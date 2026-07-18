/**
 * Trax · Crecer visual primitives
 *
 * Extraídos 1:1 del lenguaje visual de la sección "Crecer" (Formalizacion.tsx)
 * para unificar la identidad visual en toda la app.
 *
 * NO cambian lógica ni comportamiento — solo apariencia.
 */
import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Tokens ---------- */
export const TRAX_ACCENT = "#3b82f6";
export const TRAX_ACCENT_HOVER = "#2563eb";

/* ---------- Panel ----------
 * Superficie oscura con gradiente sutil desde el tono acento y glow radial
 * discreto detrás. Reemplaza cards planas coloridas por la estética Crecer.
 */
type PanelProps = HTMLAttributes<HTMLDivElement> & {
  tone?: string;
  withGlow?: boolean;
  glowIntensity?: number;
};
export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { tone = TRAX_ACCENT, withGlow = true, glowIntensity = 0.3, className, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden rounded-[24px]", className)}
      style={{
        background: `linear-gradient(160deg, ${tone}1a 0%, rgba(24,24,27,0.6) 45%, rgba(9,9,11,1) 100%)`,
        border: "1px solid rgba(255,255,255,0.07)",
        ...style,
      }}
      {...rest}
    >
      {withGlow && (
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl"
          style={{ background: tone, opacity: glowIntensity }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
});

/* ---------- IconTile ----------
 * Cuadrado 56–64px con fondo tono/10% y border tono/25% con ícono coloreado
 * al tono. La firma visual de todos los headers de Crecer.
 */
export function IconTile({
  children,
  tone = TRAX_ACCENT,
  size = 56,
  className,
}: {
  children: ReactNode;
  tone?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-[16px]", className)}
      style={{
        width: size,
        height: size,
        background: `${tone}1a`,
        border: `1px solid ${tone}40`,
        color: tone,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- PrimaryButton ----------
 * CTA azul sólido con radio 16, altura 52, Geist SemiBold.
 * Reemplaza los CTAs blancos "bg-white text-black" para el nuevo acento global.
 */
type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  block?: boolean;
};
export function PrimaryButton({
  size = "md",
  block = false,
  className,
  children,
  ...rest
}: PrimaryButtonProps) {
  const h = size === "sm" ? "h-[40px] text-[13px] px-[16px]" : size === "lg" ? "h-[52px] text-[15px] px-[22px]" : "h-[46px] text-[14px] px-[20px]";
  return (
    <button
      {...rest}
      className={cn(
        "trax-btn-primary rounded-[16px] font-['Geist'] font-semibold text-white flex items-center justify-center gap-[8px] active:scale-[0.99] transition-all",
        h,
        block && "w-full",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
      style={{ background: "var(--trax-accent)" }}
    >
      {children}
    </button>
  );
}

/* ---------- MetaChip ---------- */
export function MetaChip({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full font-['Geist'] text-[11px] text-white/70",
        className,
      )}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------- Eyebrow ---------- */
export function Eyebrow({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <p
      className={cn("font-['Geist'] text-[11px] uppercase tracking-[1.6px]", className)}
      style={{ color: tone ?? "rgba(255,255,255,0.40)" }}
    >
      {children}
    </p>
  );
}

/* ---------- SectionTitle ---------- */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "font-['Bai_Jamjuree'] text-[22px] font-semibold tracking-[-0.3px] text-white",
        className,
      )}
    >
      {children}
    </h2>
  );
}
