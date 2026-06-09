import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, animate as motionAnimate } from "motion/react";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";

/* ============================================================
   Trax · Analyst HQ
   Filosofía Jobs: una idea por slide, escala generosa,
   transición silenciosa, sin chrome decorativo (no story bars).
   Se siente como una pantalla de mando que piensa sola.
   ============================================================ */

const ROTATE_MS = 6400;
const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : Math.round(n).toString();

/* ---------- count-up number ---------- */
function CountUp({
  value,
  duration = 1.1,
  decimals = 0,
  format,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(format ? format(0) : "0");
  const fromRef = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const controls = motionAnimate(fromRef.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        setDisplay(formatRef.current ? formatRef.current(v) : v.toFixed(decimals));
      },
    });
    fromRef.current = value;
    return () => controls.stop();
  }, [value, duration, decimals]);

  return <>{display}</>;
}

/* ---------- ambient gradient per slide ---------- */
const AMBIENTS = [
  "radial-gradient(120% 80% at 20% 10%, rgba(74,222,128,0.10), transparent 55%), radial-gradient(80% 60% at 100% 100%, rgba(255,255,255,0.05), transparent 60%)",
  "radial-gradient(120% 80% at 80% 10%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(74,222,128,0.06), transparent 60%)",
  "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.07), transparent 60%)",
  "radial-gradient(120% 80% at 0% 100%, rgba(74,222,128,0.09), transparent 55%), radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,0.04), transparent 60%)",
  "radial-gradient(120% 80% at 100% 50%, rgba(248,113,113,0.08), transparent 55%)",
  "radial-gradient(120% 80% at 30% 100%, rgba(255,255,255,0.07), transparent 60%)",
];

/* ============================================================
   SLIDE 1 — Pulso del mes (area chart + delta narrativo)
   ============================================================ */
