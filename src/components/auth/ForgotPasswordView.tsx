import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BackArrow, Field, PrimaryButton } from "./shared";

export default function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Te enviamos un link para restablecer tu contraseña");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No pudimos enviar el correo";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center gap-[10px] -mt-[4px]">
        <button
          type="button"
          onClick={onBack}
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white/70 active:text-white active:bg-white/[0.05] transition"
          aria-label="Volver"
        >
          <BackArrow />
        </button>
        <span className="text-[13px] text-white/55 font-['Geist']">Volver</span>
      </div>

      <div className="text-center mb-[4px]">
        <h1 className="font-['Bai_Jamjuree'] text-[24px] font-medium text-white tracking-tight leading-none">
          Recupera tu acceso
        </h1>
        <p className="mt-[8px] text-white/50 text-[13.5px] font-['Geist'] leading-relaxed px-[6px]">
          Ingresa tu correo y te enviaremos un link para crear una nueva contraseña.
        </p>
      </div>

      {sent ? (
        <div
          className="rounded-[16px] p-[18px] text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <p className="text-[14px] text-white font-['Geist']">Correo enviado ✓</p>
          <p className="mt-[6px] text-[12.5px] text-white/55 font-['Geist']">
            Revisa <span className="text-white/85">{email}</span> y sigue el link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
          <Field
            label="Correo"
            value={email}
            onChange={setEmail}
            placeholder="tu@correo.com"
            type="email"
            autoComplete="email"
            autoFocus
          />
          <PrimaryButton type="submit" loading={loading} disabled={!email}>
            Enviar link
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
