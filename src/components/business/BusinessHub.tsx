import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ChevronRight, ArrowRight, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Trax · Business HQ — calm operating view
   Fórmula: visual grande + módulos. Sin capas extra.
   ============================================================ */

type Props = {
  onInfo: () => void;
  onInventory: () => void;
  onPayments: () => void;
  onClients: () => void;
  onReceivables: () => void;
  onPayables: () => void;
  onSuppliers: () => void;
  onChannels: () => void;
  onDocuments: () => void;
  onTeam: () => void;
};

type Area = "operacion" | "caja" | "clientes" | "canales";

/* ---------- helpers ---------- */
function fmtTime(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":");
  if (!h) return null;
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:${m ?? "00"} ${ampm}`;
}
function isOpenNow(open: string | null, close: string | null) {
  if (!open || !close) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const o = oh * 60 + (om || 0);
  const c = ch * 60 + (cm || 0);
  if (c > o) return cur >= o && cur < c;
  return cur >= o || cur < c;
}
const money = (n: number) =>
  `S/ ${Math.abs(n).toLocaleString("es-PE", { maximumFractionDigits: n >= 100 ? 0 : 2 })}`;

/* ---------- ambient silencioso ---------- */
function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-[90px] left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full opacity-[0.35]"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.10), transparent 72%)", filter: "blur(56px)" }}
      />
    </div>
  );
}

/* ============================================================
   1) Header grande del negocio
   ============================================================ */
function BizHeader() {
  const { profile } = useAuth();
  const name = profile?.business_name || "Mi negocio";
  const type = profile?.business_type || "Define tu rubro";
  const open = isOpenNow(profile?.open_time ?? null, profile?.close_time ?? null);
  const closeAt = fmtTime(profile?.close_time);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase()).join("") || "N";
  const status =
    open === null ? "Sin horario"
      : open ? `Operando · cierra ${closeAt}`
        : "Cerrado ahora";

  return (
    <div className="relative px-[22px] pt-[22px] pb-[6px]">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-[14px]">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[56px] w-[56px] rounded-[18px] shrink-0 grid place-items-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(22,66,95,0.6), rgba(40,40,40,0.4))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tracking-[-0.5px]">{initials}</span>
          )}
        </motion.div>
        <div className="min-w-0">
          <h1 className="font-['Bai_Jamjuree'] text-[28px] font-semibold text-white tracking-[-1px] leading-[1.05] truncate">
            {name}
          </h1>
          <div className="mt-[5px] flex items-center gap-[6px] font-['Geist'] text-[12.5px] text-white/55 truncate">
            <span className="truncate">{type}</span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-[5px] shrink-0">
              {open !== null && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-[5px] w-[5px] rounded-full"
                  style={{
                    background: open ? "#66F09C" : "#FF7C6D",
                    boxShadow: open ? "0 0 8px rgba(102,240,156,0.7)" : "0 0 8px rgba(255,124,109,0.5)",
                  }} />
              )}
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   2) HQ Panel (terminal grande)
   ============================================================ */
type StepLite = { id: string; label: string; done: boolean; weight: number; go?: () => void; why: string };

function useSteps(p: Props): StepLite[] {
  const { profile } = useAuth();
  const { productCount } = useInventory();
  return useMemo(() => {
    const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return [
      { id: "identity", label: "Identidad del negocio", weight: 1,
        done: has(profile?.business_name) && has(profile?.business_type), go: p.onInfo,
        why: "Define cómo se llama y a qué se dedica tu negocio." },
      { id: "address", label: "Agrega tu dirección", weight: 1,
        done: has(profile?.address), go: p.onInfo,
        why: "Tus clientes podrán encontrarte y socIA entenderá mejor tu operación." },
      { id: "schedule", label: "Configura tu horario", weight: 1,
        done: has(profile?.open_time) && has(profile?.close_time), go: p.onInfo,
        why: "Ordena tu día y mejora la precisión de tus reportes." },
      { id: "phone", label: "WhatsApp del negocio", weight: 1,
        done: has(profile?.phone), go: p.onInfo,
        why: "Tus clientes podrán contactarte rápido para pedidos." },
      { id: "catalog", label: "Agrega tu catálogo", weight: 1.4,
        done: productCount >= 3, go: p.onInventory,
        why: "Con tus productos cargados podrás vender y medir stock real." },
      { id: "payments", label: "Activa métodos de pago", weight: 1.2,
        done: false, go: p.onPayments,
        why: "Acepta más formas de cobro para no perder ninguna venta." },
      { id: "logo", label: "Sube tu logo o foto", weight: 0.8,
        done: has(profile?.avatar_url), go: p.onInfo,
        why: "Una marca visible genera más confianza." },
    ];
  }, [profile, productCount, p]);
}

function HQPanel({ steps }: { steps: StepLite[] }) {
  const totalW = steps.reduce((s, x) => s + x.weight, 0);
  const doneW = steps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const pct = Math.round((doneW / totalW) * 100);
  const next = steps.find((s) => !s.done);
  const R = 36;
  const C = 2 * Math.PI * R;
  const offset = C - (C * pct) / 100;
  const headline =
    pct === 100 ? "Tu negocio está bajo control"
      : pct >= 70 ? "Casi listo, faltan detalles"
        : pct >= 35 ? "Vas avanzando, sigue construyendo"
          : "Empecemos a ordenar tu negocio";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-[22px] rounded-[28px] overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.012))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 45px rgba(102,240,156,0.08)",
      }}
    >
      {/* terminal grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.6]"
        style={{
          background:
            "radial-gradient(80% 60% at 10% 0%, rgba(102,240,156,0.10), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(120,180,255,0.07), transparent 70%)",
        }} />

      <div className="relative px-[20px] pt-[18px] pb-[18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#66F09C]" style={{ boxShadow: "0 0 10px rgba(102,240,156,0.7)" }} />
            <span className="font-['Geist'] text-[10.5px] uppercase tracking-[2.4px] text-white/55">Estado operativo</span>
          </div>
          <span className="font-['Geist'] text-[10px] uppercase tracking-[2px] text-white/35 tabular-nums">
            HQ · v2
          </span>
        </div>

        <div className="mt-[18px] flex items-center gap-[18px]">
          <div className="relative h-[92px] w-[92px] shrink-0">
            <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="hqGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#66F09C" />
                </linearGradient>
              </defs>
              <circle cx="46" cy="46" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
              <motion.circle cx="46" cy="46" r={R} stroke="url(#hqGrad)" strokeWidth={6}
                strokeLinecap="round" fill="none" strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Bai_Jamjuree'] text-[26px] font-bold text-white tracking-[-1px] tabular-nums">
                {pct}<span className="text-[12px] text-white/45 align-top ml-[1px]">%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white leading-[1.1] tracking-[-0.5px]">
              {headline}
            </h2>
            {next ? (
              <p className="mt-[6px] font-['Geist'] text-[12.5px] text-white/55 leading-[1.4]">
                Siguiente acción: <span className="text-white/85">{next.label.toLowerCase()}</span>
              </p>
            ) : (
              <p className="mt-[6px] font-['Geist'] text-[12.5px] text-white/55">Todo configurado. Mantén tus datos al día.</p>
            )}
          </div>
        </div>

        {next && (
          <div className="mt-[16px] rounded-[18px] px-[14px] py-[11px] flex gap-[10px]"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <Sparkles className="h-[14px] w-[14px] text-white/80 shrink-0 mt-[2px]" strokeWidth={1.8} />
            <p className="font-['Geist'] text-[12px] text-white/70 leading-[1.45]">
              <span className="text-white/95">socIA · </span>{next.why}
            </p>
          </div>
        )}

        {next && (
          <button
            onClick={next.go}
            className="mt-[14px] w-full h-[52px] rounded-[20px] bg-white text-black font-['Geist'] text-[15px] font-bold active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-[8px]"
          >
            Continuar configuración
            <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   3) Tabs chunky
   ============================================================ */
const AREAS: { id: Area; label: string }[] = [
  { id: "operacion", label: "Operación" },
  { id: "caja", label: "Caja" },
  { id: "clientes", label: "Clientes" },
  { id: "canales", label: "Canales" },
];

function AreaTabs({ area, onChange }: { area: Area; onChange: (a: Area) => void }) {
  return (
    <LayoutGroup id="biz-area-tabs">
      <div className="mx-[22px] grid grid-cols-4 gap-[4px] p-[5px] rounded-[24px]"
        style={{ background: "rgba(16,17,17,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {AREAS.map((a) => {
          const active = area === a.id;
          return (
            <button key={a.id} onClick={() => onChange(a.id)}
              className="relative h-[40px] rounded-[20px] font-['Geist'] text-[13px] font-semibold transition-colors"
              style={{ color: active ? "#000" : "rgba(255,255,255,0.62)" }}>
              {active && (
                <motion.span
                  layoutId="biz-tab-pill"
                  className="absolute inset-0 rounded-[20px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{a.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ============================================================
   Shared building blocks
   ============================================================ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[22px] font-['Geist'] text-[11px] uppercase tracking-[3.5px] text-white/45">
      {children}
    </div>
  );
}

type ToneKey = "default" | "green" | "red" | "blue" | "yellow" | "muted";
const TONE_COLOR: Record<ToneKey, string> = {
  default: "#ffffff",
  green: "#66F09C",
  red: "#FF7C6D",
  blue: "#76BEFF",
  yellow: "#FFD76F",
  muted: "rgba(255,255,255,0.45)",
};

type MetricItem = { label: string; value: string; sub?: string; tone?: ToneKey };

function InnerMetric({ m }: { m: MetricItem }) {
  return (
    <div className="flex flex-col gap-[3px] min-w-0">
      <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45 truncate">{m.label}</div>
      <div className="font-['Bai_Jamjuree'] text-[22px] font-bold tracking-[-0.6px] tabular-nums leading-[1.05]"
        style={{ color: TONE_COLOR[m.tone ?? "default"] }}>
        {m.value}
      </div>
      {m.sub && <div className="font-['Geist'] text-[10.5px] text-white/40 leading-[1.2] truncate">{m.sub}</div>}
    </div>
  );
}

/* ============================================================
   BIG PANEL — visual grande protagonista por tab
   Contiene: eyebrow, headline grande, visual, chips integradas, socIA inline
   ============================================================ */
function BigPanel({
  title, headlineLabel, headline, headlineTone, visual, chips, socia,
}: {
  title: string;
  headlineLabel: string;
  headline: string;
  headlineTone?: ToneKey;
  visual: React.ReactNode;
  chips: MetricItem[];
  socia?: string;
}) {
  const cols = Math.min(chips.length, 4);
  const gridCls =
    cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      className="mx-[22px] relative rounded-[28px] overflow-hidden"
      style={{
        background: "linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0.012))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 50px rgba(102,240,156,0.07)",
      }}
    >
      {/* terminal grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 0% 0%, rgba(102,240,156,0.10), transparent 60%), radial-gradient(60% 55% at 100% 100%, rgba(120,180,255,0.07), transparent 70%)",
        }}
      />

      <div className="relative px-[20px] pt-[18px] pb-[18px] flex flex-col gap-[16px]">
        {/* eyebrow */}
        <div className="flex items-center justify-between">
          <span className="font-['Geist'] text-[10px] uppercase tracking-[2.2px] text-white/55">{title}</span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-[6px] w-[6px] rounded-full bg-[#66F09C]"
            style={{ boxShadow: "0 0 8px rgba(102,240,156,0.65)" }}
          />
        </div>

        {/* headline */}
        <div className="flex flex-col gap-[4px]">
          <div className="font-['Geist'] text-[11px] text-white/50">{headlineLabel}</div>
          <div
            className="font-['Bai_Jamjuree'] text-[34px] font-bold tracking-[-1.2px] tabular-nums leading-[1]"
            style={{ color: TONE_COLOR[headlineTone ?? "default"] }}
          >
            {headline}
          </div>
        </div>

        {/* visual */}
        <div>{visual}</div>

        {/* hairline */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* chips inline */}
        <div className={`grid ${gridCls} gap-[12px]`}>
          {chips.slice(0, 4).map((m, i) => (
            <div key={i} className="flex flex-col gap-[3px] min-w-0">
              <div className="font-['Geist'] text-[9.5px] uppercase tracking-[1.2px] text-white/40 truncate">
                {m.label}
              </div>
              <div
                className="font-['Bai_Jamjuree'] text-[16px] font-bold tabular-nums leading-[1.05] truncate"
                style={{ color: TONE_COLOR[m.tone ?? "default"] }}
              >
                {m.value}
              </div>
              {m.sub && (
                <div className="font-['Geist'] text-[10px] text-white/35 leading-[1.2] truncate">{m.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* socIA inline */}
        {socia && (
          <div className="flex items-start gap-[8px] pt-[2px]">
            <Sparkles className="h-[11px] w-[11px] text-white/60 shrink-0 mt-[2px]" strokeWidth={1.8} />
            <p className="font-['Geist'] text-[11.5px] text-white/55 leading-[1.4]">
              <span className="text-white/80">socIA · </span>
              {socia}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type Shortcut = { label: string; sub: string; onClick?: () => void; soon?: boolean };

function ShortcutsRow({ title, items }: { title: string; items: Shortcut[] }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="px-[22px] font-['Geist'] text-[11px] uppercase tracking-[3.5px] text-white/45">{title}</div>
      <div className="px-[22px] grid grid-cols-2 gap-[10px]">
        {items.map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            disabled={!s.onClick}
            className="relative text-left rounded-[20px] p-[16px] active:scale-[0.985] transition-transform disabled:active:scale-100 min-h-[82px] flex flex-col justify-between"
            style={{ background: "rgba(13,15,15,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="font-['Bai_Jamjuree'] text-[17px] font-semibold text-white tracking-[-0.4px] leading-[1.1]">
              {s.label}
            </div>
            <div className="font-['Geist'] text-[11.5px] text-white/45 leading-[1.3]">{s.sub}</div>
            {s.soon && (
              <span
                className="absolute top-[12px] right-[12px] font-['Geist'] text-[9px] uppercase tracking-[1.2px] text-white/45 px-[6px] py-[2px] rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                Pronto
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Charts / Visuals
   ============================================================ */
function buildLinePath(values: number[], w: number, h: number, padY = 8) {
  if (values.length === 0) return "";
  const max = Math.max(1, ...values);
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - padY - (v / max) * (h - padY * 2);
    return [x, y] as [number, number];
  });
  const d: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const cx = (x1 + x2) / 2;
    d.push(`C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`);
  }
  return d.join(" ");
}

function CashLineChart() {
  const { last7Days } = useFinance();
  const W = 320,
    H = 110;
  const incomePath = buildLinePath(last7Days.map((d) => d.income), W, H);
  const expensePath = buildLinePath(last7Days.map((d) => d.expense), W, H);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[110px]">
        <path d={incomePath} fill="none" stroke="#66F09C" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={expensePath} fill="none" stroke="#FF7C6D" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-[6px] flex items-center gap-[14px] font-['Geist'] text-[11px] text-white/55">
        <span className="flex items-center gap-[5px]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#66F09C]" />
          Ingresos
        </span>
        <span className="flex items-center gap-[5px]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#FF7C6D]" />
          Egresos
        </span>
      </div>
    </div>
  );
}

function StockHealth({ healthy, low, out }: { healthy: number; low: number; out: number }) {
  const total = healthy + low + out;
  const segs = [
    { v: healthy, c: "#66F09C", label: "OK" },
    { v: low, c: "#FFD76F", label: "Bajo" },
    { v: out, c: "#FF7C6D", label: "Agotado" },
  ];
  return (
    <div>
      {total === 0 ? (
        <div className="h-[12px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      ) : (
        <div className="h-[12px] rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
          {segs.map(
            (s, i) =>
              s.v > 0 && (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.v / total) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: s.c }}
                />
              ),
          )}
        </div>
      )}
      <div className="mt-[10px] flex items-center gap-[14px] font-['Geist'] text-[11px] text-white/55">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-[5px]">
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.c }} />
            {s.label} {s.v}
          </span>
        ))}
      </div>
    </div>
  );
}

function PresenceDots({ items }: { items: { label: string; ok: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-[8px]">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-[8px] px-[10px] py-[9px] rounded-[12px]"
          style={{
            background: it.ok ? "rgba(102,240,156,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${it.ok ? "rgba(102,240,156,0.20)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: it.ok ? "#66F09C" : "rgba(255,255,255,0.25)" }}
          />
          <span
            className="font-['Geist'] text-[12.5px]"
            style={{ color: it.ok ? "#ffffff" : "rgba(255,255,255,0.55)" }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClientsDistribution({
  registered,
  withDebt,
  newOnes,
}: {
  registered: number;
  withDebt: number;
  newOnes: number;
}) {
  const cells = [
    { label: "Activos", value: registered, color: "#ffffff" },
    { label: "Con fiado", value: withDebt, color: "#FFD76F" },
    { label: "Nuevos", value: newOnes, color: "rgba(255,255,255,0.45)" },
  ];
  return (
    <div className="grid grid-cols-3 gap-[10px]">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-[14px] p-[12px]"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="font-['Geist'] text-[10px] uppercase tracking-[1.2px] text-white/45">{c.label}</div>
          <div
            className="mt-[4px] font-['Bai_Jamjuree'] text-[22px] font-bold tabular-nums leading-[1]"
            style={{ color: c.color }}
          >
            {c.value === 0 && c.label === "Nuevos" ? "—" : c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   AREA: Operación
   ============================================================ */
function OperationArea(p: Props) {
  const { items, productCount, totalValue, lowStock } = useInventory();
  const out = items.filter((i) => i.stock === 0).length;
  const low = lowStock.filter((i) => i.stock > 0).length;
  const healthy = Math.max(0, productCount - low - out);
  const alertCount = low + out;

  const socia =
    productCount < 3
      ? "Agrega al menos 3 productos para medir stock real y ganancias."
      : alertCount > 0
        ? `Tienes ${alertCount} producto${alertCount === 1 ? "" : "s"} en alerta de stock.`
        : "Completa costos de compra para calcular margen real.";

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Operación del negocio</SectionTitle>

      <BigPanel
        title="Salud del inventario"
        headlineLabel="Productos activos"
        headline={String(productCount)}
        headlineTone={productCount > 0 ? "default" : "muted"}
        visual={<StockHealth healthy={healthy} low={low} out={out} />}
        chips={[
          {
            label: "Stock crítico",
            value: String(alertCount),
            sub: out > 0 ? `${out} agotados` : "bajo umbral",
            tone: alertCount > 0 ? "yellow" : "green",
          },
          {
            label: "Valor inventario",
            value: productCount > 0 ? money(totalValue) : "—",
            sub: "al costo",
            tone: productCount > 0 ? "blue" : "muted",
          },
          { label: "Última compra", value: "—", sub: "próximamente", tone: "muted" },
        ]}
        socia={socia}
      />

      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Catálogo", sub: productCount > 0 ? "Ver productos" : "Crear primero", onClick: p.onInventory },
          { label: "Inventario", sub: "Ajustar stock", onClick: p.onInventory },
          { label: "Compras", sub: "Reposiciones", soon: true },
          { label: "Proveedores", sub: "A quién compras", soon: true },
        ]}
      />
    </div>
  );
}

/* ============================================================
   AREA: Caja
   ============================================================ */
function CashArea(p: Props) {
  const { todayIncome, todayExpense, monthIncome, monthExpense, monthNet, fiadosPending, last7Days } = useFinance();
  const weekNet = last7Days.reduce((s, d) => s + (d.income - d.expense), 0);
  const margin = monthIncome > 0 ? Math.round((monthNet / monthIncome) * 100) : 0;

  const socia =
    monthIncome === 0 && monthExpense === 0
      ? "Empieza a registrar ingresos y gastos para ver tu margen real."
      : fiadosPending > 0
        ? `Tienes ${money(fiadosPending)} por cobrar. Revisa tus fiados.`
        : "Registra todos los gastos del mes para calcular ganancia real.";

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Caja del negocio</SectionTitle>

      <BigPanel
        title="Ingresos vs gastos · últimos 7 días"
        headlineLabel="Neto de la semana"
        headline={`${weekNet < 0 ? "-" : ""}${money(weekNet)}`}
        headlineTone={weekNet >= 0 ? "green" : "red"}
        visual={<CashLineChart />}
        chips={[
          {
            label: "Caja hoy",
            value: money(todayIncome - todayExpense),
            sub: "efectivo + digital",
            tone: todayIncome - todayExpense >= 0 ? "green" : "red",
          },
          {
            label: "Gastos hoy",
            value: money(todayExpense),
            sub: "registrados",
            tone: todayExpense > 0 ? "red" : "muted",
          },
          {
            label: "Margen mes",
            value: monthIncome > 0 ? `${margin}%` : "—",
            sub: "vs ingresos",
            tone: monthIncome > 0 ? "blue" : "muted",
          },
          {
            label: "Por cobrar",
            value: fiadosPending > 0 ? money(fiadosPending) : "S/ 0",
            sub: "fiados abiertos",
            tone: fiadosPending > 0 ? "yellow" : "muted",
          },
        ]}
        socia={socia}
      />

      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Ventas", sub: "Registrar", onClick: p.onPayments },
          { label: "Gastos", sub: "Agregar", onClick: p.onPayments },
          { label: "Deudas", sub: "Por cobrar / pagar", onClick: p.onReceivables },
          { label: "Reportes", sub: "Analizar", soon: true },
        ]}
      />
    </div>
  );
}

/* ============================================================
   AREA: Clientes
   ============================================================ */
function ClientsArea(p: Props) {
  const { user } = useAuth();
  const { fiados } = useFinance();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { count: c } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (active) {
        setCount(c ?? 0);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const pending = fiados.filter((f) => !f.settled);
  const debtors = new Set(pending.map((f) => f.client.trim().toLowerCase())).size;
  const debtAmount = pending.reduce((s, f) => s + f.amount, 0);

  const socia =
    count === 0
      ? "Registra a tus clientes frecuentes para hacer seguimiento."
      : debtors > 0
        ? `${debtors} cliente${debtors === 1 ? "" : "s"} con fiado abierto.`
        : "Identifica a tus clientes frecuentes para fidelizar.";

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Relación con clientes</SectionTitle>

      <BigPanel
        title="Cartera de clientes"
        headlineLabel="Clientes registrados"
        headline={loading ? "…" : String(count)}
        headlineTone={count > 0 ? "default" : "muted"}
        visual={<ClientsDistribution registered={count} withDebt={debtors} newOnes={0} />}
        chips={[
          {
            label: "Con fiado",
            value: String(debtors),
            sub: debtors > 0 ? money(debtAmount) : "sin deudas",
            tone: debtors > 0 ? "yellow" : "muted",
          },
          { label: "Frecuentes", value: "—", sub: "pronto", tone: "muted" },
          { label: "Seguimientos", value: "0", sub: "pendientes", tone: "muted" },
        ]}
        socia={socia}
      />

      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Directorio", sub: count > 0 ? "Ver clientes" : "Agregar primero", onClick: p.onClients },
          { label: "Frecuentes", sub: "Quiénes vuelven", soon: true },
          { label: "Seguimientos", sub: "Recordar contactar", soon: true },
          { label: "Historial", sub: "Compras por cliente", soon: true },
        ]}
      />
    </div>
  );
}

/* ============================================================
   AREA: Canales
   ============================================================ */
function ChannelsArea(p: Props) {
  const { profile } = useAuth();
  const has = (v: unknown) => typeof v === "string" && (v as string).trim().length > 0;
  const hasWA = has(profile?.phone);
  const hasAddr = has(profile?.address);
  const hasHours = has(profile?.open_time) && has(profile?.close_time);
  const hasLogo = has(profile?.avatar_url);
  const items = [
    { label: "WhatsApp", ok: hasWA },
    { label: "Dirección", ok: hasAddr },
    { label: "Horario", ok: hasHours },
    { label: "Logo / foto", ok: hasLogo },
  ];
  const ready = items.filter((i) => i.ok).length;

  const socia =
    ready < 4
      ? !hasWA
        ? "Activa WhatsApp para que tus clientes te escriban directo."
        : !hasAddr
          ? "Sin dirección será difícil que lleguen a tu local."
          : !hasHours
            ? "Define tu horario para que sepan cuándo atiendes."
            : "Sube tu logo o foto para que te reconozcan."
      : "Habilita catálogo compartible para vender por WhatsApp sin repetir.";

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Cómo te encuentran</SectionTitle>

      <BigPanel
        title="Presencia del negocio"
        headlineLabel="Canales activos"
        headline={`${ready}/4`}
        headlineTone={ready === 4 ? "green" : ready > 0 ? "default" : "muted"}
        visual={<PresenceDots items={items} />}
        chips={[
          {
            label: "Perfil público",
            value: ready === 4 ? "Listo" : "Parcial",
            sub: `${ready}/4 datos`,
            tone: ready === 4 ? "green" : "yellow",
          },
          { label: "Catálogo", value: "—", sub: "compartible · pronto", tone: "muted" },
          { label: "Contacto", value: hasWA ? "WhatsApp" : "—", sub: hasWA ? "activo" : "sin número", tone: hasWA ? "green" : "muted" },
        ]}
        socia={socia}
      />

      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "WhatsApp", sub: hasWA ? (profile?.phone ?? "") : "Configurar", onClick: p.onInfo },
          { label: "Perfil público", sub: "Dirección y horario", onClick: p.onInfo },
          { label: "Catálogo", sub: "Compartir productos", soon: true },
          { label: "Canales venta", sub: "Delivery, redes", soon: true },
        ]}
      />
    </div>
  );
}


/* ============================================================
   Advanced configuration row
   ============================================================ */
function AdvancedConfigRow(p: Props) {
  return (
    <div className="px-[22px]">
      <button onClick={p.onInfo}
        className="w-full flex items-center gap-[12px] px-[16px] py-[14px] rounded-[18px] text-left active:bg-white/[0.04] transition-colors"
        style={{ background: "rgba(17,17,17,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Settings2 className="h-[15px] w-[15px] text-white/60 shrink-0" strokeWidth={1.7} />
        <div className="flex-1 min-w-0 font-['Geist'] text-[12.5px] text-white/70 truncate">
          Configuración avanzada · RUC, permisos, equipo, legal
        </div>
        <ChevronRight className="h-[15px] w-[15px] text-white/30 shrink-0" strokeWidth={1.6} />
      </button>
    </div>
  );
}

/* ============================================================
   Root
   ============================================================ */
export default function BusinessHub(p: Props) {
  const [area, setArea] = useState<Area>("operacion");
  const steps = useSteps(p);

  return (
    <div className="relative w-full">
      <Ambient />
      <div className="relative flex flex-col gap-[18px] pb-[200px]">
        <BizHeader />
        <HQPanel steps={steps} />

        <div className="flex flex-col gap-[14px]">
          <AreaTabs area={area} onChange={setArea} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={area}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-[14px]">
              {area === "operacion" && <OperationArea {...p} />}
              {area === "caja" && <CashArea {...p} />}
              {area === "clientes" && <ClientsArea {...p} />}
              {area === "canales" && <ChannelsArea {...p} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <AdvancedConfigRow {...p} />
      </div>
    </div>
  );
}
