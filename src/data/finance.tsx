import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type TxKind = "ingreso" | "egreso";
export type PayMethod = "Efectivo" | "Yape" | "Plin" | "Tarjeta";

export type Transaction = {
  id: string;
  kind: TxKind;
  amount: number;
  category: string;
  note?: string;
  method?: PayMethod;
  date: string; // ISO
};

export type Fiado = {
  id: string;
  client: string;
  amount: number;
  date: string;
  dueDate?: string;
  settled: boolean;
};

export const EXPENSE_CATEGORIES = [
  { id: "mercaderia", label: "Mercadería", icon: "📦" },
  { id: "servicios", label: "Servicios", icon: "💡" },
  { id: "alquiler", label: "Alquiler", icon: "🏠" },
  { id: "sueldos", label: "Sueldos", icon: "👥" },
  { id: "transporte", label: "Transporte", icon: "🛵" },
  { id: "otros", label: "Otros", icon: "•" },
];

export const INCOME_CATEGORIES = [
  { id: "ventas", label: "Ventas", icon: "🧾" },
  { id: "cobro-fiado", label: "Cobro fiado", icon: "✅" },
  { id: "otros", label: "Otros", icon: "•" },
];

function methodFromDb(m: string | null | undefined): PayMethod {
  const v = (m ?? "efectivo").toLowerCase();
  if (v === "yape") return "Yape";
  if (v === "plin") return "Plin";
  if (v === "tarjeta" || v === "card") return "Tarjeta";
  return "Efectivo";
}

function methodToDb(m: PayMethod | undefined): string {
  if (!m) return "efectivo";
  return m.toLowerCase();
}

type Ctx = {
  tx: Transaction[];
  fiados: Fiado[];
  loading: boolean;
  addTransaction: (
    t: Omit<Transaction, "id" | "date"> & { date?: string },
  ) => Promise<void>;
  addFiado: (
    f: Omit<Fiado, "id" | "date" | "settled"> & { dueDate?: string },
  ) => Promise<void>;
  settleFiado: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  // computed
  todayIncome: number;
  todayExpense: number;
  todayNet: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  fiadosPending: number;
  fiadosOverdue: number;
  last7Days: { day: string; income: number; expense: number }[];
  expensesByCategory: { id: string; label: string; icon: string; total: number; pct: number }[];
};

const FinanceCtx = createContext<Ctx | null>(null);

function isSameDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.toDateString() === ref.toDateString();
}
function isSameMonth(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tx, setTx] = useState<Transaction[]>([]);
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setTx([]);
      setFiados([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const since = new Date();
    since.setDate(since.getDate() - 60); // ventana razonable
    const sinceIso = since.toISOString();

    const [salesRes, expensesRes, fiadosRes] = await Promise.all([
      supabase
        .from("sales")
        .select("id, total, payment_method, note, created_at, is_credit")
        .eq("user_id", user.id)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false }),
      supabase
        .from("expenses")
        .select("id, amount, category, note, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false }),
      supabase
        .from("fiados")
        .select("id, customer_name, amount, due_date, created_at, paid")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (salesRes.error) console.error("sales load", salesRes.error);
    if (expensesRes.error) console.error("expenses load", expensesRes.error);
    if (fiadosRes.error) console.error("fiados load", fiadosRes.error);

    const incomeTx: Transaction[] = (salesRes.data ?? [])
      .filter((s) => !s.is_credit) // fiados se cobran cuando se settlean
      .map((s) => ({
        id: `s_${s.id}`,
        kind: "ingreso",
        amount: Number(s.total),
        category: "ventas",
        note: s.note ?? undefined,
        method: methodFromDb(s.payment_method),
        date: s.created_at,
      }));

    const expenseTx: Transaction[] = (expensesRes.data ?? []).map((e) => ({
      id: `e_${e.id}`,
      kind: "egreso",
      amount: Number(e.amount),
      category: e.category || "otros",
      note: e.note ?? undefined,
      method: "Efectivo",
      date: e.created_at,
    }));

    const all = [...incomeTx, ...expenseTx].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const mappedFiados: Fiado[] = (fiadosRes.data ?? []).map((f) => ({
      id: f.id,
      client: f.customer_name,
      amount: Number(f.amount),
      date: f.created_at,
      dueDate: f.due_date ?? undefined,
      settled: f.paid,
    }));

    setTx(all);
    setFiados(mappedFiados);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addTransaction: Ctx["addTransaction"] = useCallback(
    async (t) => {
      if (!user) return;
      if (t.kind === "ingreso") {
        const { data, error } = await supabase
          .from("sales")
          .insert({
            user_id: user.id,
            total: t.amount,
            payment_method: methodToDb(t.method),
            note: t.note ?? null,
            is_credit: false,
            paid: true,
          })
          .select("id, total, payment_method, note, created_at")
          .single();
        if (error) {
          console.error("addTransaction ingreso", error);
          return;
        }
        if (data) {
          setTx((arr) => [
            {
              id: `s_${data.id}`,
              kind: "ingreso",
              amount: Number(data.total),
              category: t.category || "ventas",
              note: data.note ?? undefined,
              method: methodFromDb(data.payment_method),
              date: data.created_at,
            },
            ...arr,
          ]);
        }
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            amount: t.amount,
            category: t.category || "otros",
            note: t.note ?? null,
          })
          .select("id, amount, category, note, created_at")
          .single();
        if (error) {
          console.error("addTransaction egreso", error);
          return;
        }
        if (data) {
          setTx((arr) => [
            {
              id: `e_${data.id}`,
              kind: "egreso",
              amount: Number(data.amount),
              category: data.category,
              note: data.note ?? undefined,
              method: "Efectivo",
              date: data.created_at,
            },
            ...arr,
          ]);
        }
      }
    },
    [user],
  );

  const addFiado: Ctx["addFiado"] = useCallback(
    async (f) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("fiados")
        .insert({
          user_id: user.id,
          customer_name: f.client,
          amount: f.amount,
          due_date: f.dueDate ?? null,
        })
        .select("id, customer_name, amount, due_date, created_at, paid")
        .single();
      if (error) {
        console.error("addFiado", error);
        return;
      }
      if (data) {
        setFiados((arr) => [
          {
            id: data.id,
            client: data.customer_name,
            amount: Number(data.amount),
            date: data.created_at,
            dueDate: data.due_date ?? undefined,
            settled: data.paid,
          },
          ...arr,
        ]);
      }
    },
    [user],
  );

  const settleFiado: Ctx["settleFiado"] = useCallback(
    async (id) => {
      if (!user) return;
      const target = fiados.find((x) => x.id === id);
      if (!target || target.settled) return;

      setFiados((arr) => arr.map((x) => (x.id === id ? { ...x, settled: true } : x)));

      const { error: upErr } = await supabase
        .from("fiados")
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq("id", id);
      if (upErr) {
        console.error("settleFiado update", upErr);
        await load();
        return;
      }

      // Registrar el cobro como ingreso real
      const { data: sale, error: sErr } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          total: target.amount,
          payment_method: "efectivo",
          note: `Cobro fiado · ${target.client}`,
          is_credit: false,
          paid: true,
        })
        .select("id, total, payment_method, note, created_at")
        .single();

      if (sErr) {
        console.error("settleFiado sale", sErr);
        return;
      }
      if (sale) {
        setTx((arr) => [
          {
            id: `s_${sale.id}`,
            kind: "ingreso",
            amount: Number(sale.total),
            category: "cobro-fiado",
            note: sale.note ?? undefined,
            method: methodFromDb(sale.payment_method),
            date: sale.created_at,
          },
          ...arr,
        ]);
      }
    },
    [fiados, user, load],
  );

  const value = useMemo<Ctx>(() => {
    const now = new Date();
    const todayTx = tx.filter((t) => isSameDay(t.date, now));
    const monthTx = tx.filter((t) => isSameMonth(t.date, now));
    const sum = (arr: Transaction[], k: TxKind) =>
      arr.filter((t) => t.kind === k).reduce((s, t) => s + t.amount, 0);

    const todayIncome = sum(todayTx, "ingreso");
    const todayExpense = sum(todayTx, "egreso");
    const monthIncome = sum(monthTx, "ingreso");
    const monthExpense = sum(monthTx, "egreso");

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayTx = tx.filter((t) => isSameDay(t.date, d));
      return {
        day: d.toLocaleDateString("es-PE", { weekday: "short" }).slice(0, 3),
        income: sum(dayTx, "ingreso"),
        expense: sum(dayTx, "egreso"),
      };
    });

    const monthExpenseTx = monthTx.filter((t) => t.kind === "egreso");
    const total = monthExpenseTx.reduce((s, t) => s + t.amount, 0) || 1;
    const expensesByCategory = EXPENSE_CATEGORIES.map((c) => {
      const totalCat = monthExpenseTx
        .filter((t) => t.category === c.id)
        .reduce((s, t) => s + t.amount, 0);
      return { ...c, total: totalCat, pct: (totalCat / total) * 100 };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const pending = fiados.filter((f) => !f.settled);
    const fiadosPending = pending.reduce((s, f) => s + f.amount, 0);
    const fiadosOverdue = pending
      .filter((f) => f.dueDate && new Date(f.dueDate) < now)
      .reduce((s, f) => s + f.amount, 0);

    return {
      tx,
      fiados,
      loading,
      addTransaction,
      addFiado,
      settleFiado,
      refresh: load,
      todayIncome,
      todayExpense,
      todayNet: todayIncome - todayExpense,
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
      fiadosPending,
      fiadosOverdue,
      last7Days,
      expensesByCategory,
    };
  }, [tx, fiados, loading, addTransaction, addFiado, settleFiado, load]);

  return <FinanceCtx.Provider value={value}>{children}</FinanceCtx.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceCtx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
