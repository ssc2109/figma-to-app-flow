import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

/* ============================================================
   Centro Inteligente de Aprendizaje Empresarial (Trax)
   - Genera sesiones de estudio de 30/45/60 min con IA.
   - Fuentes de calidad: libros clásicos, casos reales,
     noticias recientes, tendencias.
   ============================================================ */

const InputSchema = z.object({
  topic: z.string().min(1).max(160),
  level: z.enum(["Básico", "Intermedio", "Avanzado"]),
  minutes: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  businessType: z.string().max(120).optional(),
  previousTopics: z.array(z.string().max(120)).max(20).optional(),
  pathId: z.string().max(40).optional(),
});

const SOURCE_LIBRARY: Record<string, string[]> = {
  ventas: [
    "Influence - Robert Cialdini",
    "SPIN Selling - Neil Rackham",
    "The Challenger Sale - Dixon & Adamson",
    "To Sell Is Human - Daniel Pink",
    "Pre-Suasion - Robert Cialdini",
    "Harvard Business Review (hbr.org/topic/sales)",
  ],
  finanzas: [
    "Profit First - Mike Michalowicz",
    "Financial Intelligence - Berman & Knight",
    "BID (iadb.org)",
    "CEPAL (cepal.org)",
    "Banco Mundial (worldbank.org)",
    "Investopedia (investopedia.com)",
  ],
  marketing: [
    "Permission Marketing - Seth Godin",
    "Purple Cow - Seth Godin",
    "Contagious - Jonah Berger",
    "Positioning - Ries & Trout",
    "Meta for Business (business.facebook.com)",
    "Google Digital Garage (learndigital.withgoogle.com)",
  ],
  clientes: [
    "Delivering Happiness - Tony Hsieh",
    "The Effortless Experience - Matthew Dixon",
    "Zendesk Blog (zendesk.com/blog)",
    "Harvard Business Review (hbr.org/topic/customer-service)",
  ],
  inventario: [
    "The Goal - Eliyahu Goldratt",
    "ASCM/APICS (ascm.org)",
    "Investopedia Inventory Management (investopedia.com/terms/i/inventory-management.asp)",
  ],
  liderazgo: [
    "Good to Great - Jim Collins",
    "Start With Why - Simon Sinek",
    "Leaders Eat Last - Simon Sinek",
    "The Five Dysfunctions of a Team - Patrick Lencioni",
    "Multipliers - Liz Wiseman",
    "MIT Sloan Management Review (sloanreview.mit.edu)",
  ],
  productividad: [
    "Deep Work - Cal Newport",
    "Atomic Habits - James Clear",
    "The 7 Habits of Highly Effective People - Stephen Covey",
    "Getting Things Done - David Allen",
    "Essentialism - Greg McKeown",
  ],
  ia: [
    "McKinsey Digital (mckinsey.com/capabilities/mckinsey-digital)",
    "MIT Technology Review (technologyreview.com)",
    "OpenAI Blog (openai.com/blog)",
    "Google AI Blog (ai.googleblog.com)",
  ],
  administracion: [
    "Competitive Strategy - Michael Porter",
    "The Innovator's Dilemma - Clayton Christensen",
    "Measure What Matters - John Doerr",
    "Blue Ocean Strategy - Kim & Mauborgne",
    "Management - Peter Drucker",
    "OCDE (oecd.org)",
  ],
};

/* Schema tolerante — todos los arrays y strings tienen default; se rellena en normalize(). */
const strOpt = z.string().optional().default("");
const SessionSchema = z.object({
  title: strOpt,
  category: strOpt,
  level: strOpt,
  minutes: z.number().optional().default(30),
  intro: strOpt,
  concepts: z.array(z.object({
    title: strOpt,
    description: strOpt,
  })).optional().default([]),
  books: z.array(z.object({
    author: strOpt,
    title: strOpt,
    idea: strOpt,
  })).optional().default([]),
  cases: z.array(z.object({
    company: strOpt,
    story: strOpt,
    lesson: strOpt,
  })).optional().default([]),
  news: z.array(z.object({
    headline: strOpt,
    summary: strOpt,
    source: strOpt,
    dateHint: strOpt,
  })).optional().default([]),
  trends: z.array(z.object({
    title: strOpt,
    description: strOpt,
  })).optional().default([]),
  summary: strOpt,
  exercise: strOpt,
  quiz: z.array(z.object({
    question: strOpt,
    options: z.array(z.string()).optional().default([]),
    correctIndex: z.number().optional().default(0),
    explanation: strOpt,
  })).optional().default([]),
  furtherReading: z.array(z.string()).optional().default([]),
});

export type LearnSession = z.infer<typeof SessionSchema>;

