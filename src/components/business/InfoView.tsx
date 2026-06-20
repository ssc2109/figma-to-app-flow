import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, X } from "lucide-react";
import { SubHeader, SubScreen, SectionLabel, ListGroup } from "./shared";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FieldKey = "business_name" | "business_type" | "address" | "phone" | "owner_name" | "open_time" | "close_time";

const LABELS: Record<FieldKey, string> = {
  business_name: "Nombre del negocio",
  business_type: "Rubro",
  owner_name: "Tu nombre",
  address: "Dirección",
  phone: "Teléfono / WhatsApp",
  open_time: "Hora de apertura",
  close_time: "Hora de cierre",
};

function fmtTime(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":");
  return `${h}:${m ?? "00"}`;
}

function EditSheet({
  field, value, onClose, onSaved,
}: { field: FieldKey; value: string; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [v, setV] = useState(value);
  const [saving, setSaving] = useState(false);
  const isTime = field === "open_time" || field === "close_time";

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const patch: Record<string, string | null> = { [field]: v.trim() || null };
    const { error } = await (supabase.from("profiles") as any)
      .update(patch)
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Guardado");
    onSaved(); onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[28px] px-[20px]"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white">{LABELS[field]}</h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>
        <input
          value={v} onChange={(e) => setV(e.target.value)}
          type={isTime ? "time" : "text"}
          autoFocus
          className="w-full h-[52px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <button onClick={submit} disabled={saving}
          className="mt-[18px] w-full h-[52px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </motion.div>
    </motion.div>
  );
}

function EditableRow({
  label, value, onClick, last,
}: { label: string; value: string | null; onClick: () => void; last?: boolean }) {
  return (
    <>
      <button onClick={onClick}
        className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors">
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

export default function InfoView({ onBack }: { onBack: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const [edit, setEdit] = useState<FieldKey | null>(null);

  const get = (k: FieldKey) => {
    const v = (profile as any)?.[k];
    if (!v) return null;
    if (k === "open_time" || k === "close_time") return fmtTime(v);
    return v as string;
  };

  return (
    <SubScreen>
      <SubHeader eyebrow="Datos del negocio" title="Información" onBack={onBack} />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[24px]">
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
      </div>

      <AnimatePresence>
        {edit && (
          <EditSheet field={edit} value={(profile as any)?.[edit] ?? ""}
            onClose={() => setEdit(null)} onSaved={refreshProfile} />
        )}
      </AnimatePresence>
    </SubScreen>
  );
}
