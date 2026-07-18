import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, User, Phone, Loader2, Mail, KeyRound, ShieldCheck, LogOut, Monitor, ChevronDown, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  SettingsShell,
  Section,
  FormRow,
  TextInput,
  SaveButton,
  NavRow,
  ICON_TILE,
} from "./shared";
import { useConfirm } from "@/components/ui/confirm";

const COUNTRY_CODES: { code: string; flag: string; name: string; len: [number, number] }[] = [
  { code: "+51", flag: "🇵🇪", name: "Perú", len: [9, 9] },
  { code: "+52", flag: "🇲🇽", name: "México", len: [10, 10] },
  { code: "+54", flag: "🇦🇷", name: "Argentina", len: [10, 11] },
  { code: "+55", flag: "🇧🇷", name: "Brasil", len: [10, 11] },
  { code: "+56", flag: "🇨🇱", name: "Chile", len: [8, 9] },
  { code: "+57", flag: "🇨🇴", name: "Colombia", len: [10, 10] },
  { code: "+58", flag: "🇻🇪", name: "Venezuela", len: [10, 10] },
  { code: "+593", flag: "🇪🇨", name: "Ecuador", len: [9, 9] },
  { code: "+591", flag: "🇧🇴", name: "Bolivia", len: [8, 8] },
  { code: "+595", flag: "🇵🇾", name: "Paraguay", len: [9, 9] },
  { code: "+598", flag: "🇺🇾", name: "Uruguay", len: [8, 9] },
  { code: "+34", flag: "🇪🇸", name: "España", len: [9, 9] },
  { code: "+1", flag: "🇺🇸", name: "USA/Canadá", len: [10, 10] },
];

function splitPhone(raw: string | null | undefined): { code: string; digits: string } {
  const s = (raw ?? "").trim();
  if (!s) return { code: "+51", digits: "" };
  const match = COUNTRY_CODES.find((c) => s.startsWith(c.code));
  if (match) return { code: match.code, digits: s.slice(match.code.length).replace(/\D/g, "") };
  return { code: "+51", digits: s.replace(/\D/g, "") };
}

