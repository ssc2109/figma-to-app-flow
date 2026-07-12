import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "Listar productos",
  description:
    "Lista los productos del catálogo del negocio. Permite filtrar por texto de búsqueda (nombre, sku o barcode) y limitar el número de resultados.",
  inputSchema: {
    search: z.string().trim().optional().describe("Texto a buscar en nombre, sku o barcode."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("products")
      .select("id, name, sku, barcode, category, price, cost, stock, low_stock_threshold")
      .order("name")
      .limit(limit);
    if (search && search.length > 0) {
      const s = `%${search}%`;
      q = q.or(`name.ilike.${s},sku.ilike.${s},barcode.ilike.${s}`);
    }
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
