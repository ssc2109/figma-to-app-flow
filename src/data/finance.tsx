import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type TxKind = "ingreso" | "egreso";
export type Transaction = {
  id: string;
  kind: TxKind;
  amount: number;
  category: string;
  note?: string;
  method?: "Efectivo" | "Yape" | "Plin" | "Tarjeta";
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

const today = () => new Date().toISOString();
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 8), (n * 7) % 60, 0, 0);
  return d.toISOString();
};

const SEED_TX: Transaction[] = [
  { id: "t1", kind: "ingreso", amount: 1250, category: "ventas", method: "Yape", date: today() },
  { id: "t2", kind: "egreso", amount: 320, category: "mercaderia", note: "Proveedor abarrotes", method: "Efectivo", date: today() },
  { id: "t3", kind: "ingreso", amount: 980, category: "ventas", method: "Efectivo", date: daysAgo(1) },
  { id: "t4", kind: "egreso", amount: 80, category: "servicios", note: "Luz", method: "Yape", date: daysAgo(1) },
  { id: "t5", kind: "ingreso", amount: 1420, category: "ventas", method: "Yape", date: daysAgo(2) },
  { id: "t6", kind: "ingreso", amount: 1100, category: "ventas", method: "Efectivo", date: daysAgo(3) },
  { id: "t7", kind: "egreso", amount: 600, category: "alquiler", method: "Efectivo", date: daysAgo(3) },
  { id: "t8", kind: "ingreso", amount: 1340, category: "ventas", method: "Yape", date: daysAgo(4) },
  { id: "t9", kind: "ingreso", amount: 890, category: "ventas", method: "Efectivo", date: daysAgo(5) },
  { id: "t10", kind: "egreso", amount: 150, category: "transporte", method: "Efectivo", date: daysAgo(5) },
  { id: "t11", kind: "ingreso", amount: 1580, category: "ventas", method: "Yape", date: daysAgo(6) },
];

const SEED_FIADOS: Fiado[] = [
  { id: "f1", client: "Sra. Rosa", amount: 35, date: daysAgo(2), dueDate: daysAgo(-3), settled: false },
  { id: "f2", client: "Don Julio", amount: 22, date: daysAgo(4), settled: false },
  { id: "f3", client: "Marta (vecina)", amount: 48, date: daysAgo(1), settled: false },
];

type Ctx = {
  tx: Transaction[];
  fiados: Fiado[];
  addTransaction: (t: Omit<Transaction, "id" | "date"> & { date?: string }) => void;
  addFiado: (f: Omit<Fiado, "id" | "date" | "settled">) => void;
  settleFiado: (id: string) => void;
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
  const [tx, setTx] = useState<Transaction[]>(SEED_TX);
  const [fiados, setFiados] = useState<Fiado[]>(SEED_FIADOS);

  const addTransaction: Ctx["addTransaction"] = (t) =>
    setTx((arr) => [{ ...t, id: `t${Date.now()}`, date: t.date ?? today() }, ...arr]);

  const addFiado: Ctx["addFiado"] = (f) =>
    setFiados((arr) => [
      { ...f, id: `f${Date.now()}`, date: today(), settled: false },
      ...arr,
    ]);

  const settleFiado = (id: string) => {
    setFiados((arr) => {
      const target = arr.find((x) => x.id === id);
      if (target && !target.settled) {
        // also create an ingreso
        setTx((t) => [
          {
            id: `t${Date.now()}`,
            kind: "ingreso",
            amount: target.amount,
            category: "cobro-fiado",
            note: `Cobro a ${target.client}`,
            method: "Efectivo",
            date: today(),
          },
          ...t,
        ]);
      }
      return arr.map((x) => (x.id === id ? { ...x, settled: true } : x));
    });
  };

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
      addTransaction,
      addFiado,
      settleFiado,
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
  }, [tx, fiados]);

  return <FinanceCtx.Provider value={value}>{children}</FinanceCtx.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceCtx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
