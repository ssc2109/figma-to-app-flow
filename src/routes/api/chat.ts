import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Eres socIA, la asistente inteligente de Trax — una app para dueños de negocios físicos pequeños (bodegas, minimarkets, ferreterías, panaderías, farmacias, etc.) en Perú/Latam.

Personalidad:
- Cercana, directa, sin tecnicismos. Habla en español de Perú. Tutea siempre.
- Respuestas cortas y útiles. Cero relleno. Cero corporativismo.
- Si saludan, responde con calidez breve y propón qué puedes hacer hoy.

Capacidades:
- Analizar ventas, gastos, fiados, stock y márgenes.
- Interpretar fotos: si el usuario sube una foto de su libreta de ventas/gastos o un producto, extrae los datos (monto, fecha, producto, cantidad) y proponlo en formato claro.
- Sugerir qué reponer, qué subir de precio, cómo cobrar fiados.
- Dar consejos prácticos de negocio.

Reglas:
- Si te dan un monto sin moneda, asume Soles (S/).
- Si te piden registrar algo, devuelve los campos estructurados claros (monto, categoría, nota) y confirma al final con un "¿Lo registro?".
- No inventes datos del negocio que no te hayan dado.
- Usa markdown ligero (negritas, listas) cuando ayude a leer.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          threadId?: string;
          context?: Record<string, unknown>;
        };

        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }

        const lovableKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePublishable = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!lovableKey || !supabaseUrl || !supabasePublishable) {
          return new Response("Missing server env", { status: 500 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(supabaseUrl, supabasePublishable, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        // Validate thread ownership if provided
        let threadId = body.threadId;
        if (threadId) {
          const { data: t } = await supabase
            .from("chat_threads")
            .select("id")
            .eq("id", threadId)
            .maybeSingle();
          if (!t) threadId = undefined;
        }

        // Auto-create a thread if none
        if (!threadId) {
          const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
          const inferred = (() => {
            const parts = (lastUser?.parts ?? []) as Array<{ type: string; text?: string }>;
            const txt = parts
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join(" ")
              .trim();
            return txt.length > 0 ? txt.slice(0, 60) : "Nueva conversación";
          })();
          const { data: newThread, error: tErr } = await supabase
            .from("chat_threads")
            .insert({ user_id: userId, title: inferred })
            .select("id")
            .single();
          if (tErr || !newThread) return new Response("thread create failed", { status: 500 });
          threadId = newThread.id;
        }

        // Persist the latest user message (last one in body.messages)
        const lastMessage = body.messages[body.messages.length - 1];
        if (lastMessage && lastMessage.role === "user") {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastMessage.parts as unknown as object,
          });
        }

        // Build context string from client snapshot
        const ctx = body.context ?? {};
        const ctxBlock = Object.keys(ctx).length
          ? `\n\nContexto actual del negocio del usuario (en vivo):\n\`\`\`json\n${JSON.stringify(ctx, null, 2)}\n\`\`\``
          : "";

        const gateway = createLovableAiGatewayProvider(lovableKey);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT + ctxBlock,
          messages: await convertToModelMessages(body.messages),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistantMsg = finalMessages[finalMessages.length - 1];
            if (assistantMsg && assistantMsg.role === "assistant") {
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "assistant",
                parts: assistantMsg.parts as unknown as object,
              });
              await supabase
                .from("chat_threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            }
          },
        });

        // Echo back threadId so client can adopt it
        const headers = new Headers(response.headers);
        if (threadId) headers.set("X-Thread-Id", threadId);
        headers.set("Access-Control-Expose-Headers", "X-Thread-Id");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      },
    },
  },
});
