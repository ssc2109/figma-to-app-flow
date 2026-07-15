import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { Briefing } from "@/lib/api/briefing.functions";
import type { HomeNavIntent } from "@/components/home/ProactiveHero";

type GrowCard = {
  tag: string;
  title: string;
  grad: string;
  intent: HomeNavIntent;
};

const GROW: GrowCard[] = [
  {
    tag: "Promo",
    title: "Crea una promo para el finde",
    grad:
      "radial-gradient(110% 110% at 20% 20%, #db9140 0%, transparent 50%), radial-gradient(120% 120% at 84% 26%, #ce4f82 0%, transparent 50%), linear-gradient(165deg, #2a1622 0%, #150b12 100%)",
    intent: { kind: "chat", prompt: "Ayúdame a crear una promo para este fin de semana" },
  },
  {
    tag: "Combo",
    title: "Arma un combo y vende más",
    grad:
      "radial-gradient(110% 110% at 20% 14%, #6244b8 0%, transparent 52%), radial-gradient(120% 120% at 84% 30%, #9a57e0 0%, transparent 48%), linear-gradient(165deg, #1c1733 0%, #0d0a18 100%)",
    intent: { kind: "chat", prompt: "Sugiéreme combos de productos para vender más" },
  },
  {
    tag: "Idea",
    title: "Comparte tu catálogo por WhatsApp",
    grad:
      "radial-gradient(110% 110% at 18% 16%, #1f7fc2 0%, transparent 52%), radial-gradient(120% 120% at 86% 26%, #2cc0d6 0%, transparent 50%), linear-gradient(165deg, #102a3f 0%, #0a1622 100%)",
    intent: { kind: "screen", screen: "crecer" },
  },
];

export default function MissionsCarousel({
  onIntent,
}: {
  briefing?: Briefing | undefined;
  isLoading?: boolean;
  onIntent: (i: HomeNavIntent) => void;
}) {
  return (
    <div className="w-full flex flex-col gap-[14px]">
      <div className="flex flex-col gap-[4px]">
        <span className="font-['Geist'] text-[10.5px] font-semibold tracking-[1.6px] uppercase text-[rgba(255,255,255,0.5)]">
          Ideas de socIA
        </span>
        <h2 className="font-['Bai_Jamjuree'] font-semibold text-[22px] leading-[26px] text-white tracking-[-0.4px]">
          Para crecer
        </h2>
      </div>

      <div className="-mx-[20px] px-[20px] flex gap-[14px] overflow-x-auto no-scrollbar pb-[4px]">
        {GROW.map((c, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => onIntent(c.intent)}
            whileTap={{ scale: 0.985 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="shrink-0 w-[66%] max-w-[250px] rounded-[22px] overflow-hidden text-left p-0"
            style={{
              background: "#0E0E12",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="relative h-[132px]" style={{ background: c.grad }}>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(8,8,12,0.55) 0%, transparent 52%)",
                }}
              />
              <span
                className="absolute left-[12px] bottom-[12px] px-[11px] py-[5px] rounded-full font-['Geist'] text-[10.5px] font-semibold tracking-[0.4px] text-white"
                style={{
                  background: "rgba(10,10,14,0.45)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                {c.tag}
              </span>
            </div>
            <div className="px-[16px] pt-[14px] pb-[18px] flex items-center justify-between gap-[10px]">
              <span className="font-['Geist'] text-[15.5px] font-semibold text-white tracking-[-0.2px] leading-[20px]">
                {c.title}
              </span>
              <ArrowRight
                size={16}
                strokeWidth={2.2}
                className="shrink-0 text-[rgba(255,255,255,0.4)]"
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
