import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Eres socIA, la asistente operativa de Trax — la app de bolsillo para dueños de negocios físicos (bodegas, minimarkets, ferreterías, panaderías, farmacias, etc.) en Perú/Latam.

No eres un chatbot decorativo: eres una operadora real del negocio. Cuando el usuario te pide algo accionable, USAS LAS HERRAMIENTAS disponibles (registrar venta, registrar gasto, fiados, stock, análisis) en vez de solo explicar.

Personalidad:
- Cercana, directa, peruana. Tutea siempre. Sin tecnicismos. Sin relleno.
- Respuestas cortas a menos que pidan detalle. Usa markdown ligero (negritas, listas) sólo cuando aporte.
- Si te saludan, responde breve y propón 2-3 cosas concretas que puedes hacer HOY usando sus datos reales.

Cómo trabajas:
1. Lee el "Contexto actual del negocio" para entender al usuario antes de responder.
2. Si el usuario te pide una acción (registrar, anotar, marcar, consultar, actualizar) — USA LA HERRAMIENTA correspondiente, no inventes confirmaciones falsas.
3. Después de ejecutar una herramienta, confirma en una línea qué hiciste y cuál fue el resultado.
4. Para análisis pide la herramienta "analizarNegocio" cuando el usuario pida un resumen o sugerencias del día/semana/mes.
5. Si una herramienta falla, dilo con honestidad y sugiere alternativa manual.
6. Nunca inventes números del negocio que no estén en el contexto ni vinieron de una herramienta.