function buildPrompt(input: z.infer<typeof InputSchema>) {
  const { topic, level, minutes, businessType, previousTopics, pathId } = input;
  const curatedSources = pathId ? SOURCE_LIBRARY[pathId] : undefined;
  const depth =
    minutes === 30
      ? "3 conceptos, 2 libros, 2 casos, 2 noticias, 2 tendencias, 5 preguntas de quiz"
      : minutes === 45
      ? "4 conceptos, 3 libros, 3 casos, 3 noticias, 3 tendencias, 7 preguntas de quiz"
      : "5 conceptos, 4 libros, 4 casos, 3 noticias, 4 tendencias, 10 preguntas de quiz";

  return `Eres un instructor experto en administración y negocios que diseña sesiones de estudio para dueños de pequeños negocios físicos (bodegas, minimarkets, ferreterías, panaderías, farmacias, etc.) en Perú/Latam.

Genera una sesión de aprendizaje de aproximadamente ${minutes} minutos sobre el tema: "${topic}" a nivel ${level}${businessType ? ` para un negocio del tipo: ${businessType}` : ""}.

Objetivo: que el usuario aprenda mucho en poco tiempo con contenido claro, verificado y accionable. Usa únicamente información proveniente de fuentes confiables: libros de referencia (Peter Drucker, Philip Kotler, Jim Collins, Michael Porter, Simon Sinek, Seth Godin, Eric Ries, Daniel Kahneman, Clayton Christensen, etc.), publicaciones académicas, casos empresariales reconocidos, noticias económicas actuales, informes de organismos internacionales (BID, CEPAL, OCDE, FMI, Banco Mundial), universidades top y documentación oficial.

Reglas obligatorias:
- Nunca inventes cifras, autores ni citas falsas. Si no estás seguro, generaliza sin dar un dato concreto.
- Prioriza información reciente cuando el tema lo requiera; combina con clásicos cuando aporten.
- Español neutro claro. Sin relleno. Sin markdown excesivo.
- Estructura exactamente: ${depth}.
- El campo "intro" debe ser un párrafo de 3-5 líneas.
- Cada "concept.description" debe explicar el concepto en 2-3 frases con un ejemplo.
- Cada "books[].idea" debe resumir en 2-4 frases la idea principal aplicable al negocio.
- Cada "cases[].story" describe brevemente qué hizo la empresa (2-4 frases). "cases[].lesson" es una línea con la moraleja.
- Cada "news[].summary" resume en 2-3 frases. "news[].source" es el medio o tipo de fuente (ej. "Harvard Business Review", "Reuters", "Bloomberg"). "news[].dateHint" es una referencia temporal ("últimos 12 meses", "2024-2025") sin inventar fechas exactas.
- "trends" describe 2-5 tendencias actuales del mercado ligadas al tema.
- "summary" es un resumen ejecutivo de 4-6 líneas con los puntos clave.
- "exercise" es una actividad concreta y aplicable al negocio del usuario, escrita en imperativo.
- "quiz": cada pregunta tiene 4 opciones y solo una correcta (correctIndex 0-3). La "explanation" justifica la respuesta correcta.
- "furtherReading": 3-6 títulos o recursos reales recomendados para profundizar.
${previousTopics && previousTopics.length > 0 ? `\nEl usuario ya estudió recientemente: ${previousTopics.join(", ")}. Evita repetir esos ángulos; profundiza o complementa.` : ""}
${curatedSources && curatedSources.length > 0 ? `\nPara este tema, prioriza y apóyate en estas fuentes específicas y confiables cuando sean relevantes: ${curatedSources.join("; ")}. Puedes complementar con otras fuentes reconocidas si el tema lo requiere, pero nunca inventes datos o cifras.` : ""}

Devuelve exclusivamente el objeto JSON solicitado, sin texto adicional.`;
}

export const generateLearnSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY no está configurado.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    try {
      const { experimental_output: output } = await generateText({
        model,
        experimental_output: Output.object({ schema: SessionSchema }),
        prompt: buildPrompt(data),
      });
      return normalize(output, data);
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const recovered = tryRecover(error.text);
        if (recovered) return normalize(recovered, data);
      }
      const message = error instanceof Error ? error.message : "Error al generar la sesión.";
      throw new Error(message);
    }
  });

function tryRecover(raw?: string): LearnSession | null {
  if (!raw) return null;
  const candidates: string[] = [];
  const trimmed = raw.trim();
  candidates.push(trimmed);
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidates.push(fence[1].trim());
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(trimmed.slice(first, last + 1));

  for (const c of candidates) {
    for (const attempt of [c, repairJson(c)]) {
      try {
        const parsed = JSON.parse(attempt);
        const safe = SessionSchema.safeParse(parsed);
        if (safe.success) return safe.data;
      } catch { /* try next */ }
    }
  }
  return null;
}

function repairJson(s: string): string {
  let out = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").replace(/,\s*([}\]])/g, "$1");
  let braces = 0, brackets = 0;
  for (const ch of out) {
    if (ch === "{") braces++;
    else if (ch === "}") braces--;
    else if (ch === "[") brackets++;
    else if (ch === "]") brackets--;
  }
  while (brackets-- > 0) out += "]";
  while (braces-- > 0) out += "}";
  return out;
}

function normalize(session: LearnSession, input: z.infer<typeof InputSchema>): LearnSession {
  return {
    ...session,
    title: session.title || input.topic,
    level: session.level || input.level,
    minutes: session.minutes || input.minutes,
    quiz: (session.quiz ?? []).map((q) => ({
      ...q,
      options: q.options ?? [],
      correctIndex: Math.max(0, Math.min((q.options?.length ?? 1) - 1, q.correctIndex ?? 0)),
    })),
  };
}
