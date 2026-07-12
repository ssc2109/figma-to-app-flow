import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Camera,
  User,
  Store,
  Phone,
  MapPin,
  Coins,
  AlertTriangle,
  Clock,
  Target,
  Bell,
  LogOut,
  Loader2,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

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

function formatTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "Elegir hora";
  const [h, m] = value.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-[34px] flex items-center justify-between gap-[10px] text-left font-['Bai_Jamjuree'] text-[14.5px] font-semibold tabular-nums text-white"
        >
          <span>{value ? formatTime(value) : "Elegir hora"}</span>
          <Clock className="h-[15px] w-[15px] text-white/45" strokeWidth={1.7} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
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
              className="h-[38px] rounded-[12px] px-[12px] text-left font-['Bai_Jamjuree'] text-[14px] font-semibold tabular-nums"
              style={{ background: value === t ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.04)", color: value === t ? "#000" : "rgba(255,255,255,0.82)" }}
            >
              {formatTime(t)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-[20px] mt-[28px]">
      <div className="font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.6px] text-white/40 mb-[10px] px-[4px]">
        {title}
      </div>
      <div
        className="rounded-[20px] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
  last,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
        <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center bg-white/[0.05] border border-white/[0.07] shrink-0">
          <Icon className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/40 mb-[2px]">
            {label}
          </div>
          {children}
        </div>
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/25"
    />
  );
}

function NumField({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full bg-transparent outline-none font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tabular-nums"
    />
  );
}

function SelectField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full bg-transparent outline-none font-['Geist'] text-[14.5px] text-white appearance-none"
      style={{ colorScheme: "dark" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0a0a14]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative h-[26px] w-[44px] rounded-full transition-colors"
      style={{ background: value ? "#3b82f6" : "rgba(255,255,255,0.12)" }}
      aria-pressed={value}
    >
      <span
        className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white transition-transform"
        style={{ transform: value ? "translateX(21px)" : "translateX(3px)" }}
      />
    </button>
  );
}

