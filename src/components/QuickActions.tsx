import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { ACTIONS_BY_ID, useQuickActions, type ActionId } from "@/data/quickActions";

// Acento sutil por acción — disciplinado, no satura.
// (Verde solo en "cobrar" porque es un ingreso real; el resto usa tintes calmados.)
const ACCENTS: Record<string, { ring: string; glow: string; icon: string }> = {
  cobrar: {
    ring: "rgba(74,222,128,0.28)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(74,222,128,0.18), rgba(74,222,128,0.04) 60%, transparent 80%)",
    icon: "#4ADE80",
  },
  fiar: {
    ring: "rgba(252,211,77,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(252,211,77,0.16), rgba(252,211,77,0.04) 60%, transparent 80%)",
    icon: "#FCD34D",
  },
  escanear: {
    ring: "rgba(125,211,252,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(125,211,252,0.16), rgba(125,211,252,0.04) 60%, transparent 80%)",
    icon: "#7DD3FC",
  },
  registrar_gasto: {
    ring: "rgba(248,113,113,0.28)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(248,113,113,0.16), rgba(248,113,113,0.04) 60%, transparent 80%)",
    icon: "#F87171",
  },
  cobrar_fiado: {
    ring: "rgba(74,222,128,0.28)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(74,222,128,0.16), rgba(74,222,128,0.04) 60%, transparent 80%)",
    icon: "#4ADE80",
  },
  reponer_stock: {
    ring: "rgba(167,139,250,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(167,139,250,0.16), rgba(167,139,250,0.04) 60%, transparent 80%)",
    icon: "#A78BFA",
  },
  promocion: {
    ring: "rgba(244,114,182,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(244,114,182,0.16), rgba(244,114,182,0.04) 60%, transparent 80%)",
    icon: "#F472B6",
  },
  pedir_proveedor: {
    ring: "rgba(125,211,252,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(125,211,252,0.16), rgba(125,211,252,0.04) 60%, transparent 80%)",
    icon: "#7DD3FC",
  },
  nuevo_producto: {
    ring: "rgba(255,255,255,0.22)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 60%, transparent 80%)",
    icon: "#FFFFFF",
  },
  venta: {
    ring: "rgba(255,255,255,0.30)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%, transparent 80%)",
    icon: "#FFFFFF",
  },
  __see_all__: {
    ring: "rgba(255,255,255,0.16)",
    glow: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.08), transparent 70%)",
    icon: "rgba(255,255,255,0.75)",
  },
};

export default function QuickActions({ onSeeAll }: { onSeeAll: () => void }) {
  const { homeOrder, trigger } = useQuickActions();

  return (
    <div className="w-full grid grid-cols-4 gap-[16px]">
      {homeOrder.map((id, i) => (
        <ActionButton key={id} id={id} delay={i * 0.05} onTap={() => trigger(id)} />
      ))}
      <ActionButton id="__see_all__" delay={0.15} onTap={onSeeAll} seeAll />
    </div>
  );
}

function ActionButton({
  id,
  delay,
  onTap,
  seeAll,
}: {
  id: ActionId | "__see_all__";
  delay: number;
  onTap: () => void;
  seeAll?: boolean;
}) {
  const action = seeAll ? null : ACTIONS_BY_ID[id as ActionId];
  const Icon = seeAll ? LayoutGrid : action!.Icon;
  const label = seeAll ? "Ver todo" : action!.short ?? action!.label;
  const accent = ACCENTS[id] ?? ACCENTS.__see_all__;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 28 }}
      className="flex flex-col gap-[10px] items-center justify-start pt-[4px] pb-[2px] px-[2px] relative"
      aria-label={label}
    >
      <div
        className="relative h-[56px] w-[56px] rounded-[20px] grid place-items-center overflow-hidden"
        style={{
          background: "#101014",
          border: `1px solid ${accent.ring}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 22px -12px rgba(0,0,0,0.6)",
        }}
      >
        {/* color wash interior */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: accent.glow }}
        />
        <Icon
          className="relative h-[22px] w-[22px]"
          style={{ color: accent.icon }}
          strokeWidth={1.9}
        />
      </div>
      <span className="font-['Geist'] text-[11.5px] font-medium text-white/85 leading-none text-center tracking-[-0.1px] truncate max-w-full">
        {label}
      </span>
    </motion.button>
  );
}
