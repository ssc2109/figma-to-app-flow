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

export default function SignUpView({ onBack }: { onBack: () => void }) {
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
    <div className="flex flex-col gap-[20px]">
      <div className="text-center">
        <h1 className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white tracking-tight leading-none">
          Crea tu cuenta
        </h1>
        <p className="mt-[8px] text-white/50 text-[13px] font-['Geist']">
          Ordena tu negocio en minutos
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-[10px]">
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

      <div className="text-center text-[11.5px] text-white/40 font-['Geist']">O continúa con</div>

      <div className="flex items-center justify-center gap-[14px]">
        <SocialCircle label="Google" onClick={() => handleOAuth("google")} disabled={loading}>
          <GoogleIcon />
        </SocialCircle>
        {isApple && (
          <SocialCircle label="Apple" onClick={() => handleOAuth("apple")} disabled={loading}>
            <AppleIcon />
          </SocialCircle>
        )}
        <SocialCircle
          label="Facebook"
          onClick={() => toast.info("Facebook estará disponible pronto")}
          soon
        >
          <FacebookIcon />
        </SocialCircle>
        <SocialCircle
          label="Teléfono"
          onClick={() => toast.info("Ingreso por SMS estará disponible pronto")}
          soon
        >
          <PhoneIcon />
        </SocialCircle>
      </div>

      <p className="text-[10.5px] text-white/35 font-['Geist'] text-center leading-relaxed">
        Al continuar aceptas los{" "}
        <span className="text-white/55 underline underline-offset-2">Términos</span> y la{" "}
        <span className="text-white/55 underline underline-offset-2">Privacidad</span>.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center"
      >
        ¿Ya tienes cuenta? <span className="text-white">Entrar</span>
      </button>
    </div>
  );
}
