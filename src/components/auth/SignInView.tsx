import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import {
  AppleIcon,
  Divider,
  Field,
  GoogleIcon,
  PhoneIcon,
  PrimaryButton,
  SocialButton,
  useIsAppleDevice,
} from "./shared";

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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No pudimos iniciarte sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "No se pudo continuar con " + provider);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Algo salió mal";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="text-center mb-[4px]">
        <h1 className="font-['Bai_Jamjuree'] text-[24px] font-medium text-white tracking-tight leading-none">
          Bienvenido de vuelta
        </h1>
        <p className="mt-[8px] text-white/50 text-[13.5px] font-['Geist']">
          Entra para seguir tu día
        </p>
      </div>

      <div className="flex flex-col gap-[10px]">
        {isApple && (
          <SocialButton icon={<AppleIcon />} onClick={() => handleOAuth("apple")} disabled={loading}>
            Continuar con Apple
          </SocialButton>
        )}
        <SocialButton icon={<GoogleIcon />} onClick={() => handleOAuth("google")} disabled={loading}>
          Continuar con Google
        </SocialButton>
        <SocialButton
          icon={<PhoneIcon />}
          disabled
          suffix={
            <span className="ml-[4px] text-[10px] uppercase tracking-wider text-white/40 font-medium">
              Muy pronto
            </span>
          }
        >
          <span className="text-white/60">Código por SMS</span>
        </SocialButton>
      </div>

      <Divider label="o con correo" />

      <form onSubmit={handleEmail} className="flex flex-col gap-[12px]">
        <Field
          label="Correo"
          value={email}
          onChange={setEmail}
          placeholder="tu@correo.com"
          type="email"
          autoComplete="email"
        />
        <Field
          label="Contraseña"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
        />
        <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
          Entrar
        </PrimaryButton>
        <button
          type="button"
          onClick={onGoToForgot}
          className="text-[12.5px] text-white/50 font-['Geist'] active:text-white/90 self-center mt-[2px]"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>

      <div className="h-px bg-white/[0.07] mt-[6px]" />

      <button
        type="button"
        onClick={onGoToSignUp}
        className="text-[13.5px] text-white/75 font-['Geist'] active:text-white text-center"
      >
        ¿Nuevo en Trax? <span className="text-white font-medium">Crear cuenta gratis →</span>
      </button>
    </div>
  );
}
