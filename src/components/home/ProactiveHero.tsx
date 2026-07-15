import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { generateBriefing, type Briefing } from "@/lib/api/briefing.functions";
import { BorderBeam } from "@/components/magicui/BorderBeam";
import { getDistinctCtaLabel, type BriefingCtaAction } from "@/lib/cta-labels";

type InsightAction = BriefingCtaAction;

export type HomeNavIntent =
  | { kind: "chat"; prompt: string }
  | { kind: "screen"; screen: "negocio" | "crecer" | "yo" | "socia"; subview?: "finanzas" | "hub" }
  | { kind: "sales" }
  | { kind: "reponer"; productHint?: string };

function bucket(n: number, step: number) {
  return Math.floor(n / step);
}

function ToneDot({ tone }: { tone: Briefing["insights"][number]["tone"] }) {
  const color =
    tone === "warning"
      ? "#F87171"
      : tone === "celebration"
        ? "#4ADE80"
        : tone === "opportunity"
          ? "#FCD34D"
          : "rgba(255,255,255,0.55)";
  return (
    <span
      className="inline-block size-[6px] rounded-full"
      style={{ background: color, boxShadow: `0 0 10px ${color}` }}
    />
  );
}

function AnimatedOrb({ size = 36, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <div className="relative flex-none" style={{ width: size, height: size }} aria-hidden>
      {/* halo conic ring */}
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

export default function ProactiveHero({ onIntent }: { onIntent: (i: HomeNavIntent) => void }) {
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
    fin.fiados.filter((f) => !f.settled && f.dueDate && new Date(f.dueDate) < now).length,
  ].join(":");

  const { data: briefing, isLoading } = useQuery({
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

  const handleInsightCta = (insight: Briefing["insights"][number]) => {
    if (!insight.cta) return;
    const a = insight.cta.action as InsightAction;
    if (a === "reponer") onIntent({ kind: "reponer", productHint: insight.cta.payload });
    else if (a === "cobrar_fiado") onIntent({ kind: "screen", screen: "negocio" });
    else if (a === "finanzas") onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" });
    else if (a === "ventas") onIntent({ kind: "sales" });
    else if (a === "promo") onIntent({ kind: "screen", screen: "crecer" });
    else onIntent({ kind: "chat", prompt: insight.text });
  };

  const greeting =
    briefing?.greeting ??
    (hour < 12
      ? { line1: `Buenos días, ${ownerFirstName}`, line2: "Preparando tu briefing…" }
      : hour < 19
        ? { line1: `¿Cómo va la tarde, ${ownerFirstName}?`, line2: "Revisando tu negocio…" }
        : { line1: `Buenas noches, ${ownerFirstName}`, line2: "Cerrando el día contigo…" });

  return (
    <div className="w-full flex flex-col gap-[16px]">
      {/* GREETING */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-[8px] pb-[2px]"
      >
        <h1 className="font-['Geist'] font-medium text-[34px] leading-[40px] tracking-[-0.6px] text-white break-words">
          {greeting.line1}
        </h1>
        <p className="mt-[6px] font-['Geist'] text-[15px] leading-[22px] text-[rgba(255,255,255,0.62)]">
          {greeting.line2}
        </p>
      </motion.div>

      {/* BRIEFING CARD — SOLID + animated border beam */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative w-full rounded-[24px] overflow-hidden"
        style={{
          background: "#0B0B0E",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <BorderBeam size={260} duration={9} colorFrom="#4dc8fd" colorTo="#1c7cff" />
        <BorderBeam size={260} duration={9} delay={4.5} colorFrom="#a78bfa" colorTo="#1c7cff" />

        <div className="relative p-[18px]">
          <div className="flex items-center gap-[12px] mb-[16px]">
            <AnimatedOrb size={30} spinning={isLoading} />
            <div className="flex flex-col">
              <span className="font-['Geist'] text-[10.5px] font-medium tracking-[1.2px] uppercase text-white">
                socIA
              </span>
              <span className="font-['Geist'] text-[11px] text-[rgba(255,255,255,0.4)]">
                {isLoading ? "Revisando tu negocio…" : "Briefing del momento"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            {isLoading && (
              <>
                <div className="h-[44px] rounded-[14px] trax-skeleton" />
                <div className="h-[44px] rounded-[14px] trax-skeleton" />
              </>
            )}

            {!isLoading &&
              briefing?.insights.map((ins, i) => (
                <motion.button
                  key={ins.id ?? i}
                  type="button"
                  onClick={() => handleInsightCta(ins)}
                  whileTap={{ scale: 0.985 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="w-full text-left flex items-start gap-[12px] p-[12px] rounded-[14px] transition-colors"
                  style={{
                    background: "#16161B",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="text-[18px] leading-[24px] flex-none">{ins.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <ToneDot tone={ins.tone} />
                      <span className="font-['Geist'] text-[10px] uppercase tracking-[0.6px] text-[rgba(255,255,255,0.45)]">
                        {ins.tone === "warning"
                          ? "Atención"
                          : ins.tone === "opportunity"
                            ? "Oportunidad"
                            : ins.tone === "celebration"
                              ? "Logro"
                              : "Nota"}
                      </span>
                    </div>
                    <p className="font-['Geist'] text-[14.5px] leading-[20px] text-white/95">
                      {ins.text}
                    </p>
                  </div>
                  {ins.cta && (
                    <span className="flex-none self-center inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-full text-[12px] font-medium font-['Geist'] text-black bg-white">
                      {getDistinctCtaLabel(ins.cta.label, ins.cta.action as InsightAction, ins.text)}
                      <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
                    </span>
                  )}
                </motion.button>
              ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
