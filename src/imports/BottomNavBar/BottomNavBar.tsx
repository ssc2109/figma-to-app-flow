import { motion } from "motion/react";
import { HomeIcon, BusinessIcon, SociaIcon, ProductivityIcon, GrowIcon } from "@/components/icons/NavIcons";

export type Screen = "inicio" | "negocio" | "socia" | "yo" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
  /** Nº de alertas activas — muestra un punto ámbar en la pestaña "Yo" */
  alerts?: number;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string; filled?: boolean }>;
  label: string;
  badge?: boolean;
}

function Tab({ active, onClick, Icon, label, badge }: TabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={badge ? `${label} (alertas pendientes)` : label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      className="relative flex items-center justify-center flex-1 h-[52px]"
    >
      <div className="relative flex items-center justify-center h-[32px] w-[44px]">
        {active && (
          <span
            className="absolute h-[32px] w-[32px] rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.10) 0%, transparent 72%)",
            }}
          />
        )}
        <Icon
          filled={active}
          className={`relative w-[20px] h-[20px] transition-colors duration-300 ${
            active ? "text-white" : "text-white/50"
          }`}
        />
        {badge && (
          <span className="absolute top-[-1px] right-[7px] h-[8px] w-[8px] pointer-events-none">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: "#F59E0B" }}
              animate={{ opacity: [0.35, 0.9, 0.35], scale: [1, 1.9, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "#F59E0B", boxShadow: "0 0 8px rgba(245,158,11,0.7)" }}
            />
          </span>
        )}
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