export default function SettingsScreen({ onBack, onOpenPlans }: { onBack: () => void; onOpenPlans?: () => void }) {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const inv = useInventory();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    owner_name: "",
    business_name: "",
    business_type: "",
    phone: "",
    address: "",
    currency: "PEN",
    low_stock_threshold: 5,
    daily_goal: 1500,
    open_time: "",
    close_time: "",
    notifications_enabled: true,
    avatar_url: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      owner_name: profile.owner_name ?? "",
      business_name: profile.business_name ?? "",
      business_type: profile.business_type ?? BUSINESS_TYPES[0],
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      currency: profile.currency ?? "PEN",
      low_stock_threshold: profile.low_stock_threshold ?? 5,
      daily_goal: Number(profile.daily_goal ?? 1500),
      open_time: profile.open_time ?? "",
      close_time: profile.close_time ?? "",
      notifications_enabled: profile.notifications_enabled ?? true,
      avatar_url: profile.avatar_url,
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
        owner_name: form.owner_name.trim() || "Tú",
        business_name: form.business_name.trim() || "Mi negocio",
        business_type: form.business_type || null,
        phone: form.phone || null,
        address: form.address || null,
        currency: form.currency,
        low_stock_threshold: form.low_stock_threshold,
        daily_goal: form.daily_goal,
        open_time: form.open_time || null,
        close_time: form.close_time || null,
        notifications_enabled: form.notifications_enabled,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("No se pudo guardar.");
      return;
    }
    await refreshProfile();
    await inv.refresh();
    setDirty(false);
    toast.success("Cambios guardados");
  };

  const handleAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      console.error(upErr);
      toast.error("No se pudo subir la foto.");
      setUploading(false);
      return;
    }
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = signed?.signedUrl ?? null;
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);
    if (profErr) {
      console.error(profErr);
      toast.error("No se pudo guardar la foto.");
    } else {
      setForm((f) => ({ ...f, avatar_url: url }));
      await refreshProfile();
      toast.success("Foto actualizada");
    }
    setUploading(false);
  };

  const initials =
    (form.owner_name || form.business_name || "TU")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "TU";

  return (
    <div className="relative w-full text-white">
      {/* header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/[0.05]">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <button
            type="button"
            onClick={onBack}
            className="h-[40px] w-[40px] grid place-items-center rounded-full bg-white/[0.05] border border-white/[0.08]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
          <div className="flex-1">
            <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              Ajustes
            </div>
            <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.3px]">
              Configura tu app
            </div>
          </div>
          {dirty && (
            <motion.button
              type="button"
              onClick={save}
              disabled={saving}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[36px] px-[14px] rounded-full bg-white text-black font-['Geist'] text-[13px] font-semibold flex items-center gap-[6px]"
            >
              {saving ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : <Check className="h-[14px] w-[14px]" />}
              Guardar
            </motion.button>
          )}
        </div>
      </div>

      {/* avatar */}
      <div className="flex flex-col items-center pt-[28px] pb-[10px]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-[100px] w-[100px] rounded-full overflow-hidden grid place-items-center"
          style={{
            background:
              "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[34px] font-bold tracking-[-0.5px]">{initials}</span>
          )}
          <div className="absolute bottom-[-2px] right-[-2px] h-[34px] w-[34px] rounded-full bg-white text-black grid place-items-center border-2 border-black">
            {uploading ? (
              <Loader2 className="h-[14px] w-[14px] animate-spin" />
            ) : (
              <Camera className="h-[14px] w-[14px]" strokeWidth={2} />
            )}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleAvatar(f);
            e.target.value = "";
          }}
        />
        <p className="mt-[12px] font-['Geist'] text-[12.5px] text-white/45">
          Toca la foto para cambiarla
        </p>
      </div>

      <Section title="Perfil">
        <Row icon={User} label="Tu nombre">
          <TextField
            value={form.owner_name}
            onChange={(v) => update("owner_name", v)}
            placeholder="Cómo te llamas"
          />
        </Row>
        <Row icon={Store} label="Nombre del negocio">
          <TextField
            value={form.business_name}
            onChange={(v) => update("business_name", v)}
            placeholder="Mi negocio"
          />
        </Row>
        <Row icon={Store} label="Tipo de negocio">
          <SelectField
            value={form.business_type}
            onChange={(v) => update("business_type", v)}
            options={BUSINESS_TYPES.map((b) => ({ value: b, label: b }))}
          />
        </Row>
        <Row icon={Phone} label="Teléfono">
          <TextField
            value={form.phone}
            onChange={(v) => update("phone", v)}
            placeholder="+51 999 999 999"
            type="tel"
          />
        </Row>
        <Row icon={MapPin} label="Dirección" last>
          <TextField
            value={form.address}
            onChange={(v) => update("address", v)}
            placeholder="Av. ejemplo 123"
          />
        </Row>
      </Section>

      <Section title="Operaciones">
        <Row icon={Coins} label="Moneda">
          <SelectField
            value={form.currency}
            onChange={(v) => update("currency", v)}
            options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
          />
        </Row>
        <Row icon={AlertTriangle} label="Umbral de stock crítico (unidades)">
          <NumField
            value={form.low_stock_threshold}
            onChange={(n) => update("low_stock_threshold", n)}
          />
        </Row>
        <Row icon={Target} label="Meta de ventas diaria">
          <NumField value={form.daily_goal} onChange={(n) => update("daily_goal", n)} step={50} />
        </Row>
        <Row icon={Clock} label="Horario de apertura">
          <TimeField value={form.open_time} onChange={(v) => update("open_time", v)} />
        </Row>
        <Row icon={Clock} label="Horario de cierre" last>
          <TimeField value={form.close_time} onChange={(v) => update("close_time", v)} />
        </Row>
      </Section>

      <Section title="Preferencias">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center bg-white/[0.05] border border-white/[0.07] shrink-0">
            <Bell className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[14px] text-white">Notificaciones</div>
            <div className="font-['Geist'] text-[12px] text-white/40 mt-[2px]">
              Alertas de stock, fiados y resumen del día
            </div>
          </div>
          <Toggle
            value={form.notifications_enabled}
            onChange={(v) => update("notifications_enabled", v)}
          />
        </div>
      </Section>

      {onOpenPlans && (
        <Section title="Suscripción">
          <button
            type="button"
            onClick={onOpenPlans}
            className="w-full flex items-center gap-[12px] px-[16px] py-[14px] text-left active:bg-white/[0.03]"
          >
            <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center bg-white/[0.05] border border-white/[0.07] shrink-0">
              <Sparkles className="h-[15px] w-[15px] text-white/85" strokeWidth={1.7} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Geist'] text-[14.5px] text-white">Planes y suscripción</div>
              <div className="font-['Geist'] text-[12px] text-white/40 mt-[2px]">
                Elige un plan o gestiona tu suscripción
              </div>
            </div>
            <ChevronRight className="h-[16px] w-[16px] text-white/30" />
          </button>
        </Section>
      )}


      <Section title="Cuenta">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center bg-white/[0.05] border border-white/[0.07] shrink-0">
            <User className="h-[15px] w-[15px] text-white/70" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/40 mb-[2px]">
              Correo
            </div>
            <div className="font-['Geist'] text-[14px] text-white truncate">{user?.email}</div>
          </div>
        </div>
        <div className="h-px bg-white/[0.05] mx-[16px]" />
        <button
          type="button"
          onClick={async () => {
            await signOut();
          }}
          className="w-full flex items-center gap-[12px] px-[16px] py-[14px] text-left active:bg-white/[0.03]"
        >
          <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center bg-[rgba(248,113,113,0.10)] border border-[rgba(248,113,113,0.20)] shrink-0">
            <LogOut className="h-[15px] w-[15px] text-[#F87171]" strokeWidth={1.7} />
          </div>
          <div className="flex-1 font-['Geist'] text-[14.5px] text-[#F87171]">Cerrar sesión</div>
          <ChevronRight className="h-[16px] w-[16px] text-white/30" />
        </button>
      </Section>

      <div className="h-[200px]" />
    </div>
  );
}
