import { useEffect, useMemo, useState } from "react";
import { motion, LayoutGroup } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { EXPENSE_CATEGORIES } from "@/data/finance";

/* ============================================================
   Análisis — panel ejecutivo del negocio
   Reutiliza el patrón visual de las otras áreas (Operación/Caja/Clientes)
   ============================================================ */

type Period = "hoy" | "semana" | "mes" | "trimestre" | "anio";

const PERIODS: { id: Period; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
  { id: "trimestre", label: "Trimestre" },
  { id: "anio", label: "Año" },
];

const GREEN = "#4ADE80";
const RED = "#F87171";
const WHITE = "#ffffff";

const money = (n: number) =>
  `S/ ${Math.abs(n).toLocaleString("es-PE", { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 2 })}`;
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;

type Sale = { id: string; total: number; created_at: string; is_credit: boolean };
type Expense = { id: string; amount: number; category: string; created_at: string };
type SaleItem = { qty: number; unit_price: number; name: string; product_id: string | null; created_at: string };

function periodRange(p: Period): { start: Date; end: Date; prevStart: Date; prevEnd: Date; label: string } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  const prevStart = new Date();
  const prevEnd = new Date();

  if (p === "hoy") {
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(prevStart.getDate() - 1); prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(prevEnd.getDate() - 1); prevEnd.setHours(23, 59, 59, 999);
  } else if (p === "semana") {
    start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    prevEnd.setDate(prevEnd.getDate() - 7); prevEnd.setHours(23, 59, 59, 999);
    prevStart.setDate(prevStart.getDate() - 13); prevStart.setHours(0, 0, 0, 0);
  } else if (p === "mes") {
    start.setDate(1); start.setHours(0, 0, 0, 0);
    prevStart.setMonth(prevStart.getMonth() - 1, 1); prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(0); prevEnd.setHours(23, 59, 59, 999);
  } else if (p === "trimestre") {
    start.setMonth(start.getMonth() - 2, 1); start.setHours(0, 0, 0, 0);
    prevStart.setMonth(prevStart.getMonth() - 5, 1); prevStart.setHours(0, 0, 0, 0);
    prevEnd.setMonth(prevEnd.getMonth() - 2, 0); prevEnd.setHours(23, 59, 59, 999);
  } else {
    start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
    prevStart.setFullYear(prevStart.getFullYear() - 1, 0, 1); prevStart.setHours(0, 0, 0, 0);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1, 11, 31); prevEnd.setHours(23, 59, 59, 999);
  }
  return { start, end, prevStart, prevEnd, label: PERIODS.find(x => x.id === p)!.label };
}

/* ============================================================
   Hook: data del período
   ============================================================ */
function useAnalyticsData(period: Period) {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      // Ventana amplia (1 año) para cubrir "anio" y comparativas
      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);
      since.setDate(since.getDate() - 7);
      const sinceIso = since.toISOString();

      const [salesRes, expRes, itemsRes] = await Promise.all([
        supabase.from("sales")
          .select("id, total, created_at, is_credit")
          .eq("user_id", user.id).gte("created_at", sinceIso),
        supabase.from("expenses")
          .select("id, amount, category, created_at")
          .eq("user_id", user.id).gte("created_at", sinceIso),
        supabase.from("sale_items")
          .select("qty, unit_price, name, product_id, created_at")
          .eq("user_id", user.id).gte("created_at", sinceIso),
      ]);

      if (!alive) return;
      setSales((salesRes.data ?? []).map(s => ({ ...s, total: Number(s.total) })));
      setExpenses((expRes.data ?? []).map(e => ({ ...e, amount: Number(e.amount) })));
      setItems((itemsRes.data ?? []).map(i => ({
        ...i,
        qty: Number(i.qty),
        unit_price: Number(i.unit_price),
      })));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user, period]);

  return { sales, expenses, items, loading };
}

/* ============================================================
   Segmented period picker
   ============================================================ */
