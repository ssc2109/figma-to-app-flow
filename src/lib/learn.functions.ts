import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

/* ============================================================
   Centro Inteligente de Aprendizaje Empresarial (Trax)
   Formato micro-aprendizaje tipo Duolingo:
   - Pasos cortos (idea + ejemplo mype peruano + reflexión).
   - Quiz corto al final (3-5 preguntas de opción múltiple).
   - Dificultad progresiva según posición del topic en el path.
   ============================================================ */

const InputSchema = z.object({
  topic: z.string().min(1).max(160),
  level: z.enum(["Básico", "Intermedio", "Avanzado"]),
  minutes: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  businessType: z.string().max(120).optional(),
  previousTopics: z.array(z.string().max(120)).max(40).optional(),
  pathId: z.string().max(40).optional(),
  topicIndex: z.number().int().min(0).max(40).optional(),
  topicTotal: z.number().int().min(1).max(40).optional(),
  /** Tipo especial de lección: checkpoint | recall | final | lesson (default). */
  lessonKind: z.enum(["lesson", "checkpoint", "recall", "final"]).optional(),
  /** Rango de posiciones (1-based) que cubre el checkpoint/recall/final. */
  tierRange: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
  /** Nivel base inferido del test de diagnóstico ("Básico" | "Intermedio" | "Avanzado"). */
  baselineLevel: z.enum(["Básico", "Intermedio", "Avanzado"]).optional(),
  /** Referencia de video de YouTube integrada en la lección. */
  videoRef: z.object({
    youtubeId: z.string().max(24),
    title: z.string().max(160),
    seconds: z.number().int().min(10).max(180),
  }).optional(),
  /** Títulos ya vistos en la ruta actual (para checkpoints/recalls). */
  coveredTopics: z.array(z.string().max(160)).max(40).optional(),
});

const SOURCE_LIBRARY: Record<string, string[]> = {
  ventas: [
    "Influence - Robert Cialdini",
    "SPIN Selling - Neil Rackham",
    "The Challenger Sale - Dixon & Adamson",
    "To Sell Is Human - Daniel Pink",
    "Harvard Business Review (hbr.org/topic/sales)",
  ],
  finanzas: [
    "Profit First - Mike Michalowicz",
    "Financial Intelligence - Berman & Knight",
    "BID (iadb.org)",
    "Investopedia (investopedia.com)",
  ],
  marketing: [
    "Permission Marketing - Seth Godin",
    "Contagious - Jonah Berger",
    "Positioning - Ries & Trout",
    "Meta for Business (business.facebook.com)",
  ],
  clientes: [
    "Delivering Happiness - Tony Hsieh",
    "The Effortless Experience - Matthew Dixon",
    "Zendesk Blog (zendesk.com/blog)",
  ],
  inventario: [
    "The Goal - Eliyahu Goldratt",
    "ASCM/APICS (ascm.org)",
  ],
  liderazgo: [
    "Good to Great - Jim Collins",
    "Start With Why - Simon Sinek",
    "The Five Dysfunctions of a Team - Patrick Lencioni",
  ],
  productividad: [
    "Deep Work - Cal Newport",
    "Atomic Habits - James Clear",
    "Getting Things Done - David Allen",
  ],
  ia: [
    "McKinsey Digital (mckinsey.com/capabilities/mckinsey-digital)",
    "MIT Technology Review (technologyreview.com)",
  ],
  administracion: [
    "Competitive Strategy - Michael Porter",
    "Measure What Matters - John Doerr",
    "Management - Peter Drucker",
  ],
  organizacion: [
    "The E-Myth Revisited - Michael Gerber",
    "The Checklist Manifesto - Atul Gawande",
  ],
  formalizacion: [
    "SUNAT (sunat.gob.pe)",
    "Sunarp (sunarp.gob.pe)",
    "Ministerio de la Producción (produce.gob.pe)",
  ],
  negociacion: [
    "Getting to Yes - Fisher & Ury",
    "Never Split the Difference - Chris Voss",
  ],
  expansion: [
    "Scaling Up - Verne Harnish",
  ],
  inversion: [
    "The Intelligent Investor - Benjamin Graham",
    "SBS Perú (sbs.gob.pe)",
  ],
};

