import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* --------- Client input (minimal) --------- */
const ContextInput = z.object({
  ownerFirstName: z.string().default("tú"),
  businessName: z.string().default("tu negocio"),
  businessType: z.string().nullable().optional(),
  hour: z.number().int().min(0).max(23),
  weekday: z.string(),
});

/* --------- Briefing schema --------- */
const InsightSchema = z.object({
  id: z.string(),
  tone: z.enum(["warning", "opportunity", "info", "celebration"]),
  emoji: z.string(),
  text: z.string(),
  cta: z
    .object({
      label: z.string(),
      action: z.enum([
        "chat",
        "reponer",
        "cobrar_fiado",
        "finanzas",
        "ventas",
        "promo",
      ]),
      payload: z.string().optional(),
    })
    .nullable(),
});

const BriefingSchema = z.object({
  greeting: z.object({ line1: z.string(), line2: z.string() }),
  insights: z.array(InsightSchema).min(0).max(4),
  quickPrompts: z.array(z.string()).min(2).max(4),
  salesNote: z.string().nullable(),
});

export type Briefing = z.infer<typeof BriefingSchema>;

/* --------- Data gathering --------- */
type Snapshot = {
  todayIncome: number;
  todayExpense: number;
  todaySalesCount: number;
  yesterdayIncome: number;
  yesterdayIncomeSameHour: number;
  monthIncome: number;
  fiadosPendingTotal: number;
  fiadosPendingCount: number;
  fiadosOverdueTotal: number;
  fiadosOverdueTop: Array<{ name: string; amount: number; days: number }>;
  lowStock: Array<{ name: string; units: number }>;
  expiringSoon: Array<{ name: string; daysLeft: number }>;
  topSelling7d: Array<{ name: string; units: number }>;
  purchases7dTotal: number;
  eventsToday: Array<{ title: string; kind: string | null }>;
  eventsTomorrow: number;
  totalProducts: number;
  hasAnyData: boolean;
};

