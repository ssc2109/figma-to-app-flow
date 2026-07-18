import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, CalendarDays, Trash2, Check, Bell, Wallet, Wrench, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SubHeader, SubScreen, ListGroup } from "./shared";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

type Kind = "recordatorio" | "pago" | "servicio";
type Ev = { id: string; title: string; notes: string | null; event_date: string; kind: Kind; done: boolean };

const KIND_META: Record<Kind, { label: string; Icon: typeof Bell; color: string }> = {
  recordatorio: { label: "Recordatorio", Icon: Bell, color: "rgba(255,255,255,0.7)" },
  pago: { label: "Pago", Icon: Wallet, color: "#F87171" },
  servicio: { label: "Servicio", Icon: Wrench, color: "#4ADE80" },
};

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Ev[]>([]);
  const [selected, setSelected] = useState<Date>(new Date());
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id,title,notes,event_date,kind,done")
      .eq("user_id", user.id)
      .order("event_date", { ascending: true });
    if (error) console.error(error);
    setItems((data as Ev[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const daysWithEvents = useMemo(() => {
    const set = new Set(items.filter((e) => !e.done).map((e) => e.event_date));
    return Array.from(set).map((d) => new Date(d + "T00:00:00"));
  }, [items]);

  const dayEvents = useMemo(() => {
    const key = ymd(selected);
    return items.filter((e) => e.event_date === key);
  }, [items, selected]);

  const toggle = async (e: Ev) => {
    const { error } = await supabase.from("calendar_events").update({ done: !e.done }).eq("id", e.id);
    if (error) return toast.error(error.message);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Agenda"
        title="Calendario"
        onBack={onBack}
        action={
          <button
            onClick={() => setSheet(true)}
            className="h-[36px] w-[36px] rounded-full bg-[#3b82f6] text-white grid place-items-center active:scale-95"
            aria-label="Nuevo evento"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <div className="px-[20px] pb-[60px] flex flex-col gap-[16px]">
        <div
          className="rounded-[20px] p-[8px]"
          style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ hasEvent: daysWithEvents }}
            modifiersClassNames={{ hasEvent: "after:content-[''] after:absolute after:bottom-[3px] after:left-1/2 after:-translate-x-1/2 after:h-[4px] after:w-[4px] after:rounded-full after:bg-white/80 relative" }}
            className="p-2 pointer-events-auto !bg-transparent text-white [--cell-size:2.4rem] [&_.rdp-day]:text-white/85 [&_button]:text-white/85"
          />
        </div>

        <div>
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.6px] text-white/45 mb-[10px] px-[4px]">
            {selected.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          {loading ? (
            <div className="text-center py-[30px] font-['Geist'] text-[12.5px] text-white/40">Cargando…</div>
          ) : dayEvents.length === 0 ? (
            <div className="flex flex-col items-center text-center py-[30px]">
              <div
                className="h-[52px] w-[52px] rounded-[16px] grid place-items-center mb-[10px]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <CalendarDays className="h-[20px] w-[20px] text-white/55" strokeWidth={1.5} />
              </div>
              <p className="font-['Geist'] text-[13px] text-white/55 max-w-[260px] leading-[1.5]">
                Nada agendado para este día.
              </p>
            </div>
          ) : (
            <ListGroup>
              {dayEvents.map((e, i) => {
                const meta = KIND_META[e.kind];
                const Icon = meta.Icon;
                return (
                  <div key={e.id}>
                    <div className="flex items-center gap-[12px] px-[16px] py-[13px]">
                      <div className="h-[34px] w-[34px] rounded-[10px] grid place-items-center shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Icon className="h-[14px] w-[14px]" strokeWidth={1.8} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-['Geist'] text-[14px] truncate ${e.done ? "text-white/50 line-through" : "text-white"}`}>
                          {e.title}
                        </div>
                        <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 truncate">
                          {meta.label}{e.notes ? ` · ${e.notes}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(e)}
                        className="h-[30px] w-[30px] rounded-full grid place-items-center active:scale-95"
                        style={{
                          background: e.done ? "rgba(74,222,128,0.14)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${e.done ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.10)"}`,
                        }}
                        aria-label="Marcar hecho"
                      >
                        <Check className="h-[13px] w-[13px]" strokeWidth={2.2} style={{ color: e.done ? "#4ADE80" : "rgba(255,255,255,0.45)" }} />
                      </button>
                      <button
                        onClick={() => del(e.id)}
                        className="h-[30px] w-[30px] rounded-full grid place-items-center active:bg-white/[0.05]"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-[13px] w-[13px] text-white/40" strokeWidth={1.7} />
                      </button>
                    </div>
                    {i < dayEvents.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
                  </div>
                );
              })}
            </ListGroup>
          )}
        </div>
      </div>

      <AnimatePresence>{sheet && <EventSheet defaultDate={selected} onClose={() => setSheet(false)} onSaved={load} />}</AnimatePresence>
    </SubScreen>
  );
}

function EventSheet({ defaultDate, onClose, onSaved }: { defaultDate: Date; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(ymd(defaultDate));
  const [kind, setKind] = useState<Kind>("recordatorio");
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const dateLabel = (() => {
    if (!date) return null;
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  })();

  const submit = async () => {
    if (!user) return;
    if (!title.trim()) return toast.error("Pon un título");
    setSaving(true);
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: title.trim(),
      notes: notes.trim() || null,
      event_date: date,
      kind,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Evento guardado");
    onSaved();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[24px] px-[20px]"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">Nuevo evento</h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col gap-[10px]">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ej. Pagar luz)"
            className="h-[48px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[15px] text-white placeholder:text-white/30 focus:border-white/30 transition"
          />
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="h-[46px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white focus:border-white/30 active:border-white/30 transition flex items-center gap-[10px]"
              >
                <CalendarIcon className="h-[16px] w-[16px] text-white/60 shrink-0" strokeWidth={1.7} />
                <span className={dateLabel ? "text-white" : "text-white/40"}>
                  {dateLabel ?? "Elegir fecha"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              className="w-auto p-0 rounded-[18px] border-0"
              style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Calendar
                mode="single"
                selected={date ? new Date(date + "T00:00:00") : undefined}
                onSelect={(d) => {
                  if (d) {
                    setDate(ymd(d));
                    setDateOpen(false);
                  }
                }}
                initialFocus
                className="p-2 pointer-events-auto !bg-transparent text-white [&_.rdp-day]:text-white/85 [&_button]:text-white/85"
                classNames={{ root: "!bg-transparent" }}
              />
            </PopoverContent>
          </Popover>
          <div className="grid grid-cols-3 gap-[6px]">
            {(Object.keys(KIND_META) as Kind[]).map((k) => {
              const active = kind === k;
              const M = KIND_META[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className="h-[42px] rounded-[12px] font-['Geist'] text-[12.5px] font-medium flex items-center justify-center gap-[6px]"
                  style={{
                    background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                    color: active ? "#000" : "rgba(255,255,255,0.7)",
                    border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                  }}
                >
                  <M.Icon className="h-[13px] w-[13px]" strokeWidth={1.9} />
                  {M.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            rows={2}
            className="px-[14px] py-[12px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 focus:border-white/30 transition resize-none"
          />
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-[16px] w-full h-[52px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Guardando…" : "Agendar"}
        </button>
      </motion.div>
    </motion.div>
  );
}
