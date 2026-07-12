// Configuración central de planes de Trax.
// Los límites se aplican vía usePlan() en el cliente y vía RPC/server fns en el backend.

export type PlanId = "trial" | "gratis" | "pro" | "avanzado";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export type PlanLimits = {
  maxTeamMembers: number; // dueño incluido
  maxCatalogProducts: number;
  /** Créditos de socIA por ventana (window). Infinito = ilimitado. */
  maxSociaCredits: number;
  /** Duración de la ventana de créditos socIA en horas.
   *  0 = ventana de mes calendario (comportamiento clásico).
   *  >0 = ventana rotativa (ej: 8 horas para plan gratis). */
  sociaCreditsWindowHours: number;
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
    maxSociaCredits: UNLIMITED,
    sociaCreditsWindowHours: 0,
    maxLearnSessionsPerMonth: UNLIMITED,
    hasAdvancedReports: true,
    hasCustomCatalogBranding: true,
    hasWhatsappReminders: true,
    prioritySupport: true,
  },
  gratis: {
    maxTeamMembers: 1,
    maxCatalogProducts: 30,
    maxSociaCredits: 5,
    sociaCreditsWindowHours: 8,
    maxLearnSessionsPerMonth: 2,
    hasAdvancedReports: false,
    hasCustomCatalogBranding: false,
    hasWhatsappReminders: false,
    prioritySupport: false,
  },
  pro: {
    maxTeamMembers: 3, // 1 dueño + 2 miembros
    maxCatalogProducts: 200,
    maxSociaCredits: 50,
    sociaCreditsWindowHours: 0, // mes calendario
    maxLearnSessionsPerMonth: 10,
    hasAdvancedReports: false,
    hasCustomCatalogBranding: false,
    hasWhatsappReminders: false,
    prioritySupport: false,
  },
  avanzado: {
    maxTeamMembers: UNLIMITED,
    maxCatalogProducts: UNLIMITED,
    maxSociaCredits: UNLIMITED,
    sociaCreditsWindowHours: 0,
    maxLearnSessionsPerMonth: UNLIMITED,
    hasAdvancedReports: true,
    hasCustomCatalogBranding: true,
    hasWhatsappReminders: true,
    prioritySupport: true,
  },
};

export type PaidOrFreePlan = Exclude<PlanId, "trial">;

export const PLAN_PRICES: Record<PaidOrFreePlan, { amount: number; currency: string; label: string }> = {
  gratis: { amount: 0, currency: "PEN", label: "Gratis" },
  pro: { amount: 29.9, currency: "PEN", label: "S/ 29.90 / mes" },
  avanzado: { amount: 79.9, currency: "PEN", label: "S/ 79.90 / mes" },
};

export const PLAN_FEATURES: Record<PaidOrFreePlan, { name: string; tagline: string; features: string[] }> = {
  gratis: {
    name: "Gratis",
    tagline: "Para empezar sin costo",
    features: [
      "Ventas ilimitadas",
      "Catálogo hasta 30 productos",
      "Hasta 15 clientes y fiados",
      "1 usuario (sin equipo)",
      "socIA: 5 créditos cada 8 horas",
      "Aprender: 2 sesiones/mes",
    ],
  },
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
      "socIA hasta 50 créditos/mes",
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
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.gratis;
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Mensaje user-facing cuando se acaban los créditos de socIA. */
export function sociaLimitMessage(plan: PlanId): string {
  const l = limitsFor(plan);
  if (l.sociaCreditsWindowHours > 0) {
    return `Alcanzaste tus ${l.maxSociaCredits} créditos de socIA de las últimas ${l.sociaCreditsWindowHours} horas. Vuelve a intentar más tarde o sube de plan.`;
  }
  return `Alcanzaste tus ${l.maxSociaCredits} créditos de socIA de este mes. Sube al plan Avanzado para créditos ilimitados.`;
}
