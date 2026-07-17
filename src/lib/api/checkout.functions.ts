import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { PLAN_PRICES, type PlanId } from "@/lib/plans";

/**
 * =========================================================================
 *  CHECKOUT — Stripe (internacional) y Culqi (Perú)
 * =========================================================================
 *
 *  MODO ACTUAL: SANDBOX / TEST.
 *
 *  Para pasar a PRODUCCIÓN, guarda las siguientes llaves en
 *  Project Settings → Secrets (NO las commitees en el código):
 *
 *  STRIPE (internacional + Apple Pay global):
 *    STRIPE_SECRET_KEY        → sk_live_...  (backend, obligatorio)
 *    VITE_STRIPE_PUBLIC_KEY   → pk_live_...  (frontend, obligatorio)
 *
 *  CULQI (métodos locales Perú + Apple Pay local + Yape + QR):
 *    CULQI_SECRET_KEY         → sk_live_...
 *    VITE_CULQI_PUBLIC_KEY    → pk_live_...
 *
 *  Sin llaves configuradas cada procesador entra en "modo demo":
 *  aprueba el pago SIN cobrar (útil para desarrollo). El servidor
 *  marca la suscripción como active con provider = "demo" para
 *  poder distinguirlo.
 * =========================================================================
 */

const CENTS_BY_CURRENCY: Record<string, number> = { PEN: 100, USD: 100 };

const StripeIntentInput = z.object({
  plan: z.enum(["pro", "avanzado"]),
  email: z.string().email().optional(),
});

/** Crea un PaymentIntent en Stripe (modo sandbox si no hay llave). */
export const createStripePaymentIntent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => StripeIntentInput.parse(i))
  .handler(async ({ data }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    const plan = data.plan as PlanId;
    const price = PLAN_PRICES[plan as "pro" | "avanzado"];
    const cents = Math.round(price.amount * (CENTS_BY_CURRENCY[price.currency] ?? 100));

    if (!secret || secret.includes("placeholder")) {
      return { demo: true as const, clientSecret: null as string | null, amount: cents, currency: price.currency };
    }

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" as unknown as Stripe.LatestApiVersion });
    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency: price.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: data.email,
      metadata: { plan, source: "trax_checkout" },
    });

    return {
      demo: false as const,
      clientSecret: intent.client_secret,
      amount: cents,
      currency: price.currency,
    };
  });