function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <LayoutGroup id="analytics-period-tabs">
      <div className="mx-[22px] grid grid-cols-5 gap-[3px] p-[4px] rounded-[20px]"
        style={{ background: "rgba(16,17,17,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {PERIODS.map((p) => {
          const active = p.id === value;
          return (
            <button key={p.id} onClick={() => onChange(p.id)}
              className="relative h-[34px] rounded-[16px] font-['Geist'] text-[11.5px] font-semibold transition-colors"
              style={{ color: active ? "#000" : "rgba(255,255,255,0.62)" }}>
              {active && (
                <motion.span layoutId="analytics-period-pill"
                  className="absolute inset-0 rounded-[16px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{p.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ============================================================
   Building blocks (mismos que BusinessHub)
   ============================================================ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[22px] font-['Geist'] text-[11px] uppercase tracking-[3.5px] text-white/45">
      {children}
    </div>
  );
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mx-[22px] relative rounded-[28px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[170px] opacity-70"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08), transparent 68%)" }}
      />
      <div className="relative px-[20px] pt-[18px] pb-[18px] flex flex-col gap-[14px]">
        {title && (
          <span className="font-['Geist'] text-[10px] uppercase tracking-[2.2px] text-white/55">{title}</span>
        )}
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Panel title={title}>
      <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white leading-[1.15] tracking-[-0.3px]">
        Aún no hay datos suficientes
      </div>
      <p className="font-['Geist'] text-[13px] text-white/55 leading-[1.4]">{body}</p>
    </Panel>
  );
}

type ToneKey = "default" | "green" | "red" | "muted" | "yellow";
const TONE: Record<ToneKey, string> = {
  default: "#fff",
  green: GREEN,
  red: RED,
  muted: "rgba(255,255,255,0.45)",
  yellow: "rgba(255,255,255,0.82)",
};

function Metric({ label, value, sub, tone = "default" }: {
  label: string; value: string; sub?: string; tone?: ToneKey;
}) {
  return (
    <div className="flex flex-col gap-[3px] min-w-0">
      <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45 truncate">{label}</div>
      <div className="font-['Bai_Jamjuree'] text-[22px] font-bold tracking-[-0.6px] tabular-nums leading-[1.05]"
        style={{ color: TONE[tone] }}>
        {value}
      </div>
      {sub && <div className="font-['Geist'] text-[10.5px] text-white/40 leading-[1.2] truncate">{sub}</div>}
    </div>
  );
}

/* ============================================================
   Chart wrappers — identidad Trax
   ============================================================ */
const CHART_GRID = "rgba(255,255,255,0.06)";
const AXIS_TICK = { fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Geist" };
const TOOLTIP_STYLE = {
  background: "rgba(12,12,14,0.96)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 12,
  fontFamily: "Geist",
  fontSize: 12,
  color: "#fff",
} as const;

function tooltipFormatter(v: number | string) {
  const n = Number(v);
  return Number.isFinite(n) ? money(n) : String(v);
}

/* ============================================================
   AnalyticsArea (default export)
   ============================================================ */
export default function AnalyticsArea() {
  const [period, setPeriod] = useState<Period>("mes");
  const { sales, expenses, items, loading } = useAnalyticsData(period);
  const { items: products } = useInventory();

  const range = useMemo(() => periodRange(period), [period]);

  /* --------------------- métricas base --------------------- */
  const computed = useMemo(() => {
    const inRange = (iso: string, s: Date, e: Date) => {
      const t = new Date(iso).getTime();
      return t >= s.getTime() && t <= e.getTime();
    };

    const curSales = sales.filter(s => !s.is_credit && inRange(s.created_at, range.start, range.end));
    const prevSales = sales.filter(s => !s.is_credit && inRange(s.created_at, range.prevStart, range.prevEnd));
    const curExp = expenses.filter(e => inRange(e.created_at, range.start, range.end));
    const prevExp = expenses.filter(e => inRange(e.created_at, range.prevStart, range.prevEnd));
    const curItems = items.filter(i => inRange(i.created_at, range.start, range.end));

    const income = curSales.reduce((s, r) => s + r.total, 0);
    const expense = curExp.reduce((s, r) => s + r.amount, 0);
    const net = income - expense;
    const salesN = curSales.length;
    const ticket = salesN > 0 ? income / salesN : 0;

    const prevIncome = prevSales.reduce((s, r) => s + r.total, 0);
    const growth = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : (income > 0 ? 100 : 0);

    /* --------------------- serie por día --------------------- */
    const days: { day: string; ingresos: number; egresos: number; net: number }[] = [];
    const dayCount = Math.min(31, Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000)));
    const startDay = new Date(range.start); startDay.setHours(0, 0, 0, 0);
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDay); d.setDate(d.getDate() + i);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const inc = curSales.filter(s => inRange(s.created_at, d, dEnd)).reduce((s, r) => s + r.total, 0);
      const exp = curExp.filter(s => inRange(s.created_at, d, dEnd)).reduce((s, r) => s + r.amount, 0);
      days.push({
        day: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
        ingresos: Math.round(inc),
        egresos: Math.round(exp),
        net: Math.round(inc - exp),
      });
    }

    /* --------------------- semanas (para mes/trim/anio) --------------------- */
    const weeks: { week: string; ventas: number }[] = [];
    {
      const map = new Map<string, number>();
      for (const s of curSales) {
        const d = new Date(s.created_at);
        const first = new Date(d.getFullYear(), 0, 1);
        const wk = Math.ceil((((d.getTime() - first.getTime()) / 86400000) + first.getDay() + 1) / 7);
        const key = `S${wk}`;
        map.set(key, (map.get(key) ?? 0) + s.total);
      }
      Array.from(map.entries())
        .sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
        .forEach(([k, v]) => weeks.push({ week: k, ventas: Math.round(v) }));
    }

    /* --------------------- gastos por categoría --------------------- */
    const byCatMap = new Map<string, number>();
    for (const e of curExp) byCatMap.set(e.category, (byCatMap.get(e.category) ?? 0) + e.amount);
    const byCat = Array.from(byCatMap.entries())
      .map(([id, total]) => ({
        id,
        label: EXPENSE_CATEGORIES.find(c => c.id === id)?.label ?? id,
        total: Math.round(total),
      }))
      .sort((a, b) => b.total - a.total);

    /* --------------------- productos --------------------- */
    const prodMap = new Map<string, { name: string; qty: number; revenue: number; pid: string | null }>();
    for (const it of curItems) {
      const key = (it.product_id ?? "") + "|" + it.name;
      const cur = prodMap.get(key) ?? { name: it.name, qty: 0, revenue: 0, pid: it.product_id };
      cur.qty += it.qty;
      cur.revenue += it.qty * it.unit_price;
      prodMap.set(key, cur);
    }
    const prodList = Array.from(prodMap.values()).sort((a, b) => b.qty - a.qty);
    const topProducts = prodList.slice(0, 6).map(p => ({ name: p.name, cantidad: p.qty, ingresos: Math.round(p.revenue) }));

    /* --------------------- indicadores --------------------- */
    // margen ponderado usando costo del catálogo
    let costTotal = 0;
    let revenueWithCost = 0;
    for (const it of curItems) {
      const prod = products.find(p => p.id === it.product_id);
      if (prod && prod.cost > 0) {
        costTotal += it.qty * prod.cost;
        revenueWithCost += it.qty * it.unit_price;
      }
    }
    const margin = revenueWithCost > 0 ? ((revenueWithCost - costTotal) / revenueWithCost) * 100 : null;

    const daysActive = dayCount;
    const dailyAvg = daysActive > 0 ? income / daysActive : 0;
    const perSale = ticket;
    // rotación aproximada: unidades vendidas / stock actual promedio
    const totalStock = products.reduce((s, p) => s + Math.max(0, p.stock), 0);
    const soldUnits = curItems.reduce((s, i) => s + i.qty, 0);
    const rotation = totalStock > 0 ? soldUnits / totalStock : null;

    /* --------------------- punto de equilibrio --------------------- */
    // Estimado: si margen % existe -> ventas_necesarias = gastos_fijos / margen%
    // Consideramos "gastos fijos" = gastos del período (aproximación)
    const breakEven = margin && margin > 0 ? expense / (margin / 100) : null;
    const breakEvenPct = breakEven && breakEven > 0 ? Math.min(200, (income / breakEven) * 100) : null;

    /* --------------------- productos: destacados --------------------- */
    const withRevenue = Array.from(prodMap.values());
    const mostSold = withRevenue[0] ?? null;
    const leastSold = withRevenue.length > 1 ? withRevenue[withRevenue.length - 1] : null;
    let highestMargin: { name: string; margin: number } | null = null;
    let highestRevenue = withRevenue.slice().sort((a, b) => b.revenue - a.revenue)[0] ?? null;
    for (const w of withRevenue) {
      const prod = products.find(p => p.id === w.pid);
      if (prod && prod.cost > 0 && w.qty > 0) {
        const avgPrice = w.revenue / w.qty;
        const m = ((avgPrice - prod.cost) / avgPrice) * 100;
        if (!highestMargin || m > highestMargin.margin) highestMargin = { name: w.name, margin: m };
      }
    }
    // stagnant: en catálogo con stock, sin ventas en el período
    const soldIds = new Set(withRevenue.map(w => w.pid).filter(Boolean));
    const stagnant = products
      .filter(p => p.stock > 0 && !soldIds.has(p.id))
      .slice(0, 3);

    /* --------------------- recomendaciones --------------------- */
    type Reco = { text: string; tone: ToneKey };
    const recos: Reco[] = [];
    if (income === 0) recos.push({ text: `Aún no hay ventas en este ${range.label.toLowerCase()}. Registra tu primera operación para empezar a medir.`, tone: "yellow" });
    if (mostSold && mostSold.qty >= 3) recos.push({ text: `${mostSold.name} se vende mucho (${mostSold.qty} u). Asegúrate de tener stock suficiente y evalúa comprar más al proveedor.`, tone: "green" });
    if (stagnant.length > 0) recos.push({ text: `${stagnant.length} producto${stagnant.length === 1 ? "" : "s"} con stock no rotan. Considera una promoción o reducir compras: ${stagnant.map(s => s.name).join(", ")}.`, tone: "yellow" });
    if (highestMargin && highestMargin.margin > 30) recos.push({ text: `${highestMargin.name} tiene el mejor margen (${highestMargin.margin.toFixed(0)}%). Impúlsalo con visibilidad en tu catálogo.`, tone: "green" });
    if (growth < -10 && prevIncome > 0) recos.push({ text: `Las ventas bajaron ${Math.abs(growth).toFixed(0)}% vs el período anterior. Revisa promociones, stock y horarios.`, tone: "red" });
    if (growth > 20) recos.push({ text: `Crecimiento fuerte de ${growth.toFixed(0)}%. Aprovecha para reinvertir en inventario y consolidar clientes.`, tone: "green" });
    if (byCat[0] && expense > 0 && (byCat[0].total / expense) > 0.5) recos.push({ text: `Más del 50% de tus gastos son en ${byCat[0].label}. Revisa si puedes negociar o reducir esta categoría.`, tone: "yellow" });
    if (margin !== null && margin < 15) recos.push({ text: `Tu margen (${margin.toFixed(0)}%) está por debajo del saludable. Sube precios de tus productos estrella o baja costos.`, tone: "red" });
    if (recos.length === 0) recos.push({ text: `Todo se ve estable en este ${range.label.toLowerCase()}. Sigue registrando ventas y gastos para desbloquear más análisis.`, tone: "muted" });

    return {
      income, expense, net, salesN, ticket, growth, prevIncome,
      days, weeks, byCat, topProducts, margin, dailyAvg, perSale, rotation,
      breakEven, breakEvenPct,
      mostSold, leastSold, highestMargin, highestRevenue, stagnant,
      recos,
    };
  }, [sales, expenses, items, products, range]);

  const hasAny = computed.income > 0 || computed.expense > 0;

  return (
    <div className="flex flex-col gap-[14px]">
      <SectionTitle>Análisis del negocio</SectionTitle>

      <PeriodPicker value={period} onChange={setPeriod} />

      {loading ? (
        <Panel title="Cargando">
          <div className="font-['Geist'] text-[13px] text-white/45">Preparando tu panel ejecutivo…</div>
        </Panel>
      ) : !hasAny ? (
        <EmptyState
          title={`Resumen · ${range.label}`}
          body="Registra ventas y gastos para desbloquear el análisis completo con gráficos, indicadores y recomendaciones."
        />
      ) : (
        <>
          {/* Resumen principal */}
          <Panel title={`Resumen · ${range.label}`}>
            <div className="flex flex-col gap-[4px]">
              <div className="font-['Geist'] text-[11px] text-white/50">Utilidad neta</div>
              <div className="flex items-baseline gap-[10px]">
                <div className="font-['Bai_Jamjuree'] text-[40px] font-bold tracking-[-1.2px] tabular-nums leading-[1]"
                  style={{ color: computed.net >= 0 ? GREEN : RED }}>
                  {computed.net < 0 ? "-" : ""}{money(computed.net)}
                </div>
                {computed.prevIncome > 0 && (
                  <span className="inline-flex items-center gap-[4px] font-['Geist'] text-[12px] font-semibold"
                    style={{ color: computed.growth >= 0 ? GREEN : RED }}>
                    {computed.growth >= 0 ? <TrendingUp className="h-[13px] w-[13px]" /> : <TrendingDown className="h-[13px] w-[13px]" />}
                    {pct(computed.growth)}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[16px] pt-[6px]">
              <Metric label="Ventas totales" value={money(computed.income)} tone="green" />
              <Metric label="Gastos totales" value={money(computed.expense)} tone={computed.expense > 0 ? "red" : "muted"} />
              <Metric label="N° ventas" value={String(computed.salesN)} />
              <Metric label="Ticket promedio" value={computed.ticket > 0 ? money(computed.ticket) : "—"} />
            </div>
          </Panel>

          {/* Ingresos vs egresos por día */}
          <Panel title="Ingresos vs egresos por día">
            <div className="h-[190px] -mx-[6px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computed.days} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GREEN} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
                  <Area type="monotone" dataKey="ingresos" stroke={GREEN} strokeWidth={2} fill="url(#incGrad)" />
                  <Area type="monotone" dataKey="egresos" stroke={RED} strokeWidth={2} fill="url(#expGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Ventas por semana */}
          {computed.weeks.length > 1 && (
            <Panel title="Ventas por semana">
              <div className="h-[170px] -mx-[6px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.weeks} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="ventas" fill={WHITE} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          {/* Distribución de gastos */}
          {computed.byCat.length > 0 && (
            <Panel title="Gastos por categoría">
              <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-[16px] items-center">
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={computed.byCat} dataKey="total" nameKey="label"
                        innerRadius={38} outerRadius={62} paddingAngle={2} stroke="none">
                        {computed.byCat.map((_, i) => {
                          const shades = ["#ffffff", "rgba(255,255,255,0.72)", "rgba(255,255,255,0.52)", "rgba(255,255,255,0.36)", "rgba(255,255,255,0.22)", "rgba(255,255,255,0.14)"];
                          return <Cell key={i} fill={shades[i % shades.length]} />;
                        })}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-[8px] min-w-0">
                  {computed.byCat.slice(0, 5).map((c, i) => {
                    const shades = ["#ffffff", "rgba(255,255,255,0.72)", "rgba(255,255,255,0.52)", "rgba(255,255,255,0.36)", "rgba(255,255,255,0.22)"];
                    const shareValue = computed.expense > 0 ? (c.total / computed.expense) * 100 : 0;
                    return (
                      <div key={c.id} className="flex items-center gap-[10px] min-w-0">
                        <span className="h-[8px] w-[8px] rounded-full shrink-0" style={{ background: shades[i % shades.length] }} />
                        <div className="min-w-0 flex-1 font-['Geist'] text-[12px] text-white/70 truncate">{c.label}</div>
                        <div className="font-['Bai_Jamjuree'] text-[13px] font-semibold text-white tabular-nums">{money(c.total)}</div>
                        <div className="font-['Geist'] text-[10.5px] text-white/40 tabular-nums w-[36px] text-right">{shareValue.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          )}

          {/* Top productos */}
          {computed.topProducts.length > 0 && (
            <Panel title="Productos más vendidos">
              <div className="h-[200px] -mx-[6px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.topProducts} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} width={82} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="cantidad" fill={WHITE} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          {/* Indicadores */}
          <Panel title="Indicadores del negocio">
            <div className="grid grid-cols-2 gap-x-[18px] gap-y-[18px]">
              <Metric label="Margen promedio" value={computed.margin !== null ? `${computed.margin.toFixed(0)}%` : "—"}
                tone={computed.margin === null ? "muted" : computed.margin >= 20 ? "green" : "yellow"}
                sub={computed.margin === null ? "faltan costos" : "sobre ventas con costo"} />
              <Metric label="Utilidad" value={money(computed.net)} tone={computed.net >= 0 ? "green" : "red"} sub="ingresos - gastos" />
              <Metric label="Promedio diario" value={money(computed.dailyAvg)} sub="ventas / días del período" />
              <Metric label="Ticket promedio" value={computed.ticket > 0 ? money(computed.ticket) : "—"} sub={`${computed.salesN} venta${computed.salesN === 1 ? "" : "s"}`} />
              <Metric label="Rotación inventario" value={computed.rotation !== null ? `${computed.rotation.toFixed(2)}x` : "—"} sub="unidades vendidas / stock" />
              <Metric label="Crecimiento" value={computed.prevIncome > 0 ? pct(computed.growth) : "—"}
                tone={computed.prevIncome === 0 ? "muted" : computed.growth >= 0 ? "green" : "red"}
                sub="vs período anterior" />
            </div>
          </Panel>

          {/* Punto de equilibrio */}
          <Panel title="Punto de equilibrio">
            {computed.margin === null || computed.margin <= 0 ? (
              <>
                <div className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
                  Necesitamos más datos
                </div>
                <p className="font-['Geist'] text-[12.5px] text-white/55 leading-[1.4]">
                  Registra el costo de tus productos para calcular cuánto necesitas vender para cubrir tus gastos.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-[8px]">
                  <div className="font-['Bai_Jamjuree'] text-[32px] font-bold text-white tracking-[-1px] tabular-nums leading-[1]">
                    {money(computed.breakEven ?? 0)}
                  </div>
                  <div className="font-['Geist'] text-[11px] text-white/50">necesarios en ventas</div>
                </div>
                <p className="font-['Geist'] text-[12.5px] text-white/60 leading-[1.45]">
                  Con un margen de {computed.margin.toFixed(0)}%, necesitas vender {money(computed.breakEven ?? 0)} para cubrir tus gastos del período ({money(computed.expense)}) antes de generar utilidad.
                </p>
                <div>
                  <div className="h-[10px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, computed.breakEvenPct ?? 0)}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: "100%", background: (computed.breakEvenPct ?? 0) >= 100 ? GREEN : "#ffffff" }}
                    />
                  </div>
                  <div className="mt-[6px] font-['Geist'] text-[11px] text-white/50 flex justify-between">
                    <span>{money(computed.income)} vendidos</span>
                    <span>{(computed.breakEvenPct ?? 0).toFixed(0)}% del objetivo</span>
                  </div>
                </div>
              </>
            )}
          </Panel>

          {/* Productos destacados */}
          <Panel title="Productos">
            <div className="flex flex-col gap-[12px]">
              <ProductRow label="Más vendido" name={computed.mostSold?.name ?? "—"} value={computed.mostSold ? `${computed.mostSold.qty} u` : "sin datos"} tone="green" />
              <ProductRow label="Mayor ingreso" name={computed.highestRevenue?.name ?? "—"} value={computed.highestRevenue ? money(computed.highestRevenue.revenue) : "sin datos"} />
              <ProductRow label="Mejor margen" name={computed.highestMargin?.name ?? "—"} value={computed.highestMargin ? `${computed.highestMargin.margin.toFixed(0)}%` : "faltan costos"} tone={computed.highestMargin ? "green" : "muted"} />
              <ProductRow label="Menos vendido" name={computed.leastSold?.name ?? "—"} value={computed.leastSold ? `${computed.leastSold.qty} u` : "sin datos"} tone="yellow" />
              {computed.stagnant.length > 0 && (
                <div className="pt-[8px] mt-[4px] border-t border-white/[0.06]">
                  <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45 mb-[6px]">Sin rotación</div>
                  {computed.stagnant.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-[4px]">
                      <div className="font-['Geist'] text-[13px] text-white/75 truncate">{p.name}</div>
                      <div className="font-['Geist'] text-[11.5px] text-white/45 tabular-nums">{p.stock} en stock</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* Recomendaciones socIA */}
          <Panel title="Recomendaciones socIA">
            <div className="flex flex-col gap-[10px]">
              {computed.recos.map((r, i) => (
                <div key={i} className="flex gap-[10px] items-start p-[12px] rounded-[16px]"
                  style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="h-[26px] w-[26px] rounded-full grid place-items-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <Sparkles className="h-[12px] w-[12px]" style={{ color: TONE[r.tone] }} strokeWidth={2} />
                  </div>
                  <div className="font-['Geist'] text-[13px] text-white/80 leading-[1.5]">{r.text}</div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function ProductRow({ label, name, value, tone = "default" }: {
  label: string; name: string; value: string; tone?: ToneKey;
}) {
  return (
    <div className="flex items-center justify-between gap-[10px]">
      <div className="min-w-0 flex-1">
        <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">{label}</div>
        <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white truncate tracking-[-0.2px]">{name}</div>
      </div>
      <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold tabular-nums" style={{ color: TONE[tone] }}>{value}</div>
    </div>
  );
}
