import { ChevronRight, AlertTriangle, Sparkles } from "lucide-react";

/**
 * Pill de meta del día.
 * Borde redondo que se va llenando en sentido horario con conic-gradient.
 */
export function GoalPill({
  current = 1250,
  goal = 1500,
}: {
  current?: number;
  goal?: number;
}) {
  const pct = Math.max(0, Math.min(100, (current / goal) * 100));
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 2)}K` : `${n}`;

  return (
    <div
      className="relative rounded-full p-[1.5px]"
      style={{
        background: `conic-gradient(from 270deg, #4ADE80 0%, #4ADE80 ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
      }}
    >
      <div className="rounded-full bg-black/60 backdrop-blur-md px-[14px] py-[6px] flex items-center gap-[6px]">
        <span className="font-['Geist'] text-[11px] font-medium tracking-[0.3px] text-[rgba(255,255,255,0.55)] uppercase">
          Meta del día
        </span>
        <span className="text-[rgba(255,255,255,0.25)] text-[10px]">·</span>
        <span className="font-['Bai_Jamjuree'] text-[12px] font-semibold text-white">
          S/{fmt(current)}
        </span>
        <span className="font-['Geist'] text-[11px] text-[rgba(255,255,255,0.45)]">
          de S/{fmt(goal)}
        </span>
      </div>
    </div>
  );
}

/**
 * Card de Trax AI — identidad propia, distinta al resto.
 */
export function AiCard({
  name = "Alberto",
  message = "hoy es un buen día para reponer stock de abarrotes. Tus ventas subieron un 12%.",
}: {
  name?: string;
  message?: string;
}) {
  return (
    <button
      type="button"
      className="group relative w-full rounded-[24px] overflow-hidden text-left"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.05)",
      }}

    >
      <div className="relative flex items-center gap-[14px] p-[18px]">
        <div
          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Sparkles className="h-[18px] w-[18px] text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[1.4px] text-white/45">
            Trax AI
          </div>
          <p className="mt-[4px] font-['Geist'] text-[13.5px] leading-[19px] text-white/85">
            <span className="font-semibold text-white">{name},</span> {message}
          </p>
        </div>
        <ChevronRight className="h-[18px] w-[18px] shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}


export type StockAlert = { name: string; units: number };

/**
 * Card de alerta de stock. Solo renderiza si hay alertas.
 */
export function StockAlertCard({ alerts }: { alerts: StockAlert[] }) {
  if (!alerts.length) return null;
  const top = alerts[0];
  const extra = alerts.length - 1;

  return (
    <button
      type="button"
      className="group relative w-full rounded-[24px] overflow-hidden text-left"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.05)",
      }}

    >
      <div className="relative flex items-center gap-[14px] p-[16px]">
        <div
          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.20)",
          }}
        >
          <AlertTriangle className="h-[18px] w-[18px] text-[#F87171]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[1.4px] text-white/45">
            Stock crítico
          </div>
          <p className="mt-[3px] font-['Geist'] text-[13.5px] leading-[19px] text-white/85">
            <span className="font-semibold">{top.name}</span>
            <span className="text-white/55"> — quedan </span>
            <span className="font-['Bai_Jamjuree'] font-semibold text-white">
              {top.units}
            </span>
            <span className="text-white/55"> unidades</span>
            {extra > 0 && (
              <span className="text-white/40"> · +{extra} más</span>
            )}
          </p>
        </div>
        <ChevronRight className="h-[18px] w-[18px] shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

