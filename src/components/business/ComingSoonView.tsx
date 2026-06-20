import { motion } from "motion/react";
import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";
import { SubHeader, SubScreen } from "./shared";

export default function ComingSoonView({
  onBack, title, eyebrow, icon: Icon, description, bullets,
}: {
  onBack: () => void;
  title: string;
  eyebrow?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
  bullets?: string[];
}) {
  return (
    <SubScreen>
      <SubHeader eyebrow={eyebrow ?? "Próximamente"} title={title} onBack={onBack} />

      <div className="px-[20px] pt-[14px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
          <div className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(120% 90% at 50% 0%, rgba(74,222,128,0.10), transparent 55%), radial-gradient(60% 50% at 100% 100%, rgba(120,180,255,0.06), transparent 60%)",
            }} />
          <div className="relative px-[22px] pt-[44px] pb-[36px] flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 20 }}
              className="h-[78px] w-[78px] rounded-[24px] grid place-items-center mb-[20px]"
              style={{
                background: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 65%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 12px 40px -10px rgba(74,222,128,0.15)",
              }}>
              <Icon className="h-[32px] w-[32px] text-white" strokeWidth={1.6} />
            </motion.div>

            <div className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full mb-[14px]"
              style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.25)" }}>
              <Sparkles className="h-[11px] w-[11px] text-[#4ADE80]" strokeWidth={2} />
              <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-[#4ADE80]">
                En desarrollo
              </span>
            </div>

            <h2 className="font-['Bai_Jamjuree'] text-[24px] font-semibold text-white tracking-[-0.5px] leading-[1.15]">
              {title}
            </h2>
            <p className="mt-[10px] font-['Geist'] text-[13.5px] text-white/55 max-w-[300px] leading-[1.5]">
              {description}
            </p>
          </div>
        </motion.div>

        {bullets && bullets.length > 0 && (
          <div className="mt-[20px]">
            <div className="px-[6px] pb-[10px] font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
              Qué podrás hacer
            </div>
            <div className="rounded-[18px] overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
              {bullets.map((b, i) => (
                <motion.div key={b}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                  className="flex items-center gap-[12px] px-[16px] py-[13px]">
                  <span className="h-[5px] w-[5px] rounded-full bg-white/35 shrink-0" />
                  <span className="font-['Geist'] text-[13.5px] text-white/75 leading-[1.35]">{b}</span>
                  {i < bullets.length - 1 && <div className="h-px bg-white/[0.05]" />}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SubScreen>
  );
}
