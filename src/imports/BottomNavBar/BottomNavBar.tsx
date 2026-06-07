import { LayoutDashboard, Receipt, Plus, Store, TrendingUp } from "lucide-react";

type Screen = "inicio" | "ventas" | "negocio" | "crecer";

interface BottomNavBarProps {
  currentScreen?: Screen;
  onNavigate?: (screen: Screen) => void;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

function Tab({ active, onClick, Icon }: TabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center size-[44px] rounded-full transition-all active:scale-90"
    >
      {active && (
        <span className="absolute inset-0 rounded-full bg-white/95 shadow-[0_4px_16px_rgba(255,255,255,0.25)]" />
      )}
      <Icon
        className={`relative size-[22px] ${active ? "text-black" : "text-white/55"}`}
        strokeWidth={active ? 2.2 : 1.8}
      />
    </button>
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
      <Tab Icon={Home} active={currentScreen === "inicio"} onClick={() => go("inicio")} />
      <Tab Icon={Compass} active={currentScreen === "ventas"} onClick={() => go("ventas")} />
      <Tab Icon={Plus} />
      <Tab Icon={Heart} active={currentScreen === "negocio"} onClick={() => go("negocio")} />
      <Tab Icon={MessageCircle} active={currentScreen === "crecer"} onClick={() => go("crecer")} />
    </div>
  );
}
