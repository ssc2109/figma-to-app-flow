import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Briefing } from "@/lib/api/briefing.functions";
import type { HomeNavIntent } from "@/components/home/ProactiveHero";

const TONE_META: Record<
  Briefing["insights"][number]["tone"],
  { label: string; color: string; bg: string; category: string }
> = {
  warning: { label: "Crítico", color: "#F87171", bg: "rgba(248,113,113,0.12)", category: "Atención" },
  opportunity: { label: "Oportunidad", color: "#FCD34D", bg: "rgba(252,211,77,0.12)", category: "Crecer" },
  celebration: { label: "Logro", color: "#4ADE80", bg: "rgba(74,222,128,0.12)", category: "Hoy" },
  info: { label: "Nota", color: "rgba(255,255,255,0.7)", bg: "rgba(255,255,255,0.08)", category: "General" },
};

export default function MissionsCarousel({
  briefing,
  isLoading,
  onIntent,
}: {
  briefing: Briefing | undefined;
  isLoading: boolean;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const all = briefing?.insights ?? [];
  const items = all.length <= 1 ? all : all.slice(1);

  if (!isLoading && items.length === 0) return null;

  const handle = (ins: Briefing["insights"][number]) => {
    if (!ins.cta) {
      onIntent({ kind: "chat", prompt: ins.text });
      return;
    }
    const a = ins.cta.action;
    if (a === "reponer") onIntent({ kind: "reponer", productHint: ins.cta.payload });
    else if (a === "cobrar_fiado") onIntent({ kind: "screen", screen: "negocio" });
    else if (a === "finanzas") onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" });
    else if (a === "ventas") onIntent({ kind: "sales" });
    else if (a === "promo") onIntent({ kind: "screen", screen: "crecer" });
    else onIntent({ kind: "chat", prompt: ins.text });
  };

  return (
    <div className="w-full flex flex-col gap-[12px]">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-[4px]">
          <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.6px] uppercase text-[rgba(255,255,255,0.5)]">
            Prioridades de socIA
          </span>
          <h2 className="font-['Bai_Jamjuree'] font-semibold text-[22px] leading-[26px] text-white tracking-[-0.4px]">
            Misiones Críticas
          </h2>
        </div>
        <Sparkles className="h-[16px] w-[16px] text-[rgba(255,255,255,0.35)] mb-[6px]" strokeWidth={1.6} />
      </div>

      <div className="-mx-[20px] px-[20px] flex gap-[12px] overflow-x-auto no-scrollbar pb-[4px] snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[78%] h-[170px] rounded-[22px] trax-skeleton"
              />
            ))
          : items.map((ins, i) => {
              const meta = TONE_META[ins.tone];
              return (
                <motion.button
                  key={ins.id ?? i}
                  type="button"
                  onClick={() => handle(ins)}
                  whileTap={{ scale: 0.985 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="snap-start shrink-0 w-[78%] rounded-[22px] p-[18px] text-left flex flex-col gap-[14px]"
                  style={{
                    background: "#0F0F12",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center gap-[8px]">
                    <span
                      className="px-[10px] py-[4px] rounded-full font-['Geist'] text-[10.5px] font-semibold tracking-[0.8px] uppercase"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="font-['Geist'] text-[10.5px] tracking-[0.8px] uppercase text-[rgba(255,255,255,0.45)]">
                      {meta.category}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="font-['Geist'] text-[15px] leading-[21px] text-white/95">
                      {ins.text}
                    </p>
                  </div>

                  {ins.cta && (
                    <div className="flex items-center justify-between pt-[4px]">
                      <span className="inline-flex items-center gap-[6px] font-['Geist'] text-[12.5px] font-medium text-white">
                        {ins.cta.label}
                        <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
                      </span>
                      <span className="text-[16px]">{ins.emoji}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
      </div>
    </div>
  );
}
