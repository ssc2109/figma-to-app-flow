import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLAN_LIMITS, PLAN_PRICES, limitsFor, sociaLimitMessage, type PlanId } from "@/lib/plans";

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
    let { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Auto-degradar trial vencido a plan gratis (permanente, sin bloqueo).
    if (
      sub &&
      sub.status === "trialing" &&
      sub.trial_ends_at &&
      new Date(sub.trial_ends_at).getTime() <= Date.now()
    ) {
      const { data: updated } = await supabase
        .from("subscriptions")
        .update({ plan: "gratis", status: "active" })
        .eq("user_id", userId)
        .select("*")
        .maybeSingle();
      if (updated) sub = updated;
    }

    // Usage: tomamos la ventana activa (no vencida) de cada kind
    const nowIso = new Date().toISOString();
    const { data: usage } = await supabase
      .from("usage_counters")
      .select("kind,count,period_end")
      .eq("user_id", userId)
      .gt("period_end", nowIso);

    const usageMap: Record<string, number> = {};
    (usage ?? []).forEach((r: { kind: string; count: number }) => {
      // Si hay múltiples ventanas activas por kind, nos quedamos con la mayor cuenta
      usageMap[r.kind] = Math.max(usageMap[r.kind] ?? 0, r.count);
    });

    return { subscription: sub ?? null, usage: usageMap };
  });

const SubscribeInput = z.object({
  plan: z.enum(["gratis", "pro", "avanzado"]),
  provider: z.enum(["stripe", "culqi", "demo"]).optional(),
  providerRef: z.string().min(1).optional(), // paymentIntentId / culqi token / etc.
  culqiToken: z.string().min(1).optional(), // legacy alias — se mapea a providerRef
});

export const subscribeToPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SubscribeInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const plan = data.plan as PlanId;

    // Determinar procesador: preferimos el explícito; si viene culqiToken legacy, es culqi.
    const provider = data.provider ?? (data.culqiToken ? "culqi" : plan === "gratis" ? null : "demo");
    const providerRef = data.providerRef ?? data.culqiToken ?? null;

    // Log-only en modo test. El cobro real de tarjeta ya se hizo en el cliente
    // (Stripe: confirmPayment; Culqi: token capturado). Aquí solo registramos.
    if (provider === "culqi" && providerRef) {
      const culqiSecret = process.env.CULQI_SECRET_KEY || CULQI_TEST_SECRET;
      if (culqiSecret && !culqiSecret.includes("placeholder")) {
        // TODO producción: POST https://api.culqi.com/v2/charges
        //   { amount, currency_code:"PEN", email, source_id: providerRef }
      }
    }
    const providerSubscriptionId = providerRef ? `${provider}_${plan}_${providerRef.slice(-8)}` : null;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const isPaid = plan === "pro" || plan === "avanzado";
    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: isPaid ? periodEnd.toISOString() : null,
        payment_provider: isPaid ? provider : null,
        provider_subscription_id: isPaid ? providerSubscriptionId : null,
      })
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true, plan, price: PLAN_PRICES[plan as "gratis" | "pro" | "avanzado"] };
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
    const isSocia = data.kind === "socia";
    const limit = isSocia ? limits.maxSociaCredits : limits.maxLearnSessionsPerMonth;
    const windowSeconds = isSocia && limits.sociaCreditsWindowHours > 0
      ? limits.sociaCreditsWindowHours * 3600
      : undefined;

    const denyFromKind = async (reason: "window" | "monthly", kind: string) => {
      const { data: row } = await supabase
        .from("usage_counters")
        .select("period_end")
        .eq("user_id", userId)
        .eq("kind", kind)
        .gt("period_end", new Date().toISOString())
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle();
      const periodEnd = (row as { period_end?: string } | null)?.period_end;
      const resetInMs = periodEnd ? new Date(periodEnd).getTime() - Date.now() : undefined;
      const err = new Error(
        isSocia
          ? sociaLimitMessage(plan, { resetInMs, reason })
          : `Alcanzaste el límite de ${limit} sesiones de Aprender de tu plan ${plan}. Sube a Avanzado para sesiones ilimitadas.`,
      );
      (err as Error & { code?: string; resetInMs?: number }).code = "PLAN_LIMIT_REACHED";
      (err as Error & { code?: string; resetInMs?: number }).resetInMs = resetInMs;
      throw err;
    };

    // Incremento atómico con ventana adecuada
    const { data: newCount, error } = await supabase.rpc("increment_usage_counter", {
      _kind: data.kind,
      _window_seconds: windowSeconds,
    });
    if (error) throw new Error(error.message);

    const count = Number(newCount ?? 0);
    if (Number.isFinite(limit) && count > limit) {
      await denyFromKind(windowSeconds ? "window" : "monthly", data.kind);
    }

    // Tope mensual duro para socIA (solo si el plan tiene ventana rotativa, ej. gratis).
    if (isSocia && windowSeconds && Number.isFinite(limits.maxSociaMonthlyCap)) {
      const { data: monthCount, error: err2 } = await supabase.rpc("increment_usage_counter", {
        _kind: "socia_month_cap",
        _window_seconds: undefined,
      });
      if (err2) throw new Error(err2.message);
      if (Number(monthCount ?? 0) > limits.maxSociaMonthlyCap) {
        await denyFromKind("monthly", "socia_month_cap");
      }
    }

    return { count, limit: Number.isFinite(limit) ? limit : null, plan };
  });

export const PLAN_LIMITS_EXPORT = PLAN_LIMITS;
