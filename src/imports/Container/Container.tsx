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

function HeaderBlock({
  businessName,
  ownerFirst,
  avatarUrl,
  onOpenSettings,
}: {
  businessName: string;
  ownerFirst: string;
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
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="flex items-start justify-between gap-[12px] px-[20px] pt-[16px] pb-[8px]">
        <div className="flex gap-[14px] items-center min-w-0 flex-1">
          <Profile avatarUrl={avatarUrl} initials={initials} />
          <div className="flex flex-col items-start min-w-0 justify-center">
            <div className="font-['Geist'] font-medium text-[10.5px] text-[rgba(255,255,255,0.55)] tracking-[1.6px] uppercase leading-[14px] truncate max-w-[240px]">
              {businessName || "Mi negocio"}
            </div>
            <h1 className="pt-[3px] font-['Geist'] text-[18px] leading-[24px] tracking-[-0.3px] text-white truncate max-w-[260px]">
              <span className="font-light text-[rgba(255,255,255,0.65)]">{greetingByHour()},</span>{" "}
              <span className="font-medium">{ownerFirst}</span>
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes"
          className="mt-[4px] h-[40px] w-[40px] rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08] active:scale-95 transition-transform flex-none"
        >
          <Settings className="h-[18px] w-[18px] text-white" strokeWidth={1.7} />
        </button>
      </div>
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
  const { data: briefing, isLoading } = useBriefing();
  return (
    <div className="relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[20px] items-start relative size-full">
        <div className="w-full px-[20px]">
          <Stagger className="w-full flex flex-col gap-[20px]" delay={0.1} step={0.07}>
            <PerformanceCard />
            <QuickActions onSeeAll={onSeeAllActions} />
            <SociaInsightCard briefing={briefing} isLoading={isLoading} onIntent={onIntent} />
            <MissionsCarousel briefing={briefing} isLoading={isLoading} onIntent={onIntent} />
            <RecentActivity onSeeAll={onSeeAllActivity} />
          </Stagger>
        </div>
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
        <HeaderBlock
          businessName={profile?.business_name ?? "Mi negocio"}
          ownerFirst={(profile?.owner_name ?? "").split(/\s+/)[0] || "tú"}
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


