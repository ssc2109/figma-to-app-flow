import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phone-otp.functions";
import { Field, PrimaryButton } from "./shared";

export default function PhoneAuthView({ onBack }: { onBack: () => void }) {
  const send = useServerFn(sendPhoneOtp);
  const verify = useServerFn(verifyPhoneOtp);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await send({ data: { phone } });
      toast.success("Te enviamos un código por SMS");
      setStep("code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verify({ data: { phone, code } });
      const { error } = await supabase.auth.verifyOtp({
        token_hash: res.token_hash,
        type: "magiclink",
      });
      if (error) throw error;
      toast.success("¡Bienvenido!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="text-center">
        <h1 className="font-['Bai_Jamjuree'] text-[20px] font-medium text-white tracking-tight leading-none">
          Ingresa por SMS
        </h1>
        <p className="mt-[6px] text-white/50 text-[12.5px] font-['Geist']">
          {step === "phone"
            ? "Te enviaremos un código de 6 dígitos"
            : `Ingresa el código que enviamos a ${phone}`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSend} className="flex flex-col gap-[8px]">
          <Field
            value={phone}
            onChange={setPhone}
            placeholder="+51 999 999 999"
            type="tel"
            autoComplete="tel"
          />
          <PrimaryButton type="submit" loading={loading} disabled={!phone}>
            Enviar código
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-[8px]">
          <Field
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            type="text"
            autoComplete="one-time-code"
          />
          <PrimaryButton type="submit" loading={loading} disabled={code.length !== 6}>
            Verificar
          </PrimaryButton>
          <button
            type="button"
            onClick={() => {
              setCode("");
              setStep("phone");
            }}
            className="text-[12px] text-white/50 font-['Geist'] active:text-white/90 py-[2px]"
          >
            Cambiar número
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center"
      >
        Volver a otras opciones
      </button>
    </div>
  );
}
