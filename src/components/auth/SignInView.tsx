import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { AppleIcon, FacebookIcon, Field, GoogleIcon, PhoneIcon, PrimaryButton, useIsAppleDevice } from "./shared";
import { toast as sonner } from "sonner";

export default function SignInView({
  onGoToSignUp,
  onGoToForgot,
}: {
  onGoToSignUp: () => void;
  onGoToForgot: () => void;
}) {
  const isApple = useIsAppleDevice();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No pudimos iniciarte sesión");
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
          Bienvenido
        </h1>
        <p className="mt-[8px] text-white/50 text-[13px] font-['Geist']">
          Entra a tu negocio
        </p>
      </div>

      <form onSubmit={handleEmail} className="flex flex-col gap-[10px]">
        <Field value={email} onChange={setEmail} placeholder="Correo" type="email" autoComplete="email" />
        <Field
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onGoToForgot}
            className="text-[12px] text-white/50 font-['Geist'] active:text-white/90 py-[2px]"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
          Entrar
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
          onClick={() => sonner.info("Facebook estará disponible pronto")}
          soon
        >
          <FacebookIcon />
        </SocialCircle>
        <SocialCircle
          label="Teléfono"
          onClick={() => sonner.info("Ingreso por SMS estará disponible pronto")}
          soon
        >
          <PhoneIcon />
        </SocialCircle>
      </div>

      <button
        type="button"
        onClick={onGoToSignUp}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center"
      >
        ¿Nuevo aquí? <span className="text-white">Crear cuenta</span>
      </button>
    </div>
  );
}
