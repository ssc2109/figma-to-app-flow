import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Coins,
  Package,
  TrendingUp,
  PartyPopper,
  Megaphone,
  ShoppingCart,
  MessageCircle,
  Info,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { generateBriefing, type Briefing } from "@/lib/api/briefing.functions";

import type { HomeNavIntent } from "@/components/home/ProactiveHero";

type Tone = Briefing["insights"][number]["tone"];

const TONE: Record<
  Tone,
  { accent: string; soft: string; ring: string; label: string }
> = {
  warning: {
    accent: "#FFB270",
    soft: "rgba(255,178,112,0.14)",
    ring: "rgba(255,178,112,0.30)",
    label: "Atención",
  },
  opportunity: {
    accent: "#7CC3FF",
    soft: "rgba(124,195,255,0.14)",
    ring: "rgba(124,195,255,0.30)",
    label: "Oportunidad",
  },
  celebration: {
    accent: "#5EEAA0",
    soft: "rgba(94,234,160,0.14)",
    ring: "rgba(94,234,160,0.32)",
    label: "Logro",
  },
  info: {
    accent: "rgba(255,255,255,0.85)",
    soft: "rgba(255,255,255,0.06)",
    ring: "rgba(255,255,255,0.14)",
    label: "Info",
  },
};

/** Mismo avatar que usa el chat (AIChat header): círculo glass + Sparkles. */
function ChatStyleAvatar({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-none"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.06))",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
      aria-hidden
    >
      <Sparkles
        className="text-white"
        style={{ height: size * 0.42, width: size * 0.42 }}
        strokeWidth={1.8}
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

  const briefingFn = useServerFn(generateBriefing);
  // Signals sólo para invalidar cache cuando cambia el estado del negocio.
  // El servidor lee su propia data completa (ventas, gastos, productos, fiados,
  // eventos, compras) directamente de Supabase.
  const keySig = [
    dateKey,
    Math.floor(hour / 3),
    inv.lowStock.length,
    bucket(fin.fiadosPending, 50),
    bucket(fin.todayIncome, 200),
    fin.tx.length,
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
        },
      }),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!profile?.id,
  });
}

type ActionShortcut = {
  key: string;
  label: string;
  hint: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  intent: HomeNavIntent;
};

function iconFor(action: string, tone: Tone) {
  if (action === "reponer") return Package;
  if (action === "cobrar_fiado") return Coins;
  if (action === "finanzas") return TrendingUp;
  if (action === "ventas") return ShoppingCart;
  if (action === "promo") return Megaphone;
  if (action === "chat") return MessageCircle;
  if (tone === "warning") return AlertTriangle;
  if (tone === "celebration") return PartyPopper;
  if (tone === "opportunity") return TrendingUp;
  return Info;
}

/**
 * Sólo construye atajos a partir de insights REALES con CTA.
 * Si no hay nada accionable, retorna [] y no se renderiza la sección.
 */
function shortcutsFor(briefing: Briefing | undefined): ActionShortcut[] {
  const out: ActionShortcut[] = [];
  const seen = new Set<string>();
  for (const ins of briefing?.insights ?? []) {
    if (!ins.cta) continue;
    const a = ins.cta.action;
    let intent: HomeNavIntent;
    let hint = "";
    if (a === "reponer") {
      intent = { kind: "reponer", productHint: ins.cta.payload };
      hint = "Inventario";
    } else if (a === "cobrar_fiado") {
      intent = { kind: "screen", screen: "negocio" };
      hint = "Fiados";
    } else if (a === "finanzas") {
      intent = { kind: "screen", screen: "negocio", subview: "finanzas" };
      hint = "Finanzas";
    } else if (a === "ventas") {
      intent = { kind: "sales" };
      hint = "Cobrar";
    } else if (a === "promo") {
      intent = { kind: "screen", screen: "crecer" };
      hint = "Crecer";
    } else {
      intent = { kind: "chat", prompt: ins.cta.payload ?? ins.text };
      hint = "Pregúntale";
    }
    const dedupe = `${hint}:${ins.cta.payload ?? ""}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    out.push({
      key: ins.id,
      label: ins.cta.label,
      hint,
      tone: ins.tone,
      icon: iconFor(a, ins.tone),
      intent,
    });
  }
  return out.slice(0, 3);
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
  const messages = useMemo(() => {
    if (!briefing) return [];
    // Solo insights reales (data-driven). Nunca mezclar quickPrompts genéricos.
    const fromInsights = briefing.insights.map((ins) => ({
      text: ins.text,
      key: `i-${ins.id}`,
      tone: ins.tone,
    }));
    if (fromInsights.length > 0) return fromInsights.slice(0, 3);
    // Sin insights accionables: un único mensaje de estado calmo, contextual si hay salesNote.
    return [
      {
        text: briefing.salesNote ?? "Todo tranquilo por ahora. Sin alertas del negocio.",
        key: "calm",
        tone: "info" as Tone,
      },
    ];
  }, [briefing]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      5000,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  const current = messages[idx] ?? messages[0];
  const shortcuts = useMemo(() => shortcutsFor(briefing), [briefing]);

  // Tono dominante = primer insight con cta, sino info.
  const dominantTone: Tone = shortcuts[0]?.tone ?? "info";
  const dom = TONE[dominantTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="relative w-full rounded-[22px] overflow-hidden p-[18px] flex flex-col gap-[16px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(22,22,28,0.92) 0%, rgba(16,16,20,0.96) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 40px -22px rgba(0,0,0,0.7)",
      }}
    >
      {/* Línea de tensión vertical tonal — signature element */}
      <span
        className="absolute left-0 top-[18px] bottom-[18px] w-[2px] rounded-r-full"
        style={{
          background: `linear-gradient(180deg, ${dom.accent} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
        aria-hidden
      />

      <div className="flex items-start gap-[14px]">
        <ChatStyleAvatar size={44} />
        <div className="flex-1 min-w-0 pt-[2px]">
          <div className="flex items-center gap-[8px] mb-[8px]">
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
                      background:
                        i === idx
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.16)",
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
                <motion.p
                  key={current.key}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-['Geist'] text-[15px] leading-[21px] text-white/92 tracking-[-0.1px]"
                >
                  {current.text}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Atajos sólo si socIA detectó algo accionable */}
      {!isLoading && shortcuts.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {shortcuts.map((s, i) => {
            const t = TONE[s.tone];
            const Icon = s.icon;
            return (
              <motion.button
                key={s.key}
                type="button"
                onClick={() => onIntent(s.intent)}
                whileTap={{ scale: 0.985 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group relative w-full rounded-[14px] pl-[12px] pr-[14px] py-[12px] flex items-center gap-[12px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span
                  className="h-[34px] w-[34px] rounded-[10px] grid place-items-center flex-none"
                  style={{
                    background: t.soft,
                    border: `1px solid ${t.ring}`,
                  }}
                >
                  <Icon
                    className="h-[15px] w-[15px]"
                    strokeWidth={2.2}
                    {...({ style: { color: t.accent } } as any)}
                  />
                </span>
                <div className="flex flex-col items-start gap-[1px] min-w-0 flex-1">
                  <span
                    className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.1px]"
                    style={{ color: t.accent, opacity: 0.85 }}
                  >
                    {s.hint}
                  </span>
                  <span className="font-['Geist'] text-[13.5px] font-medium text-white truncate w-full">
                    {s.label}
                  </span>
                </div>
                <ArrowUpRight
                  className="h-[15px] w-[15px] text-white/55 flex-none transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                  strokeWidth={2.2}
                />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
