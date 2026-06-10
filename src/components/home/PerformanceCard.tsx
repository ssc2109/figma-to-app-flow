import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Wallet, Smartphone } from "lucide-react";
import { useMemo } from "react";
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

  const { saldoCaja, flujoDigital, consolidado, deltaPct } = useMemo(() => {
    let caja = 0;
    let digital = 0;
    for (const t of fin.tx) {
      const isCash = (t.method ?? "Efectivo") === "Efectivo";
      const sign = t.kind === "ingreso" ? 1 : -1;
      if (isCash) caja += sign * t.amount;
      else digital += sign * t.amount;
    }
    const total = caja + digital;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yest = fin.tx
      .filter((t) => t.kind === "ingreso" && new Date(t.date).toDateString() === y.toDateString())
      .reduce((s, t) => s + t.amount, 0);
    const delta = yest > 0 ? ((fin.todayIncome - yest) / yest) * 100 : 0;
    return { saldoCaja: caja, flujoDigital: digital, consolidado: total, deltaPct: delta };
  }, [fin.tx, fin.todayIncome]);

  const trendUp = deltaPct >= 0;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      {/* eyebrow */}
      <div className="relative pb-[6px] flex items-center justify-between">
        <span className="font-['Geist'] text-[10.5px] font-medium tracking-[1.6px] uppercase text-[rgba(255,255,255,0.55)]">
          Rendimiento de hoy
        </span>
        <span className="font-['Geist'] text-[10.5px] tracking-[1px] uppercase text-[rgba(255,255,255,0.35)]">
          En vivo
        </span>
      </div>

      {/* hero amount — flota sobre el Aurora, sin card */}
      <div className="relative pb-[10px] flex items-baseline gap-[6px]">
        <span className="font-['Bai_Jamjuree'] font-medium text-[28px] leading-[32px] text-[rgba(255,255,255,0.5)] tracking-[-1px]">
          S/
        </span>
        <span className="font-['Bai_Jamjuree'] font-bold text-[54px] leading-[58px] text-white tracking-[-2px]">
          <AnimatedNumber value={consolidado} duration={1.2} format={(n) => fmtMoney(n)} />
        </span>
      </div>

      {/* delta vs ayer */}
      <div className="relative pb-[18px] flex items-center gap-[6px]">
        <TrendIcon
          className="h-[14px] w-[14px]"
          style={{ color: trendUp ? "#4ADE80" : "#F87171" }}
          strokeWidth={2.2}
        />
        <span
          className="font-['Geist'] text-[12.5px] font-medium"
          style={{ color: trendUp ? "#4ADE80" : "#F87171" }}
        >
          {trendUp ? "+" : ""}
          {deltaPct.toFixed(0)}%
        </span>
        <span className="font-['Geist'] text-[12.5px] text-[rgba(255,255,255,0.45)]">
          respecto a ayer
        </span>
      </div>

      {/* sub KPIs — solo hairline, sin caja */}
      <div className="relative grid grid-cols-2 border-t border-white/[0.08] pt-[14px]">
        <SubKpi icon={Wallet} label="Saldo en caja" value={`S/ ${fmtCompact(saldoCaja)}`} />
        <div className="border-l border-white/[0.07] pl-[18px]">
          <SubKpi icon={Smartphone} label="Flujo digital" value={`S/ ${fmtCompact(flujoDigital)}`} />
        </div>
      </div>
    </motion.div>
  );
}

function SubKpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="py-[2px] flex flex-col gap-[6px]">
      <div className="flex items-center gap-[8px] text-[rgba(255,255,255,0.5)]">
        <Icon className="h-[13px] w-[13px]" strokeWidth={1.7} />
        <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1px] font-medium">
          {label}
        </span>
      </div>
      <span className="font-['Bai_Jamjuree'] font-bold text-[20px] leading-[24px] text-white tracking-[-0.4px]">
        {value}
      </span>
    </div>
  );
}


