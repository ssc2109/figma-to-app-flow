import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { generateBriefing, type Briefing } from "@/lib/api/briefing.functions";
import { BorderBeam } from "@/components/magicui/BorderBeam";
import type { HomeNavIntent } from "@/components/home/ProactiveHero";

function AnimatedOrb({ size = 40, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <div className="relative flex-none" style={{ width: size, height: size }} aria-hidden>
      <div
        className="absolute inset-[-4px] rounded-full opacity-70 trax-conic-ring"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, #1c7cff 25%, transparent 50%, #4dc8fd 75%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full socia-orb"
        data-spinning={spinning ? "true" : "false"}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #cfe6ff 0%, #4dc8fd 22%, #1c7cff 48%, #003fc0 78%, #061535 100%)",
          boxShadow: "0 0 18px rgba(28,124,255,0.55)",
        }}
      />
    </div>
  );
}

function bucket(n: number, step: number) {
  return Math.floor(n / step);
}

export type { Briefing };

export function useBriefing() {
  const { profile } = useAuth();
  const fin = useFinance();
  const inv = useInventory();
  const ownerFirstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
  const now = new Date();
  const hour = now.getHours();
  const weekday = now.toLocaleDateString("es-PE", { weekday: "long" });
  const dateKey = now.toISOString().slice(0, 10);

  const yesterdayIncome = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return fin.tx
      .filter((t) => t.kind === "ingreso" && new Date(t.date).toDateString() === y.toDateString())
      .reduce((s, t) => s + t.amount, 0);
  }, [fin.tx]);

  const briefingFn = useServerFn(generateBriefing);
  const keySig = [
    dateKey,
    Math.floor(hour / 3),
    inv.lowStock.length,
    bucket(fin.fiadosPending, 50),
    bucket(fin.todayIncome, 200),
  ].join(":");

  return useQuery({
    queryKey: ["home-briefing", profile?.id ?? "anon", keySig],
    queryFn: () =>
      briefingFn({
        data: {
          ownerFirstName,
          businessName: profile?.business_name ?? "tu negocio",
          businessType: profile?.business_type ?? null,
          hour,
          weekday,
          todayIncome: fin.todayIncome,
          yesterdayIncome,
          monthIncome: fin.monthIncome,
          fiadosPendingTotal: fin.fiadosPending,
          fiadosPendingCount: fin.fiados.filter((f) => !f.settled).length,
          fiadosOverdueTotal: fin.fiadosOverdue,
          lowStock: inv.lowStock.slice(0, 6).map((p) => ({ name: p.name, units: p.stock })),
          newUser: fin.tx.length === 0 && inv.items.length === 0,
        },
      }),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export default function SociaInsightCard({
  briefing,
  isLoading,
  onIntent,
}: {
  briefing: Briefing | undefined;
  isLoading: boolean;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const lead = briefing?.insights[0];

  const handleTap = () => {
    if (!lead) {
      onIntent({ kind: "screen", screen: "socia" });
      return;
    }
    if (!lead.cta) {
      onIntent({ kind: "chat", prompt: lead.text });
      return;
    }
    const a = lead.cta.action;
    if (a === "reponer") onIntent({ kind: "reponer", productHint: lead.cta.payload });
    else if (a === "cobrar_fiado") onIntent({ kind: "screen", screen: "negocio" });
    else if (a === "finanzas") onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" });
    else if (a === "ventas") onIntent({ kind: "sales" });
    else if (a === "promo") onIntent({ kind: "screen", screen: "crecer" });
    else onIntent({ kind: "chat", prompt: lead.text });
  };

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="relative w-full rounded-[24px] overflow-hidden text-left"
      style={{
        background: "#0F0F12",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <BorderBeam size={240} duration={10} colorFrom="#4dc8fd" colorTo="#1c7cff" />
      <BorderBeam size={240} duration={10} delay={5} colorFrom="#a78bfa" colorTo="#1c7cff" />

      <div className="relative p-[18px] flex items-start gap-[14px]">
        <AnimatedOrb size={44} spinning={isLoading} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px] mb-[6px]">
            <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.4px] uppercase text-white">
              socIA
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-white/40" />
            <span className="font-['Geist'] text-[10.5px] tracking-[0.6px] uppercase text-[rgba(255,255,255,0.45)]">
              Asistente
            </span>
          </div>
          {isLoading || !lead ? (
            <>
              <div className="h-[16px] w-[85%] rounded trax-skeleton mb-[6px]" />
              <div className="h-[16px] w-[60%] rounded trax-skeleton" />
            </>
          ) : (
            <p className="font-['Geist'] text-[14.5px] leading-[21px] text-white/90">
              {lead.text}
            </p>
          )}
          {lead?.cta && (
            <div className="mt-[12px] inline-flex items-center gap-[6px] px-[12px] py-[7px] rounded-full bg-white text-black text-[12.5px] font-medium font-['Geist']">
              {lead.cta.label}
              <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2.4} />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
