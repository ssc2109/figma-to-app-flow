import { AnimatePresence, motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFinance } from "@/data/finance";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

function fmtMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtCompact(n: number) {
  return n.toLocaleString("es-PE", { maximumFractionDigits: 0 });
}

export default function PerformanceCard() {
  const fin = useFinance();

  const { todayNet, deltaPct, kpis } = useMemo(() => {
    let caja = 0;
    let digital = 0;
    for (const t of fin.tx) {
      const isCash = (t.method ?? "Efectivo") === "Efectivo";
      const sign = t.kind === "ingreso" ? 1 : -1;
      if (isCash) caja += sign * t.amount;
      else digital += sign * t.amount;
    }
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yest = fin.tx
      .filter((t) => t.kind === "ingreso" && new Date(t.date).toDateString() === y.toDateString())
      .reduce((s, t) => s + t.amount, 0);
    const delta = yest > 0 ? ((fin.todayIncome - yest) / yest) * 100 : 0;
    const todayCount = fin.tx.filter(
      (t) => new Date(t.date).toDateString() === new Date().toDateString(),
    ).length;

    const kpis = [
      { label: "Ventas hoy", value: `S/ ${fmtCompact(fin.todayIncome)}` },
      { label: "Gastos hoy", value: `S/ ${fmtCompact(fin.todayExpense)}` },
      { label: "Saldo en caja", value: `S/ ${fmtCompact(caja)}` },
      { label: "Flujo digital", value: `S/ ${fmtCompact(digital)}` },
      { label: "Por cobrar", value: `S/ ${fmtCompact(fin.fiadosPending)}` },
      { label: "Transacciones", value: `${todayCount}` },
      { label: "Ventas del mes", value: `S/ ${fmtCompact(fin.monthIncome)}` },
    ];

    return { todayNet: fin.todayNet, deltaPct: delta, kpis };
  }, [fin.tx, fin.todayIncome, fin.todayExpense, fin.todayNet, fin.fiadosPending, fin.monthIncome]);

  // Rotate two KPI slots every 10s through the pool.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);
  const leftIdx = (tick * 2) % kpis.length;
  const rightIdx = (tick * 2 + 1) % kpis.length;
  const left = kpis[leftIdx];
  const right = kpis[rightIdx];

  const trendUp = deltaPct >= 0;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full flex flex-col items-center text-center"
    >
      <div className="flex items-center gap-[8px] pb-[8px]">
        <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.6px] uppercase text-[rgba(255,255,255,0.55)]">
          Ganancia de hoy
        </span>
        <span className="inline-flex items-center gap-[5px] px-[7px] py-[2px] rounded-full bg-white/[0.06] border border-white/[0.08]">
          <span className="relative grid place-items-center h-[5px] w-[5px]">
            <span className="absolute inset-0 rounded-full bg-white/80 animate-ping opacity-60" />
            <span className="relative h-[5px] w-[5px] rounded-full bg-white" />
          </span>
          <span className="font-['Geist'] text-[9px] font-semibold tracking-[1px] uppercase text-white/85">
            En vivo
          </span>
        </span>
      </div>

      <div className="flex items-baseline gap-[6px]">
        <span className="font-['Bai_Jamjuree'] font-medium text-[28px] leading-[32px] text-[rgba(255,255,255,0.5)] tracking-[-1px]">
          S/
        </span>
        <span className="font-['Bai_Jamjuree'] font-bold text-[56px] leading-[60px] text-white tracking-[-2.2px]">
          <AnimatedNumber value={todayNet} duration={1.2} format={(n) => fmtMoney(n)} />
        </span>
      </div>

      <div className="pt-[8px] flex items-center gap-[6px]">
        <TrendIcon
          className="h-[14px] w-[14px]"
          style={{ color: trendUp ? "#5EEAA0" : "#FF8A8A" }}
          strokeWidth={2.4}
        />
        <span
          className="font-['Geist'] text-[12.5px] font-semibold"
          style={{ color: trendUp ? "#5EEAA0" : "#FF8A8A" }}
        >
          {trendUp ? "+" : ""}
          {deltaPct.toFixed(0)}%
        </span>
        <span className="font-['Geist'] text-[12.5px] text-[rgba(255,255,255,0.45)]">
          vs ayer
        </span>
      </div>

      {/* Rotating sub-KPIs, centered */}
      <div className="mt-[22px] w-full grid grid-cols-2 gap-[10px]">
        <RotatingKpi keyId={`${leftIdx}-l`} label={left.label} value={left.value} />
        <RotatingKpi keyId={`${rightIdx}-r`} label={right.label} value={right.value} />
      </div>
    </motion.div>
  );
}

function RotatingKpi({ keyId, label, value }: { keyId: string; label: string; value: string }) {
  return (
    <div className="relative h-[64px] overflow-hidden rounded-[16px] flex items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(28,28,34,0.85) 0%, rgba(20,20,24,0.92) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={keyId}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-[3px]"
        >
          <span className="font-['Geist'] text-[9.5px] font-medium uppercase tracking-[1.1px] text-[rgba(255,255,255,0.5)]">
            {label}
          </span>
          <span className="font-['Bai_Jamjuree'] font-bold text-[18px] leading-[20px] text-white tracking-[-0.3px]">
            {value}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
