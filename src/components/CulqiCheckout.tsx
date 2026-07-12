import { useEffect, useRef } from "react";
import { PLAN_PRICES, PLAN_FEATURES, type PlanId } from "@/lib/plans";

/**
 * Widget de checkout con Culqi.js v4 (Perú).
 *
 * ⚠️  CONFIGURACIÓN PARA PRODUCCIÓN:
 *   1) Crea tu cuenta en https://integradores.culqi.com y verifícala.
 *   2) Copia tu llave pública (empieza con `pk_live_...` en producción o
 *      `pk_test_...` en sandbox).
 *   3) Agrégala en Project Settings → Secrets como:
 *        VITE_CULQI_PUBLIC_KEY  (llave pública — expuesta al cliente, es segura)
 *        CULQI_SECRET_KEY       (llave privada — solo servidor, NUNCA la commitees)
 *   4) Habilita en tu dashboard de Culqi los métodos: Tarjeta y Yape.
 *
 * Sin `VITE_CULQI_PUBLIC_KEY` configurada, el componente hace un "modo demo"
 * que activa el plan sin cobrar (útil solo para desarrollo). Nunca actives
 * esta ruta en producción.
 */

type CulqiTokenPayload = { id: string; email?: string };

// Culqi inyecta un objeto global; lo tipamos mínimo.
interface CulqiGlobal {
  publicKey: string;
  settings: (opts: {
    title: string;
    currency: "PEN";
    description: string;
    amount: number; // céntimos
    order?: string;
  }) => void;
  options: (opts: {
    lang: "es";
    installments: boolean;
    modal: boolean;
    paymentMethods: {
      tarjeta: boolean;
      yape: boolean;
      bancaMovil?: boolean;
      agente?: boolean;
      billetera?: boolean;
      cuotealo?: boolean;
    };
    style?: {
      logo?: string;
      bannerColor?: string;
      buttonBackground?: string;
      menuColor?: string;
      linksColor?: string;
      buttonText?: string;
      buttonTextColor?: string;
      priceColor?: string;
    };
  }) => void;
  open: () => void;
  close: () => void;
  token?: CulqiTokenPayload;
  error?: { user_message?: string; merchant_message?: string };
}
declare global {
  interface Window {
    Culqi?: CulqiGlobal;
    culqi?: () => void;
  }
}

const CULQI_SRC = "https://checkout.culqi.com/js/v4";

function loadCulqiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.Culqi) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${CULQI_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar Culqi")));
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = CULQI_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Culqi"));
    document.head.appendChild(s);
  });
}

export function useCulqiCheckout() {
  const cbRef = useRef<((tokenId: string | null, err?: string) => void) | null>(null);

  useEffect(() => {
    // Culqi busca una función global `culqi()` en window cuando termina el flujo.
    window.culqi = () => {
      const C = window.Culqi;
      if (!C) return;
      if (C.token) {
        cbRef.current?.(C.token.id);
      } else if (C.error) {
        cbRef.current?.(null, C.error.user_message ?? "Pago rechazado");
      }
      C.close();
    };
    return () => {
      window.culqi = undefined;
    };
  }, []);

  return async function openCheckout(
    plan: PlanId,
    email: string,
  ): Promise<{ token: string | null; demo: boolean; error?: string }> {
    const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY as string | undefined;

    // Modo demo: sin llave configurada, saltamos el cobro y devolvemos null.
    // El servidor ya sabe interpretar esto (marca la sub como active sin
    // provider_subscription_id). Solo válido en desarrollo.
    if (!publicKey || publicKey.includes("placeholder")) {
      return { token: null, demo: true };
    }

    if (plan === "trial") return { token: null, demo: true };
    const info = PLAN_FEATURES[plan];
    const price = PLAN_PRICES[plan];

    try {
      await loadCulqiScript();
    } catch {
      return { token: null, demo: false, error: "No se pudo cargar la pasarela de pago." };
    }

    return new Promise((resolve) => {
      const C = window.Culqi;
      if (!C) {
        resolve({ token: null, demo: false, error: "Culqi no disponible" });
        return;
      }
      C.publicKey = publicKey;
      C.settings({
        title: `Trax — Plan ${info.name}`,
        currency: "PEN",
        description: `Suscripción mensual · ${email}`,
        amount: Math.round(price.amount * 100), // céntimos
        order: `trax_${plan}_${Date.now()}`,
      });
      C.options({
        lang: "es",
        installments: false,
        modal: true,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: false,
          agente: false,
          billetera: false,
          cuotealo: false,
        },
        style: {
          bannerColor: "#000000",
          buttonBackground: "#FFFFFF",
          buttonTextColor: "#000000",
          menuColor: "#000000",
          linksColor: "#FFFFFF",
          priceColor: "#FFFFFF",
        },
      });

      cbRef.current = (tokenId, err) => {
        cbRef.current = null;
        if (err) resolve({ token: null, demo: false, error: err });
        else resolve({ token: tokenId, demo: false });
      };

      C.open();
    });
  };
}
