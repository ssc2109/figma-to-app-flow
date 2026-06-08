import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              owner_name: ownerName.trim() || email.split("@")[0],
              business_name: businessName.trim() || "Mi bodega",
            },
          },
        });
        if (error) throw error;
        toast.success("Revisa tu correo para confirmar tu cuenta");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "No se pudo iniciar sesión con Google");
        setLoading(false);
      }
      // si redirected -> el navegador se va
    } catch (err: any) {
      toast.error(err?.message ?? "Algo salió mal");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-[20px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px]"
      >
        <div className="text-center mb-[36px]">
          <div className="font-['Bai_Jamjuree'] text-[44px] font-medium text-white tracking-tight leading-none">
            Trax
          </div>
          <p className="mt-[10px] text-white/55 text-[14px] font-['Geist']">
            Tu bodega, ordenada en un solo lugar
          </p>
        </div>

        <form
          onSubmit={handleEmail}
          className="rounded-[24px] p-[20px] flex flex-col gap-[12px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {mode === "signup" && (
            <>
              <Field
                label="Nombre de tu bodega"
                value={businessName}
                onChange={setBusinessName}
                placeholder="Bodega Ecoarom"
              />
              <Field
                label="Tu nombre"
                value={ownerName}
                onChange={setOwnerName}
                placeholder="Alberto"
              />
            </>
          )}
          <Field
            label="Correo"
            value={email}
            onChange={setEmail}
            placeholder="tu@correo.com"
            type="email"
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-[6px] h-[50px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Cargando…" : mode === "signup" ? "Crear mi bodega" : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-[10px] my-[18px]">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-white/40 font-['Geist'] uppercase tracking-wider">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-[50px] rounded-[16px] font-['Geist'] text-[14.5px] text-white flex items-center justify-center gap-[10px] active:scale-[0.98] transition disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <GoogleIcon /> Continuar con Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-[22px] w-full text-center text-[13px] text-white/55 font-['Geist'] active:text-white/90"
        >
          {mode === "signup"
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿Aún no tienes? Crea tu bodega"}
        </button>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[11px] uppercase tracking-wider text-white/45 font-['Geist']">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required
        className="h-[46px] rounded-[12px] px-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#fff"
        d="M21.35 11.1h-9.17v2.97h5.27c-.23 1.4-1.62 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.85 3.86 14.78 3 12.18 3 7.13 3 3 7.13 3 12.18s4.13 9.18 9.18 9.18c5.3 0 8.82-3.72 8.82-8.97 0-.6-.07-1.06-.15-1.29z"
      />
    </svg>
  );
}
