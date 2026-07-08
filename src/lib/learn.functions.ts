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
});

/* Schema plano y libre de bounds — los límites van en el prompt. */
const SessionSchema = z.object({
  title: z.string(),
  category: z.string(),
  level: z.string(),
  minutes: z.number(),
  intro: z.string(),
  concepts: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  books: z.array(z.object({
    author: z.string(),
    title: z.string(),
    idea: z.string(),
  })),
  cases: z.array(z.object({
    company: z.string(),
    story: z.string(),
    lesson: z.string(),
  })),
  news: z.array(z.object({
    headline: z.string(),
    summary: z.string(),
    source: z.string(),
    dateHint: z.string(),
  })),
  trends: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  summary: z.string(),
  exercise: z.string(),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string(),
  })),
  furtherReading: z.array(z.string()),
});

export type LearnSession = z.infer<typeof SessionSchema>;

function buildPrompt(input: z.infer<typeof InputSchema>) {
  const { topic, level, minutes, businessType, previousTopics } = input;
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
        try {
          const parsed = JSON.parse(error.text ?? "{}");
          const safe = SessionSchema.safeParse(parsed);
          if (safe.success) return normalize(safe.data, data);
        } catch { /* falls through */ }
      }
      const message = error instanceof Error ? error.message : "Error al generar la sesión.";
      throw new Error(message);
    }
  });

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
