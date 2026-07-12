import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, notAuthed, supabaseForUser } from "../supabase";

export default defineTool({
  name: "register_expense",
  title: "Registrar egreso",
  description:
    "Registra un gasto/egreso del negocio en Trax. Usa categorías como 'servicios', 'insumos', 'transporte', 'personal', 'otros'.",
  inputSchema: {
    amount: z.number().positive().describe("Monto del gasto en soles (PEN)."),
    category: z.string().trim().min(1).default("otros"),
    note: z.string().trim().max(280).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ amount, category, note }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthed();
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("expenses")
      .insert({ user_id: ctx.getUserId(), amount, category, note: note ?? null })
      .select("id, amount, category, note, created_at")
      .single();
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: `Egreso registrado: S/ ${amount.toFixed(2)} en ${category}.` }],
      structuredContent: { expense: data },
    };
  },
});
