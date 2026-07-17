import { supabase } from "@/integrations/supabase/client";

export type SubmitSaleLine = {
  dbId: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
};

export type SubmitSaleInput = {
  userId: string;
  lines: SubmitSaleLine[];
  mode: "cobrar" | "fiar";
  /** Método de pago cuando mode = "cobrar". Se guarda en minúsculas. */
  method?: string;
  customerName?: string;
  customerId?: string | null;
  note?: string;
};

export type SubmitSaleResult = {
  saleId: string;
  total: number;
  isCredit: boolean;
};

/**
 * Lógica única para registrar una venta. Espeja 1:1 lo que hacía
 * `SalesOverlay.submitSale`: inserta en sales, sale_items, decrementa stock,
 * crea el cliente si es fiado con nombre nuevo, y crea la fila en fiados.
 * Reutilizable desde el overlay clásico y desde Caja Rápida (POS).
 */
export async function submitSale(input: SubmitSaleInput): Promise<SubmitSaleResult> {
  const { userId, lines, mode } = input;
  if (!userId) throw new Error("Usuario no autenticado");
  if (lines.length === 0) throw new Error("La venta no tiene productos");

  const isCredit = mode === "fiar";
  const customer = (input.customerName ?? "").trim();
  if (isCredit && !customer) throw new Error("Pon el nombre del cliente para fiar");

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);

  // Crear cliente nuevo si es fiado y no vino con id
  let finalCustomerId = input.customerId ?? null;
  if (isCredit && !finalCustomerId && customer) {
    const { data: newC } = await supabase
      .from("customers")
      .insert({ user_id: userId, name: customer })
      .select("id")
      .single();
    finalCustomerId = newC?.id ?? null;
  }

  const paymentMethod = isCredit ? "fiado" : (input.method ?? "Efectivo").toLowerCase();

  const { data: sale, error: sErr } = await supabase
    .from("sales")
    .insert({
      user_id: userId,
      total: subtotal,
      payment_method: paymentMethod,
      note: input.note?.trim() || null,
      customer_name: customer || null,
      customer_id: finalCustomerId,
      is_credit: isCredit,
      paid: !isCredit,
    })
    .select("id")
    .single();
  if (sErr || !sale) throw sErr ?? new Error("No se pudo registrar la venta");

  const { error: iErr } = await supabase.from("sale_items").insert(
    lines.map((l) => ({
      sale_id: sale.id,
      user_id: userId,
      product_id: l.dbId,
      name: l.name,
      qty: l.qty,
      unit_price: l.price,
    })),
  );
  if (iErr) throw iErr;

  await Promise.all(
    lines.map((l) =>
      supabase
        .from("products")
        .update({ stock: Math.max(0, l.stock - l.qty) })
        .eq("id", l.dbId),
    ),
  );

  if (isCredit) {
    await supabase.from("fiados").insert({
      user_id: userId,
      sale_id: sale.id,
      customer_name: customer,
      amount: subtotal,
    });
  }

  return { saleId: sale.id, total: subtotal, isCredit };
}
