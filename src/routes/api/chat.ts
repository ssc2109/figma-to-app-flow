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
7. Si la pregunta requiere información que NO está en la base de datos del negocio (tendencias del mercado, precios promedio del sector, noticias, análisis de competencia, negocios similares, proveedores, presencia digital de otras empresas, cambios económicos), usa la herramienta "investigarWeb" — decides tú automáticamente, el usuario no tiene que pedirlo.
8. Si la consulta necesita comparar datos internos con el mercado (ej: "¿mis precios están altos?", "¿cómo va mi rubro?"), llama en paralelo a las herramientas internas (consultarStock/analizarNegocio) Y a "investigarWeb", y luego combina ambas fuentes en tu respuesta.
9. Si investigarWeb devuelve ok:false o sin resultados, dilo con transparencia y responde sólo con los datos internos disponibles. Nunca inventes datos externos.

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
        if (soloBajoStock) rows = rows.filter((p) => (p.stock ?? 0) <= (p.low_stock_threshold ?? 10));
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
        "Cambia el stock (unidades disponibles) de un producto existente. Usa esto cuando el usuario diga que repuso, recibió mercancía o quiere corregir el stock. REQUIERE CONFIRMACIÓN HUMANA: la acción no se ejecuta hasta que el usuario confirme la tarjeta en el chat.",
      inputSchema: z.object({
        nombre: z.string().describe("Nombre del producto (puede ser parcial)"),
        nuevaCantidad: z.number().int().min(0).optional().describe("Stock final (absoluto)"),
        sumar: z.number().int().optional().describe("Unidades a sumar al stock actual (si reposición)"),
      }),
      // Sin execute: la tool call llega al cliente y espera confirmación humana.
    }),

    crearProducto: tool({
      description:
        "Crea un nuevo producto en el catálogo del negocio. Úsalo cuando el usuario quiera añadir algo al stock por primera vez (ej: 'agrega Inca Kola 500ml a S/3'). REQUIERE CONFIRMACIÓN HUMANA.",
      inputSchema: z.object({
        nombre: z.string().describe("Nombre del producto"),
        precio: z.number().nonnegative().describe("Precio de venta en soles"),
        costo: z.number().nonnegative().optional().describe("Costo unitario en soles"),
        stock: z.number().int().min(0).optional().describe("Stock inicial"),
        categoria: z.string().optional(),
        low_stock_threshold: z.number().int().min(0).optional().describe("Umbral de stock crítico"),
      }),
      // Sin execute: requiere confirmación humana.
    }),


    registrarVenta: tool({
      description:
        "Registra una venta. Si el usuario menciona productos concretos (ej. 'vendí 3 Inca Kolas y 2 panes'), pásalos en 'items' como [{nombre, cantidad}]; el total explícito prevalece si viene con items. Si solo dice un monto ('vendí 25 soles'), envía solo 'total'. REQUIERE CONFIRMACIÓN HUMANA: la acción se ejecuta sólo cuando el usuario confirma la tarjeta en el chat.",
      inputSchema: z.object({
        total: z.number().positive().optional(),
        metodo: z.enum(["efectivo", "yape", "plin", "fiado", "tarjeta"]).optional(),
        nota: z.string().optional(),
        clienteNombre: z.string().optional(),
        items: z
          .array(z.object({ nombre: z.string(), cantidad: z.number().int().positive() }))
          .optional()
          .describe("Productos vendidos con su cantidad. Cada nombre puede ser parcial."),
      }),
      // Sin execute: requiere confirmación humana.
    }),

    registrarGasto: tool({
      description:
        "Registra un gasto del negocio. REQUIERE CONFIRMACIÓN HUMANA antes de escribir en la base de datos.",
      inputSchema: z.object({
        monto: z.number().positive(),
        categoria: z.string().optional(),
        nota: z.string().optional(),
      }),
      // Sin execute: requiere confirmación humana.
    }),

    registrarFiado: tool({
      description:
        "Anota un fiado (cliente que debe pagar). REQUIERE CONFIRMACIÓN HUMANA antes de crear el registro.",
      inputSchema: z.object({
        clienteNombre: z.string(),
        monto: z.number().positive(),
        telefono: z.string().optional(),
        nota: z.string().optional(),
      }),
      // Sin execute: requiere confirmación humana.
    }),

    marcarFiadoPagado: tool({
      description:
        "Marca un fiado pendiente como pagado (busca por nombre del cliente). REQUIERE CONFIRMACIÓN HUMANA antes de actualizar la deuda.",
      inputSchema: z.object({
        clienteNombre: z.string(),
      }),
      // Sin execute: requiere confirmación humana.
    }),


    analizarNegocio: tool({
      description:
        "Análisis financiero + análisis por producto del rango pedido (hoy/ayer/semana/mes). Devuelve totales (ventas, gastos, neto, fiados pendientes), top 5 productos por ingreso con margen %, producto estrella con estimación de potencial extra en soles si su margen igualara al margen promedio de la tienda, productos vendidos a pérdida (price < cost) y comparación con el período equivalente anterior (ventas y variación %). Todo calculado desde sale_items unidos a products, filtrado por el user_id autenticado. Nunca inventa datos: si no hay ventas en el rango, devuelve arrays vacíos y null. Usa cuando el usuario pida 'cómo voy', 'resumen', 'análisis', 'cierre del día', o cuando quiera saber qué producto le rinde más.",
      inputSchema: z.object({
        rango: z.enum(["hoy", "ayer", "semana", "mes"]).default("hoy"),
      }),
      execute: async ({ rango }) => {
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);
        if (rango === "hoy") {
          start.setHours(0, 0, 0, 0);
        } else if (rango === "ayer") {
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 1);
        } else if (rango === "semana") {
          start.setDate(start.getDate() - 7);
        } else {
          start.setDate(start.getDate() - 30);
        }
        const durationMs = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - durationMs);
        const prevEnd = new Date(start);
        const startIso = start.toISOString();
        const endIso = end.toISOString();
        const prevStartIso = prevStart.toISOString();
        const prevEndIso = prevEnd.toISOString();

        const [salesQ, expQ, fiadosQ, itemsQ, prevSalesQ, bajoCostoQ] = await Promise.all([
          supabase.from("sales").select("total,payment_method").eq("user_id", userId).gte("created_at", startIso).lt("created_at", endIso),
          supabase.from("expenses").select("amount,category").eq("user_id", userId).gte("created_at", startIso).lt("created_at", endIso),
          supabase.from("fiados").select("amount,paid").eq("user_id", userId).eq("paid", false),
          supabase
            .from("sale_items")
            .select("product_id,name,qty,unit_price,products(name,price,cost)")
            .eq("user_id", userId)
            .gte("created_at", startIso)
            .lt("created_at", endIso),
          supabase.from("sales").select("total").eq("user_id", userId).gte("created_at", prevStartIso).lt("created_at", prevEndIso),
          supabase.from("products").select("name,price,cost").eq("user_id", userId),
        ]);

        const ventas = (salesQ.data ?? []).reduce((s, r) => s + Number(r.total), 0);
        const gastos = (expQ.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
        const fiadosPendientes = (fiadosQ.data ?? []).reduce((s, r) => s + Number(r.amount), 0);

        // Agregación por producto
        type Agg = { nombre: string; unidades: number; ingreso: number; costo: number };
        const byProduct = new Map<string, Agg>();
        const items = (itemsQ.data ?? []) as unknown as Array<{
          product_id: string | null;
          name: string;
          qty: number;
          unit_price: number | string;
          products: { name: string; price: number | string; cost: number | string } | null;
        }>;
        for (const it of items) {
          const key = it.product_id ?? `__${it.name}`;
          const unit = Number(it.unit_price) || 0;
          const cost = Number(it.products?.cost ?? 0) || 0;
          const qty = Number(it.qty) || 0;
          const ingreso = unit * qty;
          const costoTotal = cost * qty;
          const cur = byProduct.get(key);
          if (cur) {
            cur.unidades += qty;
            cur.ingreso += ingreso;
            cur.costo += costoTotal;
          } else {
            byProduct.set(key, {
              nombre: it.products?.name ?? it.name,
              unidades: qty,
              ingreso,
              costo: costoTotal,
            });
          }
        }
        const aggs = Array.from(byProduct.values());
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const pct = (n: number) => Math.round(n * 10) / 10;

        const topProductos = aggs
          .slice()
          .sort((a, b) => b.ingreso - a.ingreso)
          .slice(0, 5)
          .map((a) => ({
            nombre: a.nombre,
            unidades: a.unidades,
            ingreso_total: round2(a.ingreso),
            margen_pct: a.ingreso > 0 ? pct(((a.ingreso - a.costo) / a.ingreso) * 100) : null,
          }));

        // Margen promedio ponderado de la tienda en el rango
        const totalIngreso = aggs.reduce((s, a) => s + a.ingreso, 0);
        const totalCosto = aggs.reduce((s, a) => s + a.costo, 0);
        const margenPromedio = totalIngreso > 0 ? ((totalIngreso - totalCosto) / totalIngreso) * 100 : null;

        let productoEstrella:
          | {
              nombre: string;
              unidades: number;
              ingreso_total: number;
              margen_pct: number | null;
              margen_promedio_tienda_pct: number | null;
              potencial_extra_soles: number;
            }
          | null = null;
        if (aggs.length > 0) {
          const star = aggs.reduce((a, b) => (b.ingreso > a.ingreso ? b : a));
          const starMargen = star.ingreso > 0 ? ((star.ingreso - star.costo) / star.ingreso) * 100 : 0;
          const potencial =
            margenPromedio !== null && margenPromedio > starMargen
              ? (star.ingreso * (margenPromedio - starMargen)) / 100
              : 0;
          productoEstrella = {
            nombre: star.nombre,
            unidades: star.unidades,
            ingreso_total: round2(star.ingreso),
            margen_pct: star.ingreso > 0 ? pct(starMargen) : null,
            margen_promedio_tienda_pct: margenPromedio !== null ? pct(margenPromedio) : null,
            potencial_extra_soles: round2(potencial),
          };
        }

        const productosBajoCosto = (bajoCostoQ.data ?? [])
          .map((p) => ({
            nombre: p.name as string,
            precio: Number(p.price) || 0,
            costo: Number(p.cost) || 0,
          }))
          .filter((p) => p.costo > 0 && p.precio < p.costo)
          .map((p) => ({
            nombre: p.nombre,
            precio: round2(p.precio),
            costo: round2(p.costo),
            perdida_por_unidad: round2(p.costo - p.precio),
          }));

        const prevVentas = (prevSalesQ.data ?? []).reduce((s, r) => s + Number(r.total), 0);
        const variacionPct =
          prevVentas > 0 ? pct(((ventas - prevVentas) / prevVentas) * 100) : ventas > 0 ? null : 0;

        return {
          rango,
          desde: startIso,
          hasta: endIso,
          ventas_total: round2(ventas),
          gastos_total: round2(gastos),
          neto: round2(ventas - gastos),
          n_ventas: salesQ.data?.length ?? 0,
          n_gastos: expQ.data?.length ?? 0,
          fiados_pendientes_total: round2(fiadosPendientes),
          margen_promedio_tienda_pct: margenPromedio !== null ? pct(margenPromedio) : null,
          top_productos: topProductos,
          producto_estrella: productoEstrella,
          productos_bajo_costo: productosBajoCosto,
          comparacion_periodo_anterior: {
            desde: prevStartIso,
            hasta: prevEndIso,
            ventas_total: round2(prevVentas),
            variacion_pct: variacionPct,
          },
        };
      },
    }),

    investigarWeb: tool({
      description:
        "Busca información pública actualizada en Internet (Tavily) cuando la respuesta NO puede obtenerse de la base de datos del negocio. Úsala para: tendencias del mercado, precios promedio del sector, noticias económicas, análisis de competencia, negocios similares, proveedores, estrategias comerciales, presencia digital y datos públicos de empresas. Combínala con las herramientas internas (consultarStock, analizarNegocio, etc.) cuando el usuario pida comparar sus datos con el mercado. No la uses para acciones (registrar, actualizar) ni para datos ya disponibles internamente.",
      inputSchema: z.object({
        consulta: z.string().min(3).describe("Consulta clara para el buscador, en español, enfocada al negocio del usuario (ej: 'precio promedio saco de arroz 50kg Lima 2026', 'competencia bodegas Miraflores', 'tendencias panaderías Perú')"),
        profundidad: z.enum(["basica", "avanzada"]).optional().describe("Usa 'avanzada' para análisis de competencia o mercado; 'basica' para consultas rápidas"),
        maxResultados: z.number().int().min(1).max(10).optional().describe("Máximo de resultados a devolver, por defecto 5"),
        incluirDominios: z.array(z.string()).optional().describe("Restringe la búsqueda a dominios específicos (opcional)"),
        tema: z.enum(["general", "news"]).optional().describe("Usa 'news' cuando el usuario pida noticias o cambios recientes"),
      }),
      execute: async ({ consulta, profundidad, maxResultados, incluirDominios, tema }) => {
        const apiKey = process.env.Tavily || process.env.TAVILY_API_KEY;
        if (!apiKey) {
          return { ok: false, error: "Tavily no está configurado en el servidor.", resultados: [] };
        }
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: apiKey,
              query: consulta,
              search_depth: profundidad === "avanzada" ? "advanced" : "basic",
              max_results: maxResultados ?? 5,
              include_answer: true,
              include_raw_content: false,
              include_images: false,
              topic: tema === "news" ? "news" : "general",
              include_domains: incluirDominios && incluirDominios.length ? incluirDominios : undefined,
            }),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            return { ok: false, error: `Tavily HTTP ${res.status}`, detalle: txt.slice(0, 200), resultados: [] };
          }
          const data = (await res.json()) as {
            answer?: string;
            results?: Array<{ title?: string; url?: string; content?: string; score?: number; published_date?: string }>;
          };
          const resultados = (data.results ?? []).map((r) => ({
            titulo: r.title ?? "",
            url: r.url ?? "",
            resumen: (r.content ?? "").slice(0, 500),
            score: r.score ?? null,
            fecha: r.published_date ?? null,
          }));
          return {
            ok: true,
            consulta,
            respuesta_sintetizada: data.answer ?? null,
            total: resultados.length,
            resultados,
            aviso: "Información obtenida de fuentes públicas via Tavily. Verifica antes de tomar decisiones críticas.",
          };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Error consultando Tavily", resultados: [] };
        }
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

        // === Gating por plan (socIA): créditos por ventana + tope mensual duro ===
        {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("plan")
            .eq("user_id", userId)
            .maybeSingle();
          const plan = ((sub as { plan?: string } | null)?.plan ?? "trial") as
            | "trial"
            | "gratis"
            | "pro"
            | "avanzado";
          const { limitsFor, sociaLimitMessage } = await import("@/lib/plans");
          const limits = limitsFor(plan);
          const limit = limits.maxSociaCredits;
          const windowSeconds = limits.sociaCreditsWindowHours > 0
            ? limits.sociaCreditsWindowHours * 3600
            : undefined;

          // Contador principal (ventana rotativa para gratis, mes calendario para pro).
          const { data: newCount, error: rpcErr } = await supabase.rpc(
            "increment_usage_counter",
            { _kind: "socia", _window_seconds: windowSeconds },
          );
          if (rpcErr) return new Response(rpcErr.message, { status: 500 });

          const denyResponse = async (reason: "window" | "monthly", kind: string) => {
            // Traer period_end de la ventana activa para calcular tiempo restante.
            const { data: row } = await supabase
              .from("usage_counters")
              .select("period_end")
              .eq("user_id", userId)
              .eq("kind", kind)
              .gt("period_end", new Date().toISOString())
              .order("period_end", { ascending: false })
              .limit(1)
              .maybeSingle();
            const periodEnd = (row as { period_end?: string } | null)?.period_end;
            const resetInMs = periodEnd ? new Date(periodEnd).getTime() - Date.now() : undefined;
            return new Response(
              JSON.stringify({
                error: "PLAN_LIMIT_REACHED",
                message: sociaLimitMessage(plan, { resetInMs, reason }),
                resetInMs: resetInMs ?? null,
                reason,
              }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          };

          if (Number.isFinite(limit) && Number(newCount ?? 0) > limit) {
            return denyResponse(windowSeconds ? "window" : "monthly", "socia");
          }

          // Tope mensual duro adicional (solo aplica cuando hay ventana rotativa).
          const monthlyCap = limits.maxSociaMonthlyCap;
          if (windowSeconds && Number.isFinite(monthlyCap)) {
            const { data: monthCount, error: rpc2 } = await supabase.rpc(
              "increment_usage_counter",
              { _kind: "socia_month_cap", _window_seconds: undefined },
            );
            if (rpc2) return new Response(rpc2.message, { status: 500 });
            if (Number(monthCount ?? 0) > monthlyCap) {
              return denyResponse("monthly", "socia_month_cap");
            }
          }
        }


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

        // Tono de socIA según preferencia del usuario (profiles.preferences.socia_tone)
        const { data: prof } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", userId)
          .maybeSingle();
        const tone = ((prof as { preferences?: { socia_tone?: string } } | null)
          ?.preferences?.socia_tone ?? "cercano") as "cercano" | "formal";
        const toneBlock =
          tone === "formal"
            ? "\n\nAjuste de tono (preferencia del usuario): usa un registro FORMAL y profesional. Trata de usted. Evita coloquialismos y modismos. Mantén la brevedad y la utilidad."
            : "\n\nAjuste de tono (preferencia del usuario): usa un registro CERCANO y peruano. Tutea siempre, con calidez y naturalidad.";

        const gateway = createLovableAiGatewayProvider(lovableKey);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT + toneBlock + ctxBlock,

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
