import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Smartphone, Calendar, HandCoins, Package, Target } from "lucide-react";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(0);
const ROTATE_MS = 5200;

/* ---------- shared shell ---------- */
function Shell({
  Icon,
  eyebrow,
  children,
  tone = "neutral",
}: {
  Icon: typeof TrendingUp;
  eyebrow: string;
  children: React.ReactNode;
  tone?: "pos" | "neg" | "neutral";
}) {
  const accent =
    tone === "pos" ? "#4ADE80" : tone === "neg" ? "#F87171" : "rgba(255,255,255,0.65)";
  return (
    <div
      className="absolute inset-0 rounded-[24px] p-[20px] flex flex-col"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-[8px] mb-[14px]">
        <Icon className="h-[13px] w-[13px]" strokeWidth={1.9} style={{ color: accent }} />
        <span className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.7px] text-white/45">
          {eyebrow}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ---------- 1. Net + area chart ---------- */
function NetSlide() {
  const fin = useFinance();
  const series = fin.last7Days.map((d) => d.income - d.expense);
  const max = Math.max(...series.map(Math.abs), 1);
  const W = 300;
  const H = 90;
  const step = W / (series.length - 1);
  const y = (v: number) => H / 2 - (v / max) * (H / 2 - 6);
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(v)}`).join(" ");
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;
  const pos = fin.monthNet >= 0;
  const stroke = pos ? "#4ADE80" : "#F87171";

  return (
    <Shell Icon={TrendingUp} eyebrow="Neto del mes" tone={pos ? "pos" : "neg"}>
      <div className="flex items-baseline gap-[4px] mb-[2px]">
        <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[52px] font-bold text-white tracking-[-1.8px] tabular-nums leading-none">
          {fmtK(Math.abs(fin.monthNet))}
        </span>
      </div>
      <p className="font-['Geist'] text-[12px] text-white/50 mb-auto">
        {pos ? "Vas en ganancia este mes." : "Estás en pérdida este mes."}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[78px] mt-[8px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="netGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#netGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </Shell>
  );
}

/* ---------- 2. Digital vs Cash donut ---------- */
function DigitalSlide() {
  const fin = useFinance();
  const monthIncomeTx = fin.tx.filter((t) => {
    const d = new Date(t.date);
    const now = new Date();
    return (
      t.kind === "ingreso" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const digital = monthIncomeTx
    .filter((t) => t.method && t.method !== "Efectivo")
    .reduce((s, t) => s + t.amount, 0);
  const pct = fin.monthIncome > 0 ? (digital / fin.monthIncome) * 100 : 0;
  const R = 38;
  const C = 2 * Math.PI * R;

  return (
    <Shell Icon={Smartphone} eyebrow="Pagos digitales · mes">
      <div className="flex-1 flex items-center gap-[18px]">
        <div className="relative h-[112px] w-[112px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={8} fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              stroke="#ffffff"
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (C * pct) / 100 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-['Bai_Jamjuree'] text-[28px] font-bold text-white tabular-nums leading-none">
              {Math.round(pct)}
              <span className="text-[15px] text-white/40 font-medium">%</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-[10px] flex-1">
          <Row dot="#ffffff" label="Digital" value={`S/ ${fmtK(digital)}`} />
          <Row
            dot="rgba(255,255,255,0.22)"
            label="Efectivo"
            value={`S/ ${fmtK(fin.monthIncome - digital)}`}
          />
        </div>
      </div>
    </Shell>
  );
}
function Row({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-[8px]">
        <div className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
        <span className="font-['Geist'] text-[12.5px] text-white/65">{label}</span>
      </div>
      <span className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold text-white tabular-nums">
        {value}
      </span>
    </div>
  );
}

/* ---------- 3. Best day bars ---------- */
function BestDaySlide() {
  const fin = useFinance();
  const days = fin.last7Days;
  const max = Math.max(...days.map((d) => d.income), 1);
  const bestIdx = days.reduce((bi, d, i) => (d.income > days[bi].income ? i : bi), 0);
  const best = days[bestIdx];
  return (
    <Shell Icon={Calendar} eyebrow="Mejor día · últimos 7">
      <div className="flex items-baseline gap-[6px] mb-[2px]">
        <span className="font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.4px] leading-none uppercase">
          {best.day}
        </span>
        <span className="font-['Geist'] text-[13px] text-white/55 ml-[6px]">
          S/ {fmtK(best.income)}
        </span>
      </div>
      <p className="font-['Geist'] text-[12px] text-white/45 mb-auto">
        Tu día más fuerte de la semana.
      </p>
      <div className="flex items-end justify-between gap-[6px] h-[78px] mt-[10px]">
        {days.map((d, i) => {
          const h = (d.income / max) * 100;
          const isBest = i === bestIdx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-[6px] h-full justify-end">
              <motion.div
                className="w-full rounded-[3px]"
                style={{ background: isBest ? "#ffffff" : "rgba(255,255,255,0.14)" }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 4)}%` }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <span
                className="font-['Geist'] text-[9.5px] tabular-nums"
                style={{ color: isBest ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)" }}
              >
                {d.day.slice(0, 1).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ---------- 4. Fiados list ---------- */
function FiadosSlide() {
  const fin = useFinance();
  const pending = fin.fiados.filter((f) => !f.settled).sort((a, b) => b.amount - a.amount);
  const max = Math.max(...pending.map((f) => f.amount), 1);
  return (
    <Shell Icon={HandCoins} eyebrow="Por cobrar" tone={fin.fiadosOverdue > 0 ? "neg" : "neutral"}>
      <div className="flex items-baseline gap-[4px] mb-[2px]">
        <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.4px] tabular-nums leading-none">
          {fmtK(fin.fiadosPending)}
        </span>
        <span className="font-['Geist'] text-[12px] text-white/45 ml-[8px]">
          {pending.length} clientes
        </span>
      </div>
      <div className="mt-[14px] flex flex-col gap-[10px]">
        {pending.slice(0, 3).map((f, i) => {
          const w = (f.amount / max) * 100;
          const overdue = f.dueDate && new Date(f.dueDate) < new Date();
          return (
            <div key={f.id}>
              <div className="flex items-center justify-between mb-[5px]">
                <span className="font-['Geist'] text-[12.5px] text-white/80 truncate max-w-[60%]">
                  {f.client}
                </span>
                <span
                  className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold tabular-nums"
                  style={{ color: overdue ? "#F87171" : "#ffffff" }}
                >
                  S/ {f.amount.toFixed(0)}
                </span>
              </div>
              <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: overdue ? "#F87171" : "rgba(255,255,255,0.65)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="font-['Geist'] text-[12.5px] text-white/45">Sin fiados pendientes.</p>
        )}
      </div>
    </Shell>
  );
}

/* ---------- 5. Inventory top products ---------- */
function InventorySlide() {
  const inv = useInventory();
  const top = [...inv.items].sort((a, b) => b.stock * b.cost - a.stock * a.cost).slice(0, 4);
  const max = Math.max(...top.map((p) => p.stock * p.cost), 1);
  return (
    <Shell Icon={Package} eyebrow="Inventario · top valor">
      <div className="flex items-baseline gap-[4px] mb-[2px]">
        <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/40">S/</span>
        <span className="font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.4px] tabular-nums leading-none">
          {fmtK(inv.totalValue)}
        </span>
        <span className="font-['Geist'] text-[12px] text-white/45 ml-[8px]">
          {inv.totalUnits} u · {inv.productCount} prod
        </span>
      </div>
      <div className="mt-[12px] flex flex-col gap-[8px]">
        {top.map((p, i) => {
          const value = p.stock * p.cost;
          const w = (value / max) * 100;
          const low = p.stock <= 5;
          return (
            <div key={p.id} className="flex items-center gap-[10px]">
              <span className="font-['Geist'] text-[12px] text-white/75 w-[78px] truncate shrink-0">
                {p.name}
              </span>
              <div className="flex-1 h-[6px] bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: low ? "#F87171" : "rgba(255,255,255,0.55)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="font-['Bai_Jamjuree'] text-[11.5px] font-semibold text-white/85 tabular-nums w-[42px] text-right">
                {fmtK(value)}
              </span>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ---------- 6. Margen ring with benchmark ---------- */
function MargenSlide() {
  const fin = useFinance();
  const margen = fin.monthIncome > 0 ? (fin.monthNet / fin.monthIncome) * 100 : 0;
  const clamped = Math.max(0, Math.min(100, margen));
  const R = 44;
  const C = 2 * Math.PI * R;
  const benchmark = 20;
  const good = margen >= benchmark;

  return (
    <Shell Icon={Target} eyebrow="Margen del mes" tone={good ? "pos" : "neutral"}>
      <div className="flex-1 flex items-center gap-[20px]">
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={6} fill="none" />
            {/* benchmark tick */}
            <circle
              cx="50"
              cy="50"
              r={R}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={6}
              strokeDasharray={`2 ${C - 2}`}
              strokeDashoffset={-(C * benchmark) / 100}
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              stroke={good ? "#4ADE80" : "#ffffff"}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (C * clamped) / 100 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-['Bai_Jamjuree'] text-[32px] font-bold text-white tabular-nums leading-none">
              {Math.round(margen)}
              <span className="text-[16px] text-white/40 font-medium">%</span>
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-['Geist'] text-[12.5px] text-white/75 leading-[1.45]">
            {good ? "Margen saludable." : "Margen ajustado, revisa costos."}
          </p>
          <p className="font-['Geist'] text-[11.5px] text-white/40 mt-[6px]">
            Referencia: {benchmark}%
          </p>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- carousel ---------- */
const SLIDES = [NetSlide, BestDaySlide, DigitalSlide, MargenSlide, FiadosSlide, InventorySlide];

export default function BusinessInsights() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const elapsedRef = useRef<number>(0); // pause-aware

  // animation loop for progress bar
  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (!paused) {
        elapsedRef.current += dt;
        const p = Math.min(elapsedRef.current / ROTATE_MS, 1);
        setProgress(p);
        if (p >= 1) {
          elapsedRef.current = 0;
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

  // reset progress on manual change
  const goTo = (i: number) => {
    elapsedRef.current = 0;
    setProgress(0);
    setIdx((i + SLIDES.length) % SLIDES.length);
  };

  // swipe
  const dragStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent | React.PointerEvent) => {
    setPaused(true);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = x;
  };
  const onTouchEnd = (e: React.TouchEvent | React.PointerEvent) => {
    setPaused(false);
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.PointerEvent).clientX;
    const dx = x - dragStartX.current;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? idx + 1 : idx - 1);
  };

  const Current = SLIDES[idx];

  return (
    <div className="px-[20px]">
      {/* progress bars */}
      <div className="flex items-center gap-[4px] mb-[10px]">
        {SLIDES.map((_, i) => {
          const fill = i < idx ? 1 : i === idx ? progress : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="flex-1 h-[2.5px] rounded-full bg-white/[0.10] overflow-hidden"
              aria-label={`Insight ${i + 1}`}
            >
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${fill * 100}%`,
                  transition: i === idx ? "none" : "width 0.3s ease",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* slide stage */}
      <div
        className="relative h-[220px] touch-pan-y select-none"
        onPointerDown={onTouchStart}
        onPointerUp={onTouchEnd}
        onPointerCancel={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
