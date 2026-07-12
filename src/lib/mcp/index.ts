import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getBusinessSummary from "./tools/get-business-summary";
import listProducts from "./tools/list-products";
import listLowStock from "./tools/list-low-stock";
import listRecentSales from "./tools/list-recent-sales";
import listPendingDebts from "./tools/list-pending-debts";
import registerExpense from "./tools/register-expense";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "trax-mcp",
  title: "Trax",
  version: "0.1.0",
  instructions:
    "Herramientas para consultar y actualizar el negocio del usuario en Trax (ERP de bolsillo para microemprendedores): resumen del día, catálogo, stock crítico, ventas recientes, fiados pendientes, y registro de egresos. Todas las herramientas operan sobre los datos del usuario autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getBusinessSummary,
    listProducts,
    listLowStock,
    listRecentSales,
    listPendingDebts,
    registerExpense,
  ],
});