Reglas:
- Moneda por defecto: Soles (S/).
- Si te falta un dato crítico para usar una herramienta, pregúntalo en UNA línea (no formulario).
- No pidas confirmación obvia para acciones pequeñas que el usuario ya describió claro — ejecútalas.
- Para fotos: si suben libreta o producto, extrae datos y propón ejecutar la herramienta de registro correspondiente.`;

function makeTools(supabase: SupabaseClient, userId: string) {
  return {
    consultarStock: tool({
      description:
        "Busca productos del negocio en la base de datos. Útil para responder qué tiene el usuario, stock crítico, precios, márgenes.",
      inputSchema: z.object({
        query: z.string().optional().describe("Texto parcial del nombre del producto (opcional)"),
        soloBajoStock: z.boolean().optional().describe("Si solo quiere ver productos por debajo del umbral"),
        limite: z.number().int().min(1).max(50).optional().describe("Máximo de resultados, por defecto 12"),
      }),
      execute: async ({ query, soloBajoStock, limite }) => {
        let q = supabase
          .from("products")
          .select("id,name,stock,price,cost,category,low_stock_threshold")
          .eq("user_id", userId)
          .order("name", { ascending: true })
          .limit(limite ?? 12);
        if (query) q = q.ilike("name", `%${query}%`);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        let rows = data ?? [];
        if (soloBajoStock) rows = rows.filter((p) => (p.stock ?? 0) <= (p.low_stock_threshold ?? 5));
        return {
          total: rows.length,
          productos: rows.map((p) => ({
            nombre: p.name,
            stock: p.stock,
            precio: Number(p.price),
            costo: Number(p.cost),
            categoria: p.category,
            margen_pct: p.cost > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : null,
          })),
        };
      },
    }),

    actualizarStock: tool({
      description:
        "Cambia el stock (unidades disponibles) de un producto existente. Usa esto cuando el usuario diga que repuso, recibió mercancía o quiere corregir el stock.",
      inputSchema: z.object({
        nombre: z.string().describe("Nombre del producto (puede ser parcial)"),
        nuevaCantidad: z.number().int().min(0).optional().describe("Stock final (absoluto)"),
        sumar: z.number().int().optional().describe("Unidades a sumar al stock actual (si reposición)"),
      }),
      execute: async ({ nombre, nuevaCantidad, sumar }) => {
        const { data: prods, error } = await supabase
          .from("products")
          .select("id,name,stock")
          .eq("user_id", userId)
          .ilike("name", `%${nombre}%`)
          .limit(2);
        if (error) throw new Error(error.message);
        if (!prods || prods.length === 0) throw new Error(`No encontré "${nombre}" en tu stock`);
        if (prods.length > 1)
          return { ambiguo: true, opciones: prods.map((p) => p.name) };
        const p = prods[0];
        const final = nuevaCantidad ?? (p.stock ?? 0) + (sumar ?? 0);
        const { error: uErr } = await supabase
          .from("products")
          .update({ stock: final })
          .eq("id", p.id);
        if (uErr) throw new Error(uErr.message);
        return { ok: true, producto: p.name, stock_anterior: p.stock, stock_nuevo: final };
      },
    }),

    registrarVenta: tool({
      description: "Registra una venta rápida (sin items detallados). Usa cuando el usuario diga 'vendí X soles' o similar.",
      inputSchema: z.object({
        total: z.number().positive(),
        metodo: z.enum(["efectivo", "yape", "plin", "fiado", "tarjeta"]).optional(),
        nota: z.string().optional(),
        clienteNombre: z.string().optional(),
      }),
      execute: async ({ total, metodo, nota, clienteNombre }) => {
        const { data, error } = await supabase
          .from("sales")
          .insert({
            user_id: userId,
            total,
            payment_method: metodo ?? "efectivo",
            customer_name: clienteNombre ?? null,
            is_credit: metodo === "fiado",
            paid: metodo !== "fiado",
            note: nota ?? null,
          })
          .select("id,total,payment_method,created_at")
          .single();
        if (error) throw new Error(error.message);
        return { ok: true, venta: data };
      },
    }),

    registrarGasto: tool({
      description: "Registra un gasto del negocio.",
      inputSchema: z.object({
        monto: z.number().positive(),
        categoria: z.string().optional(),
        nota: z.string().optional(),
      }),
      execute: async ({ monto, categoria, nota }) => {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: userId,
            amount: monto,
            category: categoria ?? "Otros",
            note: nota ?? null,
          })
          .select("id,amount,category,created_at")
          .single();
        if (error) throw new Error(error.message);
        return { ok: true, gasto: data };
      },
    }),

    registrarFiado: tool({
      description: "Anota un fiado (cliente que debe pagar).",
      inputSchema: z.object({
        clienteNombre: z.string(),
        monto: z.number().positive(),
        telefono: z.string().optional(),
        nota: z.string().optional(),
      }),
      execute: async ({ clienteNombre, monto, telefono, nota }) => {
        const { data, error } = await supabase
          .from("fiados")
          .insert({
            user_id: userId,
            customer_name: clienteNombre,
            customer_phone: telefono ?? null,
            amount: monto,
            note: nota ?? null,
          })
          .select("id,customer_name,amount,created_at")
          .single();
        if (error) throw new Error(error.message);
        return { ok: true, fiado: data };
      },
    }),

    marcarFiadoPagado: tool({
      description: "Marca un fiado pendiente como pagado (busca por nombre del cliente).",
      inputSchema: z.object({
        clienteNombre: z.string(),
      }),
      execute: async ({ clienteNombre }) => {
        const { data: f, error: fErr } = await supabase
          .from("fiados")
          .select("id,customer_name,amount,paid")
          .eq("user_id", userId)
          .eq("paid", false)
          .ilike("customer_name", `%${clienteNombre}%`)
          .order("created_at", { ascending: false })
          .limit(2);
        if (fErr) throw new Error(fErr.message);
        if (!f || f.length === 0) throw new Error(`No hay fiados pendientes de "${clienteNombre}"`);
        if (f.length > 1)
          return { ambiguo: true, opciones: f.map((x) => `${x.customer_name} (S/${x.amount})`) };
        const target = f[0];
        const { error: uErr } = await supabase
          .from("fiados")
          .update({ paid: true, paid_at: new Date().toISOString() })
          .eq("id", target.id);
        if (uErr) throw new Error(uErr.message);
        return { ok: true, cliente: target.customer_name, monto: target.amount };
      },
    }),

    analizarNegocio: tool({
      description:
        "Genera un análisis financiero compacto del rango pedido: ingresos, gastos, neto, top productos vendidos, alertas. Usa cuando el usuario pida 'cómo voy', 'resumen', 'análisis', 'cierre del día'.",
      inputSchema: z.object({
        rango: z.enum(["hoy", "ayer", "semana", "mes"]).default("hoy"),
      }),
      execute: async ({ rango }) => {
        const now = new Date();
        const start = new Date(now);
        if (rango === "hoy") start.setHours(0, 0, 0, 0);
        else if (rango === "ayer") {
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
        } else if (rango === "semana") start.setDate(start.getDate() - 7);
        else start.setDate(start.getDate() - 30);
        const startIso = start.toISOString();

        const [salesQ, expQ, fiadosQ] = await Promise.all([
          supabase.from("sales").select("total,payment_method").eq("user_id", userId).gte("created_at", startIso),
          supabase.from("expenses").select("amount,category").eq("user_id", userId).gte("created_at", startIso),
          supabase.from("fiados").select("amount,paid").eq("user_id", userId).eq("paid", false),
        ]);
        const ventas = (salesQ.data ?? []).reduce((s, r) => s + Number(r.total), 0);
        const gastos = (expQ.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
        const fiadosPendientes = (fiadosQ.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
        return {
          rango,
          ventas_total: Math.round(ventas * 100) / 100,
          gastos_total: Math.round(gastos * 100) / 100,
          neto: Math.round((ventas - gastos) * 100) / 100,
          n_ventas: salesQ.data?.length ?? 0,
          n_gastos: expQ.data?.length ?? 0,
          fiados_pendientes_total: Math.round(fiadosPendientes * 100) / 100,
        };
      },
    }),
  };
}

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
          tools: makeTools(supabase, userId),
          stopWhen: stepCountIs(8),
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
