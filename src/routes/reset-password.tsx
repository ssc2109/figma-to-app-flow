import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Field, PrimaryButton, TraxWordmark } from "@/components/auth/shared";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña · Trax" },
      { name: "description", content: "Elige una nueva contraseña para tu cuenta de Trax." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also check immediately (recovery session may already be set)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("¡Listo! Tu contraseña fue actualizada");
      navigate({ to: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No pudimos actualizar tu contraseña";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-[20px] py-[32px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px]"
      >
        <div className="flex justify-center mb-[28px]">
          <TraxWordmark />
        </div>

        <div
          className="rounded-[26px] p-[22px]"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-center mb-[18px]">
            <h1 className="font-['Bai_Jamjuree'] text-[24px] font-medium text-white tracking-tight leading-none">
              Nueva contraseña
            </h1>
            <p className="mt-[8px] text-white/50 text-[13.5px] font-['Geist']">
              {ready ? "Elige tu nueva contraseña." : "Verificando el link…"}
            </p>
          </div>

          {ready && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
              <Field
                label="Nueva contraseña"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 8 caracteres"
                type="password"
                autoComplete="new-password"
                autoFocus
              />
              <Field
                label="Confirmar"
                value={confirm}
                onChange={setConfirm}
                placeholder="Repite la contraseña"
                type="password"
                autoComplete="new-password"
              />
              <PrimaryButton type="submit" loading={loading} disabled={!password || !confirm}>
                Actualizar contraseña
              </PrimaryButton>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
