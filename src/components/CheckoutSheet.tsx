import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Loader2, ShieldCheck, QrCode } from "lucide-react";
import { loadStripe, type Stripe as StripeJs, type StripePaymentRequest } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useServerFn } from "@tanstack/react-start";
import { createStripePaymentIntent } from "@/lib/api/checkout.functions";
import { PLAN_FEATURES, PLAN_PRICES, type PlanId } from "@/lib/plans";
import { useCulqiCheckout } from "@/components/CulqiCheckout";

type PaidPlan = Exclude<PlanId, "trial" | "gratis">;

export type CheckoutResult =
  | { ok: true; provider: "stripe" | "culqi" | "demo"; providerRef?: string; demo?: boolean }
  | { ok: false; error: string };

type Props = {
  open: boolean;
  plan: PaidPlan;
  email: string;
  onClose: () => void;
  onSuccess: (r: Extract<CheckoutResult, { ok: true }>) => void;
};

const STRIPE_PK = (import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined) ?? "";
const stripePromise: Promise<StripeJs | null> | null =
  STRIPE_PK && !STRIPE_PK.includes("placeholder") ? loadStripe(STRIPE_PK) : null;

// ------------------------------------------------------------------
// Sheet
// ------------------------------------------------------------------
export default function CheckoutSheet({ open, plan, email, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<"stripe" | "culqi">("stripe");
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[430px] max-h-[90vh] overflow-y-auto rounded-t-[28px] border-t border-white/[0.08] bg-[#0a0a0a] text-white"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/[0.05] px-[18px] py-[14px] flex items-center justify-between">
              <div>
                <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
                  Confirmar plan
                </div>
                <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.3px]">
                  {PLAN_FEATURES[plan].name} · {PLAN_PRICES[plan].label}
                </div>
              </div>
              <button
                aria-label="Cerrar"
                onClick={onClose}
                className="h-[36px] w-[36px] grid place-items-center rounded-full bg-white/[0.06] border border-white/[0.08]"
              >
                <X className="h-[16px] w-[16px]" strokeWidth={1.8} />
              </button>
            </div>

            <div className="px-[18px] pt-[16px]">
              <PlanSummary plan={plan} />
              <div className="mt-[16px] grid grid-cols-2 rounded-full bg-white/[0.04] border border-white/[0.08] p-[4px]">
                <TabBtn active={tab === "stripe"} onClick={() => setTab("stripe")}>
                  <CreditCard className="h-[14px] w-[14px]" strokeWidth={1.8} /> Tarjeta / Apple Pay
                </TabBtn>
                <TabBtn active={tab === "culqi"} onClick={() => setTab("culqi")}>
                  <Smartphone className="h-[14px] w-[14px]" strokeWidth={1.8} /> Yape / QR / Local
                </TabBtn>
              </div>
            </div>

            <div className="px-[18px] py-[18px]">
              {tab === "stripe" ? (
                <StripeTab plan={plan} email={email} onSuccess={onSuccess} />
              ) : (
                <CulqiTab plan={plan} email={email} onSuccess={onSuccess} />
              )}
            </div>

            <div className="px-[18px] pb-[24px] pt-[6px] flex items-center gap-[8px] font-['Geist'] text-[11px] text-white/45">
              <ShieldCheck className="h-[13px] w-[13px]" strokeWidth={1.8} />
              Pago procesado en modo test. Ninguna tarjeta real será cargada.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-[40px] rounded-full font-['Geist'] text-[12.5px] font-semibold flex items-center justify-center gap-[6px] transition ${
        active ? "bg-white text-black" : "text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function PlanSummary({ plan }: { plan: PaidPlan }) {
  const info = PLAN_FEATURES[plan];
  const price = PLAN_PRICES[plan];
  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-[14px]">
      <div className="flex items-baseline justify-between">
        <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold">{info.name}</div>
        <div className="font-['Bai_Jamjuree'] text-[18px] font-bold tracking-[-0.5px]">{price.label}</div>
      </div>
      <div className="mt-[4px] font-['Geist'] text-[12px] text-white/55">{info.tagline}</div>
    </div>
  );
}

// ------------------------------------------------------------------
// STRIPE TAB — internacional + Apple Pay global
// ------------------------------------------------------------------
function StripeTab({
  plan,
  email,
  onSuccess,
}: {
  plan: PaidPlan;
  email: string;
  onSuccess: (r: Extract<CheckoutResult, { ok: true }>) => void;
}) {
  const createIntent = useServerFn(createStripePaymentIntent);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await createIntent({ data: { plan, email } });
        if (!alive) return;
        if (res.demo || !res.clientSecret) {
          setDemo(true);
        } else {
          setClientSecret(res.clientSecret);
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : "No se pudo iniciar el pago");
      }
    })();
    return () => {
      alive = false;
    };
  }, [plan, email, createIntent]);

  if (err) return <div className="rounded-[14px] border border-red-500/30 bg-red-500/10 p-[12px] text-[13px] text-red-200">{err}</div>;

  if (demo || !stripePromise) {
    return (
      <DemoConfirm
        title="Modo demo (Stripe)"
        note="Para cobros reales agrega STRIPE_SECRET_KEY (backend) y VITE_STRIPE_PUBLIC_KEY (frontend) en Project Settings → Secrets."
        onConfirm={() => onSuccess({ ok: true, provider: "stripe", demo: true, providerRef: `demo_stripe_${Date.now()}` })}
      />
    );
  }

  if (!clientSecret) return <SpinnerRow />;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#0a0a0a",
            colorText: "#ffffff",
            borderRadius: "12px",
            fontFamily: "Geist, system-ui, sans-serif",
          },
        },
      }}
    >
      <StripeInner plan={plan} email={email} onSuccess={onSuccess} />
    </Elements>
  );
}

