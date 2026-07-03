import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Human-in-the-loop write actions for socIA.
 * Espeja 1:1 la lógica que antes vivía en `execute` de las tools de escritura
 * en `src/routes/api/chat.ts`. Se ejecuta sólo tras confirmación del usuario.
 * Todo filtrado por el user_id autenticado (RLS + eq user_id).
 */

const RegistrarVentaInput = z.object({
  total: z.number().positive().optional(),
  metodo: z.enum(["efectivo", "yape", "plin", "fiado", "tarjeta"]).optional(),
  nota: z.string().optional(),
  clienteNombre: z.string().optional(),
  items: z
    .array(z.object({ nombre: z.string(), cantidad: z.number().int().positive() }))
    .optional(),
});

const RegistrarGastoInput = z.object({
  monto: z.number().positive(),
  categoria: z.string().optional(),
  nota: z.string().optional(),
});

const RegistrarFiadoInput = z.object({
  clienteNombre: z.string(),
  monto: z.number().positive(),
  telefono: z.string().optional(),
  nota: z.string().optional(),
});

const MarcarFiadoPagadoInput = z.object({
  clienteNombre: z.string(),
});

const ActualizarStockInput = z.object({
  nombre: z.string(),
  nuevaCantidad: z.number().int().min(0).optional(),
  sumar: z.number().int().optional(),
});

const CrearProductoInput = z.object({
  nombre: z.string(),
  precio: z.number().nonnegative(),
  costo: z.number().nonnegative().optional(),
  stock: z.number().int().min(0).optional(),
  categoria: z.string().optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
});

const ActionSchema = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("registrarVenta"), args: RegistrarVentaInput }),
  z.object({ tool: z.literal("registrarGasto"), args: RegistrarGastoInput }),
  z.object({ tool: z.literal("registrarFiado"), args: RegistrarFiadoInput }),
  z.object({ tool: z.literal("marcarFiadoPagado"), args: MarcarFiadoPagadoInput }),
  z.object({ tool: z.literal("actualizarStock"), args: ActualizarStockInput }),
  z.object({ tool: z.literal("crearProducto"), args: CrearProductoInput }),
]);

async function execRegistrarVenta(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof RegistrarVentaInput>,
) {
  const pago = a.metodo ?? "efectivo";
  const isCredit = pago === "fiado";

  if (a.items && a.items.length > 0) {
    const resolved: Array<{ id: string; name: string; price: number; stock: number; qty: number }> = [];
    for (const it of a.items) {
      const { data: prods, error } = await supabase
        .from("products")
        .select("id,name,price,stock")
        .eq("user_id", userId)
        .ilike("name", `%${it.nombre}%`)
        .limit(3);
      if (error) throw new Error(error.message);
      if (!prods || prods.length === 0) throw new Error(`No encontré "${it.nombre}" en tu stock`);
      if (prods.length > 1) {
        return { ambiguo: true, nombre_buscado: it.nombre, opciones: prods.map((p) => p.name) };
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
    const totalFinal = a.total ?? Math.round(calculado * 100) / 100;

    const { data: sale, error: sErr } = await supabase
      .from("sales")
      .insert({
        user_id: userId,
        total: totalFinal,
        payment_method: pago,
        customer_name: a.clienteNombre ?? null,
        is_credit: isCredit,
        paid: !isCredit,
        note: a.nota ?? null,
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

  if (a.total == null) {
    throw new Error("Necesito un total o al menos un item para registrar la venta");
  }
  const { data, error } = await supabase
    .from("sales")
    .insert({
      user_id: userId,
      total: a.total,
      payment_method: pago,
      customer_name: a.clienteNombre ?? null,
      is_credit: isCredit,
      paid: !isCredit,
      note: a.nota ?? null,
    })
    .select("id,total,payment_method,created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, venta: data };
}

async function execRegistrarGasto(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof RegistrarGastoInput>,
) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      amount: a.monto,
      category: a.categoria ?? "Otros",
      note: a.nota ?? null,
    })
    .select("id,amount,category,created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, gasto: data };
}

async function execRegistrarFiado(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof RegistrarFiadoInput>,
) {
  const { data, error } = await supabase
    .from("fiados")
    .insert({
      user_id: userId,
      customer_name: a.clienteNombre,
      customer_phone: a.telefono ?? null,
      amount: a.monto,
      note: a.nota ?? null,
    })
    .select("id,customer_name,amount,created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, fiado: data };
}

async function execMarcarFiadoPagado(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof MarcarFiadoPagadoInput>,
) {
  const { data: f, error: fErr } = await supabase
    .from("fiados")
    .select("id,customer_name,amount,paid")
    .eq("user_id", userId)
    .eq("paid", false)
    .ilike("customer_name", `%${a.clienteNombre}%`)
    .order("created_at", { ascending: false })
    .limit(2);
  if (fErr) throw new Error(fErr.message);
  if (!f || f.length === 0) throw new Error(`No hay fiados pendientes de "${a.clienteNombre}"`);
  if (f.length > 1) {
    return { ambiguo: true, opciones: f.map((x) => `${x.customer_name} (S/${x.amount})`) };
  }
  const target = f[0];
  const { error: uErr } = await supabase
    .from("fiados")
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq("id", target.id);
  if (uErr) throw new Error(uErr.message);
  return { ok: true, cliente: target.customer_name, monto: target.amount };
}

async function execActualizarStock(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof ActualizarStockInput>,
) {
  const { data: prods, error } = await supabase
    .from("products")
    .select("id,name,stock")
    .eq("user_id", userId)
    .ilike("name", `%${a.nombre}%`)
    .limit(2);
  if (error) throw new Error(error.message);
  if (!prods || prods.length === 0) throw new Error(`No encontré "${a.nombre}" en tu stock`);
  if (prods.length > 1) return { ambiguo: true, opciones: prods.map((p) => p.name) };
  const p = prods[0];
  const final = a.nuevaCantidad ?? (p.stock ?? 0) + (a.sumar ?? 0);
  const { error: uErr } = await supabase
    .from("products")
    .update({ stock: final })
    .eq("id", p.id);
  if (uErr) throw new Error(uErr.message);
  return { ok: true, producto: p.name, stock_anterior: p.stock, stock_nuevo: final };
}

async function execCrearProducto(
  supabase: SupabaseClient,
  userId: string,
  a: z.infer<typeof CrearProductoInput>,
) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: userId,
      name: a.nombre,
      price: a.precio,
      cost: a.costo ?? 0,
      stock: a.stock ?? 0,
      category: a.categoria ?? null,
      low_stock_threshold: a.low_stock_threshold ?? 5,
    })
    .select("id,name,price,cost,stock,category")
    .single();
  if (error) throw new Error(error.message);
  return { ok: true, producto: data };
}

export const runSociaWriteAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ActionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    switch (data.tool) {
      case "registrarVenta":
        return execRegistrarVenta(supabase, userId, data.args);
      case "registrarGasto":
        return execRegistrarGasto(supabase, userId, data.args);
      case "registrarFiado":
        return execRegistrarFiado(supabase, userId, data.args);
      case "marcarFiadoPagado":
        return execMarcarFiadoPagado(supabase, userId, data.args);
      case "actualizarStock":
        return execActualizarStock(supabase, userId, data.args);
      case "crearProducto":
        return execCrearProducto(supabase, userId, data.args);
    }
  });
