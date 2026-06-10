import Aurora from "@/components/Aurora";
import { Stagger } from "@/components/motion/Stagger";
import QuickActions from "@/components/QuickActions";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { type HomeNavIntent } from "@/components/home/ProactiveHero";
import PerformanceCard from "@/components/home/PerformanceCard";
import SociaInsightCard, { useBriefing } from "@/components/home/SociaInsightCard";
import MissionsCarousel from "@/components/home/MissionsCarousel";
import RecentActivity from "@/components/home/RecentActivity";



function greetingByHour() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}





function Profile({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  return (
    <div className="relative rounded-full shrink-0 size-[48px] overflow-hidden grid place-items-center"
      style={{
        background:
          "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {avatarUrl ? (
        <img alt="" className="absolute inset-0 size-full object-cover" src={avatarUrl} />
      ) : (
        <span className="font-['Bai_Jamjuree'] text-[17px] font-bold text-white tracking-[-0.3px]">
          {initials}
        </span>
      )}
    </div>
  );
}

function HeaderTopAppBar({
  businessName,
  avatarUrl,
  onOpenSettings,
}: {
  businessName: string;
  ownerName?: string;
  avatarUrl: string | null;
  onOpenSettings: () => void;
}) {
  const initials =
    (businessName || "TU")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "TU";

  return (
    <div className="relative shrink-0 w-full" data-name="Header - TopAppBar">
      <div className="flex items-center justify-between px-[20px] py-[16px]">
        <div className="flex gap-[12px] items-center min-w-0">
          <Profile avatarUrl={avatarUrl} initials={initials} />
          <div className="flex flex-col items-start min-w-0 justify-center">
            <div className="font-['Geist'] font-medium text-[11px] text-[rgba(255,255,255,0.5)] tracking-[1px] uppercase leading-[14px]">
              TRAX
            </div>
            <div className="pt-[2px] font-['Geist'] font-medium text-[15px] text-white tracking-[-0.2px] leading-[20px] truncate max-w-[220px]">
              {businessName || "Mi negocio"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes"
          className="h-[40px] w-[40px] rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08] active:scale-95 transition-transform"
        >
          <Settings className="h-[18px] w-[18px] text-white" strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}


function Greeting() {
  const { profile } = useAuth();
  const first = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
  return (
    <div className="px-[20px] pt-[4px] pb-[8px]">
      <h1 className="font-['Geist'] font-medium text-[26px] leading-[32px] tracking-[-0.5px] text-white">
        {greetingByHour()}, {first}
      </h1>
    </div>
  );
}


function Main({
  onSeeAllActions,
  onSeeAllActivity,
  onIntent,
}: {
  onSeeAllActions: () => void;
  onSeeAllActivity: () => void;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const { lowStock } = useInventory();
  const alerts: StockAlert[] = lowStock.map((i) => ({ name: i.name, units: i.stock }));
  return (
    <div className="relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[24px] items-start px-[20px] relative size-full">
        <Stagger className="w-full flex flex-col gap-[20px]" delay={0.1} step={0.08}>
          <ProactiveHero onIntent={onIntent} />
          <PulseStats />
          <FocusCard />
          <QuickActions onSeeAll={onSeeAllActions} />
          <StockAlertCard alerts={alerts} />
          <SectionActividadRecienteNowUsingGeistForAllTextAndNumbers onSeeAll={onSeeAllActivity} />
        </Stagger>
      </div>
    </div>


  );
}


export default function Container({
  onSeeAllActions,
  onSeeAllActivity,
  onOpenSettings,
  onIntent,
}: {
  onSeeAllActions?: () => void;
  onSeeAllActivity?: () => void;
  onOpenSettings?: () => void;
  onIntent?: (i: HomeNavIntent) => void;
} = {}) {
  const { profile } = useAuth();
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Container">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] z-0 overflow-hidden">
        <Aurora colorStops={["#3a7fff", "#0052e0", "#6899ff"]} amplitude={0.35} blend={1.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 via-60% to-transparent" />
      </div>
      <div className="relative z-10 w-full flex flex-col gap-[16px] items-start">
        <HeaderTopAppBar
          businessName={profile?.business_name ?? "Mi negocio"}
          ownerName={profile?.owner_name ?? "tú"}
          avatarUrl={profile?.avatar_url ?? null}
          onOpenSettings={onOpenSettings ?? (() => {})}
        />
        <Main
          onSeeAllActions={onSeeAllActions ?? (() => {})}
          onSeeAllActivity={onSeeAllActivity ?? (() => {})}
          onIntent={onIntent ?? (() => {})}
        />
      </div>
    </div>
  );
}


