import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Check, Store, Package, Wallet, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  { id: "bodega", label: "Bodega", emoji: "🏪" },
  { id: "ferreteria", label: "Ferretería", emoji: "🔧" },
  { id: "peluqueria", label: "Peluquería", emoji: "✂️" },
  { id: "restaurante", label: "Restaurante", emoji: "🍽️" },
  { id: "pasteleria", label: "Pastelería", emoji: "🥐" },
  { id: "ropa", label: "Tienda de ropa", emoji: "👗" },
  { id: "taller", label: "Taller mecánico", emoji: "🔩" },
  { id: "otro", label: "Otro negocio", emoji: "🏢" },
] as const;

type BizType = (typeof BUSINESS_TYPES)[number]["id"] | "";

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<BizType>("");
  const [businessName, setBusinessName] = useState(profile?.business_name ?? "");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["efectivo", "yape"]);
  const [dailyGoal, setDailyGoal] = useState("200");
  const [saving, setSaving] = useState(false);

  const togglePay = (m: string) =>
    setPaymentMethods((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({
          business_name: businessName.trim() || "Mi negocio",
          business_type: businessType || null,
          daily_goal: Number(dailyGoal) || 200,
          onboarding_done: true,
        })
        .eq("id", user.id);

      if (productName.trim() && productPrice) {
        await supabase.from("products").insert({
          user_id: user.id,
          name: productName.trim(),
          price: Number(productPrice) || 0,
          stock: Number(productStock) || 0,
          category: "General",
        });
      }

      await refreshProfile();
      toast.success("¡Listo! Bienvenido a Trax");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return businessType !== "";
    if (step === 1) return businessName.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return paymentMethods.length > 0;
    if (step === 4) return Number(dailyGoal) > 0;
    return true;
  };

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-black flex flex-col px-[20px] pt-[60px] pb-[40px]">
      <div className="mx-auto w-full max-w-[400px] flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="flex items-center gap-[6px] mb-[40px]">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all duration-500"
              style={{
                background: i <= step ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.10)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Step 0: Tipo de negocio */}
            {step === 0 && (
              <StepShell
                icon={<span className="text-[26px]">🏪</span>}
                title="¿Qué tipo de negocio tienes?"
                subtitle="Trax se adapta a tu rubro para darte información que realmente te sirva."
              >
                <div className="grid grid-cols-2 gap-[10px]">
                  {BUSINESS_TYPES.map((bt) => {
                    const active = businessType === bt.id;
                    return (
                      <button
                        key={bt.id}
                        type="button"
                        onClick={() => setBusinessType(bt.id)}
                        className="h-[64px] rounded-[16px] flex items-center gap-[12px] px-[16px] transition active:scale-[0.97]"
                        style={{
                          background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                          color: active ? "#000" : "#fff",
                          border: `1px solid ${active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.10)"}`,
                        }}
                      >
                        <span className="text-[22px]">{bt.emoji}</span>
                        <span className="font-['Geist'] text-[13.5px] font-medium leading-tight">
                          {bt.label}
                        </span>
                        {active && (
                          <Check
                            className="h-[14px] w-[14px] ml-auto shrink-0"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* Step 1: Nombre del negocio */}
            {step === 1 && (
              <StepShell
                icon={<Store className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />}
                title="¿Cómo se llama tu negocio?"
                subtitle="El nombre que ven tus clientes."
              >
                <OInput
                  value={businessName}
                  onChange={setBusinessName}
                  placeholder="Ej. Ferretería Mendoza"
                  autoFocus
                />
              </StepShell>
            )}

            {/* Step 2: Primer producto */}
            {step === 2 && (
              <StepShell
                icon={<Package className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />}
                title="Tu primer producto"
                subtitle="Agrega uno para empezar. Puedes saltarlo."
              >
                <div className="flex flex-col gap-[10px]">
                  <OInput
                    value={productName}
                    onChange={setProductName}
                    placeholder="Ej. Inca Kola 500ml"
                  />
                  <div className="grid grid-cols-2 gap-[10px]">
                    <OInput
                      value={productPrice}
                      onChange={setProductPrice}
                      placeholder="Precio S/"
                      type="number"
                    />
                    <OInput
                      value={productStock}
                      onChange={setProductStock}
                      placeholder="Stock"
                      type="number"
                    />
                  </div>
                </div>
              </StepShell>
            )}

            {/* Step 3: Métodos de pago */}
            {step === 3 && (
              <StepShell
                icon={<Wallet className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />}
                title="¿Cómo cobras?"
                subtitle="Elige los métodos que aceptas en tu negocio."
              >
                <div className="grid grid-cols-2 gap-[10px]">
                  {[
                    { id: "efectivo", label: "Efectivo" },
                    { id: "yape", label: "Yape" },
                    { id: "plin", label: "Plin" },
                    { id: "tarjeta", label: "Tarjeta" },
                  ].map((m) => {
                    const active = paymentMethods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => togglePay(m.id)}
                        className="h-[54px] rounded-[14px] font-['Geist'] text-[14px] transition active:scale-[0.97] flex items-center justify-center gap-[8px]"
                        style={{
                          background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                          color: active ? "#000" : "#fff",
                          border: `1px solid ${active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.10)"}`,
                        }}
                      >
                        {active && <Check className="h-[14px] w-[14px]" strokeWidth={2.5} />}
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {/* Step 4: Meta diaria */}
            {step === 4 && (
              <StepShell
                icon={<Target className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />}
                title="¿Cuánto quieres ganar al día?"
                subtitle="Trax te va mostrando en tiempo real si estás llegando a tu meta."
              >
                <div className="flex flex-col gap-[20px]">
                  <div className="flex items-center gap-[10px]">
                    <span className="font-['Bai_Jamjuree'] text-[28px] font-medium text-white/40">
                      S/
                    </span>
                    <input
                      inputMode="numeric"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(e.target.value)}
                      placeholder="200"
                      className="flex-1 h-[52px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.08] text-white text-[24px] font-['Bai_Jamjuree'] font-bold tabular-nums placeholder:text-white/20 outline-none focus:border-white/30 transition"
                    />
                  </div>
                  <div className="flex gap-[8px] flex-wrap">
                    {["100", "200", "500", "1000"].map((v) => {
                      const active = dailyGoal === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setDailyGoal(v)}
                          className="h-[34px] px-[16px] rounded-full font-['Geist'] text-[13px] font-medium transition active:scale-[0.97]"
                          style={{
                            background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)",
                            color: active ? "#000" : "rgba(255,255,255,0.65)",
                            border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                          }}
                        >
                          S/ {v}
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-['Geist'] text-[13px] text-white/35 leading-relaxed">
                    Puedes cambiar esto cuando quieras desde tu perfil.
                  </p>
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <button
          type="button"
          disabled={!isStepValid() || saving}
          onClick={() => {
            if (isLast) finish();
            else setStep((s) => s + 1);
          }}
          className="mt-[24px] h-[54px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-40 flex items-center justify-center gap-[8px]"
        >
          {saving ? (
            "Guardando…"
          ) : isLast ? (
            "Empezar ahora"
          ) : (
            <>
              Siguiente <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.2} />
            </>
          )}
        </button>

        {step > 0 && !saving && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="mt-[12px] h-[40px] flex items-center justify-center gap-[6px] font-['Geist'] text-[13px] text-white/40 active:text-white/70 transition mx-auto"
          >
            <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.8} /> Atrás
          </button>
        )}
      </div>
    </div>
  );
}

function StepShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div
        className="h-[58px] w-[58px] rounded-[18px] flex items-center justify-center mb-[24px]"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {icon}
      </div>
      <h2 className="font-['Bai_Jamjuree'] text-[28px] text-white tracking-tight leading-tight">
        {title}
      </h2>
      <p className="mt-[8px] text-white/55 text-[14.5px] font-['Geist'] leading-relaxed">
        {subtitle}
      </p>
      <div className="mt-[28px]">{children}</div>
    </div>
  );
}

function OInput({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      autoFocus={autoFocus}
      className="w-full h-[52px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.08] text-white text-[16px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition"
    />
  );
}
