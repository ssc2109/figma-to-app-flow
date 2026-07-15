import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import {
  AppleIcon,
  BackArrow,
  Divider,
  Field,
  GoogleIcon,
  PhoneIcon,
  PrimaryButton,
  SocialButton,
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
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success("¡Casi listo! Revisa tu correo para confirmar tu cuenta");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No pudimos crear tu cuenta";
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
          Crea tu cuenta
        </h1>
        <p className="mt-[8px] text-white/50 text-[13.5px] font-['Geist']">
          Empieza a ordenar tu negocio en minutos
        </p>
      </div>

      <div className="flex flex-col gap-[10px]">
        {isApple && (
          <SocialButton icon={<AppleIcon />} onClick={() => handleOAuth("apple")} disabled={loading}>
            Registrarme con Apple
          </SocialButton>
        )}
        <SocialButton icon={<GoogleIcon />} onClick={() => handleOAuth("google")} disabled={loading}>
          Registrarme con Google
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
          <span className="text-white/60">Registrarme con SMS</span>
        </SocialButton>
      </div>

      <Divider label="o con correo" />

      <form onSubmit={handleSignUp} className="flex flex-col gap-[12px]">
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
          placeholder="Mínimo 8 caracteres"
          type="password"
          autoComplete="new-password"
        />
        <PrimaryButton type="submit" loading={loading} disabled={!email || !password}>
          Crear cuenta
        </PrimaryButton>
      </form>

      <p className="text-[11px] text-white/40 font-['Geist'] text-center leading-relaxed px-[8px]">
        Al crear una cuenta aceptas los{" "}
        <span className="text-white/60 underline underline-offset-2">Términos</span> y la{" "}
        <span className="text-white/60 underline underline-offset-2">Política de Privacidad</span>{" "}
        de Trax.
      </p>

      <div className="h-px bg-white/[0.07]" />

      <button
        type="button"
        onClick={onBack}
        className="text-[13.5px] text-white/75 font-['Geist'] active:text-white text-center"
      >
        ¿Ya tienes cuenta? <span className="text-white font-medium">Entrar →</span>
      </button>
    </div>
  );
}
