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

function AnimatedOrb({ size = 44, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <div className="relative flex-none" style={{ width: size, height: size }} aria-hidden>
      {/* Halo azul suave (mismo lenguaje que el orb del chat) */}
      <div
        className="absolute inset-[-10px] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(closest-side, rgba(77,200,253,0.5), rgba(28,124,255,0.2) 55%, transparent 75%)",
          filter: "blur(10px)",
        }}
      />
      {/* Orb idéntico al AssistantAvatar del chat */}
      <div
        className="absolute inset-0 rounded-full socia-orb"
        data-spinning={spinning ? "true" : "false"}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #cfe6ff 0%, #4dc8fd 22%, #1c7cff 48%, #003fc0 78%, #061535 100%)",
          boxShadow:
            "0 0 22px rgba(28,124,255,0.35), inset 0 0 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
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
      className="relative w-full text-left"
    >
      <div className="relative flex items-start gap-[16px]">
        <AnimatedOrb size={48} spinning={isLoading} />
        <div className="flex-1 min-w-0 pt-[2px]">
          <div className="flex items-center gap-[8px] mb-[10px]">
            <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.6px] uppercase text-white">
              socIA
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
            <span className="font-['Geist'] text-[10.5px] tracking-[0.8px] uppercase text-[rgba(255,255,255,0.4)]">
              te escribe
            </span>
            {messages.length > 1 && (
              <span className="ml-auto flex items-center gap-[4px]">
                {messages.map((_, i) => (
                  <span
                    key={i}
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{
                      width: i === idx ? 14 : 4,
                      background: i === idx ? "rgba(77,200,253,0.85)" : "rgba(255,255,255,0.16)",
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
                  <p className="font-['Geist'] text-[15.5px] leading-[22px] text-white/92 tracking-[-0.1px]">
                    {current.text}
                  </p>
                  {current.cta && (
                    <div className="mt-[14px] inline-flex items-center gap-[6px] text-white/85 font-['Geist'] text-[12.5px] font-medium border-b border-white/25 pb-[2px]">
                      {current.cta.label}
                      <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2.4} />
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
