import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_business_summary",
  title: "Resumen del negocio hoy",
  description:
    "Devuelve ingresos, egresos, ganancia neta del día, número de productos con stock bajo y total de fiados pendientes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const iso = startOfDay.toISOString();

    const [salesRes, expensesRes, productsRes, fiadosRes] = await Promise.all([
      sb.from("sales").select("total").gte("created_at", iso),
      sb.from("expenses").select("amount").gte("created_at", iso),
      sb.from("products").select("id, stock, low_stock_threshold"),
      sb.from("fiados").select("amount").eq("paid", false),
    ]);

    if (salesRes.error) return errorResult(salesRes.error.message);
    if (expensesRes.error) return errorResult(expensesRes.error.message);
    if (productsRes.error) return errorResult(productsRes.error.message);
    if (fiadosRes.error) return errorResult(fiadosRes.error.message);

    const income = (salesRes.data ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0);
    const expense = (expensesRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const lowStock = (productsRes.data ?? []).filter(
      (p) => Number(p.stock) <= Number(p.low_stock_threshold),
    ).length;
    const pendingDebts = (fiadosRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);

    const summary = {
      currency: "PEN",
      today_income: income,
      today_expense: expense,
      today_net: income - expense,
      low_stock_products: lowStock,
      pending_debts_total: pendingDebts,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
