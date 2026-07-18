import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Store, Package, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function OnboardingFlow() {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(profile?.business_name ?? "");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["efectivo", "yape"]);
  const [saving, setSaving] = useState(false);

  const togglePay = (m: string) =>
    setPaymentMethods((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. update profile
      await supabase
        .from("profiles")
        .update({
          business_name: businessName.trim() || "Mi negocio",
          onboarding_done: true,
        })
        .eq("id", user.id);

      // 2. insert first product if filled
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

  const steps = [
    {
      icon: Store,
      title: "Tu negocio",
      subtitle: "¿Cómo se llama?",
      valid: businessName.trim().length > 0,
      body: (
        <Input value={businessName} onChange={setBusinessName} placeholder="Ej. Ferretería Mendoza" />
      ),
    },
    {
      icon: Package,
      title: "Tu primer producto",
      subtitle: "Agrega uno para empezar (puedes saltarlo)",
      valid: true,
      body: (
        <div className="flex flex-col gap-[10px]">
          <Input value={productName} onChange={setProductName} placeholder="Inca Kola 500ml" />
          <div className="grid grid-cols-2 gap-[10px]">
            <Input
              value={productPrice}
              onChange={setProductPrice}
              placeholder="Precio S/"
              type="number"
            />
            <Input
              value={productStock}
              onChange={setProductStock}
              placeholder="Stock"
              type="number"
            />
          </div>
        </div>
      ),
    },
    {
      icon: Wallet,
      title: "Cómo cobras",
      subtitle: "Elige los métodos que aceptas",
      valid: paymentMethods.length > 0,
      body: (
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
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-black flex flex-col px-[20px] pt-[60px] pb-[40px]">
      <div className="mx-auto w-full max-w-[400px] flex-1 flex flex-col">
        <div className="flex items-center gap-[6px] mb-[40px]">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all"
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
            <div
              className="h-[58px] w-[58px] rounded-[18px] flex items-center justify-center mb-[24px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Icon className="h-[24px] w-[24px] text-white" strokeWidth={1.8} />
            </div>

            <h2 className="font-['Bai_Jamjuree'] text-[28px] text-white tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="mt-[8px] text-white/55 text-[14.5px] font-['Geist']">
              {current.subtitle}
            </p>

            <div className="mt-[28px]">{current.body}</div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          disabled={!current.valid || saving}
          onClick={() => {
            if (isLast) finish();
            else setStep((s) => s + 1);
          }}
          className="mt-[24px] h-[54px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-40 flex items-center justify-center gap-[8px]"
        >
          {saving ? "Guardando…" : isLast ? "Empezar" : "Siguiente"}
          {!saving && <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="h-[52px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.08] text-white text-[16px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition"
    />
  );
}
