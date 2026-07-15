import { useEffect, useState } from "react";
import {
  Moon,
  Type,
  MousePointer2,
  Bell,
  AlertTriangle,
  Package,
  Trophy,
  Mail,
  MessageSquare,
  Sparkles,
  Trash2,
  Cpu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  SettingsShell,
  Section,
  FormRow,
  SegmentedControl,
  Toggle,
  SaveButton,
  NavRow,
} from "./shared";

type Prefs = {
  theme?: "dark" | "auto";
  text_size?: "compact" | "normal" | "large";
  reduce_motion?: boolean;
  socia_tone?: "cercano" | "formal";
  notif_stock?: boolean;
  notif_debts?: boolean;
  notif_goal?: boolean;
  notif_summary?: boolean;
  notif_email_weekly?: boolean;
};

function usePrefs() {
  const { user, profile, refreshProfile } = useAuth();
  const base = (profile?.preferences as Prefs | null) ?? {};
  const [prefs, setPrefs] = useState<Prefs>(base);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(((profile?.preferences as Prefs | null) ?? {}) as Prefs);
    setDirty(false);
  }, [profile]);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const currentPrefs = (profile?.preferences as Record<string, unknown> | null) ?? {};
    const { error } = await supabase
      .from("profiles")
      .update({ preferences: { ...currentPrefs, ...prefs } })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar.");
    await refreshProfile();
    setDirty(false);
    toast.success("Preferencias guardadas");
  };

  return { prefs, update, dirty, saving, save };
}

/* ------------------------- Apariencia ------------------------- */
export function AppearanceScreen({ onBack }: { onBack: () => void }) {
  const { prefs, update, dirty, saving, save } = usePrefs();

  return (
    <SettingsShell
      title="Apariencia"
      eyebrow="Ajustes · Preferencias"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Tema">
        <FormRow icon={Moon} label="Aspecto" last>
          <SegmentedControl
            value={prefs.theme ?? "dark"}
            onChange={(v) => update("theme", v)}
            options={[
              { value: "dark", label: "Oscuro" },
              { value: "auto", label: "Auto" },
            ]}
          />
        </FormRow>
      </Section>

      <Section title="Accesibilidad">
        <FormRow icon={Type} label="Tamaño de texto">
          <SegmentedControl
            value={prefs.text_size ?? "normal"}
            onChange={(v) => update("text_size", v)}
            options={[
              { value: "compact", label: "Compacto" },
              { value: "normal", label: "Normal" },
              { value: "large", label: "Grande" },
            ]}
          />
        </FormRow>
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
            <MousePointer2 className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[14.5px] text-white">Reducir movimiento</div>
            <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">
              Minimiza animaciones y transiciones
            </div>
          </div>
          <Toggle
            value={!!prefs.reduce_motion}
            onChange={(v) => update("reduce_motion", v)}
          />
        </div>
      </Section>

      <div className="px-[20px] mt-[16px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          Trax fue diseñado en modo oscuro. El modo automático seguirá el ajuste del sistema
          cuando la plataforma lo soporte.
        </p>
      </div>
    </SettingsShell>
  );
}

/* ------------------------- Notificaciones ------------------------- */
export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { prefs, update, dirty, saving, save } = usePrefs();
  const { user, profile, refreshProfile } = useAuth();
  const [master, setMaster] = useState(profile?.notifications_enabled ?? true);

  useEffect(() => {
    setMaster(profile?.notifications_enabled ?? true);
  }, [profile]);

  const saveMaster = async (v: boolean) => {
    setMaster(v);
    if (!user) return;
    await supabase.from("profiles").update({ notifications_enabled: v }).eq("id", user.id);
    await refreshProfile();
  };

  const rowStatic = (
    Icon: typeof AlertTriangle,
    key: keyof Prefs,
    title: string,
    desc: string,
    defaultOn = true,
    last = false,
  ) => (
    <>
      <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
        <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
          <Icon className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[14.5px] text-white">{title}</div>
          <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">{desc}</div>
        </div>
        <Toggle
          value={master && ((prefs[key] as boolean | undefined) ?? defaultOn)}
          onChange={(v) => update(key, v as never)}
          disabled={!master}
        />
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );

  return (
    <SettingsShell
      title="Notificaciones"
      eyebrow="Ajustes · Preferencias"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Principal">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
            <Bell className="h-[15px] w-[15px] text-white/78" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[14.5px] text-white">Notificaciones activas</div>
            <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">
              Interruptor maestro. Apagarlo silencia todas las alertas.
            </div>
          </div>
          <Toggle value={master} onChange={saveMaster} />
        </div>
      </Section>

      <Section title="Alertas del negocio">
        {rowStatic(Package, "notif_stock", "Stock crítico", "Cuando un producto baja del umbral")}
        {rowStatic(AlertTriangle, "notif_debts", "Fiados vencidos", "Recordatorio cuando alguien te debe")}
        {rowStatic(Trophy, "notif_goal", "Meta diaria alcanzada", "Celebración al llegar a tu meta")}
        {rowStatic(MessageSquare, "notif_summary", "Resumen del día", "Cierre con ventas, gastos y ganancia", true, true)}
      </Section>

      <Section title="Correo electrónico">
        {rowStatic(Mail, "notif_email_weekly", "Resumen semanal", "Un correo cada lunes con tu semana", false, true)}
      </Section>
    </SettingsShell>
  );
}

/* ------------------------- SocIA ------------------------- */
export function SociaSettingsScreen({ onBack, openThreads }: { onBack: () => void; openThreads?: () => void }) {
  const { prefs, update, dirty, saving, save } = usePrefs();
  const { user } = useAuth();
  const [clearing, setClearing] = useState(false);

  const clearHistory = async () => {
    if (!user) return;
    if (!confirm("¿Borrar todo tu historial de chats con socIA? Esta acción no se puede deshacer.")) return;
    setClearing(true);
    const { error } = await supabase.from("chat_threads").delete().eq("user_id", user.id);
    setClearing(false);
    if (error) return toast.error("No se pudo limpiar el historial.");
    toast.success("Historial de socIA borrado");
  };

  return (
    <SettingsShell
      title="socIA"
      eyebrow="Ajustes · Preferencias"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Personalidad">
        <FormRow icon={Sparkles} label="Tono de respuestas" last>
          <SegmentedControl
            value={prefs.socia_tone ?? "cercano"}
            onChange={(v) => update("socia_tone", v)}
            options={[
              { value: "cercano", label: "Cercano" },
              { value: "formal", label: "Formal" },
            ]}
          />
        </FormRow>
      </Section>

      <Section title="Historial de chats">
        <NavRow
          icon={Cpu}
          title="Ver mis conversaciones"
          description="Retoma cualquier hilo anterior"
          onClick={openThreads}
        />
        <NavRow
          icon={Trash2}
          title={clearing ? "Borrando…" : "Borrar todo el historial"}
          description="Elimina todos los hilos de socIA"
          onClick={clearHistory}
          last
          tone="danger"
        />
      </Section>

      <div className="px-[20px] mt-[16px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          socIA solo procesa tus mensajes para ayudarte. Nunca compartimos tu contenido con terceros
          y puedes borrar tu historial en cualquier momento.
        </p>
      </div>
    </SettingsShell>
  );
}
