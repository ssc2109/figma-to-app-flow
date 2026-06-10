import { motion } from "motion/react";
import { Flame, Sparkles } from "lucide-react";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { useMemo } from "react";

/**
 * Foco del día — un mensaje motivacional/táctico para la mañana.
 * Derivado del estado real del negocio, con un shimmer animado.
 */
export default function FocusCard() {
  const fin = useFinance();
  const inv = useInventory();
  const hour = new Date().getHours();

  const focus = useMemo(() => {
    if (inv.lowStock.length >= 2) {
      return {
        eyebrow: "Foco de hoy",
        text: `Repón ${inv.lowStock.length} productos antes que se acabe el día.`,
        icon: Flame,
        tint: "#F59E0B",
      };
    }
    if (fin.fiadosOverdue > 0) {
      return {
        eyebrow: "Foco de hoy",
        text: `Cobrar S/ ${fin.fiadosOverdue.toFixed(0)} en fiados vencidos. Hoy es el día.`,
        icon: Flame,
        tint: "#F87171",
      };
    }
    if (hour < 11) {
      return {
        eyebrow: "Foco de hoy",
        text: "Atiende los primeros clientes con tu mejor energía. El día empieza ahora.",
        icon: Sparkles,
        tint: "#4dc8fd",
      };
    }
    if (hour < 18 && fin.todayIncome === 0) {
      return {
        eyebrow: "Foco de hoy",
        text: "Aún no hay ventas registradas. Anota cada movimiento, suma siempre.",
        icon: Sparkles,
        tint: "#4dc8fd",
      };
    }
    return {
      eyebrow: "Foco de hoy",
      text: "Mantén el ritmo. La constancia es lo que construye negocio.",
      icon: Sparkles,
      tint: "#4dc8fd",
    };
  }, [inv.lowStock.length, fin.fiadosOverdue, fin.todayIncome, hour]);

  const Icon = focus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative w-full rounded-[20px] overflow-hidden p-[16px] flex items-start gap-[14px]"
      style={{
        background: "#0B0B0E",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* glow lateral animado */}
      <div
        aria-hidden
        className="absolute -left-[40px] top-1/2 -translate-y-1/2 h-[120px] w-[120px] rounded-full opacity-25 trax-breathe pointer-events-none"
        style={{ background: focus.tint, filter: "blur(40px)" }}
      />

      <div
        className="relative flex-none h-[36px] w-[36px] rounded-full grid place-items-center"
        style={{
          background: `${focus.tint}1F`,
          border: `1px solid ${focus.tint}33`,
        }}
      >
        <Icon className="h-[16px] w-[16px]" style={{ color: focus.tint }} strokeWidth={2.1} />
      </div>

      <div className="relative flex-1 min-w-0 flex flex-col gap-[4px]">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.45)]">
          {focus.eyebrow}
        </span>
        <p className="font-['Geist'] text-[14.5px] leading-[20px] trax-text-shimmer">
          {focus.text}
        </p>
      </div>
    </motion.div>
  );
}
