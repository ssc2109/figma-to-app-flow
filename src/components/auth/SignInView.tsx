import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { AppleIcon, Field, GoogleIcon, PrimaryButton, SocialButton, useIsAppleDevice } from "./shared";

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
    <div className="flex flex-col gap-[24px]">
      <div>
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-medium text-white tracking-tight leading-none">
          Bienvenido
        </h1>
        <p className="mt-[10px] text-white/45 text-[14px] font-['Geist']">
          Entra a tu negocio
        </p>
      </div>

      <div className="flex flex-col gap-[10px]">
        <SocialButton icon={<GoogleIcon />} onClick={() => handleOAuth("google")} disabled={loading}>
          Continuar con Google
        </SocialButton>
        {isApple && (
          <SocialButton icon={<AppleIcon />} onClick={() => handleOAuth("apple")} disabled={loading}>
            Continuar con Apple
          </SocialButton>
        )}
      </div>

      <div className="flex items-center gap-[12px]">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] text-white/35 font-['Geist']">o con correo</span>
        <div className="h-px flex-1 bg-white/10" />
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
        <div className="flex justify-end -mt-[2px]">
          <button
            type="button"
            onClick={onGoToForgot}
            className="text-[12.5px] text-white/50 font-['Geist'] active:text-white/90 py-[4px]"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
          Entrar
        </PrimaryButton>
      </form>

      <button
        type="button"
        onClick={onGoToSignUp}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center pt-[6px]"
      >
        ¿Nuevo aquí? <span className="text-white">Crear cuenta</span>
      </button>
    </div>
  );
}
