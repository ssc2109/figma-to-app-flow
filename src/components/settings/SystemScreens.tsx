import { useState } from "react";
import {
  Download,
  Database,
  FileJson,
  Trash2,
  ExternalLink,
  FileText,
  Shield,
  MessageCircle,
  BookOpen,
  Info,
  HeartHandshake,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SettingsShell, Section, NavRow } from "./shared";

/* ------------------------ Datos y privacidad ------------------------ */
export function DataPrivacyScreen({ onBack }: { onBack: () => void }) {
  const { user, signOut } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exportAll = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const tables = [
        "profiles",
        "products",
        "sales",
        "sale_items",
        "expenses",
        "fiados",
        "customers",
        "purchases",
        "purchase_items",
        "calendar_events",
      ] as const;
      const dump: Record<string, unknown> = { exported_at: new Date().toISOString(), user_id: user.id };
      for (const t of tables) {
        const { data } = await supabase.from(t).select("*");
        dump[t] = data ?? [];
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trax-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exportación lista");
    } catch {
      toast.error("No se pudo exportar tus datos.");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    const ok = confirm(
      "Vas a eliminar todos los datos de tu negocio y cerrar tu cuenta. Esta acción es permanente. ¿Continuar?",
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const tables = [
        "sale_items",
        "sales",
        "expenses",
        "fiados",
        "purchase_items",
        "purchases",
        "products",
        "customers",
        "calendar_events",
        "chat_messages",
        "chat_threads",
        "subscriptions",
        "usage_counters",
      ] as const;
      for (const t of tables) {
        await supabase.from(t).delete().eq("user_id", user.id);
      }
      await supabase.from("profiles").delete().eq("id", user.id);
      await signOut();
      toast.success("Cuenta eliminada");
    } catch {
      toast.error("No se pudo completar. Contáctanos.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsShell title="Datos y privacidad" eyebrow="Ajustes · Sistema" onBack={onBack}>
      <Section title="Exportar">
        <NavRow
          icon={FileJson}
          title="Descargar todos mis datos"
          description="Un archivo JSON con productos, ventas, gastos y más"
          value={exporting ? "Preparando…" : undefined}
          onClick={exportAll}
        />
        <NavRow
          icon={Database}
          title="Copia local del negocio"
          description="Guarda un respaldo mensual en tu dispositivo"
          onClick={exportAll}
          last
        />
      </Section>

      <Section title="Privacidad">
        <NavRow
          icon={Shield}
          title="Cómo tratamos tus datos"
          description="Detalle de qué almacenamos y con quién"
          onClick={() => window.open("https://trax.pe/privacidad", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
          last
        />
      </Section>

      <Section title="Zona sensible">
        <NavRow
          icon={Trash2}
          title={deleting ? "Eliminando…" : "Eliminar cuenta y datos"}
          description="Acción permanente e irreversible"
          onClick={deleteAccount}
          tone="danger"
          last
        />
      </Section>

      <div className="px-[20px] mt-[16px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          Puedes exportar tu información en cualquier momento. Cumplimos con estándares
          internacionales de protección de datos y nunca vendemos tu información.
        </p>
      </div>

      <div className="h-[8px]" />
      <div className="px-[20px]">
        <button
          type="button"
          onClick={exportAll}
          className="w-full h-[46px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[14px] font-semibold flex items-center justify-center gap-[8px]"
        >
          <Download className="h-[15px] w-[15px]" strokeWidth={2} />
          Exportar mis datos
        </button>
      </div>
    </SettingsShell>
  );
}

/* ------------------------ Ayuda y legal ------------------------ */
export function SupportLegalScreen({ onBack }: { onBack: () => void }) {
  return (
    <SettingsShell title="Ayuda y legal" eyebrow="Ajustes · Sistema" onBack={onBack}>
      <Section title="Soporte">
        <NavRow
          icon={MessageCircle}
          title="Contactar soporte"
          description="Respondemos en menos de 24 horas"
          onClick={() => window.open("mailto:hola@trax.pe", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
        />
        <NavRow
          icon={BookOpen}
          title="Centro de ayuda"
          description="Guías y tutoriales"
          onClick={() => window.open("https://trax.pe/ayuda", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
        />
        <NavRow
          icon={HeartHandshake}
          title="Enviar sugerencia"
          description="Ideas que hagan Trax mejor para ti"
          onClick={() => window.open("mailto:ideas@trax.pe", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
          last
        />
      </Section>

      <Section title="Legal">
        <NavRow
          icon={FileText}
          title="Términos y condiciones"
          onClick={() => window.open("https://trax.pe/terminos", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
        />
        <NavRow
          icon={Shield}
          title="Política de privacidad"
          onClick={() => window.open("https://trax.pe/privacidad", "_blank")}
          right={<ExternalLink className="h-[15px] w-[15px] text-white/35" />}
        />
        <NavRow
          icon={Info}
          title="Acerca de Trax"
          value={`v${(typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_APP_VERSION?: string } }).env?.VITE_APP_VERSION) || "2.6"}`}
          onClick={undefined}
          last
        />
      </Section>

      <div className="px-[20px] mt-[16px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          Trax es hecho en Perú por un equipo que cree que un negocio bien llevado transforma
          familias enteras.
        </p>
      </div>
    </SettingsShell>
  );
}

/* end */
