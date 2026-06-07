import { Home, Briefcase, Sparkles, User, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

export type Screen = "inicio" | "negocio" | "socia" | "yo" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  glow?: boolean;
}

function Tab({ active, onClick, Icon, label, glow }: TabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.86 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative flex items-center justify-center flex-1 h-[56px]"
    >
      <div className="relative flex items-center justify-center h-[40px] w-[52px]">
        {active && (
          <motion.span
            layoutId="trax-nav-pill"
            className="absolute inset-0 rounded-full bg-white/95"
            style={{ boxShadow: "0 4px 22px rgba(255,255,255,0.22)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
          />
        )}
        {glow && !active && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(180,200,255,0.25) 0%, transparent 70%)",
            }}
          />
        )}
        <Icon
          className={`relative size-[20px] transition-colors duration-300 ${
            active ? "text-black" : "text-white/65"
          }`}
          strokeWidth={active ? 2.2 : 1.8}
        />
      </div>
    </motion.button>
  );
}

export default function BottomNavBar({ currentScreen = "inicio", onNavigate }: BottomNavBarProps) {
  const go = (s: Screen) => onNavigate?.(s);

  return (
    <div
      className="size-full flex items-center justify-around px-[12px] pt-[10px] pb-[26px] border-t border-white/[0.06]"
      style={{
        background: "rgba(16, 16, 18, 0.62)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      <Tab label="Inicio" Icon={Home} active={currentScreen === "inicio"} onClick={() => go("inicio")} />
      <Tab label="Mi Negocio" Icon={Briefcase} active={currentScreen === "negocio"} onClick={() => go("negocio")} />
      <Tab label="socIA" Icon={Sparkles} active={currentScreen === "socia"} onClick={() => go("socia")} glow />
      <Tab label="Yo" Icon={User} active={currentScreen === "yo"} onClick={() => go("yo")} />
      <Tab label="Crecer" Icon={Lightbulb} active={currentScreen === "crecer"} onClick={() => go("crecer")} />
    </div>
  );
}
