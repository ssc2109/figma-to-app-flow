import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_recent_sales",
  title: "Ventas recientes",
  description: "Devuelve las ventas más recientes con sus items.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("sales")
      .select(
        "id, created_at, total, payment_method, is_credit, paid, customer_name, sale_items(name, qty, unit_price)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { sales: data ?? [] },
    };
  },
});
