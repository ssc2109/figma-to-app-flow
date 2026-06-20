import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ArrowRight, Settings2, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Trax · Business HQ — vivo, condicional, basado en data real
   Fórmula: visual grande + módulos. Insights priorizados.
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
const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const money = (n: number) =>
  `S/ ${Math.abs(n).toLocaleString("es-PE", { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 2 })}`;
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

/* ============================================================
   Señales del negocio (single source of truth)
   ============================================================ */
type Signals = {
  // perfil
  hasIdentity: boolean;   // nombre + rubro
  hasAddress: boolean;
  hasHours: boolean;
  hasWA: boolean;
  hasLogo: boolean;
  // operación
  productCount: number;
  productsNoCost: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyStockCount: number;
  totalInventoryValue: number;
  // caja
  salesCount: number;
  expenseCount: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  weekNet: number;
  weekHasMovement: boolean;
  margin: number | null;
  // clientes / deudas
  clientCount: number;
  debtorsCount: number;
  debtAmount: number;
};

function useBusinessSignals(): Signals {
  const { profile, user } = useAuth();
  const { items, productCount, totalValue, lowStock } = useInventory();
  const {
    todayIncome, todayExpense, monthIncome, monthExpense, monthNet,
    last7Days, tx, fiados,
  } = useFinance();

  const [clientCount, setClientCount] = useState(0);
  useEffect(() => {
    if (!user) { setClientCount(0); return; }
    let active = true;
    (async () => {
      const { count } = await supabase
        .from("customers").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      if (active) setClientCount(count ?? 0);
    })();
    return () => { active = false; };
  }, [user]);

  return useMemo<Signals>(() => {
    const out = items.filter((i) => i.stock === 0).length;
    const low = lowStock.filter((i) => i.stock > 0).length;
    const healthy = Math.max(0, productCount - low - out);
    const noCost = items.filter((i) => !i.cost || i.cost <= 0).length;

    const salesCount = tx.filter((t) => t.kind === "ingreso").length;
    const expenseCount = tx.filter((t) => t.kind === "egreso").length;
    const weekNet = last7Days.reduce((s, d) => s + (d.income - d.expense), 0);
    const weekHasMovement = last7Days.some((d) => d.income > 0 || d.expense > 0);

    const pending = fiados.filter((f) => !f.settled);
    const debtors = new Set(pending.map((f) => f.client.trim().toLowerCase())).size;
    const debtAmount = pending.reduce((s, f) => s + f.amount, 0);

    return {
      hasIdentity: has(profile?.business_name) && has(profile?.business_type),
      hasAddress: has(profile?.address),
      hasHours: has(profile?.open_time) && has(profile?.close_time),
      hasWA: has(profile?.phone),
      hasLogo: has(profile?.avatar_url),
      productCount,
      productsNoCost: noCost,
      lowStockCount: low,
      outOfStockCount: out,
      healthyStockCount: healthy,
      totalInventoryValue: totalValue,
      salesCount,
      expenseCount,
      todayIncome,
      todayExpense,
      monthIncome,
      monthExpense,
      monthNet,
      weekNet,
      weekHasMovement,
      margin: monthIncome > 0 ? Math.round((monthNet / monthIncome) * 100) : null,
      clientCount,
      debtorsCount: debtors,
      debtAmount,
    };
  }, [profile, items, productCount, totalValue, lowStock, todayIncome, todayExpense,
      monthIncome, monthExpense, monthNet, last7Days, tx, fiados, clientCount]);
}

/* ============================================================
   Motor de insights (prioridad lógica)
   ============================================================ */
type Insight = {
  id: string;
  priority: number; // menor = más urgente
  text: string;
  cta: string;
  go: () => void;
  area?: Area;
};

