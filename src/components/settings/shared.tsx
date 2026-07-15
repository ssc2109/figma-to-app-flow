import { type LucideIcon, ChevronRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { usePlan } from "@/hooks/usePlan";

/* ============================================================
 * Tokens compartidos — coherentes con DESIGN.md
 * ============================================================ */
export const SURFACE = "rgba(255,255,255,0.035)";
export const SURFACE_HAIRLINE = "1px solid rgba(255,255,255,0.06)";
export const ICON_TILE = "bg-white/[0.05] border border-white/[0.07]";

/* ============================================================
 * Shell reutilizable: header sticky + safe-area para nav
 * ============================================================ */
export function SettingsShell({
  title,
  eyebrow,
  onBack,
  right,
  footer,
  children,
}: {
  title: string;
  eyebrow?: string;
  onBack: () => void;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full text-white pb-[200px]">
      <div
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(0,0,0,0.72)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <button
            type="button"
            onClick={onBack}
            className="h-[40px] w-[40px] grid place-items-center rounded-full bg-white/[0.05] border border-white/[0.08] active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              {eyebrow ?? "Ajustes"}
            </div>
            <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.3px] truncate">
              {title}
            </div>
          </div>
          {right}
        </div>
      </div>

      {children}

      {footer && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 backdrop-blur-xl"
          style={{
            background: "rgba(0,0,0,0.85)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 110px)",
          }}
        >
          <div className="px-[16px] py-[12px]">{footer}</div>
        </div>
      )}
    </div>
  );
}

export function SaveButton({
  onClick,
  saving,
  disabled,
  children = "Guardar",
}: {
  onClick: () => void;
  saving?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || saving}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-[36px] px-[14px] rounded-full bg-white text-black font-['Geist'] text-[13px] font-semibold flex items-center gap-[6px] disabled:opacity-40"
    >
      {saving ? (
        <Loader2 className="h-[14px] w-[14px] animate-spin" />
      ) : (
        <Check className="h-[14px] w-[14px]" />
      )}
      {children}
    </motion.button>
  );
}

/* ============================================================
 * Section: título uppercase + card contenedora
 * ============================================================ */
export function Section({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-[20px] mt-[28px] ${className ?? ""}`}>
      {title && (
        <div className="flex items-baseline justify-between px-[4px] mb-[10px]">
          <div className="font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.6px] text-white/40">
            {title}
          </div>
          {hint && (
            <div className="font-['Geist'] text-[10.5px] text-white/30">{hint}</div>
          )}
        </div>
      )}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: SURFACE, border: SURFACE_HAIRLINE }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Row — patrón Apple/Wise: icono cuadrado + título + valor + chevron
 * ============================================================ */
export function NavRow({
  icon: Icon,
  title,
  description,
  value,
  onClick,
  last,
  disabled,
  tone = "default",
  right,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  last?: boolean;
  disabled?: boolean;
  tone?: "default" | "danger";
  right?: ReactNode;
}) {
  const isDanger = tone === "danger";
  return (
    <>
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className="w-full flex items-center gap-[12px] px-[16px] py-[13px] text-left active:bg-white/[0.03] disabled:opacity-45"
      >
        <div
          className={`h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 ${
            isDanger
              ? "bg-[rgba(248,113,113,0.10)] border border-[rgba(248,113,113,0.22)]"
              : ICON_TILE
          }`}
        >
          <Icon
            className={`h-[15px] w-[15px] ${isDanger ? "text-[#F87171]" : "text-white/78"}`}
            strokeWidth={1.7}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-['Geist'] text-[14.5px] leading-[1.25] ${
              isDanger ? "text-[#F87171]" : "text-white"
            } truncate`}
          >
            {title}
          </div>
          {description && (
            <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px] truncate">
              {description}
            </div>
          )}
        </div>
        {right ??
          (value ? (
            <div className="font-['Geist'] text-[13px] text-white/55 tabular-nums max-w-[130px] truncate text-right">
              {value}
            </div>
          ) : null)}
        {onClick && !disabled && (
          <ChevronRight className="h-[16px] w-[16px] text-white/25 shrink-0" strokeWidth={1.7} />
        )}
      </button>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

/* ============================================================
 * FormRow — patrón para subpantalla: label arriba, input abajo
 * ============================================================ */
export function FormRow({
  icon: Icon,
  label,
  children,
  hint,
  last,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-start gap-[12px] px-[16px] py-[14px]">
        <div className={`h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 mt-[2px] ${ICON_TILE}`}>
          <Icon className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/40 mb-[4px]">
            {label}
          </div>
          {children}
          {hint && (
            <div className="font-['Geist'] text-[11.5px] text-white/35 mt-[6px]">{hint}</div>
          )}
        </div>
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  numeric,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  numeric?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent outline-none text-white placeholder:text-white/25 ${
        numeric
          ? "font-['Bai_Jamjuree'] text-[15px] font-semibold tabular-nums"
          : "font-['Geist'] text-[14.5px]"
      }`}
      style={{ colorScheme: "dark" }}
    />
  );
}

export function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className="relative h-[26px] w-[44px] rounded-full transition-colors disabled:opacity-40 shrink-0"
      style={{ background: value ? "#3b82f6" : "rgba(255,255,255,0.12)" }}
      aria-pressed={value}
    >
      <span
        className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white transition-transform"
        style={{ transform: value ? "translateX(21px)" : "translateX(3px)" }}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      className="inline-flex p-[4px] rounded-[12px] w-full"
      style={{ background: "rgba(255,255,255,0.04)", border: SURFACE_HAIRLINE }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex-1 h-[32px] rounded-[9px] font-['Geist'] text-[12.5px] font-semibold transition-colors"
            style={{
              background: active ? "#ffffff" : "transparent",
              color: active ? "#000" : "rgba(255,255,255,0.7)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
 * PlanChip
 * ============================================================ */
export function PlanChip({ compact }: { compact?: boolean }) {
  const { plan, isTrialing, daysLeft } = usePlan();
  const labelMap: Record<string, string> = {
    trial: `Prueba · ${daysLeft}d`,
    gratis: "Gratis",
    pro: "Pro",
    avanzado: "Avanzado",
  };
  const label = isTrialing ? `Prueba · ${daysLeft}d` : labelMap[plan] ?? plan;
  const isPaid = plan === "pro" || plan === "avanzado";
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full font-['Geist'] font-semibold uppercase tracking-[1.2px] ${
        compact ? "h-[22px] px-[10px] text-[9.5px]" : "h-[26px] px-[12px] text-[10.5px]"
      }`}
      style={{
        background: isPaid
          ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.72))"
          : "rgba(255,255,255,0.06)",
        color: isPaid ? "#000" : "rgba(255,255,255,0.75)",
        border: isPaid ? "none" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </span>
  );
}