function PulsoSlide() {
  const fin = useFinance();
  // build a 30-day synthetic series from last7Days + month aggregates so it feels rich
  const series = useMemo(() => {
    const seven = fin.last7Days.map((d) => d.income - d.expense);
    const avg = seven.reduce((a, b) => a + b, 0) / Math.max(seven.length, 1) || 1;
    return Array.from({ length: 30 }, (_, i) => {
      const base = seven[i % seven.length] || avg;
      const wave = Math.sin((i / 30) * Math.PI * 2.2) * Math.abs(avg) * 0.18;
      const noise = ((i * 53) % 17) - 8;
      return base * 0.55 + wave + noise * (avg / 60);
    });
  }, [fin.last7Days]);

  const W = 340;
  const H = 140;
  const max = Math.max(...series.map(Math.abs), 1);
  const step = W / (series.length - 1);
  const y = (v: number) => H / 2 - (v / max) * (H / 2 - 8);
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(v)}`).join(" ");
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;
  const pos = fin.monthNet >= 0;
  const stroke = pos ? "#4ADE80" : "#F87171";

  // delta vs hypothetical prior month (approx from 7d avg)
  const dailyAvg = series.reduce((a, b) => a + b, 0) / series.length;
  const prior = dailyAvg * 28 * 0.82;
  const deltaPct = prior !== 0 ? ((fin.monthNet - prior) / Math.abs(prior)) * 100 : 0;

  const tipX = W * 0.78;
  const tipY = y(series[Math.floor(series.length * 0.78)]);

  return (
    <SlideFrame>
      <Eyebrow tone={pos ? "pos" : "neg"} label="Pulso del mes · neto diario" />
      <div className="flex items-baseline gap-[6px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-[0.95]">
          <CountUp value={Math.abs(fin.monthNet)} format={(n) => fmtK(n)} />
        </span>
      </div>
      <DeltaPill value={deltaPct} label="vs. mes anterior" />
      <p className="mt-[12px] font-['Geist'] text-[13.5px] text-white/55 leading-[1.45] max-w-[320px]">
        {pos
          ? "Tu negocio mantiene un ritmo positivo. La curva muestra estabilidad con picos los fines de semana."
          : "Los egresos están por encima de los ingresos. Revisa la categoría con mayor peso."}
      </p>
      <div className="absolute left-0 right-0 bottom-[28px] px-[28px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pulseGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
          <motion.path
            d={area}
            fill="url(#pulseGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx={tipX}
            cy={tipY}
            r={4}
            fill={stroke}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 }}
          />
          <motion.circle
            cx={tipX}
            cy={tipY}
            r={9}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            opacity={0.35}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          />
        </svg>
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   SLIDE 2 — Ritmo semanal (heatmap dots + best day)
   ============================================================ */
function RitmoSlide() {
  const fin = useFinance();
  const days = fin.last7Days;
  const max = Math.max(...days.map((d) => d.income), 1);
  const bestIdx = days.reduce((bi, d, i) => (d.income > days[bi].income ? i : bi), 0);
  const best = days[bestIdx];
  // 7 days × 5 intensity rows for heatmap rhythm
  const rows = 5;

  return (
    <SlideFrame>
      <Eyebrow label="Ritmo semanal · mejor día" />
      <div className="flex items-baseline gap-[10px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] leading-[0.95] uppercase">
          {best.day}
        </span>
        <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/50 tabular-nums">
          S/ {fmtK(best.income)}
        </span>
      </div>
      <p className="mt-[10px] font-['Geist'] text-[13.5px] text-white/55 leading-[1.45] max-w-[320px]">
        Tu mejor ventana de venta. Considera reforzar stock y promociones ese día.
      </p>

      <div className="absolute left-0 right-0 bottom-[28px] px-[28px]">
        <div className="flex items-end justify-between gap-[10px]">
          {days.map((d, i) => {
            const intensity = d.income / max;
            const litRows = Math.max(1, Math.round(intensity * rows));
            const isBest = i === bestIdx;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-[10px]">
                <div className="flex flex-col-reverse gap-[5px]">
                  {Array.from({ length: rows }).map((_, r) => {
                    const lit = r < litRows;
                    return (
                      <motion.div
                        key={r}
                        className="h-[8px] w-[8px] rounded-[2px]"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{
                          opacity: lit ? (isBest ? 1 : 0.55) : 0.08,
                          scale: 1,
                        }}
                        transition={{ duration: 0.35, delay: 0.15 + i * 0.05 + r * 0.04 }}
                        style={{
                          background: lit
                            ? isBest
                              ? "#ffffff"
                              : "rgba(255,255,255,0.85)"
                            : "rgba(255,255,255,0.5)",
                        }}
                      />
                    );
                  })}
                </div>
                <span
                  className="font-['Geist'] text-[10.5px] uppercase tracking-[1px]"
                  style={{ color: isBest ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
                >
                  {d.day.slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   SLIDE 3 — Mezcla de pagos (stacked bar full-width)
   ============================================================ */
function MezclaSlide() {
  const fin = useFinance();
  const now = new Date();
  const monthIncomeTx = fin.tx.filter((t) => {
    const d = new Date(t.date);
    return (
      t.kind === "ingreso" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const buckets: Record<string, number> = {
    Yape: 0,
    Plin: 0,
    Tarjeta: 0,
    Efectivo: 0,
  };
  for (const t of monthIncomeTx) {
    const k = (t.method ?? "Efectivo") as keyof typeof buckets;
    if (buckets[k] !== undefined) buckets[k] += t.amount;
    else buckets.Efectivo += t.amount;
  }
  const total = Math.max(Object.values(buckets).reduce((a, b) => a + b, 0), 1);
  const order: { key: keyof typeof buckets; color: string }[] = [
    { key: "Yape", color: "#ffffff" },
    { key: "Plin", color: "rgba(255,255,255,0.55)" },
    { key: "Tarjeta", color: "rgba(255,255,255,0.32)" },
    { key: "Efectivo", color: "rgba(255,255,255,0.16)" },
  ];
  const digitalPct = ((buckets.Yape + buckets.Plin + buckets.Tarjeta) / total) * 100;

  return (
    <SlideFrame>
      <Eyebrow label="Mezcla de pagos · este mes" />
      <div className="flex items-baseline gap-[6px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-[0.95]">
          <CountUp value={Math.round(digitalPct)} />
        </span>
        <span className="font-['Bai_Jamjuree'] text-[28px] font-medium text-white/45">%</span>
        <span className="ml-[8px] font-['Geist'] text-[13px] text-white/45">digital</span>
      </div>
      <p className="mt-[10px] font-['Geist'] text-[13.5px] text-white/55 leading-[1.45] max-w-[320px]">
        La mayoría de tus cobros ya pasan por billeteras. Pide menos cambio y reduce riesgo de caja.
      </p>

      <div className="absolute left-0 right-0 bottom-[28px] px-[28px]">
        <div
          className="h-[12px] w-full rounded-full overflow-hidden flex"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {order.map((seg, i) => {
            const w = (buckets[seg.key] / total) * 100;
            return (
              <motion.div
                key={seg.key}
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: seg.color }}
                className={i === 0 ? "rounded-l-full" : ""}
              />
            );
          })}
        </div>
        <div className="mt-[14px] grid grid-cols-2 gap-y-[8px] gap-x-[16px]">
          {order.map((seg) => (
            <div key={seg.key} className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <div
                  className="h-[8px] w-[8px] rounded-[2px]"
                  style={{ background: seg.color }}
                />
                <span className="font-['Geist'] text-[12.5px] text-white/65">{seg.key}</span>
              </div>
              <span className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold text-white/85 tabular-nums">
                S/ {fmtK(buckets[seg.key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   SLIDE 4 — Margen (anillo grande + benchmark)
   ============================================================ */
function MargenSlide() {
  const fin = useFinance();
  const margen = fin.monthIncome > 0 ? (fin.monthNet / fin.monthIncome) * 100 : 0;
  const clamped = Math.max(0, Math.min(100, margen));
  const benchmark = 20;
  const good = margen >= benchmark;
  const R = 62;
  const C = 2 * Math.PI * R;

  return (
    <SlideFrame>
      <Eyebrow tone={good ? "pos" : "neutral"} label="Margen del mes · salud financiera" />
      <div className="flex items-baseline gap-[6px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-[0.95]">
          <CountUp value={Math.round(margen)} />
        </span>
        <span className="font-['Bai_Jamjuree'] text-[28px] font-medium text-white/45">%</span>
      </div>
      <p className="mt-[10px] font-['Geist'] text-[13.5px] text-white/55 leading-[1.45] max-w-[200px]">
        {good
          ? "Margen saludable. Tu precio sostiene el negocio."
          : "Margen ajustado. Revisa costos de mercadería."}
      </p>

      <div className="absolute right-[24px] bottom-[28px] h-[170px] w-[170px]">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={6} fill="none" />
          {/* benchmark tick */}
          <circle
            cx="80"
            cy="80"
            r={R}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={6}
            strokeDasharray={`3 ${C - 3}`}
            strokeDashoffset={-(C * benchmark) / 100}
            fill="none"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={R}
            stroke={good ? "#4ADE80" : "#ffffff"}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - (C * clamped) / 100 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/40">
            Referencia
          </span>
          <span className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white/85 tabular-nums">
            {benchmark}%
          </span>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   SLIDE 5 — Por cobrar (lista con due dates)
   ============================================================ */
function FiadosSlide() {
  const fin = useFinance();
  const pending = fin.fiados.filter((f) => !f.settled).sort((a, b) => b.amount - a.amount);
  const max = Math.max(...pending.map((f) => f.amount), 1);
  const overdue = fin.fiadosOverdue > 0;

  return (
    <SlideFrame>
      <Eyebrow tone={overdue ? "neg" : "neutral"} label={`Por cobrar · ${pending.length} clientes`} />
      <div className="flex items-baseline gap-[6px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-[0.95]">
          <CountUp value={fin.fiadosPending} format={(n) => fmtK(n)} />
        </span>
      </div>
      {overdue ? (
        <DeltaPill value={-100} customLabel={`S/ ${fmtK(fin.fiadosOverdue)} vencidos`} />
      ) : (
        <p className="mt-[8px] font-['Geist'] text-[12.5px] text-white/45">Sin vencimientos hoy</p>
      )}

      <div className="absolute left-0 right-0 bottom-[24px] px-[28px] flex flex-col gap-[12px]">
        {pending.slice(0, 3).map((f, i) => {
          const w = (f.amount / max) * 100;
          const isOverdue = f.dueDate && new Date(f.dueDate) < new Date();
          const days = f.dueDate
            ? Math.round(
                (new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              )
            : null;
          return (
            <div key={f.id}>
              <div className="flex items-center justify-between mb-[6px]">
                <span className="font-['Geist'] text-[13px] text-white/85 truncate max-w-[55%]">
                  {f.client}
                </span>
                <div className="flex items-center gap-[10px]">
                  {days !== null && (
                    <span
                      className="font-['Geist'] text-[10.5px] uppercase tracking-[0.8px]"
                      style={{ color: isOverdue ? "#F87171" : "rgba(255,255,255,0.35)" }}
                    >
                      {isOverdue ? `vencido ${Math.abs(days)}d` : days === 0 ? "hoy" : `${days}d`}
                    </span>
                  )}
                  <span
                    className="font-['Bai_Jamjuree'] text-[13.5px] font-semibold tabular-nums"
                    style={{ color: isOverdue ? "#F87171" : "#ffffff" }}
                  >
                    S/ {f.amount.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isOverdue ? "#F87171" : "rgba(255,255,255,0.7)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="font-['Geist'] text-[13px] text-white/45">Sin fiados pendientes. Limpio.</p>
        )}
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   SLIDE 6 — Top de inventario (lollipop horizontal)
   ============================================================ */
function InventorioSlide() {
  const inv = useInventory();
  const top = [...inv.items].sort((a, b) => b.stock * b.cost - a.stock * a.cost).slice(0, 4);
  const max = Math.max(...top.map((p) => p.stock * p.cost), 1);
  return (
    <SlideFrame>
      <Eyebrow label={`Inventario · ${inv.productCount} productos`} />
      <div className="flex items-baseline gap-[6px] mt-[14px]">
        <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-[0.95]">
          <CountUp value={inv.totalValue} format={(n) => fmtK(n)} />
        </span>
      </div>
      <p className="mt-[10px] font-['Geist'] text-[13.5px] text-white/55 leading-[1.45] max-w-[320px]">
        Capital invertido en stock. Estos productos concentran la mayor parte.
      </p>

      <div className="absolute left-0 right-0 bottom-[24px] px-[28px] flex flex-col gap-[14px]">
        {top.map((p, i) => {
          const value = p.stock * p.cost;
          const w = (value / max) * 100;
          const low = p.stock <= 5;
          return (
            <div key={p.id} className="flex items-center gap-[12px]">
              <span className="font-['Geist'] text-[12.5px] text-white/80 w-[88px] truncate shrink-0">
                {p.name}
              </span>
              <div className="flex-1 relative h-[2px] bg-white/[0.06] rounded-full">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: low ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.55)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-[10px] w-[10px] rounded-full"
                  style={{
                    background: low ? "#F87171" : "#ffffff",
                    boxShadow: low ? "0 0 12px rgba(248,113,113,0.5)" : "0 0 12px rgba(255,255,255,0.3)",
                  }}
                  initial={{ left: 0, opacity: 0 }}
                  animate={{ left: `calc(${w}% - 5px)`, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold text-white/85 tabular-nums w-[48px] text-right">
                {fmtK(value)}
              </span>
            </div>
          );
        })}
      </div>
    </SlideFrame>
  );
}

/* ============================================================
   Shared frame primitives
   ============================================================ */
function SlideFrame({ children }: { children: React.ReactNode }) {
  return <div className="relative h-full w-full px-[28px] pt-[24px]">{children}</div>;
}

function Eyebrow({ label, tone = "neutral" }: { label: string; tone?: "pos" | "neg" | "neutral" }) {
  const dot =
    tone === "pos" ? "#4ADE80" : tone === "neg" ? "#F87171" : "rgba(255,255,255,0.45)";
  return (
    <div className="flex items-center gap-[8px]">
      <motion.div
        className="h-[6px] w-[6px] rounded-full"
        style={{ background: dot }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.8px] text-white/50">
        {label}
      </span>
    </div>
  );
}

function DeltaPill({
  value,
  label,
  customLabel,
}: {
  value: number;
  label?: string;
  customLabel?: string;
}) {
  const pos = value >= 0;
  const color = customLabel ? "#F87171" : pos ? "#4ADE80" : "#F87171";
  const arrow = pos ? "↑" : "↓";
  return (
    <div className="mt-[10px] inline-flex items-center gap-[6px]">
      <span
        className="font-['Geist'] text-[12px] font-medium tabular-nums"
        style={{ color }}
      >
        {customLabel ?? `${arrow} ${Math.abs(value).toFixed(1)}%`}
      </span>
      {label && (
        <span className="font-['Geist'] text-[11.5px] text-white/35">{label}</span>
      )}
    </div>
  );
}

/* ============================================================
   Carousel — HQ feel, no story bars
   ============================================================ */
const SLIDES = [PulsoSlide, RitmoSlide, MezclaSlide, MargenSlide, FiadosSlide, InventorioSlide];
const SLIDE_LABELS = ["Pulso", "Ritmo", "Pagos", "Margen", "Cobros", "Inventario"];

export default function BusinessInsights() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const elapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (!paused) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= ROTATE_MS) {
          elapsedRef.current = 0;
          setDir(1);
          setIdx((i) => (i + 1) % SLIDES.length);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused]);

  const goTo = (next: number) => {
    setDir(next > idx ? 1 : -1);
    elapsedRef.current = 0;
    setIdx((next + SLIDES.length) % SLIDES.length);
  };

  // swipe
  const dragStartX = useRef(0);
  const onDown = (e: React.PointerEvent) => {
    setPaused(true);
    dragStartX.current = e.clientX;
  };
  const onUp = (e: React.PointerEvent) => {
    setPaused(false);
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 44) goTo(dx < 0 ? idx + 1 : idx - 1);
  };

  const Current = SLIDES[idx];

  return (
    <div className="px-[16px]">
      <div
        className="relative h-[440px] w-full overflow-hidden select-none touch-pan-y"
        style={{
          borderRadius: 28,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => setPaused(false)}
      >
        {/* ambient layer (cross-fades with slide) */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`amb-${idx}`}
            className="absolute inset-0 pointer-events-none"
            style={{ background: AMBIENTS[idx % AMBIENTS.length] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </AnimatePresence>

        {/* top status bar — slide counter */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end px-[24px] pt-[18px]">
          <span className="font-['Bai_Jamjuree'] text-[11px] font-semibold tabular-nums text-white/55">
            {String(idx + 1).padStart(2, "0")}
            <span className="text-white/25"> / {String(SLIDES.length).padStart(2, "0")}</span>
          </span>
        </div>

        {/* slide stage */}
        <div className="absolute inset-0 pt-[44px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -dir * 24, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* bottom navigator — minimal labels (no story bar) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-[20px] pb-[14px]">
          <div className="flex items-center justify-center gap-[14px]">
            {SLIDE_LABELS.map((label, i) => {
              const active = i === idx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goTo(i)}
                  className="group flex items-center gap-[6px] py-[4px]"
                  aria-label={label}
                >
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width: active ? 18 : 3,
                      backgroundColor: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.22)",
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: 3 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
