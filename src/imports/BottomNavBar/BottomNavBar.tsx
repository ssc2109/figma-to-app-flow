import { motion } from "motion/react";
import { HomeIcon, BusinessIcon, SociaIcon, ProductivityIcon, GrowIcon } from "@/components/icons/NavIcons";

export type Screen = "inicio" | "negocio" | "socia" | "yo" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string; filled?: boolean }>;
  label: string;
}

function Tab({ active, onClick, Icon, label }: TabProps) {
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
          <span
            className="absolute h-[52px] w-[52px] rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 45%, transparent 80%)",
            }}
          />
        )}
        <Icon
          filled={active}
          className={`relative w-[24px] h-[24px] transition-colors duration-300 ${
            active ? "text-white" : "text-white/55"
          }`}
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
      <Tab label="Inicio" Icon={HomeIcon} active={currentScreen === "inicio"} onClick={() => go("inicio")} />
      <Tab label="Mi Negocio" Icon={BusinessIcon} active={currentScreen === "negocio"} onClick={() => go("negocio")} />
      <Tab label="socIA" Icon={SociaIcon} active={currentScreen === "socia"} onClick={() => go("socia")} />
      <Tab label="Yo" Icon={ProductivityIcon} active={currentScreen === "yo"} onClick={() => go("yo")} />
      <Tab label="Crecer" Icon={GrowIcon} active={currentScreen === "crecer"} onClick={() => go("crecer")} />
    </div>
  );
}