/* ----------------------------- Perfil personal ----------------------------- */
export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    phoneCode: "+51",
    phoneDigits: "",
    avatar_url: null as string | null,
  });
  const [dirty, setDirty] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const { code, digits } = splitPhone(profile.phone);
    setForm({
      owner_name: profile.owner_name ?? "",
      phoneCode: code,
      phoneDigits: digits,
      avatar_url: profile.avatar_url ?? null,
    });
    setDirty(false);
  }, [profile]);

  const currentCountry = useMemo(
    () => COUNTRY_CODES.find((c) => c.code === form.phoneCode) ?? COUNTRY_CODES[0],
    [form.phoneCode],
  );

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
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
      toast.error("No se pudo subir la foto.");
      setUploading(false);
      return;
    }
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = signed?.signedUrl ?? null;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setForm((f) => ({ ...f, avatar_url: url }));
    await refreshProfile();
    toast.success("Foto actualizada");
    setUploading(false);
  };

  const save = async () => {
    if (!user) return;
    const minLen = currentCountry.len[0];
    const maxLen = currentCountry.len[1];
    if (form.phoneDigits && (form.phoneDigits.length < minLen || form.phoneDigits.length > maxLen)) {
      toast.error(`El teléfono debe tener entre ${minLen} y ${maxLen} dígitos.`);
      return;
    }
    setSaving(true);
    const fullPhone = form.phoneDigits ? `${form.phoneCode}${form.phoneDigits}` : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        owner_name: form.owner_name.trim() || "Tú",
        phone: fullPhone,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar.");
      return;
    }
    await refreshProfile();
    setDirty(false);
    toast.success("Perfil actualizado");
  };

  const initials =
    (form.owner_name || "TU")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "TU";

  return (
    <SettingsShell
      title="Perfil personal"
      eyebrow="Ajustes · Cuenta"
      onBack={onBack}
      right={dirty ? <SaveButton onClick={save} saving={saving} /> : null}
    >
      <div className="flex flex-col items-center pt-[28px] pb-[12px]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-[104px] w-[104px] rounded-full overflow-hidden grid place-items-center"
          style={{
            background:
              "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[36px] font-bold tracking-[-0.5px]">
              {initials}
            </span>
          )}
          <div className="absolute bottom-[-2px] right-[-2px] h-[34px] w-[34px] rounded-full bg-[#3b82f6] text-white grid place-items-center border-2 border-black">
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
        <p className="mt-[12px] font-['Geist'] text-[12.5px] text-white/45">Toca la foto para cambiarla</p>
      </div>

      <Section title="Identidad">
        <FormRow icon={User} label="Tu nombre">
          <TextInput
            value={form.owner_name}
            onChange={(v) => update("owner_name", v)}
            placeholder="Cómo te llamas"
          />
        </FormRow>
        <FormRow icon={Phone} label="Teléfono" last>
          <div className="flex items-stretch gap-[8px] w-full">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCodeOpen((o) => !o)}
                className="h-[40px] px-[10px] rounded-[12px] flex items-center gap-[6px] bg-white/[0.04] border border-white/10 text-white text-[13px] font-['Geist']"
              >
                <span className="text-[15px] leading-none">{currentCountry.flag}</span>
                <span>{currentCountry.code}</span>
                <ChevronDown className="h-[13px] w-[13px] text-white/50" />
              </button>
              {codeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[70]"
                    onClick={() => setCodeOpen(false)}
                  />
                  <div className="absolute z-[71] top-[46px] left-0 w-[220px] max-h-[280px] overflow-y-auto rounded-[14px] bg-[#0e0e10] border border-white/10 shadow-2xl py-[6px]">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          update("phoneCode", c.code);
                          setCodeOpen(false);
                        }}
                        className={`w-full px-[12px] py-[8px] flex items-center gap-[8px] text-left text-[13px] font-['Geist'] active:bg-white/[0.06] ${
                          c.code === form.phoneCode ? "text-white bg-white/[0.04]" : "text-white/75"
                        }`}
                      >
                        <span className="text-[15px]">{c.flag}</span>
                        <span className="flex-1">{c.name}</span>
                        <span className="text-white/50">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex-1">
              <TextInput
                value={form.phoneDigits}
                onChange={(v) => update("phoneDigits", v.replace(/\D/g, "").slice(0, 15))}
                placeholder="999999999"
                type="tel"
                numeric
              />
            </div>
          </div>
        </FormRow>
      </Section>
    </SettingsShell>
  );
}

