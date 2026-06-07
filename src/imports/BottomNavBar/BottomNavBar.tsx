import { LayoutDashboard, Receipt, Plus, Store, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

type Screen = "inicio" | "ventas" | "negocio" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}

function Tab({ active, onClick, Icon, label }: TabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative flex items-center justify-center size-[44px] rounded-full"
    >
      {active && (
        <motion.span
          layoutId="trax-nav-pill"
          className="absolute inset-0 rounded-full bg-white/95"
          style={{ boxShadow: "0 4px 20px rgba(255,255,255,0.22)" }}
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
        />
      )}
      <Icon
        className={`relative size-[22px] transition-colors duration-300 ${
          active ? "text-black" : "text-white/55"
        }`}
        strokeWidth={active ? 2.2 : 1.8}
      />
    </motion.button>
  );
}

export default function BottomNavBar({ currentScreen = "inicio", onNavigate }: BottomNavBarProps) {
  const go = (s: Screen) => onNavigate?.(s);

  return (
    <div
      className="size-full flex items-center justify-around px-[12px] pt-[10px] pb-[28px] border-t border-white/[0.06]"
      style={{
        background: "rgba(20, 20, 22, 0.55)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      <Tab label="Inicio" Icon={LayoutDashboard} active={currentScreen === "inicio"} onClick={() => go("inicio")} />
      <Tab label="Ventas" Icon={Receipt} active={currentScreen === "ventas"} onClick={() => go("ventas")} />
      <motion.button
        type="button"
        aria-label="Nuevo"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="relative flex items-center justify-center size-[44px] rounded-full bg-white/[0.06] border border-white/[0.08]"
      >
        <Plus className="size-[20px] text-white/70" strokeWidth={2} />
      </motion.button>
      <Tab label="Negocio" Icon={Store} active={currentScreen === "negocio"} onClick={() => go("negocio")} />
      <Tab label="Crecer" Icon={TrendingUp} active={currentScreen === "crecer"} onClick={() => go("crecer")} />
    </div>
  );
}