/* Schema tolerante — nuevos campos con defaults para no romper si la IA omite algo. */
const strOpt = z.string().optional().default("");

const StepSchema = z.object({
  title: strOpt,
  idea: strOpt,
  example: strOpt,
  reflection: z.string().optional().default(""),
});

const QuizSchema = z.object({
  question: strOpt,
  options: z.array(z.string()).optional().default([]),
  correctIndex: z.number().optional().default(0),
  explanation: strOpt,
});

const SessionSchema = z.object({
  title: strOpt,
  category: strOpt,
  level: strOpt,
  minutes: z.number().optional().default(30),
  steps: z.array(StepSchema).optional().default([]),
  quiz: z.array(QuizSchema).optional().default([]),
  summary: strOpt,
});

export type LearnStep = z.infer<typeof StepSchema>;
export type LearnQuizQ = z.infer<typeof QuizSchema>;
export type LearnSession = z.infer<typeof SessionSchema>;

/** Dificultad en 3 tramos según posición (1..30) — la usa el nuevo formato
 *  expandido de 30 lecciones. Se combina con `baselineLevel` del diagnóstico. */
function tramoBand(index1based: number | undefined, total: number | undefined) {
  const total30 = (total ?? 0) >= 25; // path expandido a 30 lecciones
  if (!total30 || index1based == null) {
    // Path clásico (5-7 lecciones): usa la banda antigua.
    if (index1based == null || total == null || total <= 0) return { band: "básica", note: "Explica de forma sencilla, con lenguaje claro y ejemplos muy cotidianos." };
    if (index1based <= 2) return { band: "básica", note: "Explica de forma sencilla, con lenguaje claro y ejemplos muy cotidianos." };
    if (index1based <= 4) return { band: "intermedia", note: "Sube un poco la complejidad: usa términos técnicos con su explicación y ejemplos con más variables." };
    return { band: "alta", note: "Caso complejo con varias variables interactuando y trade-offs estratégicos." };
  }
  if (index1based <= 10) return { band: "poco visible", note: "Contenido introductorio a intermedio-bajo. Sé claro y directo, sin jerga. La dificultad debe subir de forma casi imperceptible respecto a la lección anterior." };
  if (index1based <= 20) return { band: "presente", note: "Contenido intermedio a intermedio-alto. Introduce vocabulario técnico con explicación, casos con 2-3 variables y decisiones concretas. El usuario ya notará el salto." };
  return { band: "ultrapresente", note: "Contenido avanzado y casos complejos. Trade-offs, escenarios multi-variable, decisiones estratégicas y ejemplos con márgenes/porcentajes/plazos reales." };
}

function baselineNote(baseline?: "Básico" | "Intermedio" | "Avanzado") {
  if (!baseline) return "";
  if (baseline === "Básico") return "El usuario dio nivel BÁSICO en el test de diagnóstico: no asumas conocimientos previos. Baja medio escalón la dificultad esperada del tramo y añade micro-recordatorios de conceptos base.";
  if (baseline === "Intermedio") return "El usuario dio nivel INTERMEDIO en el test de diagnóstico: mantén la dificultad del tramo tal como se pide.";
  return "El usuario dio nivel AVANZADO en el test de diagnóstico: sube medio escalón la exigencia — menos definiciones básicas, más profundidad estratégica y ejemplos con cifras.";
}

