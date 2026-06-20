import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Package, Boxes, ShoppingCart, Truck,
  Wallet, TrendingDown, FileBarChart, ArrowDownLeft,
  Users, UserCheck, Bell, History,
  MessageCircle, Globe, Share2, Megaphone,
  ChevronRight, Sparkles, ArrowRight, Settings2,
  
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Trax · Business HQ (v4 — Command Center)
   Header compacto + Panel HQ + Tabs por área con mini-dashboards
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
const money = (n: number) => `S/ ${n.toFixed(n >= 100 ? 0 : 2)}`;

/* ---------- ambient ---------- */
function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 h-[420px] w-[520px] rounded-full opacity-[0.45]"
        style={{ background: "radial-gradient(closest-side, rgba(74,222,128,0.10), transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute top-[320px] -right-[160px] h-[380px] w-[380px] rounded-full opacity-[0.30]"
        style={{ background: "radial-gradient(closest-side, rgba(120,180,255,0.10), transparent 70%)", filter: "blur(60px)" }} />
    </div>
  );
}

/* ============================================================
   Compact header
   ============================================================ */
function CompactHeader() {
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
    <div className="relative px-[20px] pt-[22px] pb-[10px]">
      <div className="flex items-center gap-[12px]">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[44px] w-[44px] rounded-[14px] shrink-0 grid place-items-center overflow-hidden"
          style={{
            background: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[15px] font-bold text-white tracking-[-0.4px]">{initials}</span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h1 className="font-['Bai_Jamjuree'] text-[19px] font-semibold text-white tracking-[-0.5px] leading-[1.15] truncate">
            {name}
          </h1>
          <div className="mt-[3px] flex items-center gap-[8px] font-['Geist'] text-[11.5px] text-white/50 truncate">
            <span className="truncate">{type}</span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-[5px] shrink-0">
              {open !== null && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-[5px] w-[5px] rounded-full"
                  style={{
                    background: open ? "#4ADE80" : "#F87171",
                    boxShadow: open ? "0 0 8px rgba(74,222,128,0.7)" : "0 0 8px rgba(248,113,113,0.5)",
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
   HQ Operational Panel (terminal)
   ============================================================ */
type StepLite = { id: string; label: string; hint: string; done: boolean; weight: number; go?: () => void; why: string };

function useSteps(p: Props): StepLite[] {
  const { profile } = useAuth();
  const { productCount } = useInventory();
  return useMemo(() => {
    const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return [
      { id: "identity", label: "Identidad del negocio", hint: "Nombre y rubro", weight: 1,
        done: has(profile?.business_name) && has(profile?.business_type), go: p.onInfo,
        why: "Define cómo se llama y a qué se dedica tu negocio." },
      { id: "address", label: "Agrega tu dirección", hint: "Dónde encontrarte", weight: 1,
        done: has(profile?.address), go: p.onInfo,
        why: "Tus clientes podrán encontrarte y socIA entenderá mejor tu operación." },
      { id: "schedule", label: "Configura tu horario", hint: "Apertura y cierre", weight: 1,
        done: has(profile?.open_time) && has(profile?.close_time), go: p.onInfo,
        why: "Ordena tu día y mejora la precisión de tus reportes." },
      { id: "phone", label: "WhatsApp del negocio", hint: "Contacto directo", weight: 1,
        done: has(profile?.phone), go: p.onInfo,
        why: "Tus clientes podrán contactarte rápido para pedidos." },
      { id: "catalog", label: "Agrega tu catálogo", hint: productCount > 0 ? `${productCount} productos` : "Sin productos", weight: 1.4,
        done: productCount >= 3, go: p.onInventory,
        why: "Con tus productos cargados podrás vender y medir stock real." },
      { id: "payments", label: "Activa métodos de pago", hint: "Efectivo, Yape, Plin", weight: 1.2,
        done: false, go: p.onPayments,
        why: "Acepta más formas de cobro para no perder ninguna venta." },
      { id: "logo", label: "Sube tu logo o foto", hint: "Tu marca visible", weight: 0.8,
        done: has(profile?.avatar_url), go: p.onInfo,
        why: "Una marca visible genera más confianza." },
    ];
  }, [profile, productCount, p]);
}

function OperationalPanel({ steps }: { steps: StepLite[] }) {
  const totalW = steps.reduce((s, x) => s + x.weight, 0);
  const doneW = steps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const pct = Math.round((doneW / totalW) * 100);
  const next = steps.find((s) => !s.done);
  const R = 30;
  const C = 2 * Math.PI * R;
  const offset = C - (C * pct) / 100;
  const headline =
    pct === 100 ? "Tu negocio está bajo control"
      : pct >= 70 ? "Casi listo, faltan detalles"
        : pct >= 35 ? "Vas avanzando, sigue construyendo"
          : "Empecemos a poner tu negocio en orden";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-[20px] rounded-[24px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.07), 0 18px 50px -28px rgba(74,222,128,0.18)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(120% 80% at 88% 0%, rgba(120,180,255,0.10), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(74,222,128,0.10), transparent 60%)",
        }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

      <div className="relative px-[18px] pt-[16px] pb-[16px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#4ADE80]" style={{ boxShadow: "0 0 10px rgba(74,222,128,0.7)" }} />
            <span className="font-['Geist'] text-[10px] uppercase tracking-[1.8px] text-white/55">Estado operativo</span>
          </div>
          <span className="font-['Geist'] text-[9.5px] uppercase tracking-[1.4px] text-white/30 tabular-nums px-[7px] py-[2px] rounded-full"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            HQ · v2
          </span>
        </div>

        <div className="mt-[14px] flex items-center gap-[16px]">
          <div className="relative h-[78px] w-[78px] shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="hqGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
              <motion.circle cx="40" cy="40" r={R} stroke="url(#hqGrad)" strokeWidth={5}
                strokeLinecap="round" fill="none" strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Bai_Jamjuree'] text-[22px] font-bold text-white tracking-[-0.8px] tabular-nums">
                {pct}<span className="text-[11px] text-white/45 align-top ml-[1px]">%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
              {headline}
            </div>
            {next ? (
              <div className="mt-[4px] font-['Geist'] text-[11.5px] text-white/60 leading-[1.4]">
                <span className="text-white/40">Siguiente acción: </span>{next.label.toLowerCase()}
              </div>
            ) : (
              <div className="mt-[4px] font-['Geist'] text-[12px] text-white/55">Todo configurado. Mantén tus datos al día.</div>
            )}
          </div>
        </div>

        {next && (
          <div className="mt-[14px] rounded-[14px] px-[12px] py-[10px] flex gap-[10px]"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Sparkles className="h-[13px] w-[13px] text-white/70 shrink-0 mt-[2px]" strokeWidth={1.8} />
            <p className="font-['Geist'] text-[11.5px] text-white/60 leading-[1.45]">
              <span className="text-white/85">socIA · </span>{next.why}
            </p>
          </div>
        )}

        {next && (
          <button
            onClick={next.go}
            className="mt-[12px] w-full h-[46px] rounded-[14px] bg-white text-black font-['Geist'] text-[13.5px] font-semibold active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-[7px]"
          >
            Continuar configuración
            <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Area tabs
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
      <div className="mx-[20px] flex items-center gap-[4px] p-[4px] rounded-full"
        style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {AREAS.map((a) => {
          const active = area === a.id;
          return (
            <button key={a.id} onClick={() => onChange(a.id)}
              className="relative flex-1 h-[34px] rounded-full font-['Geist'] text-[12.5px] font-medium transition-colors"
              style={{ color: active ? "#000" : "rgba(255,255,255,0.65)" }}>
              {active && (
                <motion.span
                  layoutId="biz-tab-pill"
                  className="absolute inset-0 rounded-full bg-white"
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
   Shared mini-components
   ============================================================ */
function AreaTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[20px] flex items-center gap-[8px]">
      <span className="h-[5px] w-[5px] rounded-full bg-white/40" />
      <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/45">{children}</span>
    </div>
  );
}

function Metric({
  label, value, tone = "default", hint,
}: { label: string; value: string; tone?: "default" | "ok" | "warn" | "muted"; hint?: string }) {
  const color =
    tone === "ok" ? "#4ADE80"
    : tone === "warn" ? "#F8B86C"
    : tone === "muted" ? "rgba(255,255,255,0.55)"
    : "#ffffff";
  return (
    <div className="rounded-[14px] p-[12px] flex flex-col justify-between min-h-[68px]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="font-['Geist'] text-[10px] uppercase tracking-[1.2px] text-white/40 leading-[1.2]">{label}</div>
      <div className="mt-[6px] flex items-baseline gap-[6px]">
        <span className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.4px] tabular-nums" style={{ color }}>
          {value}
        </span>
        {hint && <span className="font-['Geist'] text-[10.5px] text-white/35">{hint}</span>}
      </div>
    </div>
  );
}

function MetricsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[20px] grid grid-cols-2 gap-[10px]">{children}</div>
  );
}

function ActionRow({
  Icon, label, meta, onClick, soon,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  meta?: string;
  onClick?: () => void;
  soon?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className="w-full flex items-center gap-[12px] px-[14px] py-[12px] text-left active:bg-white/[0.03] transition-colors disabled:active:bg-transparent">
      <div className="h-[32px] w-[32px] rounded-[10px] grid place-items-center shrink-0"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Icon className="h-[14px] w-[14px] text-white/75" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[13.5px] text-white truncate">{label}</div>
        {meta && <div className="mt-[1px] font-['Geist'] text-[11px] text-white/40 truncate">{meta}</div>}
      </div>
      {soon ? (
        <span className="font-['Geist'] text-[9.5px] uppercase tracking-[1.2px] text-white/35 shrink-0">Pronto</span>
      ) : (
        onClick && <ChevronRight className="h-[15px] w-[15px] text-white/25 shrink-0" strokeWidth={1.6} />
      )}
    </button>
  );
}

function ActionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-[20px] rounded-[18px] overflow-hidden divide-y divide-white/[0.05]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      {children}
    </div>
  );
}

function SociaTip({ title, body, cta, onClick }: { title: string; body: string; cta?: string; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-[20px] rounded-[16px] overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, rgba(120,180,255,0.07), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="px-[14px] py-[12px] flex gap-[11px]">
        <div className="h-[26px] w-[26px] rounded-full grid place-items-center shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <Sparkles className="h-[12px] w-[12px] text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[9.5px] uppercase tracking-[1.3px] text-white/40">socIA recomienda</div>
          <div className="mt-[2px] font-['Geist'] text-[12.5px] text-white font-medium leading-[1.3]">{title}</div>
          <p className="mt-[2px] font-['Geist'] text-[11px] text-white/55 leading-[1.45]">{body}</p>
          {cta && onClick && (
            <button onClick={onClick}
              className="mt-[8px] inline-flex items-center gap-[5px] font-['Geist'] text-[11px] text-white/85 px-[10px] py-[5px] rounded-full bg-white/[0.06] border border-white/[0.09] active:bg-white/[0.10] transition-colors">
              {cta}
              <ArrowRight className="h-[10px] w-[10px]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Visual: Operation health bar (stock distribution)
   ============================================================ */
function OperationHealth({ total, low, out }: { total: number; low: number; out: number }) {
  const healthy = Math.max(0, total - low - out);
  const segs = total > 0
    ? [
        { v: healthy, c: "#4ADE80" },
        { v: low, c: "#F8B86C" },
        { v: out, c: "#F87171" },
      ]
    : [];

  return (
    <div className="mx-[20px] rounded-[18px] overflow-hidden p-[14px]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="flex items-center justify-between">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/45">Salud del inventario</span>
        <span className="font-['Geist'] text-[10.5px] text-white/50 tabular-nums">{total} productos</span>
      </div>

      <div className="mt-[10px] h-[8px] rounded-full overflow-hidden flex"
        style={{ background: "rgba(255,255,255,0.05)" }}>
        {total === 0 ? (
          <div className="h-full w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        ) : segs.map((s, i) => s.v > 0 && (
          <motion.div key={i}
            initial={{ width: 0 }} animate={{ width: `${(s.v / total) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: s.c }} />
        ))}
      </div>

      <div className="mt-[10px] flex items-center gap-[14px] font-['Geist'] text-[11px] text-white/55">
        <span className="flex items-center gap-[5px]"><span className="h-[6px] w-[6px] rounded-full bg-[#4ADE80]" />OK {healthy}</span>
        <span className="flex items-center gap-[5px]"><span className="h-[6px] w-[6px] rounded-full bg-[#F8B86C]" />Bajo {low}</span>
        <span className="flex items-center gap-[5px]"><span className="h-[6px] w-[6px] rounded-full bg-[#F87171]" />Agotado {out}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Visual: Cash 7-day bars (ingresos vs egresos)
   ============================================================ */
function CashWeekBars() {
  const { last7Days } = useFinance();
  const max = Math.max(1, ...last7Days.map((d) => Math.max(d.income, d.expense)));
  return (
    <div className="mx-[20px] rounded-[18px] overflow-hidden p-[14px]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="flex items-center justify-between">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/45">Últimos 7 días</span>
        <div className="flex items-center gap-[10px] font-['Geist'] text-[10.5px] text-white/50">
          <span className="flex items-center gap-[5px]"><span className="h-[6px] w-[6px] rounded-full bg-[#4ADE80]" />Ingresos</span>
          <span className="flex items-center gap-[5px]"><span className="h-[6px] w-[6px] rounded-full bg-[#F87171]" />Egresos</span>
        </div>
      </div>
      <div className="mt-[12px] flex items-end gap-[6px] h-[68px]">
        {last7Days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-[3px]">
            <div className="flex items-end gap-[2px] h-full">
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(d.income / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                className="w-[7px] rounded-t-[2px]"
                style={{ background: "#4ADE80", minHeight: d.income > 0 ? 3 : 0 }} />
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(d.expense / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 + 0.05 }}
                className="w-[7px] rounded-t-[2px]"
                style={{ background: "#F87171", minHeight: d.expense > 0 ? 3 : 0 }} />
            </div>
            <span className="font-['Geist'] text-[9.5px] text-white/35 uppercase tracking-[0.6px]">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Visual: Client mix
   ============================================================ */
function ClientsMix({ total, withDebt }: { total: number; withDebt: number }) {
  return (
    <div className="mx-[20px] rounded-[18px] overflow-hidden p-[14px]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="flex items-center justify-between">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/45">Relación con clientes</span>
        <span className="font-['Geist'] text-[10.5px] text-white/50 tabular-nums">{total} registrados</span>
      </div>
      {total === 0 ? (
        <p className="mt-[10px] font-['Geist'] text-[12px] text-white/45 leading-[1.5]">
          Aún no registras clientes. Empieza por los que compran seguido.
        </p>
      ) : (
        <div className="mt-[12px] flex items-center gap-[10px]">
          <div className="flex-1">
            <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tabular-nums">{total}</div>
            <div className="font-['Geist'] text-[10.5px] text-white/45 uppercase tracking-[1px]">Activos</div>
          </div>
          <div className="h-[42px] w-px bg-white/10" />
          <div className="flex-1">
            <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold tabular-nums" style={{ color: withDebt > 0 ? "#F8B86C" : "#ffffff" }}>{withDebt}</div>
            <div className="font-['Geist'] text-[10.5px] text-white/45 uppercase tracking-[1px]">Con fiado</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Visual: Channels checklist
   ============================================================ */
function ChannelsChecklist({
  hasWA, hasAddr, hasHours, hasLogo,
}: { hasWA: boolean; hasAddr: boolean; hasHours: boolean; hasLogo: boolean }) {
  const items = [
    { l: "WhatsApp", ok: hasWA },
    { l: "Dirección", ok: hasAddr },
    { l: "Horario", ok: hasHours },
    { l: "Logo / foto", ok: hasLogo },
  ];
  const done = items.filter((x) => x.ok).length;
  return (
    <div className="mx-[20px] rounded-[18px] overflow-hidden p-[14px]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="flex items-center justify-between">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/45">Presencia básica</span>
        <span className="font-['Geist'] text-[10.5px] text-white/50 tabular-nums">{done}/4 listos</span>
      </div>
      <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
        {items.map((it) => (
          <div key={it.l} className="flex items-center gap-[8px] px-[10px] py-[8px] rounded-[10px]"
            style={{
              background: it.ok ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${it.ok ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.05)"}`,
            }}>
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: it.ok ? "#4ADE80" : "rgba(255,255,255,0.25)" }} />
            <span className="font-['Geist'] text-[12px]" style={{ color: it.ok ? "#ffffff" : "rgba(255,255,255,0.55)" }}>{it.l}</span>
          </div>
        ))}
      </div>
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

  return (
    <div className="flex flex-col gap-[14px]">
      <AreaTitle>Operación · cómo trabaja tu negocio</AreaTitle>

      <OperationHealth total={productCount} low={low} out={out} />

      <MetricsGrid>
        <Metric label="Productos activos" value={String(productCount)} tone={productCount > 0 ? "default" : "muted"} />
        <Metric label="Stock bajo" value={String(low + out)} tone={low + out > 0 ? "warn" : "ok"} hint={out > 0 ? `${out} agotados` : undefined} />
        <Metric label="Valor inventario" value={productCount > 0 ? money(totalValue) : "—"} tone={productCount > 0 ? "default" : "muted"} />
        <Metric label="Última compra" value="—" tone="muted" hint="próximamente" />
      </MetricsGrid>

      <ActionCard>
        <ActionRow Icon={Package} label="Catálogo" meta={productCount > 0 ? `${productCount} productos` : "Aún sin productos"} onClick={p.onInventory} />
        <ActionRow Icon={Boxes} label="Inventario y stock" meta="Ajustar existencias" onClick={p.onInventory} />
        <ActionRow Icon={ShoppingCart} label="Compras" meta="Registra reposiciones" onClick={p.onSuppliers} soon />
        <ActionRow Icon={Truck} label="Proveedores" meta="A quién le compras" onClick={p.onSuppliers} soon />
      </ActionCard>

      {productCount < 3 ? (
        <SociaTip
          title="Agrega tus productos más vendidos"
          body="Con al menos 3 productos socIA puede detectar stock crítico y sugerir reposición."
          cta="Ir al catálogo" onClick={p.onInventory} />
      ) : low + out > 0 ? (
        <SociaTip
          title={`Tienes ${low + out} producto${low + out === 1 ? "" : "s"} en alerta`}
          body="Revisa cuáles necesitan reposición para no perder ventas."
          cta="Ver inventario" onClick={p.onInventory} />
      ) : (
        <SociaTip
          title="Completa costos de compra"
          body="Con los costos reales podrás calcular tu ganancia real y margen por producto." />
      )}
    </div>
  );
}

/* ============================================================
   AREA: Caja
   ============================================================ */
function CashArea(p: Props) {
  const { todayIncome, todayExpense, monthIncome, monthExpense, monthNet, fiadosPending } = useFinance();
  const margin = monthIncome > 0 ? Math.round((monthNet / monthIncome) * 100) : 0;

  return (
    <div className="flex flex-col gap-[14px]">
      <AreaTitle>Caja · el dinero real de tu negocio</AreaTitle>

      <CashWeekBars />

      <MetricsGrid>
        <Metric label="Caja hoy" value={money(todayIncome - todayExpense)} tone={todayIncome - todayExpense >= 0 ? "ok" : "warn"} />
        <Metric label="Gastos hoy" value={money(todayExpense)} tone={todayExpense > 0 ? "warn" : "muted"} />
        <Metric label="Margen del mes" value={monthIncome > 0 ? `${margin}%` : "—"} tone={monthIncome > 0 ? (margin >= 0 ? "ok" : "warn") : "muted"} />
        <Metric label="Por cobrar" value={fiadosPending > 0 ? money(fiadosPending) : "S/ 0"} tone={fiadosPending > 0 ? "warn" : "muted"} />
      </MetricsGrid>

      <ActionCard>
        <ActionRow Icon={Wallet} label="Ventas y cobros" meta="Historial y métodos" onClick={p.onPayments} />
        <ActionRow Icon={TrendingDown} label="Gastos" meta="Registrar egresos" onClick={p.onPayments} />
        <ActionRow Icon={ArrowDownLeft} label="Deudas por cobrar" meta="Lo que te deben" onClick={p.onReceivables} />
        <ActionRow Icon={FileBarChart} label="Reportes" meta="Resumen mensual" onClick={p.onDocuments} soon />
      </ActionCard>

      {monthIncome === 0 && monthExpense === 0 ? (
        <SociaTip
          title="Empieza a registrar tu caja"
          body="Anota ingresos y gastos para ver tu margen real, no solo lo que entra a tu bolsillo." />
      ) : fiadosPending > 0 ? (
        <SociaTip
          title={`Tienes ${money(fiadosPending)} por cobrar`}
          body="Revisa quién te debe y cuándo te lo prometieron para mantener tu flujo."
          cta="Ver deudas" onClick={p.onReceivables} />
      ) : (
        <SociaTip
          title="No confundas caja con ganancia"
          body="Registra todos los gastos del mes para calcular tu margen real, no solo el efectivo en mano." />
      )}
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
      if (!user) { setLoading(false); return; }
      const { count: c } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (active) { setCount(c ?? 0); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  const pending = fiados.filter((f) => !f.settled);
  const uniqueDebtors = new Set(pending.map((f) => f.client.trim().toLowerCase())).size;

  return (
    <div className="flex flex-col gap-[14px]">
      <AreaTitle>Clientes · personas que te compran</AreaTitle>

      <ClientsMix total={loading ? 0 : count} withDebt={uniqueDebtors} />

      <MetricsGrid>
        <Metric label="Registrados" value={loading ? "…" : String(count)} tone={count > 0 ? "default" : "muted"} />
        <Metric label="Con fiado" value={String(uniqueDebtors)} tone={uniqueDebtors > 0 ? "warn" : "muted"} />
        <Metric label="Nuevos esta semana" value="—" tone="muted" hint="próximamente" />
        <Metric label="Seguimientos" value="0" tone="muted" />
      </MetricsGrid>

      <ActionCard>
        <ActionRow Icon={Users} label="Directorio" meta={count > 0 ? `${count} cliente${count === 1 ? "" : "s"}` : "Agrega tu primer cliente"} onClick={p.onClients} />
        <ActionRow Icon={UserCheck} label="Frecuentes" meta="Quiénes vuelven más" onClick={p.onClients} soon />
        <ActionRow Icon={Bell} label="Seguimientos" meta="Recordatorios y notas" onClick={p.onClients} soon />
        <ActionRow Icon={History} label="Historial" meta="Compras por cliente" onClick={p.onClients} soon />
      </ActionCard>

      {count === 0 ? (
        <SociaTip
          title="Registra a tus clientes frecuentes"
          body="Con sus contactos podrás recordarles promociones, pedidos o cobros pendientes."
          cta="Agregar cliente" onClick={p.onClients} />
      ) : uniqueDebtors > 0 ? (
        <SociaTip
          title={`${uniqueDebtors} cliente${uniqueDebtors === 1 ? "" : "s"} con fiado abierto`}
          body="Revisa quiénes te deben para hacer seguimiento sin perder la relación."
          cta="Ver por cobrar" onClick={p.onReceivables} />
      ) : (
        <SociaTip
          title="Marca tus clientes frecuentes"
          body="Identifica quiénes te compran más para premiarlos o recordarles ofertas." />
      )}
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
  const ready = [hasWA, hasAddr, hasHours, hasLogo].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-[14px]">
      <AreaTitle>Canales · cómo te encuentran</AreaTitle>

      <ChannelsChecklist hasWA={hasWA} hasAddr={hasAddr} hasHours={hasHours} hasLogo={hasLogo} />

      <MetricsGrid>
        <Metric label="Canales activos" value={String(ready)} tone={ready > 0 ? "default" : "muted"} hint={`de 4`} />
        <Metric label="Perfil público" value={ready === 4 ? "Listo" : "Parcial"} tone={ready === 4 ? "ok" : "warn"} />
        <Metric label="Catálogo compartible" value="—" tone="muted" hint="próximamente" />
        <Metric label="Contactos" value={hasWA ? "1" : "0"} tone={hasWA ? "ok" : "muted"} />
      </MetricsGrid>

      <ActionCard>
        <ActionRow Icon={MessageCircle} label="WhatsApp del negocio" meta={hasWA ? profile?.phone ?? "" : "Sin configurar"} onClick={p.onInfo} />
        <ActionRow Icon={Globe} label="Perfil público" meta="Dirección, horario y contacto" onClick={p.onInfo} />
        <ActionRow Icon={Share2} label="Catálogo compartible" meta="Enlace para WhatsApp" onClick={p.onChannels} soon />
        <ActionRow Icon={Megaphone} label="Canales de venta" meta="Delivery, redes, tienda" onClick={p.onChannels} soon />
      </ActionCard>

      {ready < 4 ? (
        <SociaTip
          title="Completa tu presencia básica"
          body={!hasWA
            ? "Activa WhatsApp para que tus clientes te puedan escribir directo."
            : !hasAddr ? "Sin dirección será difícil que lleguen a tu local."
              : !hasHours ? "Define tu horario para que sepan cuándo atiendes."
                : "Sube tu logo o foto para que te reconozcan."}
          cta="Completar" onClick={p.onInfo} />
      ) : (
        <SociaTip
          title="Tu presencia básica está lista"
          body="Cuando habilites catálogo compartible, podrás vender por WhatsApp sin repetir productos." />
      )}
    </div>
  );
}

/* ============================================================
   Advanced configuration row
   ============================================================ */
function AdvancedConfigRow(p: Props) {
  return (
    <div className="px-[20px]">
      <div className="font-['Geist'] text-[10px] uppercase tracking-[1.6px] text-white/35 mb-[8px]">
        Configuración avanzada
      </div>
      <div className="rounded-[16px] overflow-hidden divide-y divide-white/[0.05]"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={p.onInfo}
          className="w-full flex items-center gap-[12px] px-[14px] py-[12px] text-left active:bg-white/[0.03] transition-colors">
          <Settings2 className="h-[14px] w-[14px] text-white/55" strokeWidth={1.7} />
          <div className="flex-1 min-w-0 font-['Geist'] text-[12.5px] text-white/75 truncate">
            Información, RUC, permisos, equipo, legal
          </div>
          <ChevronRight className="h-[14px] w-[14px] text-white/25" strokeWidth={1.6} />
        </button>
      </div>
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
        <CompactHeader />
        <OperationalPanel steps={steps} />

        <div className="flex flex-col gap-[14px]">
          <AreaTabs area={area} onChange={setArea} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={area}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
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
