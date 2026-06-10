import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ContextInput = z.object({
  ownerFirstName: z.string().default("tú"),
  businessName: z.string().default("tu negocio"),
  businessType: z.string().nullable().optional(),
  hour: z.number().int().min(0).max(23),
  weekday: z.string(), // "lunes" .. "domingo"
  todayIncome: z.number(),
  yesterdayIncome: z.number(),
  monthIncome: z.number(),
  fiadosPendingTotal: z.number(),
  fiadosPendingCount: z.number(),
  fiadosOverdueTotal: z.number(),
  lowStock: z
    .array(z.object({ name: z.string(), units: z.number(), sold24h: z.number().optional() }))
    .max(8),
  newUser: z.boolean().default(false),
});

const InsightSchema = z.object({
  id: z.string(),
  tone: z.enum(["warning", "opportunity", "info", "celebration"]),
  emoji: z.string(),
  text: z.string(),
  cta: z
    .object({
      label: z.string(),
      action: z.enum(["chat", "reponer", "cobrar_fiado", "finanzas", "ventas", "promo"]),
      payload: z.string().optional(),
    })
    .nullable(),
});

const BriefingSchema = z.object({
  greeting: z.object({
    line1: z.string(),
    line2: z.string(),
  }),
  insights: z.array(InsightSchema).min(0).max(3),
  quickPrompts: z.array(z.string()).min(2).max(4),
  salesNote: z.string().nullable(),
});

export type Briefing = z.infer<typeof BriefingSchema>;

export const generateBriefing = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContextInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      // Fallback graceful sin IA
      return fallbackBriefing(data);
    }

    const system = `Eres socIA, asistente proactiva de Trax, una app para negocios físicos pequeños (bodegas, ferreterías, panaderías, etc.) en Perú.
Tu trabajo en el briefing de inicio es sonar HUMANA, CERCANA y EMPÁTICA — como una socia de confianza que ya revisó el negocio antes de que el dueño abra la app.

REGLAS:
- Habla en español peruano natural, segunda persona ("tú"), nunca formal.
- Saludo (line1+line2) ajustado a la hora: madrugada (0-4) descansar, mañana (5-11) motivador suave, mediodía-tarde (12-18) energético, noche (19-23) calmado/celebrando.
- Si es la mañana y aún no hay ventas, NO menciones "S/ 0", celebra que el día está por empezar.
- Insights (0 a 3): basados SOLO en datos reales. Si el negocio está tranquilo, devuelve 0-1 insight calmado.
  - tone "warning": stock crítico, fiados vencidos.
  - tone "opportunity": predicción, promo, momento de reponer.
  - tone "info": dato útil neutral.
  - tone "celebration": superaste a ayer, racha, etc.
- Cada insight max 18 palabras, conversacional, con número concreto cuando aplique.
- CTAs concisas (1-3 palabras): "Reponer", "Cobrarle", "Ver detalle", "Pregúntame", "Mandar mensaje".
- quickPrompts: 3 sugerencias breves para hacerle a socIA, contextuales al estado actual (ej. "¿Cómo voy esta semana?", "Sugiéreme una promo para hoy").
- salesNote: una línea corta tipo "Hoy llevas S/ X · Ayer a esta hora: S/ Y" o null si es muy temprano y no aplica.
- Usuario nuevo (newUser=true): saludo de bienvenida, 1 insight guía, prompts de onboarding.

NO uses formalismos. NO repitas el nombre del dueño en cada frase. NO inventes datos.`;

    const userPrompt = JSON.stringify({
      contexto: {
        dueño: data.ownerFirstName,
        negocio: data.businessName,
        tipo: data.businessType ?? null,
        hora: data.hour,
        dia: data.weekday,
        ventas_hoy: data.todayIncome,
        ventas_ayer: data.yesterdayIncome,
        ventas_mes: data.monthIncome,
        fiados_pendientes: data.fiadosPendingTotal,
        fiados_cuenta: data.fiadosPendingCount,
        fiados_vencidos: data.fiadosOverdueTotal,
        stock_bajo: data.lowStock,
        usuario_nuevo: data.newUser,
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
      return fallbackBriefing(data);
    }
  });

function fallbackBriefing(data: z.infer<typeof ContextInput>): Briefing {
  const greet =
    data.hour < 5
      ? { line1: `Aún despierto, ${data.ownerFirstName}`, line2: "Descansa, mañana volvemos con todo 🌙" }
      : data.hour < 12
        ? { line1: `Buenos días, ${data.ownerFirstName}`, line2: "Tu negocio amaneció listo para abrir ☀️" }
        : data.hour < 19
          ? { line1: `¿Cómo va la tarde, ${data.ownerFirstName}?`, line2: "Sigue así, vas bien 💪" }
          : { line1: `Buenas noches, ${data.ownerFirstName}`, line2: "Hora de cuadrar y descansar 🌙" };

  const insights: Briefing["insights"] = [];
  if (data.lowStock[0]) {
    insights.push({
      id: "stock",
      tone: "warning",
      emoji: "📦",
      text: `Te quedan ${data.lowStock[0].units} de ${data.lowStock[0].name}. Conviene reponer.`,
      cta: { label: "Reponer", action: "reponer", payload: data.lowStock[0].name },
    });
  }
  if (data.fiadosOverdueTotal > 0) {
    insights.push({
      id: "fiado",
      tone: "warning",
      emoji: "💰",
      text: `Tienes S/ ${data.fiadosOverdueTotal.toFixed(0)} en fiados vencidos por cobrar.`,
      cta: { label: "Ver fiados", action: "cobrar_fiado", payload: undefined },
    });
  }
  if (insights.length === 0) {
    insights.push({
      id: "calm",
      tone: "info",
      emoji: "✨",
      text: "Todo está bajo control. Disfruta tu café.",
      cta: null,
    });
  }

  return {
    greeting: greet,
    insights,
    quickPrompts: [
      "¿Cómo voy esta semana?",
      "Registrar un gasto",
      "Sugiéreme una promo para hoy",
    ],
    salesNote:
      data.hour >= 8 && data.todayIncome > 0
        ? `Hoy llevas S/ ${data.todayIncome.toFixed(0)} · Ayer cerraste en S/ ${data.yesterdayIncome.toFixed(0)}`
        : null,
  };
}
