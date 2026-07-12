import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_low_stock",
  title: "Productos con stock crítico",
  description: "Lista los productos cuyo stock actual está por debajo o igual al umbral configurado.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("products")
      .select("id, name, stock, low_stock_threshold, price")
      .order("stock");
    if (error) return errorResult(error.message);
    const low = (data ?? []).filter((p) => Number(p.stock) <= Number(p.low_stock_threshold));
    return {
      content: [{ type: "text", text: JSON.stringify(low, null, 2) }],
      structuredContent: { low_stock: low },
    };
  },
});
