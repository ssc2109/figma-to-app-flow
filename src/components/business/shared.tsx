import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

/* ============================================================
   Trax · primitives (Apple-style discipline)
   - One intention per screen.
   - Hairlines over filled containers.
   - No tinted icon boxes. No decorative chips.
   ============================================================ */

/* ---------- legacy surface (kept for compat) ---------- */
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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- typographic ---------- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-[6px] pb-[10px] font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
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
    <div className="flex items-end justify-between w-full px-[6px] pb-[10px]">
      <span className="font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
        {title}
      </span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="font-['Geist'] text-[12px] text-white/55 hover:text-white transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ---------- list group (Apple Settings vibe) ---------- */
export function ListGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      {children}
    </div>
  );
}

export function RowDivider() {
  return <div className="h-px bg-white/[0.05] ml-[54px]" />;
}

export function PlainRow({
  Icon,
  label,
  meta,
  onClick,
  trailing,
  danger,
  disabled,
}: {
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  meta?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  const Tag = onClick ? "button" : ("div" as const);
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left ${
        onClick ? "active:bg-white/[0.025] transition-colors" : ""
      }`}
    >
      {Icon && (
        <Icon
          className={`h-[18px] w-[18px] shrink-0 ${danger ? "text-[#F87171]" : "text-white/70"}`}
          strokeWidth={1.6}
        />
      )}
      <div className="flex-1 min-w-0">
        <div
          className={`font-['Geist'] text-[15px] leading-[1.25] truncate ${
            danger ? "text-[#F87171]" : "text-white"
          }`}
          style={{ fontWeight: 400 }}
        >
          {label}
        </div>
        {meta && (
          <div className="mt-[2px] font-['Geist'] text-[12.5px] text-white/45 truncate">
            {meta}
          </div>
        )}
      </div>
      {trailing ?? (onClick && <ChevronRight className="h-[16px] w-[16px] text-white/25" strokeWidth={1.6} />)}
    </Tag>
  );
}

/* ---------- page header (small, calm) ---------- */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-[12px] px-[24px] pt-[26px] pb-[8px]">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <div className="font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-[6px] font-['Bai_Jamjuree'] text-[30px] font-semibold text-white tracking-[-0.8px] leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-[6px] font-['Geist'] text-[13.5px] text-white/45 leading-[1.45]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pt-[4px]">{action}</div>}
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
    <div className="flex items-center gap-[14px] px-[20px] pt-[22px] pb-[12px]">
      <button
        type="button"
        onClick={onBack}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full active:bg-white/[0.06] transition-colors"
        aria-label="Volver"
      >
        <ChevronLeft className="h-[20px] w-[20px] text-white/75" strokeWidth={1.8} />
      </button>
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.4px] text-white/35">
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
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {children}
    </motion.div>
  );
}

/* ---------- footer mark ---------- */
export function FooterMark({ children }: { children: ReactNode }) {
  return (
    <p className="font-['Geist'] text-[11px] text-white/25 text-center pt-[28px] pb-[8px] tracking-[0.2px]">
      {children}
    </p>
  );
}