function buildInsights(s: Signals, p: Props): Insight[] {
  const list: Insight[] = [];

  // 1. Onboarding — datos del negocio
  if (!s.hasIdentity) list.push({
    id: "identity", priority: 1,
    text: "Completa los datos básicos para que socIA entienda tu negocio.",
    cta: "Completar negocio", go: p.onInfo,
  });

  // 2. Catálogo
  if (s.productCount === 0) list.push({
    id: "first-product", priority: 2,
    text: "Agrega tu primer producto para empezar a controlar inventario y ventas.",
    cta: "Agregar producto", go: p.onInventory, area: "operacion",
  });

  // 3. Costos
  if (s.productCount > 0 && s.productsNoCost > 0) list.push({
    id: "costs", priority: 3,
    text: `Tienes ${s.productsNoCost} producto${s.productsNoCost === 1 ? "" : "s"} sin costo. Sin costo no se puede calcular tu margen real.`,
    cta: "Completar costos", go: p.onInventory, area: "operacion",
  });

  // 4. Primera venta
  if (s.productCount > 0 && s.salesCount === 0) list.push({
    id: "first-sale", priority: 4,
    text: "Ya tienes productos. Registra tu primera venta para empezar a medir tu negocio.",
    cta: "Registrar venta", go: p.onPayments, area: "caja",
  });

  // 5. Gastos
  if (s.salesCount > 0 && s.expenseCount === 0) list.push({
    id: "first-expense", priority: 5,
    text: "Registras ventas pero no gastos. Sin gastos no sabes tu ganancia real.",
    cta: "Registrar gasto", go: p.onPayments, area: "caja",
  });

  // 6. WhatsApp / pagos digitales
  if (!s.hasWA) list.push({
    id: "wa", priority: 6,
    text: "Configura WhatsApp para que tus clientes te contacten directo.",
    cta: "Configurar WhatsApp", go: p.onInfo, area: "canales",
  });

  // 7. Stock crítico
  const critical = s.outOfStockCount + s.lowStockCount;
  if (critical > 0) list.push({
    id: "stock", priority: 7,
    text: `${critical} producto${critical === 1 ? "" : "s"} con stock bajo o agotado. Revisa reposición antes de perder ventas.`,
    cta: "Ver inventario", go: p.onInventory, area: "operacion",
  });

  // 8. Deudas por cobrar
  if (s.debtAmount > 0) list.push({
    id: "receivables", priority: 8,
    text: `${money(s.debtAmount)} por cobrar a ${s.debtorsCount} cliente${s.debtorsCount === 1 ? "" : "s"}.`,
    cta: "Ver deudas", go: p.onReceivables, area: "clientes",
  });

  // 9. Clientes
  if (s.salesCount > 0 && s.clientCount === 0) list.push({
    id: "clients", priority: 9,
    text: "Registra a tus clientes frecuentes para entender quién vuelve a comprarte.",
    cta: "Agregar cliente", go: p.onClients, area: "clientes",
  });

  // 10. Canales (dirección / horario / logo)
  if (s.hasIdentity && (!s.hasAddress || !s.hasHours || !s.hasLogo)) {
    const missing = [
      !s.hasAddress && "dirección",
      !s.hasHours && "horario",
      !s.hasLogo && "logo",
    ].filter(Boolean).join(", ");
    list.push({
      id: "channels", priority: 10,
      text: `Completa tu presencia: te falta ${missing}.`,
      cta: "Completar canales", go: p.onInfo, area: "canales",
    });
  }

  return list.sort((a, b) => a.priority - b.priority);
}

