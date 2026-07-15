import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { AppleIcon, Field, GoogleIcon, PrimaryButton, SocialButton, useIsAppleDevice } from "./shared";

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
    <div className="flex flex-col gap-[24px]">
      <div>
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-medium text-white tracking-tight leading-none">
          Crea tu cuenta
        </h1>
        <p className="mt-[10px] text-white/45 text-[14px] font-['Geist']">
          Ordena tu negocio en minutos
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

      <p className="text-[11px] text-white/35 font-['Geist'] text-center leading-relaxed">
        Al continuar aceptas los{" "}
        <span className="text-white/55 underline underline-offset-2">Términos</span> y la{" "}
        <span className="text-white/55 underline underline-offset-2">Privacidad</span> de Trax.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="text-[13px] text-white/55 font-['Geist'] active:text-white text-center pt-[4px]"
      >
        ¿Ya tienes cuenta? <span className="text-white">Entrar</span>
      </button>
    </div>
  );
}
