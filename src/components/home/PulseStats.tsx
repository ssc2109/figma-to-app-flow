import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useFinance } from "@/data/finance";
import { useMemo } from "react";

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toFixed(0);
}

export default function PulseStats() {
  const fin = useFinance();

  const yesterdayIncome = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return fin.tx
      .filter((t) => t.kind === "ingreso" && new Date(t.date).toDateString() === y.toDateString())
      .reduce((s, t) => s + t.amount, 0);
  }, [fin.tx]);

  const delta = yesterdayIncome > 0 ? ((fin.todayIncome - yesterdayIncome) / yesterdayIncome) * 100 : 0;
  const trend = delta > 2 ? "up" : delta < -2 ? "down" : "flat";

  const stats = [
    {
      label: "Hoy",
      value: `S/ ${fmt(fin.todayIncome)}`,
      sub: yesterdayIncome > 0 ? `Ayer S/ ${fmt(yesterdayIncome)}` : "Sin ref. ayer",
    },
    {
      label: "vs Ayer",
      value:
        yesterdayIncome > 0
          ? `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}%`
          : "—",
      sub: trend === "up" ? "Vas mejor" : trend === "down" ? "Más lento" : "Igual",
      trend,
    },
    {
      label: "Fiados",
      value: `S/ ${fmt(fin.fiadosPending)}`,
      sub: `${fin.fiados.filter((f) => !f.settled).length} pendientes`,
    },
  ];

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#4ADE80" : trend === "down" ? "#F87171" : "rgba(255,255,255,0.55)";

  return (
    <div
      className="w-full rounded-[20px] overflow-hidden grid grid-cols-3"
      style={{
        background: "#0B0B0E",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i }}
          className={`flex flex-col gap-[2px] px-[12px] py-[14px] ${i > 0 ? "border-l border-white/[0.06]" : ""}`}
        >
          <span className="font-['Geist'] text-[10px] uppercase tracking-[0.8px] text-[rgba(255,255,255,0.45)]">
            {s.label}
          </span>
          <div className="flex items-center gap-[6px]">
            <span className="font-['Bai_Jamjuree'] font-bold text-[18px] leading-[22px] text-white tracking-[-0.4px]">
              {s.value}
            </span>
            {i === 1 && yesterdayIncome > 0 && (
              <TrendIcon className="h-[14px] w-[14px]" style={{ color: trendColor }} strokeWidth={2.2} />
            )}
          </div>
          <span className="font-['Geist'] text-[10.5px] text-[rgba(255,255,255,0.5)] leading-[14px] mt-[2px] truncate">
            {s.sub}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