/* ============================================================
   Ambient
   ============================================================ */
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
   Header del negocio
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
                    background: open ? "#4ADE80" : "#F87171",
                    boxShadow: open ? "0 0 8px rgba(74,222,128,0.45)" : "0 0 8px rgba(248,113,113,0.35)",
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
   Panel HQ — Next Best Action (insight #1)
   Si no hay nada urgente, muestra resumen calmado.
   ============================================================ */
function HQPanel({ insights, signals }: { insights: Insight[]; signals: Signals }) {
  const next = insights[0];

  // Headline calmado cuando no hay insight urgente
  const calmHeadline = signals.weekHasMovement
    ? "Tu negocio está operando"
    : "Todo configurado. Sin movimientos esta semana.";
  const calmSub = signals.weekHasMovement
    ? `Neto últimos 7 días · ${signals.weekNet < 0 ? "-" : ""}${money(signals.weekNet)}`
    : "Registra una venta o gasto para empezar la semana.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-[22px] rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="relative px-[20px] pt-[18px] pb-[18px]">
        <div className="font-['Geist'] text-[10.5px] uppercase tracking-[2.4px] text-white/45">
          {next ? "Siguiente paso" : "Estado operativo"}
        </div>

        <h2 className="mt-[10px] font-['Bai_Jamjuree'] text-[21px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
          {next ? next.text : calmHeadline}
        </h2>

        {!next && (
          <p className="mt-[8px] font-['Geist'] text-[13px] text-white/55 leading-[1.4]">{calmSub}</p>
        )}

        {next ? (
          <button
            onClick={next.go}
            className="mt-[16px] w-full h-[50px] rounded-[20px] bg-white text-black font-['Geist'] text-[15px] font-bold active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-[8px]"
          >
            {next.cta}
            <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.4} />
          </button>
        ) : null}

        {insights.length > 1 && (
          <div className="mt-[14px] flex items-center gap-[6px] font-['Geist'] text-[11px] text-white/45">
            <span>+{insights.length - 1} otra{insights.length - 1 === 1 ? "" : "s"} recomendación{insights.length - 1 === 1 ? "" : "es"}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Tabs
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
   Building blocks
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
  green: "#4ADE80",
  red: "#F87171",
  blue: "rgba(255,255,255,0.82)",
  yellow: "rgba(255,255,255,0.70)",
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
   BIG PANEL — visual grande con carrusel cuando hay data
   ============================================================ */
function BigPanel({
  title, headlineLabel, headline, headlineTone, visual, chips,
}: {
  title: string;
  headlineLabel: string;
  headline: string;
  headlineTone?: ToneKey;
  visual: React.ReactNode;
  chips?: MetricItem[];
}) {
  const pages = useMemo(
    () => [
      { id: "visual", node: visual },
      ...(chips && chips.length
        ? [{
          id: "metrics",
          node: (
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[18px]">
              {chips.slice(0, 4).map((m) => <InnerMetric key={m.label} m={m} />)}
            </div>
          ),
        }]
        : []),
    ],
    [chips, visual],
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (pages.length <= 1) return;
    const id = window.setInterval(() => setPage((c) => (c + 1) % pages.length), 4600);
    return () => window.clearInterval(id);
  }, [pages.length]);

  useEffect(() => setPage(0), [title]);

  return (
    <div
      className="mx-[22px] relative rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[170px] opacity-80"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.10), transparent 68%)" }}
      />
      <div className="relative px-[20px] pt-[18px] pb-[18px] flex flex-col gap-[18px]">
        <div className="flex items-center justify-between gap-[12px]">
          <span className="font-['Geist'] text-[10px] uppercase tracking-[2.2px] text-white/55">{title}</span>
          {pages.length > 1 && (
            <div className="flex items-center gap-[5px]">
              {pages.map((pg, i) => (
                <button
                  key={pg.id}
                  aria-label={`Ver ${i + 1}`}
                  onClick={() => setPage(i)}
                  className="h-[6px] rounded-full transition-all"
                  style={{ width: i === page ? 18 : 6, background: i === page ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.22)" }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[4px]">
          <div className="font-['Geist'] text-[11px] text-white/50">{headlineLabel}</div>
          <div
            className="font-['Bai_Jamjuree'] text-[40px] font-bold tracking-[-1.2px] tabular-nums leading-[1]"
            style={{ color: TONE_COLOR[headlineTone ?? "default"] }}
          >
            {headline}
          </div>
        </div>

        <div className="min-h-[128px] flex flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${title}-${pages[page]?.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {pages[page]?.node}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY PANEL — estado vacío útil
   ============================================================ */
function EmptyPanel({
  title, headline, body, cta, onCta,
}: {
  title: string;
  headline: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div
      className="mx-[22px] relative rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.075)" }}
    >
      <div className="relative px-[20px] pt-[18px] pb-[18px] flex flex-col gap-[16px]">
        <span className="font-['Geist'] text-[10px] uppercase tracking-[2.2px] text-white/55">{title}</span>
        <div className="flex flex-col gap-[8px]">
          <div className="font-['Bai_Jamjuree'] text-[28px] font-semibold text-white tracking-[-0.7px] leading-[1.1]">
            {headline}
          </div>
          <p className="font-['Geist'] text-[13px] text-white/55 leading-[1.45] max-w-[300px]">{body}</p>
        </div>
        <button
          onClick={onCta}
          className="self-start h-[44px] px-[18px] rounded-[16px] bg-white text-black font-['Geist'] text-[13.5px] font-bold active:scale-[0.985] transition-transform inline-flex items-center gap-[8px]"
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.6} />
          {cta}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Shortcuts
   ============================================================ */
type Shortcut = { label: string; sub: string; onClick?: () => void; soon?: boolean };

function ShortcutsRow({ title, items }: { title: string; items: Shortcut[] }) {
  return (
    <div className="flex flex-col gap-[10px] px-[22px]">
      <div className="font-['Geist'] text-[11px] uppercase tracking-[3.5px] text-white/45">{title}</div>
      <div
        className="grid grid-cols-2 overflow-hidden rounded-[24px]"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.075)" }}
      >
        {items.map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            disabled={!s.onClick}
            className="relative min-h-[78px] text-left p-[16px] active:bg-white/[0.035] transition-colors disabled:active:bg-transparent flex flex-col justify-between border-white/[0.06] odd:border-r [&:nth-child(-n+2)]:border-b"
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
   Visuales reales
   ============================================================ */
function CashBar({ income, expense }: { income: number; expense: number }) {
  const total = Math.max(1, income + expense);
  const incomePct = (income / total) * 100;
  const expensePct = (expense / total) * 100;
  return (
    <div className="py-[10px]">
      <div className="flex h-[18px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        {income > 0 && (
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${incomePct}%` }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: "#4ADE80" }}
          />
        )}
        {expense > 0 && (
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${expensePct}%` }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            style={{ background: "#F87171" }}
          />
        )}
      </div>
      <div className="mt-[18px] grid grid-cols-2 gap-[18px]">
        <InnerMetric m={{ label: "Ingresos 7d", value: money(income), tone: income > 0 ? "green" : "muted" }} />
        <InnerMetric m={{ label: "Egresos 7d", value: money(expense), tone: expense > 0 ? "red" : "muted" }} />
      </div>
    </div>
  );
}

function StockHealth({ healthy, low, out }: { healthy: number; low: number; out: number }) {
  const total = healthy + low + out;
  const segs = [
    { v: healthy, c: "#4ADE80", label: "OK" },
    { v: low, c: "rgba(255,255,255,0.46)", label: "Bajo" },
    { v: out, c: "#F87171", label: "Agotado" },
  ];
  return (
    <div>
      <div className="h-[12px] rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
        {total > 0 && segs.map(
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
      <div className="mt-[14px] grid grid-cols-3 gap-[10px] font-['Geist'] text-[11px] text-white/55">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-[5px] min-w-0">
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.c }} />
            <span className="truncate">{s.label} {s.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PresenceDots({ items }: { items: { label: string; ok: boolean }[] }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-[10px]">
          <span
            className="h-[8px] w-[8px] rounded-full shrink-0"
            style={{ background: it.ok ? "#4ADE80" : "rgba(255,255,255,0.22)" }}
          />
          <span
            className="font-['Geist'] text-[14px]"
            style={{ color: it.ok ? "#ffffff" : "rgba(255,255,255,0.55)" }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClientsBreakdown({ registered, withDebt }: { registered: number; withDebt: number }) {
  const cells = [
    { label: "Registrados", value: registered, color: "#ffffff" },
    { label: "Con fiado", value: withDebt, color: withDebt > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-[14px]">
      {cells.map((c) => (
        <div key={c.label} className="min-w-0">
          <div className="font-['Geist'] text-[10px] uppercase tracking-[1.2px] text-white/45">{c.label}</div>
          <div
            className="mt-[6px] font-['Bai_Jamjuree'] text-[28px] font-bold tabular-nums leading-[1]"
            style={{ color: c.color }}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   AREA: Operación
   ============================================================ */
function OperationArea(p: Props, s: Signals) {
  if (s.productCount === 0) {
    return (
      <div className="flex flex-col gap-[14px]">
        <SectionTitle>Operación del negocio</SectionTitle>
        <EmptyPanel
          title="Inventario"
          headline="Aún no tienes productos"
          body="Agrega tu primer producto para empezar a controlar stock, costos y ventas."
          cta="Agregar producto"
          onCta={p.onInventory}
        />
        <ShortcutsRow
          title="Módulos"
          items={[
            { label: "Catálogo", sub: "Crear primero", onClick: p.onInventory },
            { label: "Inventario", sub: "Ajustar stock", onClick: p.onInventory },
            { label: "Compras", sub: "Reposiciones", soon: true },
            { label: "Proveedores", sub: "A quién compras", soon: true },
          ]}
        />
      </div>
    );
  }

  const alertCount = s.lowStockCount + s.outOfStockCount;
  const chips: MetricItem[] = [
    {
      label: "Stock crítico", value: String(alertCount),
      sub: s.outOfStockCount > 0 ? `${s.outOfStockCount} agotados` : "bajo umbral",
      tone: alertCount > 0 ? "yellow" : "green",
    },
    {
      label: "Valor inventario",
      value: s.totalInventoryValue > 0 ? money(s.totalInventoryValue) : "—",
      sub: "al costo",
      tone: s.totalInventoryValue > 0 ? "blue" : "muted",
    },
    {
      label: "Sin costo", value: String(s.productsNoCost),
      sub: s.productsNoCost > 0 ? "completar" : "todo OK",
      tone: s.productsNoCost > 0 ? "yellow" : "green",
    },
    { label: "Saludables", value: String(s.healthyStockCount), sub: "con stock OK", tone: "blue" },
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Operación del negocio</SectionTitle>
      <BigPanel
        title="Salud del inventario"
        headlineLabel="Productos activos"
        headline={String(s.productCount)}
        visual={<StockHealth healthy={s.healthyStockCount} low={s.lowStockCount} out={s.outOfStockCount} />}
        chips={chips}
      />
      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Catálogo", sub: `${s.productCount} producto${s.productCount === 1 ? "" : "s"}`, onClick: p.onInventory },
          { label: "Inventario", sub: alertCount > 0 ? `${alertCount} en alerta` : "Todo en orden", onClick: p.onInventory },
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
function CashArea(p: Props, s: Signals) {
  if (s.salesCount === 0 && s.expenseCount === 0) {
    return (
      <div className="flex flex-col gap-[14px]">
        <SectionTitle>Caja del negocio</SectionTitle>
        <EmptyPanel
          title="Movimientos"
          headline="Aún no registras movimientos"
          body="Registra tu primera venta o gasto para empezar a medir caja, margen y ganancia real."
          cta="Registrar movimiento"
          onCta={p.onPayments}
        />
        <ShortcutsRow
          title="Módulos"
          items={[
            { label: "Ventas", sub: "Registrar primera", onClick: p.onPayments },
            { label: "Gastos", sub: "Registrar primero", onClick: p.onPayments },
            { label: "Deudas", sub: "Por cobrar / pagar", onClick: p.onReceivables },
            { label: "Reportes", sub: "Analizar", soon: true },
          ]}
        />
      </div>
    );
  }

  const incomeWeek = Math.max(0, s.weekNet < 0 ? 0 : 0);
  // recompute from finance hook
  const { last7Days } = useFinance();
  const income = last7Days.reduce((sum, d) => sum + d.income, 0);
  const expense = last7Days.reduce((sum, d) => sum + d.expense, 0);

  const chips: MetricItem[] = [
    {
      label: "Caja hoy",
      value: money(s.todayIncome - s.todayExpense),
      sub: "ingresos - gastos",
      tone: (s.todayIncome - s.todayExpense) >= 0 ? "green" : "red",
    },
    {
      label: "Gastos hoy",
      value: money(s.todayExpense),
      sub: s.todayExpense > 0 ? "registrados" : "sin gastos",
      tone: s.todayExpense > 0 ? "red" : "muted",
    },
    {
      label: "Margen mes",
      value: s.margin !== null ? `${s.margin}%` : "—",
      sub: s.expenseCount === 0 ? "faltan gastos" : "vs ingresos",
      tone: s.margin !== null ? (s.margin >= 0 ? "green" : "red") : "muted",
    },
    {
      label: "Por cobrar",
      value: s.debtAmount > 0 ? money(s.debtAmount) : "S/ 0",
      sub: s.debtorsCount > 0 ? `${s.debtorsCount} cliente${s.debtorsCount === 1 ? "" : "s"}` : "sin deudas",
      tone: s.debtAmount > 0 ? "yellow" : "muted",
    },
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Caja del negocio</SectionTitle>
      <BigPanel
        title="Ingresos vs egresos · últimos 7 días"
        headlineLabel={s.expenseCount === 0 ? "Ingresos de la semana" : "Neto de la semana"}
        headline={`${s.weekNet < 0 ? "-" : ""}${money(s.weekNet)}`}
        headlineTone={s.expenseCount === 0 ? "green" : (s.weekNet >= 0 ? "green" : "red")}
        visual={<CashBar income={income} expense={expense} />}
        chips={chips}
      />
      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Ventas", sub: `${s.salesCount} registrada${s.salesCount === 1 ? "" : "s"}`, onClick: p.onPayments },
          { label: "Gastos", sub: s.expenseCount > 0 ? `${s.expenseCount} registrados` : "Agregar", onClick: p.onPayments },
          { label: "Deudas", sub: s.debtAmount > 0 ? money(s.debtAmount) : "Por cobrar / pagar", onClick: p.onReceivables },
          { label: "Reportes", sub: "Analizar", soon: true },
        ]}
      />
    </div>
  );
}

/* ============================================================
   AREA: Clientes
   ============================================================ */
function ClientsArea(p: Props, s: Signals) {
  if (s.clientCount === 0 && s.debtorsCount === 0) {
    return (
      <div className="flex flex-col gap-[14px]">
        <SectionTitle>Relación con clientes</SectionTitle>
        <EmptyPanel
          title="Clientes"
          headline="Aún no tienes clientes"
          body="Registra a tus clientes frecuentes para hacer seguimiento, fiados y entender quién vuelve a comprarte."
          cta="Agregar cliente"
          onCta={p.onClients}
        />
        <ShortcutsRow
          title="Módulos"
          items={[
            { label: "Directorio", sub: "Agregar primero", onClick: p.onClients },
            { label: "Deudas", sub: "Por cobrar", onClick: p.onReceivables },
            { label: "Frecuentes", sub: "Quiénes vuelven", soon: true },
            { label: "Historial", sub: "Compras por cliente", soon: true },
          ]}
        />
      </div>
    );
  }

  const chips: MetricItem[] = [
    {
      label: "Con fiado", value: String(s.debtorsCount),
      sub: s.debtAmount > 0 ? money(s.debtAmount) : "sin deudas",
      tone: s.debtorsCount > 0 ? "yellow" : "muted",
    },
    {
      label: "Por cobrar",
      value: s.debtAmount > 0 ? money(s.debtAmount) : "S/ 0",
      sub: "fiados abiertos",
      tone: s.debtAmount > 0 ? "yellow" : "muted",
    },
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Relación con clientes</SectionTitle>
      <BigPanel
        title="Cartera de clientes"
        headlineLabel="Clientes registrados"
        headline={String(s.clientCount)}
        visual={<ClientsBreakdown registered={s.clientCount} withDebt={s.debtorsCount} />}
        chips={chips}
      />
      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "Directorio", sub: `${s.clientCount} cliente${s.clientCount === 1 ? "" : "s"}`, onClick: p.onClients },
          { label: "Deudas", sub: s.debtAmount > 0 ? money(s.debtAmount) : "Por cobrar", onClick: p.onReceivables },
          { label: "Frecuentes", sub: "Quiénes vuelven", soon: true },
          { label: "Historial", sub: "Compras por cliente", soon: true },
        ]}
      />
    </div>
  );
}

/* ============================================================
   AREA: Canales
   ============================================================ */
function ChannelsArea(p: Props, s: Signals) {
  const items = [
    { label: "WhatsApp", ok: s.hasWA },
    { label: "Dirección", ok: s.hasAddress },
    { label: "Horario", ok: s.hasHours },
    { label: "Logo / foto", ok: s.hasLogo },
  ];
  const ready = items.filter((i) => i.ok).length;
  const { profile } = useAuth();

  if (ready === 0) {
    return (
      <div className="flex flex-col gap-[14px]">
        <SectionTitle>Cómo te encuentran</SectionTitle>
        <EmptyPanel
          title="Presencia"
          headline="Tu negocio aún no es visible"
          body="Completa WhatsApp, dirección y horario para que tus clientes puedan encontrarte y contactarte."
          cta="Configurar presencia"
          onCta={p.onInfo}
        />
        <ShortcutsRow
          title="Módulos"
          items={[
            { label: "WhatsApp", sub: "Configurar", onClick: p.onInfo },
            { label: "Perfil público", sub: "Dirección y horario", onClick: p.onInfo },
            { label: "Catálogo", sub: "Compartir productos", soon: true },
            { label: "Canales venta", sub: "Delivery, redes", soon: true },
          ]}
        />
      </div>
    );
  }

  const chips: MetricItem[] = [
    {
      label: "Perfil público",
      value: ready === 4 ? "Listo" : "Parcial",
      sub: `${ready}/4 datos`,
      tone: ready === 4 ? "green" : "yellow",
    },
    {
      label: "Contacto",
      value: s.hasWA ? "WhatsApp" : "—",
      sub: s.hasWA ? "activo" : "sin número",
      tone: s.hasWA ? "green" : "muted",
    },
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Cómo te encuentran</SectionTitle>
      <BigPanel
        title="Presencia del negocio"
        headlineLabel="Canales activos"
        headline={`${ready}/4`}
        headlineTone={ready === 4 ? "green" : "default"}
        visual={<PresenceDots items={items} />}
        chips={chips}
      />
      <ShortcutsRow
        title="Módulos"
        items={[
          { label: "WhatsApp", sub: s.hasWA ? (profile?.phone ?? "") : "Configurar", onClick: p.onInfo },
          { label: "Perfil público", sub: ready === 4 ? "Completo" : `${ready}/4 datos`, onClick: p.onInfo },
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
  const signals = useBusinessSignals();
  const insights = useMemo(() => buildInsights(signals, p), [signals, p]);

  return (
    <div className="relative w-full">
      <Ambient />
      <div className="relative flex flex-col gap-[18px] pb-[200px]">
        <BizHeader />
        <HQPanel insights={insights} signals={signals} />

        <div className="flex flex-col gap-[14px]">
          <AreaTabs area={area} onChange={setArea} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={area}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-[14px]">
              {area === "operacion" && OperationArea(p, signals)}
              {area === "caja" && CashArea(p, signals)}
              {area === "clientes" && ClientsArea(p, signals)}
              {area === "canales" && ChannelsArea(p, signals)}
            </motion.div>
          </AnimatePresence>
        </div>

        <AdvancedConfigRow {...p} />
      </div>
    </div>
  );
}
