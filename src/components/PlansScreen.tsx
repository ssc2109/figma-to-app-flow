import { useState } from "react";
import { ArrowLeft, Check, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToPlan } from "@/lib/api/subscription.functions";
import { PLAN_FEATURES, PLAN_PRICES, type PlanId } from "@/lib/plans";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import CheckoutSheet from "@/components/CheckoutSheet";

type PaidPlan = Exclude<PlanId, "trial" | "gratis">;

export default function PlansScreen({ onBack }: { onBack: () => void }) {
  const { subscription, plan, isTrialing, daysLeft, refresh } = usePlan();
  const { user } = useAuth();
  const subscribe = useServerFn(subscribeToPlan);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutFor, setCheckoutFor] = useState<PaidPlan | null>(null);

  const handleChoose = async (target: "gratis" | "pro" | "avanzado") => {
    setError(null);
    setNotice(null);
    if (target === "gratis") {
      setBusy(target);
      try {
        await subscribe({ data: { plan: "gratis" } });
        await refresh();
        setNotice("Estás en el plan Gratis. Puedes subir a Pro o Avanzado cuando quieras.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo activar el plan.");
      } finally {
        setBusy(null);
      }
      return;
    }
    setCheckoutFor(target);
  };



  return (
    <div className="relative w-full text-white pb-[180px]">
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/[0.05]">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <button
            type="button"
            onClick={onBack}
            className="h-[40px] w-[40px] grid place-items-center rounded-full bg-white/[0.05] border border-white/[0.08]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
          <div className="flex-1">
            <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              Suscripción
            </div>
            <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.3px]">
              Planes y facturación
            </div>
          </div>
        </div>
      </div>

      <div className="px-[16px] pt-[18px] space-y-[14px]">
        {isTrialing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] p-[16px] border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-[10px]">
              <Sparkles className="h-[16px] w-[16px] text-white" strokeWidth={1.7} />
              <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/50">
                Prueba gratuita
              </div>
            </div>
            <div className="mt-[8px] font-['Bai_Jamjuree'] text-[26px] font-semibold tracking-[-0.5px]">
              {daysLeft} {daysLeft === 1 ? "día" : "días"} restantes
            </div>
            <div className="mt-[4px] font-['Geist'] text-[13px] text-white/55">
              Estás usando Trax con acceso completo tipo Avanzado. Elige un plan antes de que termine tu prueba para no perder funciones.
            </div>
          </motion.div>
        )}

        {subscription && !isTrialing && (
          <div
            className="rounded-[20px] p-[16px] border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-[10px]">
              <ShieldCheck className="h-[16px] w-[16px] text-white" strokeWidth={1.7} />
              <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/50">
                Plan actual
              </div>
            </div>
            <div className="mt-[8px] font-['Bai_Jamjuree'] text-[22px] font-semibold capitalize">
              {plan}
            </div>
          </div>
        )}

        {(["gratis", "pro", "avanzado"] as const).map((id) => {
          const info = PLAN_FEATURES[id];
          const price = PLAN_PRICES[id];
          const isCurrent = plan === id;
          const featured = id === "avanzado";
          return (
            <div
              key={id}
              className="rounded-[24px] p-[20px] border"
              style={{
                borderColor: featured ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                background: featured
                  ? "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
                  : "rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-['Bai_Jamjuree'] text-[24px] font-semibold tracking-[-0.5px]">
                    {info.name}
                  </div>
                  <div className="font-['Geist'] text-[12.5px] text-white/50 mt-[2px]">
                    {info.tagline}
                  </div>
                </div>
                {featured && (
                  <div className="rounded-full px-[10px] py-[4px] bg-white text-black font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.2px]">
                    Recomendado
                  </div>
                )}
              </div>

              <div className="mt-[14px] font-['Bai_Jamjuree'] text-[32px] font-bold tracking-[-0.8px]">
                {price.label}
              </div>

              <ul className="mt-[16px] space-y-[10px]">
                {info.features.map((f) => (
                  <li key={f} className="flex items-start gap-[10px]">
                    <div className="h-[18px] w-[18px] rounded-full bg-white/10 grid place-items-center mt-[1px] shrink-0">
                      <Check className="h-[11px] w-[11px] text-white" strokeWidth={2.2} />
                    </div>
                    <div className="font-['Geist'] text-[13.5px] text-white/85 leading-[1.4]">{f}</div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleChoose(id)}
                disabled={busy !== null || isCurrent}
                className={`mt-[18px] w-full h-[48px] rounded-full font-['Geist'] text-[14px] font-semibold flex items-center justify-center gap-[8px] transition-opacity ${
                  featured
                    ? "bg-white text-black"
                    : "bg-white/10 text-white border border-white/[0.12]"
                } ${busy || isCurrent ? "opacity-60" : "active:opacity-80"}`}
              >
                {busy === id ? (
                  <Loader2 className="h-[16px] w-[16px] animate-spin" />
                ) : isCurrent ? (
                  "Tu plan actual"
                ) : (
                  `Elegir ${info.name}`
                )}
              </button>
            </div>
          );
        })}

        {notice && (
          <div className="rounded-[16px] p-[14px] border border-emerald-400/25 bg-emerald-400/10 font-['Geist'] text-[13px] text-emerald-100">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-[16px] p-[14px] border border-red-500/30 bg-red-500/10 font-['Geist'] text-[13px] text-red-200">
            {error}
          </div>
        )}


        <div className="font-['Geist'] text-[11.5px] text-white/40 text-center pt-[6px] leading-[1.5]">
          Pagos internacionales por Stripe · Métodos locales (Yape, QR, Apple Pay) por Culqi.
          <br />
          Puedes cancelar cuando quieras desde esta pantalla.
        </div>
      </div>

      {checkoutFor && (
        <CheckoutSheet
          open={!!checkoutFor}
          plan={checkoutFor}
          email={user?.email ?? "cliente@trax.pe"}
          onClose={() => setCheckoutFor(null)}
          onSuccess={async (r) => {
            setBusy(checkoutFor);
            try {
              await subscribe({
                data: { plan: checkoutFor, provider: r.provider, providerRef: r.providerRef },
              });
              await refresh();
              setNotice(
                r.demo
                  ? `Plan ${checkoutFor} activado en modo demo (${r.provider}). Configura las llaves reales en Secrets para cobrar de verdad.`
                  : `¡Listo! Plan ${checkoutFor} activo. Ya puedes usar todas las funciones incluidas.`,
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo activar el plan.");
            } finally {
              setBusy(null);
              setCheckoutFor(null);
            }
          }}
        />
      )}
    </div>
  );
}