function buildPrompt(input: z.infer<typeof InputSchema>) {
  const { topic, level, minutes, businessType, previousTopics, pathId, topicIndex, topicTotal, lessonKind = "lesson", tierRange, baselineLevel, videoRef, coveredTopics } = input;
  const curatedSources = pathId ? SOURCE_LIBRARY[pathId] : undefined;
  const position1 = topicIndex != null ? topicIndex + 1 : undefined;
  const diff = tramoBand(position1, topicTotal);
  const baseline = baselineNote(baselineLevel);

  // ==== Formato según tipo de lección ====
  if (lessonKind === "checkpoint" || lessonKind === "final") {
    const isFinal = lessonKind === "final";
    const quizCount = isFinal ? "10" : "6";
    const rangeTxt = tierRange ? `lecciones ${tierRange[0]} a ${tierRange[1]}` : "las lecciones vistas";
    return `Eres un instructor experto en negocios diseñando un TEST FORMATIVO${isFinal ? " FINAL" : ""} para dueños de MYPEs peruanas.

Categoría/ruta: ${pathId ?? "general"}
Título del test: "${topic}"
Este test evalúa exclusivamente el contenido de ${rangeTxt} de la ruta. NO introduzcas conceptos nuevos: pregunta sobre lo ya cubierto.

${baseline}

REGLAS OBLIGATORIAS:
- Devuelve "steps": [] (vacío). Este contenido es solo evaluación, no lección.
- Devuelve exactamente ${quizCount} preguntas en "quiz". 4 opciones cada una, solo una correcta.
- Nivel de dificultad general del test: ${diff.band} (tramo ${position1 ?? "?"} de ${topicTotal ?? "?"}).
- Cada pregunta debe cubrir un concepto distinto del rango indicado.
- "explanation": 1-2 frases justificando la respuesta y, cuando aplique, mencionando en qué lección se vio ese concepto.
- "summary": una frase que resuma qué se evaluó y qué debe reforzar el usuario si falló.
${coveredTopics && coveredTopics.length > 0 ? `- Conceptos ya cubiertos (usa estos como banco de temas): ${coveredTopics.join("; ")}.` : ""}
${curatedSources && curatedSources.length > 0 ? `- Fuentes de referencia: ${curatedSources.join("; ")}.` : ""}

Devuelve exclusivamente el JSON solicitado.`;
  }

  if (lessonKind === "recall") {
    const rangeTxt = tierRange ? `lecciones ${tierRange[0]} a ${tierRange[1]}` : "las lecciones anteriores";
    return `Eres un instructor experto diseñando una SESIÓN DE REPASO ACTIVO (spaced-recall) para dueños de MYPEs peruanas. Esto NO es una lección nueva ni un juego: es un recordatorio activo estructurado.

Categoría/ruta: ${pathId ?? "general"}
Título: "${topic}"
Cubre exclusivamente conceptos de ${rangeTxt} de la ruta. NO agregues teoría nueva.

${baseline}

REGLAS OBLIGATORIAS:
- Devuelve exactamente 5 "steps". Cada step es UN concepto ya visto, reformulado como recordatorio activo:
  - "title": nombre corto del concepto ya visto.
  - "idea": frase de 1-2 líneas que resuma la idea principal del concepto.
  - "example": micro-ejemplo mype peruano (S/, productos reales) que active la memoria del usuario.
  - "reflection": UNA pregunta corta de auto-chequeo ("¿Puedes explicarle esto a un socio en 2 frases?").
- Devuelve exactamente 3 preguntas en "quiz" — cortas, tipo flashcard, que verifiquen que el concepto quedó fijado.
- "summary": una frase que refuerce por qué este repaso importa antes de avanzar.
${coveredTopics && coveredTopics.length > 0 ? `- Conceptos disponibles para repasar: ${coveredTopics.join("; ")}.` : ""}

Devuelve exclusivamente el JSON solicitado.`;
  }

  // ==== Lección regular (posiblemente con video) ====
  const stepCount = minutes === 30 ? "5" : minutes === 45 ? "6" : "8";
  const quizCount = videoRef ? "4" : (minutes === 30 ? "3" : minutes === 45 ? "4" : "5");

  return `Eres un instructor experto en administración y negocios que diseña micro-lecciones para dueños de MYPEs peruanas (bodegas, minimarkets, ferreterías, panaderías, farmacias, juguerías, tiendas de ropa, etc.). Los usuarios NO tienen tiempo para leer artículos largos: necesitan aprender rápido en formato tipo Duolingo.

Tema: "${topic}"
Nivel del path: ${level}
Dificultad de este tramo: ${diff.band}${position1 != null && topicTotal != null ? ` (lección ${position1} de ${topicTotal})` : ""}.
Duración objetivo: ${minutes} minutos.${businessType ? ` Negocio del usuario: ${businessType}.` : ""}

${baseline}

REGLAS DE CONTENIDO (obligatorias):
- ${diff.note}
- Devuelve exactamente ${stepCount} pasos en "steps". Cada paso es UNA idea clara y practicable, NO un párrafo largo.
- Cada "steps[].title": máximo 6 palabras, directo. Sin numeración manual, sin comillas.
- Cada "steps[].idea": 1-2 frases cortas explicando la idea principal. Español claro, sin jerga innecesaria.
- Cada "steps[].example": 1-3 frases con un ejemplo CONCRETO ambientado en una MYPE peruana real (bodega en Comas, panadería en Villa El Salvador, ferretería en Los Olivos, etc.). Usa nombres realistas, cifras en soles (S/), productos comunes en Perú.
- Cada "steps[].reflection": OPCIONAL. Si aporta, una pregunta corta de reflexión personal al dueño ("¿Cuánto de tu inventario rota en menos de 30 días?"). Máximo 15 palabras. Puede quedar vacía si el paso no lo necesita.
- Devuelve exactamente ${quizCount} preguntas en "quiz". Cada una con 4 opciones y solo una correcta (correctIndex 0-3). "explanation": 1-2 frases justificando la respuesta correcta.
- "summary": una sola frase (máximo 20 palabras) con la idea clave de toda la sesión.
${videoRef ? `\nVIDEO INTEGRADO (obligatorio):\n- Justo antes del quiz el usuario verá un clip de YouTube titulado "${videoRef.title}" (~${videoRef.seconds}s).\n- De las ${quizCount} preguntas del quiz, al menos 2 deben basarse en el ángulo del video (no citando "el video dice X", sino evaluando la idea que transmite).\n` : ""}
REGLAS DE FUENTES (obligatorias):
- No inventes cifras, autores ni citas falsas. Si no estás seguro, generaliza sin dar dato concreto.
- Cuando cites una idea de un libro o autor, que sea real y verificable.
${curatedSources && curatedSources.length > 0 ? `- Para este tema, apóyate cuando sea relevante en: ${curatedSources.join("; ")}.` : ""}
${previousTopics && previousTopics.length > 0 ? `- El usuario ya vio: ${previousTopics.slice(0, 12).join(", ")}. Evita repetir esos ángulos.` : ""}

Devuelve exclusivamente el objeto JSON solicitado, sin texto adicional, sin markdown, sin comentarios.`;
}

