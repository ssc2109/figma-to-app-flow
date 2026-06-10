import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
        className="absolute inset-[-5px] rounded-full opacity-80 trax-conic-ring"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.85) 25%, transparent 50%, rgba(255,255,255,0.55) 75%, transparent 100%)",
          filter: "blur(5px)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full socia-orb"
        data-spinning={spinning ? "true" : "false"}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #ffffff 0%, #d6d6d6 22%, #6a6a6e 55%, #1a1a1e 88%, #000 100%)",
          boxShadow: "0 0 18px rgba(255,255,255,0.22), inset 0 0 6px rgba(0,0,0,0.4)",
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
  // Construye el ciclo de mensajes: todos los insights + prompts como filler conversacional.
  const messages = useMemo(() => {
    if (!briefing) return [];
    const fromInsights = briefing.insights.map((ins) => ({
      text: ins.text,
      cta: ins.cta,
      key: `i-${ins.id}`,
    }));
    const fromPrompts = (briefing.quickPrompts ?? []).map((p, i) => ({
      text: p,
      cta: { label: "Pregúntame", action: "chat" as const, payload: p },
      key: `p-${i}`,
    }));
    const all = [...fromInsights, ...fromPrompts];
    return all.length > 0 ? all : [{ text: "Todo está bajo control. Disfruta tu café.", cta: null, key: "fallback" }];
  }, [briefing]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 5000);
    return () => clearInterval(id);
  }, [messages.length]);

  const current = messages[idx] ?? messages[0];

  const handleTap = () => {
    if (!current) {
      onIntent({ kind: "screen", screen: "socia" });
      return;
    }
    const cta = current.cta;
    if (!cta) {
      onIntent({ kind: "chat", prompt: current.text });
      return;
    }
    const a = cta.action;
    if (a === "reponer") onIntent({ kind: "reponer", productHint: cta.payload });
    else if (a === "cobrar_fiado") onIntent({ kind: "screen", screen: "negocio" });
    else if (a === "finanzas") onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" });
    else if (a === "ventas") onIntent({ kind: "sales" });
    else if (a === "promo") onIntent({ kind: "screen", screen: "crecer" });
    else onIntent({ kind: "chat", prompt: cta.payload ?? current.text });
  };

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="trax-grain relative w-full rounded-[24px] overflow-hidden text-left"
      style={{
        background:
          "linear-gradient(180deg, #131318 0%, #0C0C10 80%, #08080B 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <BorderBeam size={240} duration={10} colorFrom="rgba(255,255,255,0.85)" colorTo="rgba(255,255,255,0.15)" />
      <BorderBeam size={240} duration={10} delay={5} colorFrom="rgba(255,255,255,0.6)" colorTo="rgba(255,255,255,0.05)" />

      <div className="relative p-[18px] flex items-start gap-[14px]">
        <AnimatedOrb size={44} spinning={isLoading} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px] mb-[8px]">
            <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.4px] uppercase text-white">
              socIA
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-white/40" />
            <span className="font-['Geist'] text-[10.5px] tracking-[0.6px] uppercase text-[rgba(255,255,255,0.45)]">
              Asistente
            </span>
            {messages.length > 1 && (
              <span className="ml-auto flex items-center gap-[4px]">
                {messages.map((_, i) => (
                  <span
                    key={i}
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{
                      width: i === idx ? 14 : 4,
                      background: i === idx ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </span>
            )}
          </div>

          {isLoading || !current ? (
            <>
              <div className="h-[16px] w-[85%] rounded trax-skeleton mb-[6px]" />
              <div className="h-[16px] w-[60%] rounded trax-skeleton" />
            </>
          ) : (
            <div className="relative min-h-[44px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-['Geist'] text-[14.5px] leading-[21px] text-white/90">
                    {current.text}
                  </p>
                  {current.cta && (
                    <div className="mt-[12px] inline-flex items-center gap-[6px] px-[12px] py-[7px] rounded-full bg-white text-black text-[12.5px] font-medium font-['Geist']">
                      {current.cta.label}
                      <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2.4} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
