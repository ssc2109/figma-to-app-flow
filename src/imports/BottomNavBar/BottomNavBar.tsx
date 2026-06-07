import { Home, Briefcase, Sparkles, User, Lightbulb, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type Screen = "inicio" | "negocio" | "socia" | "yo" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
  onSell?: () => void;
}

type TabDef = {
  id: Screen;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  glow?: boolean;
};

const TABS: TabDef[] = [
  { id: "inicio", label: "Inicio", Icon: Home },
  { id: "negocio", label: "Negocio", Icon: Briefcase },
  { id: "socia", label: "socIA", Icon: Sparkles, glow: true },
  { id: "yo", label: "Yo", Icon: User },
  { id: "crecer", label: "Crecer", Icon: Lightbulb },
];

function Tab({
  tab,
  active,
  onClick,
}: {
  tab: TabDef;
  active: boolean;
  onClick: () => void;
}) {
  const { Icon, label, glow } = tab;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative flex items-center justify-center h-[44px] flex-shrink-0 outline-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
        className={`relative flex items-center justify-center gap-[6px] h-[40px] rounded-full ${
          active ? "px-[14px] bg-white" : "px-[12px]"
        }`}
        style={
          active
            ? { boxShadow: "0 6px 20px rgba(255,255,255,0.18), inset 0 0 0 0.5px rgba(0,0,0,0.04)" }
            : undefined
        }
      >
        {glow && !active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(167,139,250,0.22) 0%, rgba(74,222,128,0.10) 50%, transparent 75%)",
            }}
          />
        )}
        <Icon
          className={`relative size-[19px] transition-colors duration-200 ${
            active ? "text-black" : "text-white/70"
          }`}
          strokeWidth={active ? 2.3 : 1.85}
        />
        <AnimatePresence initial={false}>
          {active && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0, marginLeft: -4 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 0 }}
              exit={{ opacity: 0, width: 0, marginLeft: -4 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="relative overflow-hidden whitespace-nowrap text-[13px] font-medium text-black font-['Geist'] tracking-[-0.01em]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

function SellFab({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-[26px] pointer-events-none">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Registrar venta"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 480, damping: 26 }}
        className="pointer-events-auto relative flex items-center justify-center size-[58px] rounded-full outline-none"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #e6e6e6 100%)",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.6) inset, 0 -2px 6px rgba(0,0,0,0.18) inset",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          aria-hidden
          className="absolute -inset-[3px] rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(74,222,128,0.0), rgba(74,222,128,0.6), rgba(60,88,243,0.5), rgba(74,222,128,0.0))",
            filter: "blur(8px)",
            opacity: 0.55,
            zIndex: -1,
          }}
        />
        <Plus className="size-[26px] text-black" strokeWidth={2.6} />
      </motion.button>
    </div>
  );
}

export default function BottomNavBar({
  currentScreen = "inicio",
  onNavigate,
  onSell,
}: BottomNavBarProps) {
  const go = (s: Screen) => onNavigate?.(s);

  return (
    <div className="relative px-4 pb-[22px] pt-[18px]">
      {onSell && <SellFab onClick={onSell} />}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        className="relative mx-auto flex items-center justify-between gap-[2px] h-[60px] px-[8px] rounded-full"
        style={{
          background: "rgba(18, 18, 20, 0.72)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 18px 50px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.4) inset",
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            active={currentScreen === tab.id}
            onClick={() => go(tab.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