function StripeInner({
  plan,
  email,
  onSuccess,
}: {
  plan: PaidPlan;
  email: string;
  onSuccess: (r: Extract<CheckoutResult, { ok: true }>) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const price = PLAN_PRICES[plan];
  const info = PLAN_FEATURES[plan];

  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: price.currency.toLowerCase(),
      total: { label: `Trax · ${info.name}`, amount: Math.round(price.amount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((res) => {
      if (res) setPaymentRequest(pr);
    });
    pr.on("paymentmethod", async (ev) => {
      // Confirmamos el PaymentIntent con el método de Apple/Google Pay
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        (elements as unknown as { _commonOptions?: { clientSecret?: string } })?._commonOptions?.clientSecret ?? "",
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );
      if (error) {
        ev.complete("fail");
        setErr(error.message ?? "Pago rechazado");
      } else {
        ev.complete("success");
        onSuccess({ ok: true, provider: "stripe", providerRef: paymentIntent?.id });
      }
    });
  }, [stripe, elements, plan, email, price.amount, price.currency, info.name, onSuccess]);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setErr(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/plans?checkout=stripe` },
      redirect: "if_required",
    });
    setBusy(false);
    if (error) {
      setErr(error.message ?? "Pago rechazado. Verifica tu tarjeta.");
      return;
    }
    onSuccess({ ok: true, provider: "stripe", providerRef: paymentIntent?.id });
  };

  return (
    <div className="space-y-[14px]">
      {paymentRequest && (
        <div className="rounded-[14px] overflow-hidden">
          <PaymentRequestButtonElement
            options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "48px" } } }}
          />
          <div className="text-center font-['Geist'] text-[11px] text-white/40 mt-[8px]">o paga con tarjeta</div>
        </div>
      )}
      <PaymentElement options={{ layout: "tabs" }} />
      {err && (
        <div className="rounded-[12px] border border-red-500/30 bg-red-500/10 p-[10px] text-[12.5px] text-red-200">
          {err}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={!stripe || busy}
        className="w-full h-[48px] rounded-full bg-white text-black font-['Geist'] text-[14px] font-semibold flex items-center justify-center gap-[8px] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : `Pagar ${price.label}`}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// CULQI TAB — Yape / QR / Apple Pay local
// ------------------------------------------------------------------
function CulqiTab({
  plan,
  email,
  onSuccess,
}: {
  plan: PaidPlan;
  email: string;
  onSuccess: (r: Extract<CheckoutResult, { ok: true }>) => void;
}) {
  const openCulqi = useCulqiCheckout();
  const [busy, setBusy] = useState<null | "yape" | "qr" | "apple">(null);
  const [err, setErr] = useState<string | null>(null);
  const hasKey = useMemo(() => {
    const k = import.meta.env.VITE_CULQI_PUBLIC_KEY as string | undefined;
    return Boolean(k && !k.includes("placeholder"));
  }, []);

  const trigger = async (kind: "yape" | "qr" | "apple") => {
    setErr(null);
    setBusy(kind);
    try {
      // Culqi checkout unificado — el usuario elige método dentro del modal.
      // El objeto de Apple Pay local se activa automáticamente cuando el
      // dispositivo lo soporta y el comercio está habilitado en Culqi.
      const res = await openCulqi(plan, email);
      if (res.error) throw new Error(res.error);
      onSuccess({
        ok: true,
        provider: "culqi",
        demo: res.demo,
        providerRef: res.token ?? `demo_culqi_${kind}_${Date.now()}`,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo procesar el pago");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-[10px]">
      <PayMethodBtn
        label="Yape"
        sublabel="Ingresa tu número y aprueba con el código Yape (OTP)"
        icon={<Smartphone className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        loading={busy === "yape"}
        onClick={() => trigger("yape")}
      />
      <PayMethodBtn
        label="Pagar con QR"
        sublabel="Compatible con Yape, Plin y otras billeteras locales"
        icon={<QrCode className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        loading={busy === "qr"}
        onClick={() => trigger("qr")}
      />
      <PayMethodBtn
        label="Apple Pay (Perú)"
        sublabel="Autorización con Face ID / Touch ID"
        icon={<CreditCard className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        loading={busy === "apple"}
        onClick={() => trigger("apple")}
      />
      {!hasKey && (
        <div className="mt-[6px] rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-[10px] font-['Geist'] text-[11.5px] text-white/50 leading-[1.5]">
          <b className="text-white/70">Modo demo (Culqi)</b> — Para cobros reales, agrega
          <code className="mx-[3px] px-[4px] py-[1px] rounded bg-white/[0.06]">VITE_CULQI_PUBLIC_KEY</code>
          y <code className="mx-[3px] px-[4px] py-[1px] rounded bg-white/[0.06]">CULQI_SECRET_KEY</code>
          en Project Settings → Secrets, y habilita Yape/QR/Apple Pay en el dashboard de Culqi.
        </div>
      )}
      {err && (
        <div className="rounded-[12px] border border-red-500/30 bg-red-500/10 p-[10px] text-[12.5px] text-red-200">
          {err}
        </div>
      )}
    </div>
  );
}

function PayMethodBtn({
  label,
  sublabel,
  icon,
  loading,
  onClick,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-[12px] p-[14px] rounded-[16px] border border-white/[0.08] bg-white/[0.04] active:opacity-80 disabled:opacity-60 text-left"
    >
      <div className="h-[38px] w-[38px] grid place-items-center rounded-full bg-white/10">
        {loading ? <Loader2 className="h-[16px] w-[16px] animate-spin" /> : icon}
      </div>
      <div className="flex-1">
        <div className="font-['Geist'] text-[14px] font-semibold">{label}</div>
        <div className="font-['Geist'] text-[11.5px] text-white/50">{sublabel}</div>
      </div>
    </button>
  );
}

function DemoConfirm({
  title,
  note,
  onConfirm,
}: {
  title: string;
  note: string;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-[12px]">
      <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-[12px] font-['Geist'] text-[12.5px] text-white/70">
        <div className="text-white font-semibold mb-[4px]">{title}</div>
        {note}
      </div>
      <button
        onClick={onConfirm}
        className="w-full h-[48px] rounded-full bg-white text-black font-['Geist'] text-[14px] font-semibold"
      >
        Simular pago exitoso
      </button>
    </div>
  );
}

function SpinnerRow() {
  return (
    <div className="h-[120px] grid place-items-center text-white/50">
      <Loader2 className="h-[20px] w-[20px] animate-spin" />
    </div>
  );
}