/* --------------------------- Correo y contraseña -------------------------- */
export function EmailPasswordScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [sending, setSending] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const sendReset = async () => {
    if (!user?.email) return;
    if (!(await confirm({
      title: "Enviar link de restablecimiento",
      description: `Te enviaremos un correo a ${user.email} con un enlace para crear una contraseña nueva.`,
      confirmText: "Enviar correo",
    }))) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    if (error) toast.error("No se pudo enviar el correo.");
    else toast.success("Te enviamos un correo para restablecer tu contraseña.");
  };

  const changePassword = async () => {
    if (pw.length < 8) return toast.error("Mínimo 8 caracteres.");
    if (pw !== pw2) return toast.error("Las contraseñas no coinciden.");
    if (!(await confirm({
      title: "Actualizar contraseña",
      description: "Tu contraseña actual dejará de funcionar en todos tus dispositivos.",
      confirmText: "Actualizar",
    }))) return;
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setChangingPw(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Contraseña actualizada");
      setPw("");
      setPw2("");
    }
  };

  return (
    <SettingsShell title="Correo y contraseña" eyebrow="Ajustes · Cuenta" onBack={onBack}>
      <Section title="Correo">
        <FormRow icon={Mail} label="Correo verificado" last>
          <div className="font-['Geist'] text-[14.5px] text-white truncate">{user?.email}</div>
        </FormRow>
      </Section>

      <Section title="Cambiar contraseña" hint="Mínimo 8 caracteres">
        <FormRow icon={KeyRound} label="Nueva contraseña">
          <TextInput value={pw} onChange={setPw} type="password" placeholder="••••••••" />
        </FormRow>
        <FormRow icon={KeyRound} label="Repetir contraseña" last>
          <TextInput value={pw2} onChange={setPw2} type="password" placeholder="••••••••" />
        </FormRow>
      </Section>

      <div className="px-[20px] mt-[16px]">
        <button
          type="button"
          onClick={changePassword}
          disabled={changingPw || !pw}
          className="w-full h-[46px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[14px] font-semibold disabled:opacity-40 flex items-center justify-center gap-[8px]"
        >
          {changingPw && <Loader2 className="h-[14px] w-[14px] animate-spin" />}
          Actualizar contraseña
        </button>
        <button
          type="button"
          onClick={sendReset}
          disabled={sending}
          className="w-full h-[42px] mt-[10px] rounded-full font-['Geist'] text-[13px] font-semibold text-white/70 border border-white/[0.08]"
        >
          {sending ? "Enviando…" : "Enviar link de restablecimiento"}
        </button>
      </div>
    </SettingsShell>
  );
}

/* --------------------------- Sesiones y dispositivos ---------------------- */
export function SessionsScreen({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const device = /iPhone|iPad/i.test(ua) ? "iPhone" : /Android/i.test(ua) ? "Android" : "Este dispositivo";

  const closeOthers = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setLoading(false);
    if (error) toast.error("No se pudo cerrar las demás sesiones.");
    else toast.success("Cerramos las sesiones en otros dispositivos.");
  };

  return (
    <SettingsShell title="Sesiones y dispositivos" eyebrow="Ajustes · Cuenta" onBack={onBack}>
      <Section title="Sesión actual">
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <div className={`h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0 ${ICON_TILE}`}>
            <Monitor className="h-[15px] w-[15px] text-white/78" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[14.5px] text-white">{device}</div>
            <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">
              Iniciada · sesión actual
            </div>
          </div>
          <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-[#4ADE80]">
            Activa
          </span>
        </div>
      </Section>

      <Section title="Seguridad">
        <NavRow
          icon={ShieldCheck}
          title="Cerrar sesión en otros dispositivos"
          description="Solo mantiene la sesión actual"
          onClick={closeOthers}
          right={loading ? <Loader2 className="h-[14px] w-[14px] animate-spin text-white/50" /> : undefined}
        />
        <NavRow
          icon={UserCog}
          title="Cambiar de cuenta"
          description="Cierra sesión y vuelve a entrar con otra cuenta. Requiere validar credenciales por seguridad."
          onClick={async () => {
            const ok = confirm(
              "Vas a cerrar esta sesión para iniciar con otra cuenta. Por tu seguridad tendrás que validar tus credenciales al volver a entrar. ¿Continuar?",
            );
            if (!ok) return;
            await supabase.auth.signOut();
          }}
          last
        />
      </Section>

      <div className="px-[20px] mt-[18px]">
        <p className="font-['Geist'] text-[11.5px] text-white/35 leading-[1.55]">
          Trax cifra tu sesión con tokens rotativos. Si perdiste un teléfono o cambiaste de equipo,
          cerrar las otras sesiones garantiza que solo este dispositivo tenga acceso.
        </p>
      </div>

      <div className="h-[8px]" />
      <div className="px-[20px]">
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          className="w-full h-[44px] rounded-full bg-white/[0.05] border border-white/[0.08] font-['Geist'] text-[13.5px] font-semibold text-white flex items-center justify-center gap-[8px]"
        >
          <LogOut className="h-[15px] w-[15px]" strokeWidth={1.7} />
          Cerrar sesión en este dispositivo
        </button>
      </div>
    </SettingsShell>
  );
}
