import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { generateBriefing, type Briefing } from "@/lib/api/briefing.functions";

import type { HomeNavIntent } from "@/components/home/ProactiveHero";

/** Mismo avatar que usa el chat (AIChat header): círculo glass + Sparkles. */
function ChatStyleAvatar({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
      aria-hidden
    >
      <Sparkles className="text-white" style={{ height: size * 0.42, width: size * 0.42 }} strokeWidth={1.8} />
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

type ActionShortcut = {
  key: string;
  label: string;
  hint: string;
  intent: HomeNavIntent;
};

function shortcutsFor(briefing: Briefing | undefined): ActionShortcut[] {
  const out: ActionShortcut[] = [];
  const seen = new Set<string>();
  for (const ins of briefing?.insights ?? []) {
    if (!ins.cta) continue;
    const a = ins.cta.action;
    let intent: HomeNavIntent | null = null;
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
      hint = "Chat";
    }
    if (seen.has(hint)) continue;
    seen.add(hint);
    out.push({ key: ins.id, label: ins.cta.label, hint, intent });
  }
  // Asegura al menos 2 atajos.
  if (!seen.has("Chat")) {
    out.push({
      key: "ask",
      label: "Pregúntale a socIA",
      hint: "Chat",
      intent: { kind: "screen", screen: "socia" },
    });
  }
  if (out.length < 2) {
    out.push({
      key: "ventas",
      label: "Registrar venta",
      hint: "Cobrar",
      intent: { kind: "sales" },
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
    const fromInsights = briefing.insights.map((ins) => ({ text: ins.text, key: `i-${ins.id}` }));
    const fromPrompts = (briefing.quickPrompts ?? []).map((p, i) => ({ text: p, key: `p-${i}` }));
    const all = [...fromInsights, ...fromPrompts];
    return all.length > 0 ? all : [{ text: "Todo está bajo control. Disfruta tu café.", key: "fallback" }];
  }, [briefing]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 5000);
    return () => clearInterval(id);
  }, [messages.length]);

  const current = messages[idx] ?? messages[0];
  const shortcuts = useMemo(() => shortcutsFor(briefing), [briefing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="relative w-full rounded-[22px] overflow-hidden p-[18px] flex flex-col gap-[16px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(28,124,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px -20px rgba(28,124,255,0.4)",
      }}
    >
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
                      background: i === idx ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.16)",
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

      {/* Atajos sugeridos por socIA — cards dentro de la card */}
      {!isLoading && shortcuts.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          {shortcuts.map((s, i) => (
            <motion.button
              key={s.key}
              type="button"
              onClick={() => onIntent(s.intent)}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="w-full rounded-[14px] px-[14px] py-[12px] flex items-center justify-between gap-[10px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex flex-col items-start gap-[2px] min-w-0">
                <span className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.1px] text-[rgba(255,255,255,0.5)]">
                  {s.hint}
                </span>
                <span className="font-['Geist'] text-[13.5px] font-medium text-white truncate">
                  {s.label}
                </span>
              </div>
              <ArrowUpRight className="h-[15px] w-[15px] text-white/70 flex-none" strokeWidth={2.2} />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
