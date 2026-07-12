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
  /** Tope duro mensual adicional de créditos socIA (aplica sobre la ventana rotativa).
   *  Infinito = sin tope mensual. */
  maxSociaMonthlyCap: number;
  maxLearnSessionsPerMonth: number;
  /** Días de historial de ventas visibles. Infinito = sin límite. */
  maxSalesHistoryDays: number;
  /** Acceso a Compras a proveedores. */
  hasSupplierPurchases: boolean;
  /** Acceso a Calendario y agenda. */
  hasCalendarAgenda: boolean;
  /** Catálogo público sin la marca "Hecho con Trax".
   *  true = SIN marca (limpio). false = con marca. */
  hasCatalogBranding: boolean;
  hasAdvancedReports: boolean;
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
    maxSociaMonthlyCap: UNLIMITED,
    maxLearnSessionsPerMonth: UNLIMITED,
    maxSalesHistoryDays: UNLIMITED,
    hasSupplierPurchases: true,
    hasCalendarAgenda: true,
    hasCatalogBranding: true,
    hasAdvancedReports: true,
    hasWhatsappReminders: true,
    prioritySupport: true,
  },
  gratis: {
    maxTeamMembers: 1,
    maxCatalogProducts: 30,
    maxSociaCredits: 5,
    sociaCreditsWindowHours: 8,
    maxSociaMonthlyCap: 15,
    maxLearnSessionsPerMonth: 2,
    maxSalesHistoryDays: 30,
    hasSupplierPurchases: false,
    hasCalendarAgenda: false,
    hasCatalogBranding: false,
    hasAdvancedReports: false,
    hasWhatsappReminders: false,
    prioritySupport: false,
  },
  pro: {
    maxTeamMembers: 3, // 1 dueño + 2 miembros
    maxCatalogProducts: 200,
    maxSociaCredits: 50,
    sociaCreditsWindowHours: 0, // mes calendario
    maxSociaMonthlyCap: UNLIMITED,
    maxLearnSessionsPerMonth: 10,
    maxSalesHistoryDays: UNLIMITED,
    hasSupplierPurchases: true,
    hasCalendarAgenda: true,
    hasCatalogBranding: true, // sin marca de Trax
    hasAdvancedReports: false,
    hasWhatsappReminders: false,
    prioritySupport: false,
  },
  avanzado: {
    maxTeamMembers: UNLIMITED,
    maxCatalogProducts: UNLIMITED,
    maxSociaCredits: UNLIMITED,
    sociaCreditsWindowHours: 0,
    maxSociaMonthlyCap: UNLIMITED,
    maxLearnSessionsPerMonth: UNLIMITED,
    maxSalesHistoryDays: UNLIMITED,
    hasSupplierPurchases: true,
    hasCalendarAgenda: true,
    hasCatalogBranding: true,
    hasAdvancedReports: true,
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
      "Historial de ventas: últimos 30 días",
      "Catálogo hasta 30 productos",
      "Hasta 15 clientes y fiados",
      "1 usuario (sin equipo)",
      "Sin compras a proveedores",
      "Sin calendario y agenda",
      "Catálogo público con marca Hecho con Trax",
      "socIA: 5 créditos cada 8h (tope 15/mes)",
      "Aprender: 2 sesiones/mes",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Para negocios que empiezan a crecer",
    features: [
      "Ventas ilimitadas + historial completo",
      "Catálogo hasta 200 productos",
      "Clientes y fiados ilimitados",
      "Compras a proveedores (básico)",
      "Calendario y agenda",
      "Hasta 2 miembros de equipo",
      "Catálogo público sin marca de Trax",
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

/** Formatea milisegundos restantes a un texto natural en español ("2 h 15 min", "45 min", "unos minutos"). */
export function formatTimeRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "unos minutos";
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Mensaje user-facing cuando se acaban los créditos de socIA.
 *  Si se pasa `resetInMs`, se muestra el tiempo restante hasta que se reinicie
 *  la ventana. `reason` distingue "window" (ventana rotativa) de "monthly" (tope mensual). */
export function sociaLimitMessage(
  plan: PlanId,
  opts?: { resetInMs?: number; reason?: "window" | "monthly" },
): string {
  const l = limitsFor(plan);
  const reason = opts?.reason ?? (l.sociaCreditsWindowHours > 0 ? "window" : "monthly");
  const remaining = opts?.resetInMs;

  if (reason === "monthly") {
    if (plan === "gratis") {
      return `Alcanzaste tu tope mensual de ${l.maxSociaMonthlyCap} créditos de socIA. Pasa a Pro y no esperes al próximo mes.`;
    }
    return `Alcanzaste tus ${l.maxSociaCredits} créditos de socIA de este mes. Sube al plan Avanzado para créditos ilimitados.`;
  }
  // reason === "window"
  const when = remaining && remaining > 0 ? `Vuelve en ${formatTimeRemaining(remaining)}` : "Vuelve más tarde";
  return `Se acabaron tus créditos por ahora. ${when}, o pasa a Pro y no esperes más.`;
}
