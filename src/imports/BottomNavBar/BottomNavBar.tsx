import { LayoutDashboard, Receipt, Wallet, Store, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

type Screen = "inicio" | "ventas" | "finanzas" | "negocio" | "crecer";

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
      className="relative flex flex-col items-center justify-center gap-[3px] flex-1 h-[52px]"
    >
      <div className="relative flex items-center justify-center h-[28px] w-[44px]">
        {active && (
          <motion.span
            layoutId="trax-nav-pill"
            className="absolute inset-0 rounded-full bg-white/95"
            style={{ boxShadow: "0 4px 20px rgba(255,255,255,0.22)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
          />
        )}
        <Icon
          className={`relative size-[19px] transition-colors duration-300 ${
            active ? "text-black" : "text-white/55"
          }`}
          strokeWidth={active ? 2.2 : 1.8}
        />
      </div>
      <span
        className={`font-['Geist'] text-[10px] tracking-[0.1px] transition-colors ${
          active ? "text-white font-medium" : "text-white/45"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}

export default function BottomNavBar({ currentScreen = "inicio", onNavigate }: BottomNavBarProps) {
  const go = (s: Screen) => onNavigate?.(s);

  return (
    <div
      className="size-full flex items-center justify-around px-[8px] pt-[8px] pb-[24px] border-t border-white/[0.06]"
      style={{
        background: "rgba(20, 20, 22, 0.55)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      <Tab label="Inicio" Icon={LayoutDashboard} active={currentScreen === "inicio"} onClick={() => go("inicio")} />
      <Tab label="Ventas" Icon={Receipt} active={currentScreen === "ventas"} onClick={() => go("ventas")} />
      <Tab label="Finanzas" Icon={Wallet} active={currentScreen === "finanzas"} onClick={() => go("finanzas")} />
      <Tab label="Negocio" Icon={Store} active={currentScreen === "negocio"} onClick={() => go("negocio")} />
      <Tab label="Crecer" Icon={TrendingUp} active={currentScreen === "crecer"} onClick={() => go("crecer")} />
    </div>
  );
}
