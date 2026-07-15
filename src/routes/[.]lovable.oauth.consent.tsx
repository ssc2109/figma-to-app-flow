import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import AuthScreen from "@/components/AuthScreen";
import { TraxWordmark } from "@/components/auth/shared";


// Beta namespace on the Supabase JS client — locally typed so TS is happy.
type OAuthDetails = {
  client?: { name?: string; redirect_uris?: string[] } | null;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
};
type OAuthResult<T> = { data: T | null; error: { message: string } | null };
type SupabaseAuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult<OAuthDetails>>;
  approveAuthorization: (
    id: string,
  ) => Promise<OAuthResult<{ redirect_url?: string; redirect_to?: string }>>;
  denyAuthorization: (
    id: string,
  ) => Promise<OAuthResult<{ redirect_url?: string; redirect_to?: string }>>;
};
const oauth = (supabase.auth as unknown as { oauth: SupabaseAuthOAuth }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.authorization_id) throw new Error("Falta authorization_id");
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { unauthenticated: true as const, authorizationId };

    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return { unauthenticated: false as const, authorizationId, details: data };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-['Geist']">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold mb-2">No se pudo cargar la autorización</h1>
        <p className="text-white/60 text-sm">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const data = Route.useLoaderData();

  // Re-check session after in-page sign-in and reload to trigger the loader.
  useEffect(() => {
    if (!data.unauthenticated) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) window.location.reload();
    });
    return () => sub.subscription.unsubscribe();
  }, [data.unauthenticated]);

  if (data.unauthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <div className="pt-8 text-center font-['Geist'] text-white/70 text-sm px-6">
          Inicia sesión en Trax para autorizar la conexión.
        </div>
        <AuthScreen />
      </div>
    );
  }

  return <ConsentPrompt authorizationId={data.authorizationId} details={data.details} />;
}

function ConsentPrompt({
  authorizationId,
  details,
}: {
  authorizationId: string;
  details: OAuthDetails | null | undefined;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "una aplicación";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // AuthScreen will render after reload.
    window.location.reload();
  };

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no devolvió una URL de redirección.");
      return;
    }
    window.location.href = target;
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-5 font-['Geist']">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <TraxWordmark />
          </div>
          <p className="mt-3 text-white/55 text-[13px]">Autorizar acceso</p>
        </div>


        <div
          className="rounded-[24px] p-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="text-[17px] font-semibold">
            Conectar {clientName} a tu cuenta de Trax
          </h1>
          <p className="mt-2 text-[13.5px] text-white/70 leading-relaxed">
            Esto permitirá que <strong>{clientName}</strong> use las herramientas de Trax como tú
            (leer tu resumen del negocio, tu catálogo, tus ventas y fiados, y registrar egresos en
            tu nombre).
          </p>
          <p className="mt-3 text-[12px] text-white/45 leading-relaxed">
            No otorga acceso a datos de otros usuarios: las políticas de Trax siguen aplicando.
          </p>

          {error && (
            <p role="alert" className="mt-4 text-[13px] text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(true)}
              className="h-[50px] rounded-[16px] bg-white text-black text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-50"
            >
              {busy ? "Procesando…" : "Aprobar y conectar"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(false)}
              className="h-[46px] rounded-[16px] text-[14px] text-white/80 active:scale-[0.98] transition disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-5 w-full text-center text-[12.5px] text-white/50 active:text-white/80"
        >
          Cambiar de cuenta
        </button>

        {/* Silence unused-import lint if lovable auth becomes needed later */}
        <span className="hidden">{typeof lovable}</span>
      </div>
    </main>
  );
}
