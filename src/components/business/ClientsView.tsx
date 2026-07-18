import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, UserPlus, Users, Phone, X, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SubHeader, SubScreen, ListGroup } from "./shared";
import { useConfirm } from "@/components/ui/confirm";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  note: string | null;
  created_at: string;
};

function Field({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-['Geist'] uppercase tracking-[1.2px] text-white/40">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="h-[46px] rounded-[12px] px-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition"
      />
    </label>
  );
}

function ClientSheet({
  client, onClose, onSaved,
}: { client: Customer | "new"; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const isNew = client === "new";
  const current = isNew ? null : client;
  const [name, setName] = useState(current?.name ?? "");
  const [phone, setPhone] = useState(current?.phone ?? "");
  const [note, setNote] = useState(current?.note ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Pon un nombre");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const { error } = await supabase.from("customers").insert({
          user_id: user.id, name: name.trim(),
          phone: phone.trim() || null, note: note.trim() || null,
        });
        if (error) throw error;
        toast.success("Cliente agregado");
      } else if (current) {
        const { error } = await supabase.from("customers").update({
          name: name.trim(), phone: phone.trim() || null, note: note.trim() || null,
        }).eq("id", current.id);
        if (error) throw error;
        toast.success("Cliente actualizado");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!current) return;
    if (!confirm(`¿Eliminar a ${current.name}?`)) return;
    const { error } = await supabase.from("customers").delete().eq("id", current.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cliente eliminado");
    onSaved(); onClose();
  };

  return createPortal(
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] flex flex-col"
        style={{
          background: "rgba(14,14,16,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "min(85dvh, 720px)",
        }}>
        <div className="shrink-0 pt-[14px] px-[20px]">
          <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
          <div className="flex items-center justify-between mb-[6px]">
            <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">
              {isNew ? "Nuevo cliente" : "Editar cliente"}
            </h3>
            <button onClick={onClose} className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]" aria-label="Cerrar">
              <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-[20px] pt-[12px] pb-[16px]">
          <div className="flex flex-col gap-[10px]">
            <Field label="Nombre" value={name} onChange={setName} placeholder="Ej. María Quispe" />
            <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="987 654 321" type="tel" />
            <Field label="Nota (opcional)" value={note} onChange={setNote} placeholder="Vecina, viene los sábados" />
          </div>
        </div>
        <div className="shrink-0 px-[20px] pt-[8px] pb-[calc(env(safe-area-inset-bottom)+18px)] border-t border-white/[0.05]"
          style={{ background: "rgba(14,14,16,0.97)" }}>
          <button onClick={submit} disabled={saving}
            className="w-full h-[52px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40">
            {saving ? "Guardando…" : isNew ? "Crear cliente" : "Guardar cambios"}
          </button>
          {!isNew && (
            <button onClick={del}
              className="mt-[10px] w-full h-[44px] rounded-[14px] font-['Geist'] text-[13px] text-[#F87171] active:bg-white/[0.04] flex items-center justify-center gap-[8px]"
              style={{ border: "1px solid rgba(248,113,113,0.20)" }}>
              <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.8} /> Eliminar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}


export default function ClientsView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<Customer | "new" | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("customers")
      .select("id, name, phone, note, created_at")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    if (error) console.error(error);
    setItems((data as Customer[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(
    () => items.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone ?? "").includes(query)),
    [items, query],
  );

  return (
    <SubScreen>
      <SubHeader
        eyebrow={`${items.length} cliente${items.length === 1 ? "" : "s"}`}
        title="Clientes"
        onBack={onBack}
        action={
          <button onClick={() => setSheet("new")}
            className="h-[36px] w-[36px] rounded-full bg-[#3b82f6] text-white flex items-center justify-center active:scale-95"
            aria-label="Añadir cliente">
            <UserPlus className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-[60px] px-[20px]">
          <div className="h-[64px] w-[64px] rounded-[20px] flex items-center justify-center mb-[18px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Users className="h-[26px] w-[26px] text-white/55" strokeWidth={1.5} />
          </div>
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white mb-[8px]">Aún no tienes clientes</h3>
          <p className="font-['Geist'] text-[13.5px] text-white/50 max-w-[280px] leading-[1.5] mb-[20px]">
            Registra a tus clientes frecuentes para llevar su historial y contacto.
          </p>
          <button onClick={() => setSheet("new")}
            className="h-[44px] px-[20px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[13.5px] font-semibold active:scale-95 flex items-center gap-[8px]">
            <UserPlus className="h-[15px] w-[15px]" strokeWidth={2.4} /> Agregar cliente
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-[14px] px-[20px] pt-[6px]">
          <div className="flex items-center gap-[10px] h-[44px] px-[16px] rounded-full"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search className="h-[15px] w-[15px] text-white/40" strokeWidth={1.8} />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente o teléfono"
              className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30" />
          </div>

          <ListGroup>
            {filtered.length === 0 ? (
              <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">Nada coincide</div>
            ) : filtered.map((c, idx) => (
              <div key={c.id}>
                <button onClick={() => setSheet(c)}
                  className="w-full flex items-center gap-[14px] px-[16px] py-[13px] text-left active:bg-white/[0.025] transition-colors">
                  <div className="h-[38px] w-[38px] rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08] shrink-0">
                    <span className="font-['Bai_Jamjuree'] text-[13px] font-semibold text-white/80">
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['Geist'] text-[14.5px] text-white truncate">{c.name}</div>
                    {c.phone && (
                      <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45 flex items-center gap-[5px]">
                        <Phone className="h-[10px] w-[10px]" strokeWidth={1.8} /> {c.phone}
                      </div>
                    )}
                  </div>
                </button>
                {idx < filtered.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
              </div>
            ))}
          </ListGroup>
        </div>
      )}

      <AnimatePresence>
        {sheet && <ClientSheet client={sheet} onClose={() => setSheet(null)} onSaved={load} />}
      </AnimatePresence>
    </SubScreen>
  );
}
