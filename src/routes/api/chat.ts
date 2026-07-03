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
        "Registra una venta. Si el usuario menciona productos concretos (ej. 'vendí 3 Inca Kolas y 2 panes'), pásalos en 'items' como [{nombre, cantidad}]: la herramienta buscará cada producto, creará los sale_items, calculará el total desde los precios y descontará el stock. Si solo dice un monto ('vendí 25 soles'), envía solo 'total' para una venta rápida sin detalle. El total explícito, si se envía junto con items, prevalece sobre el calculado.",
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
      execute: async ({ total, metodo, nota, clienteNombre, items }) => {
        const pago = metodo ?? "efectivo";
        const isCredit = pago === "fiado";

        // Camino con items: resolver productos, calcular total, insertar sale + sale_items, descontar stock.
        if (items && items.length > 0) {
          const resolved: Array<{ id: string; name: string; price: number; stock: number; qty: number }> = [];
          for (const it of items) {
            const { data: prods, error } = await supabase
              .from("products")
              .select("id,name,price,stock")
              .eq("user_id", userId)
              .ilike("name", `%${it.nombre}%`)
              .limit(3);
            if (error) throw new Error(error.message);
            if (!prods || prods.length === 0) {
              throw new Error(`No encontré "${it.nombre}" en tu stock`);
            }
            if (prods.length > 1) {
              return {
                ambiguo: true,
                nombre_buscado: it.nombre,
                opciones: prods.map((p) => p.name),
              };
            }
            const p = prods[0];
            resolved.push({
              id: p.id,
              name: p.name,
              price: Number(p.price) || 0,
              stock: Number(p.stock) || 0,
              qty: it.cantidad,
            });
          }

          const calculado = resolved.reduce((s, r) => s + r.price * r.qty, 0);
          const totalFinal = total ?? Math.round(calculado * 100) / 100;

          const { data: sale, error: sErr } = await supabase
            .from("sales")
            .insert({
              user_id: userId,
              total: totalFinal,
              payment_method: pago,
              customer_name: clienteNombre ?? null,
              is_credit: isCredit,
              paid: !isCredit,
              note: nota ?? null,
            })
            .select("id,total,payment_method,created_at")
            .single();
          if (sErr || !sale) throw new Error(sErr?.message ?? "No se pudo registrar la venta");

          const itemsPayload = resolved.map((r) => ({
            sale_id: sale.id,
            user_id: userId,
            product_id: r.id,
            name: r.name,
            qty: r.qty,
            unit_price: r.price,
          }));
          const { error: iErr } = await supabase.from("sale_items").insert(itemsPayload);
          if (iErr) throw new Error(iErr.message);

          await Promise.all(
            resolved.map((r) =>
              supabase
                .from("products")
                .update({ stock: Math.max(0, r.stock - r.qty) })
                .eq("id", r.id),
            ),
          );

          return {
            ok: true,
            venta: sale,
            items: resolved.map((r) => ({
              nombre: r.name,
              cantidad: r.qty,
              precio_unit: r.price,
              subtotal: Math.round(r.price * r.qty * 100) / 100,
            })),
            total_calculado: Math.round(calculado * 100) / 100,
          };
        }

        // Camino rápido: solo total.
        if (total == null) {
          throw new Error("Necesito un total o al menos un item para registrar la venta");
        }
        const { data, error } = await supabase
          .from("sales")
          .insert({
            user_id: userId,
            total,
            payment_method: pago,
            customer_name: clienteNombre ?? null,
            is_credit: isCredit,
            paid: !isCredit,
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