export const generateLearnSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY no está configurado.");

    // === Gating por plan (Aprender) ===
    const { supabase, userId } = context as { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };
    const { limitsFor } = await import("@/lib/plans");
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();
    const plan = (sub?.plan ?? "trial") as "trial" | "pro" | "avanzado";
    const limit = limitsFor(plan).maxLearnSessionsPerMonth;

    const { data: newCount, error: rpcErr } = await supabase.rpc("increment_usage_counter", {
      _kind: "learn",
    });
    if (rpcErr) throw new Error(rpcErr.message);
    if (Number.isFinite(limit) && Number(newCount ?? 0) > limit) {
      const err = new Error(
        `Alcanzaste el límite de ${limit} sesiones de Aprender de tu plan ${plan} este mes. Sube al plan Avanzado para sesiones ilimitadas.`,
      );
      (err as Error & { code?: string }).code = "PLAN_LIMIT_REACHED";
      throw err;
    }

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
    steps: (session.steps ?? []).map((s) => ({
      title: s.title ?? "",
      idea: s.idea ?? "",
      example: s.example ?? "",
      reflection: s.reflection ?? "",
    })),
    quiz: (session.quiz ?? []).map((q) => ({
      ...q,
      options: q.options ?? [],
      correctIndex: Math.max(0, Math.min((q.options?.length ?? 1) - 1, q.correctIndex ?? 0)),
    })),
  };
}
