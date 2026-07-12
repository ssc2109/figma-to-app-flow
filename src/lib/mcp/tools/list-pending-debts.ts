import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_pending_debts",
  title: "Fiados pendientes",
  description: "Lista los fiados (créditos a clientes) que aún no han sido pagados.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("fiados")
      .select("id, customer_name, customer_phone, amount, due_date, created_at, note")
      .eq("paid", false)
      .order("created_at", { ascending: false });
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { pending: data ?? [] },
    };
  },
});
