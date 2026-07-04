import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, ClipboardList, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/finance";
import { SubHeader, SubScreen, ListGroup } from "./shared";

type CashEvent = {
  id: string;
  date: string;
  title: string;
  meta: string;
  amount: number;
  tone: "in" | "out" | "neutral";
  Icon: typeof Plus;
};

type DebtRow = {
  id: string;
  customer_name: string;
  amount: number;
  created_at: string;
  paid: boolean;
  kind: "cobrar" | "pagar" | null;
};

function fmt(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.max(0, Math.round(diffMs / 60000));
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 12) return `Hace ${h} h`;
  if (d.toDateString() === now.toDateString()) {
    return `Hoy, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) {
    return `Ayer, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function categoryLabel(catId: string, kind: "ingreso" | "egreso") {
  const list = kind === "ingreso" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === catId)?.label ?? (catId || "Movimiento");
}

export default function CashActivityView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const fin = useFinance();
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(true);

  useEffect(() => {
    if (!user) {
      setDebts([]);
      setLoadingDebts(false);
      return;
    }
    let active = true;
    setLoadingDebts(true);
    (async () => {
      const { data, error } = await supabase
        .from("fiados")
        .select("id, customer_name, amount, created_at, paid, kind")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) console.error("cash activity debts", error);
      if (active) {
        setDebts((data as DebtRow[]) ?? []);
        setLoadingDebts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const events = useMemo<CashEvent[]>(() => {
    const txEvents: CashEvent[] = fin.tx.map((t) => {
      const isIn = t.kind === "ingreso";
      const isDebtCollection = t.category === "cobro-fiado" || (t.note ?? "").toLowerCase().includes("cobro");
      const isDebtPayment = t.kind === "egreso" && (t.note ?? "").toLowerCase().includes("pago deuda");
      return {
        id: t.id,
        date: t.date,
        title: isDebtCollection
          ? "Cobro registrado"
          : isDebtPayment
            ? "Pago registrado"
            : isIn
              ? "Venta registrada"
              : "Gasto registrado",
        meta: `${relativeTime(t.date)} · ${t.note || categoryLabel(t.category, t.kind)}`,
        amount: t.amount,
        tone: isIn ? "in" : "out",
        Icon: isIn ? Plus : Minus,
      };
    });

    const debtEvents: CashEvent[] = debts.map((d) => {
      const payable = d.kind === "pagar";
      return {
        id: `d_${d.id}`,
        date: d.created_at,
        title: payable ? "Cuenta por pagar registrada" : "Fiado registrado",
        meta: `${relativeTime(d.created_at)} · ${d.customer_name}${d.paid ? " · saldado" : ""}`,
        amount: Number(d.amount),
        tone: "neutral",
        Icon: payable ? ArrowUpRight : ArrowDownLeft,
      };
    });

    return [...txEvents, ...debtEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 80);
  }, [fin.tx, debts]);

  const todayEvents = events.filter((e) => new Date(e.date).toDateString() === new Date().toDateString()).length;
  const totalIn = fin.tx.filter((t) => t.kind === "ingreso").reduce((s, t) => s + t.amount, 0);
  const totalOut = fin.tx.filter((t) => t.kind === "egreso").reduce((s, t) => s + t.amount, 0);
  const isLoading = fin.loading && events.length === 0;

  return (
    <SubScreen>
      <SubHeader eyebrow="Caja" title="Historial" onBack={onBack} />

      <div className="px-[20px] pt-[6px] pb-[180px]">
        <div
          className="rounded-[20px] p-[16px] mb-[14px]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">
            Movimientos de caja
          </div>
          <div className="mt-[4px] font-['Bai_Jamjuree'] text-[30px] font-bold text-white tracking-[-1px] tabular-nums">
            {events.length}
          </div>
          <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45">
            {todayEvents} hoy · +S/ {fmt(totalIn)} · −S/ {fmt(totalOut)}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center text-center py-[50px]">
            <div
              className="h-[60px] w-[60px] rounded-[18px] grid place-items-center mb-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ClipboardList className="h-[24px] w-[24px] text-white/55" strokeWidth={1.5} />
            </div>
            <p className="font-['Geist'] text-[13.5px] text-white/55 max-w-[260px] leading-[1.5]">
              Tus ventas, gastos, cobros y pagos aparecerán aquí cuando registres movimientos en Caja.
            </p>
          </div>
        ) : (
          <>
            <ListGroup>
              {events.map((e, idx) => {
                const color = e.tone === "in" ? "#4ADE80" : e.tone === "out" ? "#F87171" : "rgba(255,255,255,0.72)";
                const bg = e.tone === "in" ? "rgba(74,222,128,0.13)" : e.tone === "out" ? "rgba(248,113,113,0.13)" : "rgba(255,255,255,0.06)";
                const border = e.tone === "in" ? "rgba(74,222,128,0.30)" : e.tone === "out" ? "rgba(248,113,113,0.30)" : "rgba(255,255,255,0.10)";
                const Icon = e.Icon;
                return (
                  <div key={e.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.025, 0.18) }}
                      className="flex items-center gap-[12px] px-[16px] py-[13px]"
                    >
                      <div
                        className="h-[36px] w-[36px] rounded-full grid place-items-center flex-none"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon className="h-[15px] w-[15px]" style={{ color }} strokeWidth={2.3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Geist'] text-[14.5px] text-white truncate">{e.title}</div>
                        <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 truncate">{e.meta}</div>
                      </div>
                      <div
                        className="font-['Bai_Jamjuree'] font-bold text-[15px] tracking-[-0.2px] whitespace-nowrap tabular-nums"
                        style={{ color }}
                      >
                        {e.tone === "in" ? "+" : e.tone === "out" ? "−" : ""}S/ {fmt(e.amount)}
                      </div>
                    </motion.div>
                    {idx < events.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
                  </div>
                );
              })}
            </ListGroup>
            {loadingDebts && (
              <div className="pt-[10px] text-center font-['Geist'] text-[11px] text-white/30">
                Actualizando cobros y pagos…
              </div>
            )}
          </>
        )}

        {events.length > 0 && (
          <p className="text-center font-['Geist'] italic text-[12px] text-white/35 mt-[16px]">
            Caja actualizada con ventas, gastos, cobros y registros recientes.
          </p>
        )}
      </div>
    </SubScreen>
  );
}