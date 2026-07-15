import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  X,
  Copy,
  Download,
  Settings2,
  ExternalLink,
  Lock,
  FileText,
  Share2,
  FileSpreadsheet,
  Plug,
  Sparkles,
} from "lucide-react";
import { SubHeader, SubScreen, SectionLabel, ListGroup } from "./shared";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";

type FieldKey =
  | "business_name"
  | "business_type"
  | "address"
  | "phone"
  | "owner_name"
  | "open_time"
  | "close_time"
  | "ruc"
  | "razon_social"
  | "regimen"
  | "direccion_fiscal"
  | "actividad_economica";

const LABELS: Record<FieldKey, string> = {
  business_name: "Nombre del negocio",
  business_type: "Rubro",
  owner_name: "Tu nombre",
  address: "Dirección",
  phone: "Teléfono / WhatsApp",
  open_time: "Hora de apertura",
  close_time: "Hora de cierre",
  ruc: "RUC",
  razon_social: "Razón social",
  regimen: "Régimen tributario",
  direccion_fiscal: "Dirección fiscal",
  actividad_economica: "Actividad económica",
};

const REGIMENES = ["NRUS", "RER", "MYPE Tributario", "General"];

function fmtTime(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":");
  return `${h}:${m ?? "00"}`;
}

function EditSheet({
  field,
  value,
  onClose,
  onSaved,
}: {
  field: FieldKey;
  value: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [v, setV] = useState(value);
  const [saving, setSaving] = useState(false);
  const isTime = field === "open_time" || field === "close_time";
  const isRegimen = field === "regimen";

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const patch: Record<string, string | null> = { [field]: v.trim() || null };
    const { error } = await (supabase.from("profiles") as any).update(patch).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Guardado");
    onSaved();
    onClose();
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-[16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[398px] rounded-[28px] pt-[18px] pb-[20px] px-[20px] flex flex-col max-h-[calc(100dvh-32px)] overflow-y-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white">{LABELS[field]}</h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        {isRegimen ? (
          <div className="flex flex-col gap-[8px]">
            {REGIMENES.map((r) => {
              const active = v === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setV(r)}
                  className="h-[46px] rounded-[14px] px-[14px] text-left font-['Geist'] text-[14px] transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                    color: active ? "#000" : "#fff",
                    border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !saving) {
                e.preventDefault();
                submit();
              }
            }}
            type={isTime ? "time" : "text"}
            autoFocus
            inputMode={field === "ruc" ? "numeric" : undefined}
            maxLength={field === "ruc" ? 11 : undefined}
            className="w-full h-[52px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30"
          />
        )}

        <div className="mt-[18px] flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-[52px] flex-1 rounded-[16px] bg-white/[0.05] border border-white/[0.08] text-white font-['Geist'] text-[14.5px] font-medium active:scale-[0.98] disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="h-[52px] flex-[1.4] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function EditableRow({
  label,
  value,
  onClick,
  last,
}: {
  label: string;
  value: string | null;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[11.5px] text-white/45">{label}</div>
          <div className={`mt-[3px] font-['Geist'] text-[14.5px] truncate ${value ? "text-white" : "text-white/35"}`}>
            {value || "Sin configurar"}
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/25" strokeWidth={1.6} />
      </button>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

export default function InfoView({ onBack, onOpenPlans }: { onBack: () => void; onOpenPlans?: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const { plan } = usePlan();
  const isAvanzado = plan === "avanzado" || plan === "trial";
  const [edit, setEdit] = useState<FieldKey | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [gate, setGate] = useState(false);

  const get = (k: FieldKey) => {
    const v = (profile as any)?.[k];
    if (!v) return null;
    if (k === "open_time" || k === "close_time") return fmtTime(v);
    return v as string;
  };

  return (
    <SubScreen>
      <SubHeader eyebrow="Información" title="Datos del negocio" onBack={onBack} />

      <div className="px-[20px] pt-[6px] pb-[40px] flex flex-col gap-[24px]">
        <div>
          <SectionLabel>Identidad</SectionLabel>
          <ListGroup>
            <EditableRow label={LABELS.business_name} value={get("business_name")} onClick={() => setEdit("business_name")} />
            <EditableRow label={LABELS.business_type} value={get("business_type")} onClick={() => setEdit("business_type")} />
            <EditableRow label={LABELS.owner_name} value={get("owner_name")} onClick={() => setEdit("owner_name")} last />
          </ListGroup>
        </div>

        <div>
          <SectionLabel>Contacto</SectionLabel>
          <ListGroup>
            <EditableRow label={LABELS.address} value={get("address")} onClick={() => setEdit("address")} />
            <EditableRow label={LABELS.phone} value={get("phone")} onClick={() => setEdit("phone")} last />
          </ListGroup>
        </div>

        <div>
          <SectionLabel>Horario</SectionLabel>
          <ListGroup>
            <EditableRow label={LABELS.open_time} value={get("open_time")} onClick={() => setEdit("open_time")} />
            <EditableRow label={LABELS.close_time} value={get("close_time")} onClick={() => setEdit("close_time")} last />
          </ListGroup>
        </div>

        <div>
          <SectionLabel>Información tributaria · RUC</SectionLabel>
          <ListGroup>
            <EditableRow label={LABELS.ruc} value={get("ruc")} onClick={() => setEdit("ruc")} />
            <EditableRow label={LABELS.razon_social} value={get("razon_social")} onClick={() => setEdit("razon_social")} />
            <EditableRow label={LABELS.regimen} value={get("regimen")} onClick={() => setEdit("regimen")} />
            <EditableRow label={LABELS.direccion_fiscal} value={get("direccion_fiscal")} onClick={() => setEdit("direccion_fiscal")} />
            <EditableRow label={LABELS.actividad_economica} value={get("actividad_economica")} onClick={() => setEdit("actividad_economica")} last />
          </ListGroup>
          <p className="mt-[10px] px-[6px] font-['Geist'] text-[11.5px] text-white/40 leading-[1.5]">
            Estos datos se usan para tus reportes tributarios y no se comparten fuera de Trax.
          </p>
        </div>

        <div>
          <SectionLabel>Opciones avanzadas</SectionLabel>
          <button
            onClick={() => (isAvanzado ? setAdvanced(true) : setGate(true))}
            className="relative w-full flex items-center gap-[12px] px-[16px] py-[14px] rounded-[18px] text-left active:bg-white/[0.04] transition-colors overflow-hidden"
            style={{ background: "rgba(17,17,17,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-[36px] w-[36px] rounded-full grid place-items-center flex-none"
              style={{
                background: isAvanzado
                  ? "linear-gradient(135deg, #60A5FA, #6366F1)"
                  : "rgba(255,255,255,0.05)",
              }}
            >
              {isAvanzado ? (
                <Settings2 className="h-[15px] w-[15px] text-white" strokeWidth={1.9} />
              ) : (
                <Lock className="h-[14px] w-[14px] text-white/60" strokeWidth={1.9} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Geist'] text-[14px] text-white">
                {isAvanzado ? "Abrir opciones avanzadas" : "Opciones avanzadas"}
              </div>
              <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45">
                {isAvanzado
                  ? "Datos fiscales, reportes e integraciones"
                  : "Exclusivo del plan Avanzado"}
              </div>
            </div>
            <ChevronRight className="h-[15px] w-[15px] text-white/30" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {edit && (
          <EditSheet
            field={edit}
            value={((profile as any)?.[edit] as string) ?? ""}
            onClose={() => setEdit(null)}
            onSaved={refreshProfile}
          />
        )}
        {advanced && <AdvancedSheet onClose={() => setAdvanced(false)} />}
        {gate && (
          <AdvancedGate
            onClose={() => setGate(false)}
            onUpgrade={onOpenPlans ? () => { setGate(false); onOpenPlans(); } : undefined}
          />
        )}
      </AnimatePresence>
    </SubScreen>
  );
}

function AdvancedGate({ onClose, onUpgrade }: { onClose: () => void; onUpgrade?: () => void }) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-[16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[398px] rounded-[28px] pt-[28px] pb-[24px] px-[22px] flex flex-col items-center text-center"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-[64px] w-[64px] rounded-[20px] grid place-items-center mb-[16px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <Lock className="h-[24px] w-[24px] text-white/70" strokeWidth={1.6} />
        </div>
        <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/45 mb-[6px]">
          Función exclusiva
        </div>
        <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.3px] mb-[8px]">
          Disponible en Avanzado
        </h3>
        <p className="font-['Geist'] text-[13px] text-white/60 leading-[1.55] mb-[20px]">
          Datos fiscales, reportes exportables e integraciones con SUNAT y facturación electrónica.
          Sube al plan Avanzado para desbloquear todo.
        </p>
        <div className="w-full flex flex-col gap-[8px]">
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="h-[48px] rounded-full bg-white text-black font-['Geist'] text-[14px] font-semibold flex items-center justify-center gap-[8px] active:scale-95"
            >
              <Sparkles className="h-[14px] w-[14px]" strokeWidth={2} />
              Ver planes
            </button>
          )}
          <button
            onClick={onClose}
            className="h-[46px] rounded-full font-['Geist'] text-[13.5px] text-white/70 active:text-white"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Volver
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function AdvancedSheet({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();

  const copyRuc = async () => {
    if (!profile?.ruc) return toast.error("Aún no has registrado tu RUC");
    try {
      await navigator.clipboard.writeText(profile.ruc);
      toast.success("RUC copiado");
    } catch {
      toast.info(profile.ruc);
    }
  };

  const copyRazon = async () => {
    if (!profile?.razon_social) return toast.error("Aún no has registrado la razón social");
    try {
      await navigator.clipboard.writeText(profile.razon_social);
      toast.success("Razón social copiada");
    } catch {
      toast.info(profile.razon_social);
    }
  };

  const shareCard = async () => {
    const text = [
      profile?.business_name,
      profile?.razon_social && `Razón social: ${profile.razon_social}`,
      profile?.ruc && `RUC: ${profile.ruc}`,
      profile?.regimen && `Régimen: ${profile.regimen}`,
      profile?.direccion_fiscal && `Dirección fiscal: ${profile.direccion_fiscal}`,
    ]
      .filter(Boolean)
      .join("\n");
    if (!text) return toast.error("Aún no hay datos fiscales para compartir");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ficha del negocio", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Ficha copiada");
      }
    } catch {
      /* usuario canceló */
    }
  };

  const exportJson = () => {
    const payload = {
      business_name: profile?.business_name ?? null,
      ruc: profile?.ruc ?? null,
      razon_social: profile?.razon_social ?? null,
      regimen: profile?.regimen ?? null,
      direccion_fiscal: profile?.direccion_fiscal ?? null,
      actividad_economica: profile?.actividad_economica ?? null,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trax-datos-tributarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Datos exportados");
  };

  const exportCsv = () => {
    const rows: Array<[string, string]> = [
      ["Campo", "Valor"],
      ["Negocio", profile?.business_name ?? ""],
      ["Razón social", profile?.razon_social ?? ""],
      ["RUC", profile?.ruc ?? ""],
      ["Régimen", profile?.regimen ?? ""],
      ["Dirección fiscal", profile?.direccion_fiscal ?? ""],
      ["Actividad económica", profile?.actividad_economica ?? ""],
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trax-datos-tributarios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel/CSV descargado");
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] max-h-[85vh] overflow-y-auto rounded-t-[28px] pt-[14px] pb-[28px] px-[20px]"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[6px]">
          <div>
            <div className="font-['Geist'] text-[10px] uppercase tracking-[1.6px] text-white/45">
              Plan Avanzado
            </div>
            <h3 className="mt-[2px] font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">
              Opciones avanzadas
            </h3>
          </div>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        <AdvSection title="Datos fiscales">
          <AdvRow
            Icon={Copy}
            gradient="linear-gradient(135deg, #60A5FA, #6366F1)"
            label="Copiar RUC"
            desc={profile?.ruc ?? "Aún sin RUC configurado"}
            onClick={copyRuc}
          />
          <AdvRow
            Icon={FileText}
            gradient="linear-gradient(135deg, #6366F1, #8B5CF6)"
            label="Copiar razón social"
            desc={profile?.razon_social ?? "Aún sin razón social"}
            onClick={copyRazon}
          />
          <AdvRow
            Icon={Share2}
            gradient="linear-gradient(135deg, #22D3EE, #60A5FA)"
            label="Compartir ficha del negocio"
            desc="RUC, razón social, régimen y dirección"
            onClick={shareCard}
          />
        </AdvSection>

        <AdvSection title="Documentos y reportes">
          <AdvRow
            Icon={Download}
            gradient="linear-gradient(135deg, #34D399, #10B981)"
            label="Exportar como JSON"
            desc="Para tu contador o backup técnico"
            onClick={exportJson}
          />
          <AdvRow
            Icon={FileSpreadsheet}
            gradient="linear-gradient(135deg, #10B981, #059669)"
            label="Exportar como Excel"
            desc="Planilla CSV compatible con Excel"
            onClick={exportCsv}
          />
        </AdvSection>

        <AdvSection title="Integraciones">
          <AdvRow
            Icon={Plug}
            gradient="linear-gradient(135deg, #F59E0B, #F97316)"
            label="SUNAT"
            desc="Validación automática del RUC · próximamente"
            disabled
          />
          <AdvRow
            Icon={Sparkles}
            gradient="linear-gradient(135deg, #A855F7, #EC4899)"
            label="Facturación electrónica"
            desc="Emisión desde Trax · próximamente"
            disabled
          />
        </AdvSection>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function AdvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-[18px]">
      <div className="px-[4px] mb-[8px] font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
        {title}
      </div>
      <div className="flex flex-col gap-[8px]">{children}</div>
    </div>
  );
}

function AdvRow({
  Icon,
  label,
  desc,
  onClick,
  disabled,
  gradient,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  desc: string;
  onClick?: () => void;
  disabled?: boolean;
  gradient?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-[12px] px-[14px] py-[14px] rounded-[16px] text-left active:bg-white/[0.04] transition-colors disabled:opacity-50"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="h-[36px] w-[36px] rounded-full grid place-items-center flex-none"
        style={{ background: gradient ?? "rgba(255,255,255,0.05)" }}
      >
        <Icon className="h-[15px] w-[15px] text-white" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14px] text-white truncate">{label}</div>
        <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 truncate">{desc}</div>
      </div>
      <ChevronRight className="h-[14px] w-[14px] text-white/30" strokeWidth={1.6} />
    </button>
  );
}
