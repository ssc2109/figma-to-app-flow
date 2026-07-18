import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  FileText,
  Building2,
  Coins,
  Clock,
  Target,
  AlertTriangle,
  Bell,
  Users,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { toast } from "sonner";
import {
  SettingsShell,
  Section,
  FormRow,
  TextInput,
  SaveButton,
  SegmentedControl,
} from "./shared";

const BUSINESS_TYPES = [
  "Bodega / minimarket",
  "Panadería",
  "Ferretería",
  "Farmacia",
  "Tienda de ropa",
  "Juguería / cafetería",
  "Otro",
];

const CURRENCIES = [
  { code: "PEN", label: "Sol peruano (S/)" },
  { code: "USD", label: "Dólar (US$)" },
  { code: "MXN", label: "Peso mexicano ($)" },
  { code: "COP", label: "Peso colombiano ($)" },
  { code: "ARS", label: "Peso argentino ($)" },
  { code: "EUR", label: "Euro (€)" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  return `${String(h).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`;
});

function fmtTime(v: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return "Elegir";
  const [h, m] = v.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-[36px] px-[14px] rounded-[10px] font-['Bai_Jamjuree'] text-[14px] font-semibold tabular-nums text-white bg-white/[0.05] border border-white/[0.08]"
        >
          {value ? fmtTime(value) : "Elegir"}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[180px] p-[6px] rounded-[18px] pointer-events-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-h-[260px] overflow-y-auto trax-scroll flex flex-col gap-[4px]">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className="h-[36px] rounded-[10px] px-[12px] text-left font-['Bai_Jamjuree'] text-[13.5px] font-semibold tabular-nums"
              style={{
                background: value === t ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.04)",
                color: value === t ? "#000" : "rgba(255,255,255,0.82)",
              }}
            >
              {fmtTime(t)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------- Ficha del negocio ---------------------- */
export function BusinessInfoScreen({ onBack }: { onBack: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    business_name: "",
    business_type: BUSINESS_TYPES[0],
    address: "",
    ruc: "",
    razon_social: "",
    regimen: "",
    open_time: "",
    close_time: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      business_name: profile.business_name ?? "",
      business_type: profile.business_type ?? BUSINESS_TYPES[0],
      address: profile.address ?? "",
      ruc: profile.ruc ?? "",
      razon_social: profile.razon_social ?? "",
      regimen: profile.regimen ?? "",
      open_time: profile.open_time ?? "",
      close_time: profile.close_time ?? "",
    });
    setDirty(false);
  }, [profile]);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: form.business_name.trim() || "Mi negocio",
        business_type: form.business_type || null,
        address: form.address || null,
        ruc: form.ruc || null,
        razon_social: form.razon_social || null,
        regimen: form.regimen || null,
        open_time: form.open_time || null,
        close_time: form.close_time || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar.");
    await refreshProfile();
    setDirty(false);
    toast.success("Ficha actualizada");
  };

  return (
    <SettingsShell
      title="Ficha del negocio"
      eyebrow="Ajustes · Negocio"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Identidad">
        <FormRow icon={Store} label="Nombre del negocio">
          <TextInput
            value={form.business_name}
            onChange={(v) => update("business_name", v)}
            placeholder="Mi negocio"
          />
        </FormRow>
        <FormRow icon={Building2} label="Rubro">
          <select
            value={form.business_type}
            onChange={(e) => update("business_type", e.target.value)}
            className="w-full bg-transparent outline-none font-['Geist'] text-[14.5px] text-white appearance-none"
            style={{ colorScheme: "dark" }}
          >
            {BUSINESS_TYPES.map((b) => (
              <option key={b} value={b} className="bg-[#0a0a14]">
                {b}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow icon={MapPin} label="Dirección" last>
          <TextInput value={form.address} onChange={(v) => update("address", v)} placeholder="Av. ejemplo 123" />
        </FormRow>
      </Section>

      <Section title="Horario">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
            <Clock className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/40 mb-[6px]">
              Apertura
            </div>
            <TimePicker value={form.open_time} onChange={(v) => update("open_time", v)} />
          </div>
        </div>
        <div className="h-px bg-white/[0.05] mx-[16px]" />
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
            <Clock className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/40 mb-[6px]">
              Cierre
            </div>
            <TimePicker value={form.close_time} onChange={(v) => update("close_time", v)} />
          </div>
        </div>
      </Section>

      <Section title="Datos fiscales" hint="Opcional">
        <FormRow icon={FileText} label="RUC">
          <TextInput value={form.ruc} onChange={(v) => update("ruc", v)} placeholder="20123456789" />
        </FormRow>
        <FormRow icon={Building2} label="Razón social">
          <TextInput
            value={form.razon_social}
            onChange={(v) => update("razon_social", v)}
            placeholder="Mi Negocio S.A.C."
          />
        </FormRow>
        <FormRow icon={FileText} label="Régimen tributario" last>
          <TextInput
            value={form.regimen}
            onChange={(v) => update("regimen", v)}
            placeholder="RUS / RER / MYPE / General"
          />
        </FormRow>
      </Section>
    </SettingsShell>
  );
}

/* ---------------------- Moneda y formato ---------------------- */
export function CurrencyFormatScreen({ onBack }: { onBack: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [currency, setCurrency] = useState<string>("PEN");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCurrency(profile.currency ?? "PEN");
    setDirty(false);
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ currency }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar.");
    await refreshProfile();
    setDirty(false);
    toast.success("Moneda actualizada");
  };

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <SettingsShell
      title="Moneda y formato"
      eyebrow="Ajustes · Negocio"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Moneda">
        <div className="p-[8px] grid grid-cols-2 gap-[6px]">
          {CURRENCIES.map((c) => {
            const active = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setDirty(true);
                }}
                className="text-left rounded-[14px] px-[14px] py-[12px] transition-colors"
                style={{
                  background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(255,255,255,0.20)" : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="font-['Bai_Jamjuree'] text-[15px] font-semibold"
                  style={{ color: active ? "#fff" : "rgba(255,255,255,0.85)" }}
                >
                  {c.code}
                </div>
                <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">{c.label}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Formato regional">
        <FormRow icon={Coins} label="Zona horaria" last>
          <div className="font-['Geist'] text-[14px] text-white/70">{tz}</div>
        </FormRow>
      </Section>

      <div className="px-[20px] mt-[16px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          La moneda seleccionada se usa en ventas, gastos, fiados y reportes exportados.
          La zona horaria se sincroniza con tu dispositivo automáticamente.
        </p>
      </div>
    </SettingsShell>
  );
}

/* ---------------------- Metas y umbrales ---------------------- */
export function GoalsThresholdsScreen({ onBack }: { onBack: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const inv = useInventory();
  const [form, setForm] = useState({
    daily_goal: 1500,
    low_stock_threshold: 10,
    notifications_enabled: true,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      daily_goal: Number(profile.daily_goal ?? 1500),
      low_stock_threshold: profile.low_stock_threshold ?? 10,
      notifications_enabled: profile.notifications_enabled ?? true,
    });
    setDirty(false);
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        daily_goal: form.daily_goal,
        low_stock_threshold: form.low_stock_threshold,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error("No se pudo guardar.");
    await refreshProfile();
    await inv.refresh();
    setDirty(false);
    toast.success("Metas actualizadas");
  };

  return (
    <SettingsShell
      title="Metas y umbrales"
      eyebrow="Ajustes · Negocio"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <Section title="Objetivos diarios">
        <FormRow icon={Target} label="Meta de ventas diaria" hint="Se muestra en Inicio y Caja">
          <TextInput
            value={form.daily_goal}
            onChange={(v) => {
              setForm((f) => ({ ...f, daily_goal: Number(v) || 0 }));
              setDirty(true);
            }}
            numeric
            type="number"
          />
        </FormRow>
        <FormRow
          icon={AlertTriangle}
          label="Stock crítico"
          hint="Unidades desde las que socIA te avisa"
          last
        >
          <TextInput
            value={form.low_stock_threshold}
            onChange={(v) => {
              setForm((f) => ({ ...f, low_stock_threshold: Number(v) || 0 }));
              setDirty(true);
            }}
            numeric
            type="number"
          />
        </FormRow>
      </Section>
    </SettingsShell>
  );
}

/* ---------------------- Equipo (placeholder) ---------------------- */
export function TeamScreen({ onBack }: { onBack: () => void }) {
  return (
    <SettingsShell title="Equipo" eyebrow="Ajustes · Negocio" onBack={onBack}>
      <div className="px-[20px] mt-[40px]">
        <div
          className="rounded-[22px] p-[24px] text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-[52px] w-[52px] rounded-full grid place-items-center mx-auto mb-[16px]"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.05))",
              border: "1px solid rgba(59,130,246,0.30)",
            }}
          >
            <Users className="h-[22px] w-[22px] text-white" strokeWidth={1.7} />
          </div>
          <div className="font-['Bai_Jamjuree'] text-[17px] font-semibold text-white">
            Colaboradores en Trax
          </div>
          <p className="font-['Geist'] text-[13px] text-white/50 mt-[8px] leading-[1.55]">
            Invita cajeros o socios, asigna roles y controla qué puede ver cada uno.
            Estará disponible en el plan Avanzado próximamente.
          </p>
          <div className="inline-flex items-center gap-[6px] mt-[16px] px-[12px] py-[6px] rounded-full bg-white/[0.06] border border-white/[0.08]">
            <Sparkles className="h-[12px] w-[12px] text-white/60" strokeWidth={1.7} />
            <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/70">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}

/* Re-export util pequeño para el hub */
export { fmtTime, BUSINESS_TYPES, CURRENCIES };
export const NotifPrefsIcon = Bell;
