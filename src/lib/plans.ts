// Configuración central de planes de Trax.
// Los límites se aplican vía usePlan() en el cliente y vía RPC/server fns en el backend.

export type PlanId = "trial" | "pro" | "avanzado";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export type PlanLimits = {
  maxTeamMembers: number; // dueño incluido
  maxCatalogProducts: number;
  maxSociaQueriesPerMonth: number;
  maxLearnSessionsPerMonth: number;
  hasAdvancedReports: boolean;
  hasCustomCatalogBranding: boolean;
  hasWhatsappReminders: boolean;
  prioritySupport: boolean;
};

export const UNLIMITED = Number.POSITIVE_INFINITY;

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: {
    maxTeamMembers: UNLIMITED,
    maxCatalogProducts: UNLIMITED,
    maxSociaQueriesPerMonth: UNLIMITED,
    maxLearnSessionsPerMonth: UNLIMITED,
    hasAdvancedReports: true,
    hasCustomCatalogBranding: true,
    hasWhatsappReminders: true,
    prioritySupport: true,
  },
  pro: {
    maxTeamMembers: 3, // 1 dueño + 2 miembros
    maxCatalogProducts: 200,
    maxSociaQueriesPerMonth: 30,
    maxLearnSessionsPerMonth: 10,
    hasAdvancedReports: false,
    hasCustomCatalogBranding: false,
    hasWhatsappReminders: false,
    prioritySupport: false,
  },
  avanzado: {
    maxTeamMembers: UNLIMITED,
    maxCatalogProducts: UNLIMITED,
    maxSociaQueriesPerMonth: UNLIMITED,
    maxLearnSessionsPerMonth: UNLIMITED,
    hasAdvancedReports: true,
    hasCustomCatalogBranding: true,
    hasWhatsappReminders: true,
    prioritySupport: true,
  },
};

export const PLAN_PRICES: Record<Exclude<PlanId, "trial">, { amount: number; currency: string; label: string }> = {
  pro: { amount: 29.9, currency: "PEN", label: "S/ 29.90 / mes" },
  avanzado: { amount: 79.9, currency: "PEN", label: "S/ 79.90 / mes" },
};

export const PLAN_FEATURES: Record<Exclude<PlanId, "trial">, { name: string; tagline: string; features: string[] }> = {
  pro: {
    name: "Pro",
    tagline: "Para negocios que empiezan a crecer",
    features: [
      "Ventas ilimitadas",
      "Catálogo hasta 200 productos",
      "Clientes y fiados ilimitados",
      "Compras a proveedores (básico)",
      "Calendario y agenda",
      "Hasta 2 miembros de equipo",
      "socIA hasta 30 consultas/mes",
      "Aprender: 10 sesiones IA/mes",
    ],
  },
  avanzado: {
    name: "Avanzado",
    tagline: "Sin límites para operar en serio",
    features: [
      "Todo lo de Pro, sin límites",
      "Equipo y catálogo ilimitados",
      "socIA ilimitado",
      "Aprender ilimitado",
      "Catálogo público con tu marca",
      "Reportes avanzados (Excel/PDF)",
      "Recordatorios de fiado por WhatsApp",
      "Soporte prioritario",
    ],
  },
};

export function limitsFor(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.pro;
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
