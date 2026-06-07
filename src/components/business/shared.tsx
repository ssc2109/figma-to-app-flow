import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

/* ---------- surfaces ---------- */

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[20px] overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-['Geist'] text-[11px] font-semibold uppercase tracking-[1.4px] text-white/45">
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="flex items-end justify-between w-full px-[4px]">
      <h2 className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white/90 tracking-[-0.2px]">
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="font-['Geist'] text-[12.5px] text-white/55 hover:text-white transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ---------- sub-screen scaffolding ---------- */

export function SubHeader({
  eyebrow,
  title,
  onBack,
  action,
}: {
  eyebrow?: string;
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-[12px] px-[20px] pt-[18px] pb-[10px]">
      <button
        type="button"
        onClick={onBack}
        className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95 transition-transform"
        aria-label="Volver"
      >
        <ChevronLeft className="h-[18px] w-[18px] text-white/85" strokeWidth={1.8} />
      </button>
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/45">
            {eyebrow}
          </div>
        )}
        <h1 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.5px] truncate">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function SubScreen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {children}
    </motion.div>
  );
}