async function gatherSnapshot(
  supabase: any,
  userId: string,
  hour: number,
): Promise<Snapshot> {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start7d = new Date(now);
  start7d.setDate(start7d.getDate() - 7);

  const yISO = startYesterday.toISOString();
  const tISO = startToday.toISOString();
  const mISO = startMonth.toISOString();
  const w7ISO = start7d.toISOString();
  const todayDate = tISO.slice(0, 10);
  const tomorrowDate = new Date(startToday.getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  const in7Days = new Date(startToday.getTime() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [
    salesMonthR,
    expensesMonthR,
    productsR,
    fiadosR,
    eventsR,
    purchases7R,
    saleItems7R,
  ] = await Promise.all([
    supabase
      .from("sales")
      .select("total, created_at")
      .eq("user_id", userId)
      .gte("created_at", mISO),
    supabase
      .from("expenses")
      .select("amount, category, created_at")
      .eq("user_id", userId)
      .gte("created_at", mISO),
    supabase
      .from("products")
      .select("name, stock, low_stock_threshold, expires_at")
      .eq("user_id", userId),
    supabase
      .from("fiados")
      .select("customer_name, amount, paid, due_date, created_at")
      .eq("user_id", userId)
      .eq("paid", false),
    supabase
      .from("calendar_events")
      .select("title, kind, event_date, done")
      .eq("user_id", userId)
      .gte("event_date", todayDate)
      .lte("event_date", in7Days)
      .eq("done", false),
    supabase
      .from("purchases")
      .select("total, created_at")
      .eq("user_id", userId)
      .gte("created_at", w7ISO),
    supabase
      .from("sale_items")
      .select("name, qty, created_at")
      .eq("user_id", userId)
      .gte("created_at", w7ISO),
  ]);

  const salesMonth = salesMonthR.data ?? [];
  const expensesMonth = expensesMonthR.data ?? [];
  const products = productsR.data ?? [];
  const fiados = fiadosR.data ?? [];
  const events = eventsR.data ?? [];
  const purchases7 = purchases7R.data ?? [];
  const saleItems7 = saleItems7R.data ?? [];

  const num = (n: any) => Number(n ?? 0);

  // Sales today / yesterday
  const salesToday = salesMonth.filter((s: any) => s.created_at >= tISO);
  const salesYesterday = salesMonth.filter(
    (s: any) => s.created_at >= yISO && s.created_at < tISO,
  );
  const salesYesterdaySameHour = salesYesterday.filter((s: any) => {
    const h = new Date(s.created_at).getHours();
    return h <= hour;
  });
  const todayIncome = salesToday.reduce((s: number, r: any) => s + num(r.total), 0);
  const yesterdayIncome = salesYesterday.reduce(
    (s: number, r: any) => s + num(r.total),
    0,
  );
  const yesterdayIncomeSameHour = salesYesterdaySameHour.reduce(
    (s: number, r: any) => s + num(r.total),
    0,
  );
  const monthIncome = salesMonth.reduce((s: number, r: any) => s + num(r.total), 0);

  const expensesToday = expensesMonth
    .filter((e: any) => e.created_at >= tISO)
    .reduce((s: number, r: any) => s + num(r.amount), 0);

  // Fiados
  const fiadosPendingTotal = fiados.reduce((s: number, f: any) => s + num(f.amount), 0);
  const overdue = fiados
    .filter((f: any) => f.due_date && f.due_date < todayDate)
    .map((f: any) => ({
      name: f.customer_name ?? "Cliente",
      amount: num(f.amount),
      days: Math.max(
        1,
        Math.round(
          (startToday.getTime() - new Date(f.due_date).getTime()) / 86400000,
        ),
      ),
    }))
    .sort((a: any, b: any) => b.amount - a.amount);
  const fiadosOverdueTotal = overdue.reduce((s: number, f: any) => s + f.amount, 0);

  // Products
  const lowStock = products
    .filter((p: any) => {
      const th = p.low_stock_threshold ?? 5;
      return p.stock !== null && p.stock <= th;
    })
    .map((p: any) => ({ name: p.name, units: p.stock ?? 0 }))
    .sort((a: any, b: any) => a.units - b.units)
    .slice(0, 6);

  const expiringSoon = products
    .filter((p: any) => {
      if (!p.expires_at) return false;
      const d = new Date(p.expires_at);
      const diff = Math.round((d.getTime() - startToday.getTime()) / 86400000);
      return diff >= 0 && diff <= 7;
    })
    .map((p: any) => ({
      name: p.name,
      daysLeft: Math.max(
        0,
        Math.round(
          (new Date(p.expires_at).getTime() - startToday.getTime()) / 86400000,
        ),
      ),
    }))
    .slice(0, 4);

  // Top selling last 7d (aggregate)
  const bucket: Record<string, number> = {};
  for (const it of saleItems7) {
    const k = it.name ?? "—";
    bucket[k] = (bucket[k] ?? 0) + Number(it.qty ?? 0);
  }
  const topSelling7d = Object.entries(bucket)
    .map(([name, units]) => ({ name, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 3);

  const purchases7dTotal = purchases7.reduce(
    (s: number, p: any) => s + num(p.total),
    0,
  );

  const eventsToday = events
    .filter((e: any) => e.event_date === todayDate)
    .map((e: any) => ({ title: e.title, kind: e.kind ?? null }))
    .slice(0, 4);
  const eventsTomorrow = events.filter((e: any) => e.event_date === tomorrowDate).length;

  const hasAnyData =
    products.length > 0 ||
    salesMonth.length > 0 ||
    fiados.length > 0 ||
    events.length > 0;

  return {
    todayIncome,
    todayExpense: expensesToday,
    todaySalesCount: salesToday.length,
    yesterdayIncome,
    yesterdayIncomeSameHour,
    monthIncome,
    fiadosPendingTotal,
    fiadosPendingCount: fiados.length,
    fiadosOverdueTotal,
    fiadosOverdueTop: overdue.slice(0, 3),
    lowStock,
    expiringSoon,
    topSelling7d,
    purchases7dTotal,
    eventsToday,
    eventsTomorrow,
    totalProducts: products.length,
    hasAnyData,
  };
}

/* --------- Server function --------- */
export const generateBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ContextInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    let snap: Snapshot;
    try {
      snap = await gatherSnapshot(supabase, userId, data.hour);
    } catch (err) {
      console.error("briefing snapshot failed", err);
      return fallbackBriefing(data, emptySnapshot());
    }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return fallbackBriefing(data, snap);

    const system = `Eres socIA, asistente proactiva de Trax para negocios físicos en Perú.
Tu trabajo en el briefing de inicio es sonar HUMANA, CERCANA y EMPÁTICA — como una socia de confianza que ya revisó TODO el negocio antes de que el dueño abra la app.

REGLAS DURAS:
- Español peruano natural, tuteo, nunca formal.
- Saludo (line1+line2) ajustado a la hora: madrugada (0-4) descansa, mañana (5-11) motivador suave, mediodía-tarde (12-18) energético, noche (19-23) calmado/cierre.
- Basa TODO en los datos reales que te doy. NUNCA inventes cifras, nombres de productos, clientes ni categorías. Si el dato es 0 o no está, no lo menciones.
- Insights (0-4): prioriza en este orden:
  1) fiados vencidos con monto/persona conocidos (tone "warning", action "cobrar_fiado").
  2) stock crítico o agotado por producto real (tone "warning", action "reponer", payload = nombre exacto).
  3) productos por vencer en <=7 días (tone "warning" o "opportunity", action "reponer" o "promo", payload = nombre).
  4) eventos del día pendientes (tone "info", action "chat").
  5) oportunidades reales: producto top de la semana, día bueno vs ayer (tone "opportunity" o "celebration").
- Si el negocio está calmado y todo está al día, devuelve 0 insights. No inventes tareas.
- Cada insight: máximo 18 palabras, conversacional, con número o nombre concreto de los datos.
- CTA label: verbo de acción de 1-2 palabras, GENÉRICO. Permitidos exactamente: "Reponer", "Cobrar", "Ver", "Registrar", "Crear promo", "Abrir". PROHIBIDO repetir en el label el nombre del producto, cliente, monto, cantidad o cualquier palabra ya presente en el texto del insight (el label NO puede parafrasear ni resumir el texto). El contexto va en payload, nunca en label. Si no hay una acción clara distinta al mensaje, usa cta: null.
- quickPrompts (3): sugerencias breves y CONTEXTUALES para preguntarle a socIA hoy, usando los datos reales (ej. "¿Cuánto gané esta semana?", "Sugiéreme una promo para ${'{'}producto real${'}'}").
- salesNote: una línea corta comparando hoy vs ayer a esta hora, sólo si hay ventas de referencia. Si no, null.
- Usuario sin datos aún: saludo de bienvenida, 0 insights, prompts de onboarding ("Registrar mi primer producto", "¿Cómo empiezo?").

NO uses formalismos. NO repitas el nombre del dueño en cada frase. NO inventes datos.`;

    const userPrompt = JSON.stringify({
      contexto: {
        dueño: data.ownerFirstName,
        negocio: data.businessName,
        tipo: data.businessType ?? null,
        hora: data.hour,
        dia: data.weekday,
        ventas_hoy: snap.todayIncome,
        ventas_hoy_num: snap.todaySalesCount,
        gastos_hoy: snap.todayExpense,
        ventas_ayer_total: snap.yesterdayIncome,
        ventas_ayer_hasta_esta_hora: snap.yesterdayIncomeSameHour,
        ventas_mes: snap.monthIncome,
        fiados_pendientes_total: snap.fiadosPendingTotal,
        fiados_pendientes_cuenta: snap.fiadosPendingCount,
        fiados_vencidos_total: snap.fiadosOverdueTotal,
        fiados_vencidos_top: snap.fiadosOverdueTop,
        stock_bajo: snap.lowStock,
        por_vencer: snap.expiringSoon,
        top_ventas_7d: snap.topSelling7d,
        compras_7d_total: snap.purchases7dTotal,
        eventos_hoy: snap.eventsToday,
        eventos_manana_cuenta: snap.eventsTomorrow,
        productos_total: snap.totalProducts,
        usuario_nuevo: !snap.hasAnyData,
      },
    });

    try {
      const gateway = createLovableAiGatewayProvider(key);
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt: userPrompt,
        experimental_output: Output.object({ schema: BriefingSchema }),
      });
      return experimental_output;
    } catch (err) {
      console.error("briefing generation failed", err);
      return fallbackBriefing(data, snap);
    }
  });

