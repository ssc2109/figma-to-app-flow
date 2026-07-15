import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import {
  AppleIcon,
  FacebookIcon,
  Field,
  GoogleIcon,
  PhoneIcon,
  PrimaryButton,
  SocialCircle,
  useIsAppleDevice,
} from "./shared";

export default function SignUpView({ onBack, onGoToPhone }: { onBack: () => void; onGoToPhone: () => void }) {
  void onBack;
  const isApple = useIsAppleDevice();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast.success("¡Casi listo! Revisa tu correo para confirmar tu cuenta");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No pudimos crear tu cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) {
        toast.error(result.error.message ?? "No se pudo continuar");
        setLoading(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Algo salió mal");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="text-center">
        <h1 className="font-['Bai_Jamjuree'] text-[20px] font-medium text-white tracking-tight leading-none">
          Crea tu cuenta
        </h1>
        <p className="mt-[6px] text-white/50 text-[12.5px] font-['Geist']">
          Ordena tu negocio en minutos
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-[8px]">
        <Field value={email} onChange={setEmail} placeholder="Correo" type="email" autoComplete="email" />
        <Field
          value={password}
          onChange={setPassword}
          placeholder="Contraseña (mín. 8)"
          type="password"
          autoComplete="new-password"
        />
        <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
          Crear cuenta
        </PrimaryButton>
      </form>

      <div className="text-center text-[11px] text-white/40 font-['Geist']">O continúa con</div>

      <div className="flex items-center justify-center gap-[12px]">
        <SocialCircle label="Google" onClick={() => handleOAuth("google")} disabled={loading}>
          <GoogleIcon />
        </SocialCircle>
        <SocialCircle label="Apple" onClick={() => handleOAuth("apple")} disabled={loading}>
          <AppleIcon />
        </SocialCircle>
        <SocialCircle label="Teléfono" onClick={onGoToPhone} disabled={loading}>
          <PhoneIcon />
        </SocialCircle>
      </div>
    </div>
  );
}

