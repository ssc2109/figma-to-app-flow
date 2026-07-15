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
  const [showEmail, setShowEmail] = useState(false);
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
    <div className="flex flex-col gap-[28px]">
      <div className="text-center">
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-medium text-white tracking-tight leading-none">
          Hola de nuevo
        </h1>
        <p className="mt-[10px] text-white/45 text-[13.5px] font-['Geist']">
          Entra a tu negocio
        </p>
      </div>

      {!showEmail ? (
        <div className="flex flex-col gap-[10px]">
          <SocialButton icon={<GoogleIcon />} onClick={() => handleOAuth("google")} disabled={loading}>
            Continuar con Google
          </SocialButton>
          {isApple && (
            <SocialButton icon={<AppleIcon />} onClick={() => handleOAuth("apple")} disabled={loading}>
              Continuar con Apple
            </SocialButton>
          )}
          <button
            type="button"
            onClick={() => setShowEmail(true)}
            className="mt-[6px] text-[13px] text-white/50 font-['Geist'] active:text-white/90 self-center py-[8px]"
          >
            Usar correo y contraseña
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmail} className="flex flex-col gap-[12px]">
          <Field value={email} onChange={setEmail} placeholder="Correo" type="email" autoComplete="email" />
          <Field
            value={password}
            onChange={setPassword}
            placeholder="Contraseña"
            type="password"
            autoComplete="current-password"
          />
          <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
            Entrar
          </PrimaryButton>
          <div className="flex items-center justify-between mt-[2px]">
            <button
              type="button"
              onClick={() => setShowEmail(false)}
              className="text-[12.5px] text-white/45 font-['Geist'] active:text-white/90"
            >
              ← Volver
            </button>
            <button
              type="button"
              onClick={onGoToForgot}
              className="text-[12.5px] text-white/45 font-['Geist'] active:text-white/90"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      )}

      <button
        type="button"
        onClick={onGoToSignUp}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center pt-[10px]"
      >
        ¿Nuevo aquí? <span className="text-white">Crear cuenta</span>
      </button>
    </div>
  );
}