/* --------- Fallback (data-driven, sin IA) --------- */
function emptySnapshot(): Snapshot {
  return {
    todayIncome: 0,
    todayExpense: 0,
    todaySalesCount: 0,
    yesterdayIncome: 0,
    yesterdayIncomeSameHour: 0,
    monthIncome: 0,
    fiadosPendingTotal: 0,
    fiadosPendingCount: 0,
    fiadosOverdueTotal: 0,
    fiadosOverdueTop: [],
    lowStock: [],
    expiringSoon: [],
    topSelling7d: [],
    purchases7dTotal: 0,
    eventsToday: [],
    eventsTomorrow: 0,
    totalProducts: 0,
    hasAnyData: false,
  };
}

function fallbackBriefing(
  data: z.infer<typeof ContextInput>,
  snap: Snapshot,
): Briefing {
  const greet =
    data.hour < 5
      ? {
          line1: `Aún despierto, ${data.ownerFirstName}`,
          line2: "Descansa, mañana volvemos con todo 🌙",
        }
      : data.hour < 12
        ? {
            line1: `Buenos días, ${data.ownerFirstName}`,
            line2: "Tu negocio amaneció listo para abrir ☀️",
          }
        : data.hour < 19
          ? {
              line1: `¿Cómo va la tarde, ${data.ownerFirstName}?`,
              line2: "Sigue así, vas bien 💪",
            }
          : {
              line1: `Buenas noches, ${data.ownerFirstName}`,
              line2: "Hora de cuadrar y descansar 🌙",
            };

  const insights: Briefing["insights"] = [];

  if (snap.fiadosOverdueTop[0]) {
    const f = snap.fiadosOverdueTop[0];
    insights.push({
      id: `fiado-${f.name}`,
      tone: "warning",
      emoji: "💰",
      text: `${f.name} debe S/ ${f.amount.toFixed(0)} vencido hace ${f.days} d.`,
      cta: { label: `Cobrarle a ${f.name.split(" ")[0]}`, action: "cobrar_fiado" },
    });
  }
  if (snap.lowStock[0]) {
    const p = snap.lowStock[0];
    insights.push({
      id: `stock-${p.name}`,
      tone: "warning",
      emoji: "📦",
      text:
        p.units === 0
          ? `Se acabó ${p.name}. Reponer hoy.`
          : `Te quedan ${p.units} de ${p.name}. Conviene reponer.`,
      cta: { label: "Reponer", action: "reponer", payload: p.name },
    });
  }
  if (snap.expiringSoon[0]) {
    const e = snap.expiringSoon[0];
    insights.push({
      id: `exp-${e.name}`,
      tone: "opportunity",
      emoji: "⏳",
      text: `${e.name} vence en ${e.daysLeft} d. Buena para una promo.`,
      cta: { label: "Crear promo", action: "promo", payload: e.name },
    });
  }
  if (snap.eventsToday[0]) {
    const e = snap.eventsToday[0];
    insights.push({
      id: `ev-${e.title}`,
      tone: "info",
      emoji: "🗓",
      text: `Tienes hoy: ${e.title}.`,
      cta: { label: "Ver detalle", action: "chat", payload: e.title },
    });
  }
  if (
    insights.length === 0 &&
    snap.yesterdayIncomeSameHour > 0 &&
    snap.todayIncome > snap.yesterdayIncomeSameHour * 1.1
  ) {
    insights.push({
      id: "celebrate",
      tone: "celebration",
      emoji: "🎉",
      text: `Vas mejor que ayer a esta hora: S/ ${snap.todayIncome.toFixed(0)}.`,
      cta: null,
    });
  }

  const prompts: string[] = [];
  if (snap.topSelling7d[0])
    prompts.push(`Sugiéreme una promo para ${snap.topSelling7d[0].name}`);
  prompts.push("¿Cómo voy esta semana?");
  if (snap.fiadosPendingCount > 0) prompts.push("Recordar cobros de fiados");
  else prompts.push("Registrar un gasto");
  if (!snap.hasAnyData) {
    prompts.length = 0;
    prompts.push("Registrar mi primer producto", "¿Cómo empiezo?", "Registrar una venta");
  }

  return {
    greeting: greet,
    insights,
    quickPrompts: prompts.slice(0, 3),
    salesNote:
      snap.yesterdayIncomeSameHour > 0
        ? `Hoy S/ ${snap.todayIncome.toFixed(0)} · Ayer a esta hora S/ ${snap.yesterdayIncomeSameHour.toFixed(0)}`
        : snap.todayIncome > 0
          ? `Hoy llevas S/ ${snap.todayIncome.toFixed(0)}`
          : null,
  };
}
