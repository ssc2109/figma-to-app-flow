import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLAN_LIMITS, PLAN_PRICES, limitsFor, type PlanId } from "@/lib/plans";

/**
 * Culqi (pasarela peruana). Actualmente en modo test/sandbox.
 * ⚠️  DUEÑO DEL PROYECTO: cuando tengas tus llaves reales, guárdalas
 * como secretos en Project Settings → Secrets:
 *   - CULQI_SECRET_KEY  (llave privada, pk_live_...)
 *   - VITE_CULQI_PUBLIC_KEY (llave pública, pk_live_...)
 * Y elimina los fallbacks *_test_* de abajo. NO commitees llaves reales.
 */
const CULQI_TEST_SECRET = "sk_test_placeholder_replace_in_production";

export const getSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Usage del mes actual
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthISO = monthStart.toISOString().slice(0, 10);

    const { data: usage } = await supabase
      .from("usage_counters")
      .select("kind,count")
      .eq("user_id", userId)
      .eq("period_month", monthISO);

    const usageMap: Record<string, number> = {};
    (usage ?? []).forEach((r: { kind: string; count: number }) => {
      usageMap[r.kind] = r.count;
    });

    return { subscription: sub ?? null, usage: usageMap };
  });

const SubscribeInput = z.object({
  plan: z.enum(["pro", "avanzado"]),
  culqiToken: z.string().min(1).optional(), // token generado por Culqi.js en el cliente
});

export const subscribeToPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SubscribeInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const plan = data.plan as PlanId;

    // ⚠️  Integración Culqi (modo test). Reemplazar CULQI_TEST_SECRET por process.env.CULQI_SECRET_KEY.
    // Docs: https://docs.culqi.com/es/documentacion/subscripciones-v2/introduccion/
    const secret = process.env.CULQI_SECRET_KEY || CULQI_TEST_SECRET;
    let providerSubscriptionId: string | null = null;

    if (data.culqiToken && secret && !secret.includes("placeholder")) {
      try {
        // 1) crear/obtener cliente en Culqi con el email
        // 2) crear card con el token
        // 3) crear suscripción al plan
        // (Aquí van las llamadas reales cuando el dueño configure sus llaves.)
        // const res = await fetch("https://api.culqi.com/v2/subscriptions/create", {...})
        providerSubscriptionId = `culqi_${plan}_${Date.now()}`;
      } catch (err) {
        console.error("[culqi] subscription error", err);
        throw new Error("No se pudo procesar el pago. Verifica tu tarjeta e intenta de nuevo.");
      }
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_provider: "culqi",
        provider_subscription_id: providerSubscriptionId,
      })
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true, plan, price: PLAN_PRICES[plan] };
  });

const IncInput = z.object({
  kind: z.enum(["socia", "learn"]),
});

/** Incrementa el contador mensual y valida contra el límite del plan.
 *  Devuelve { count, limit } o lanza si se superó el límite. */
export const incrementAndCheckUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => IncInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan,status,trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle();

    const plan = ((sub?.plan as PlanId) ?? "trial") as PlanId;
    const limits = limitsFor(plan);
    const limit =
      data.kind === "socia" ? limits.maxSociaQueriesPerMonth : limits.maxLearnSessionsPerMonth;

    // Incremento atómico
    const { data: newCount, error } = await supabase.rpc("increment_usage_counter", {
      _kind: data.kind,
    });
    if (error) throw new Error(error.message);

    const count = Number(newCount ?? 0);
    if (Number.isFinite(limit) && count > limit) {
      const err = new Error(
        data.kind === "socia"
          ? `Alcanzaste el límite de ${limit} consultas a socIA de tu plan ${plan}. Sube a Avanzado para uso ilimitado.`
          : `Alcanzaste el límite de ${limit} sesiones de Aprender de tu plan ${plan}. Sube a Avanzado para sesiones ilimitadas.`,
      );
      // marca reconocible para el cliente
      (err as Error & { code?: string }).code = "PLAN_LIMIT_REACHED";
      throw err;
    }

    return { count, limit: Number.isFinite(limit) ? limit : null, plan };
  });

export const PLAN_LIMITS_EXPORT = PLAN_LIMITS;
