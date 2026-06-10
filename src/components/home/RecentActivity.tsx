import { motion } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/finance";

function fmt(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 12) return `Hace ${h} h`;
  if (d.toDateString() === now.toDateString())
    return `Hoy, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString())
    return `Ayer, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function categoryLabel(catId: string, kind: "ingreso" | "egreso") {
  const list = kind === "ingreso" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === catId)?.label ?? "Movimiento";
}

export default function RecentActivity({ onSeeAll }: { onSeeAll: () => void }) {
  const fin = useFinance();
  const items = fin.tx.slice(0, 4);
  const todayCount = fin.tx.filter(
    (t) => new Date(t.date).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div className="w-full flex flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <h2 className="font-['Bai_Jamjuree'] font-semibold text-[22px] leading-[26px] text-white tracking-[-0.4px]">
            Actividad
          </h2>
          <span className="inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-full bg-white/[0.06] border border-white/[0.08]">
            <span className="relative grid place-items-center h-[6px] w-[6px]">
              <span className="absolute inset-0 rounded-full bg-white/80 animate-ping opacity-60" />
              <span className="relative h-[6px] w-[6px] rounded-full bg-white" />
            </span>
            <span className="font-['Geist'] text-[9.5px] font-semibold tracking-[1px] uppercase text-white/85">
              En vivo
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-['Geist'] text-[11px] font-medium tracking-[1px] uppercase text-[rgba(255,255,255,0.55)] hover:text-white transition-colors"
        >
          Ver historial
        </button>
      </div>

      <div className="flex flex-col">
        {items.map((t, i) => {
          const isIn = t.kind === "ingreso";
          const color = isIn ? "#4ADE80" : "#F87171";
          const Icon = isIn ? Plus : Minus;
          const title = `${isIn ? "Venta" : "Pago"}: ${categoryLabel(t.category, t.kind)}`;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full py-[14px] flex items-center gap-[14px]"
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="h-[34px] w-[34px] rounded-full grid place-items-center flex-none"
                style={{ background: `${color}14`, border: `1px solid ${color}26` }}
              >
                <Icon className="h-[14px] w-[14px]" style={{ color }} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Geist'] text-[14px] font-medium text-white truncate">
                  {title}
                </div>
                <div className="font-['Geist'] text-[11.5px] text-[rgba(255,255,255,0.5)] truncate">
                  {relativeTime(t.date)} · {t.method ?? "Efectivo"}
                </div>
              </div>
              <div
                className="font-['Bai_Jamjuree'] font-bold text-[16px] tracking-[-0.2px] whitespace-nowrap"
                style={{ color }}
              >
                {isIn ? "+" : "−"} S/ {fmt(t.amount)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {todayCount > 0 && (
        <p className="text-center font-['Geist'] italic text-[12px] text-[rgba(255,255,255,0.4)] mt-[4px]">
          Juntos hemos asegurado {todayCount} {todayCount === 1 ? "transacción" : "transacciones"} hoy
          sin errores.
        </p>
      )}
    </div>
  );
}
