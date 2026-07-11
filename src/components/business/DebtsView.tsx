import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X, Check, Wallet, ArrowDownLeft, ArrowUpRight, Trash2, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SubHeader, SubScreen, ListGroup } from "./shared";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Kind = "cobrar" | "pagar";
type Debt = {
  id: string;
  customer_name: string;
  amount: number;
  due_date: string | null;
  created_at: string;
  paid: boolean;
  kind: Kind;
};

function Field({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-['Geist'] uppercase tracking-[1.2px] text-white/40">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        className="h-[46px] rounded-[12px] px-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition" />
    </label>
  );
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const label = selected
    ? selected.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
    : "Elegir fecha";

  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-['Geist'] uppercase tracking-[1.2px] text-white/40">Fecha límite (opcional)</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-[46px] rounded-[12px] px-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] outline-none focus:border-white/30 transition flex items-center gap-[10px] text-left"
          >
            <CalendarIcon className="h-[16px] w-[16px] text-white/55 shrink-0" strokeWidth={1.7} />
            <span className={value ? "text-white" : "text-white/35"}>{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-auto p-0 rounded-[18px] pointer-events-auto"
          style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (!d) return;
              onChange(ymd(d));
              setOpen(false);
            }}
            initialFocus
            className="p-2 pointer-events-auto !bg-transparent text-white [&_.rdp-day]:text-white/85 [&_button]:text-white/85"
            classNames={{ root: "!bg-transparent" }}
          />
        </PopoverContent>
      </Popover>
    </label>
  );
}

function DebtSheet({
  kind, onClose, onSaved,
}: { kind: Kind; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error(kind === "cobrar" ? "Pon el cliente" : "Pon el proveedor");
    const a = parseFloat(amount.replace(",", ".")) || 0;
    if (a <= 0) return toast.error("Pon un monto válido");
    setSaving(true);
    try {
      const { error } = await supabase.from("fiados").insert({
        user_id: user.id, customer_name: name.trim(), amount: a,
        due_date: due || null, kind,
      });
      if (error) throw error;
      toast.success("Registrado");
      onSaved(); onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Error");
    } finally { setSaving(false); }
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
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">
            {kind === "cobrar" ? "Nueva cuenta por cobrar" : "Nueva cuenta por pagar"}
          </h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex flex-col gap-[10px]">
          <Field label={kind === "cobrar" ? "Cliente" : "Proveedor / Acreedor"} value={name} onChange={setName}
            placeholder={kind === "cobrar" ? "Nombre del cliente" : "A quién le debes"} />
          <Field label="Monto (S/)" value={amount} onChange={setAmount} placeholder="0.00" type="number" />
          <DateField value={due} onChange={setDue} />
        </div>
        <button onClick={submit} disabled={saving}
          className="mt-[18px] w-full h-[52px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40">
          {saving ? "Guardando…" : "Registrar"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function DebtsView({
  onBack, initialKind = "cobrar", lockKind = false,
}: { onBack: () => void; initialKind?: Kind; lockKind?: boolean }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Kind>(initialKind);
  const [items, setItems] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<Kind | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("fiados")
      .select("id, customer_name, amount, due_date, created_at, paid, kind")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setItems((data as Debt[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(() => items.filter((d) => d.kind === tab), [items, tab]);
  const pending = filtered.filter((d) => !d.paid);
  const total = pending.reduce((s, d) => s + Number(d.amount), 0);

  const markPaid = async (id: string) => {
    const d = items.find((x) => x.id === id);
    if (!d) return;
    const { error } = await supabase.from("fiados")
      .update({ paid: true, paid_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (d.kind === "cobrar" && user) {
      await supabase.from("sales").insert({
        user_id: user.id, total: d.amount, payment_method: "efectivo",
        note: `Cobro deuda · ${d.customer_name}`, is_credit: false, paid: true,
      });
    } else if (d.kind === "pagar" && user) {
      await supabase.from("expenses").insert({
        user_id: user.id, amount: d.amount, category: "otros",
        note: `Pago deuda · ${d.customer_name}`,
      });
    }
    toast.success(d.kind === "cobrar" ? "Cobrada" : "Pagada");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const { error } = await supabase.from("fiados").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow={lockKind ? (initialKind === "cobrar" ? "Lo que te deben" : "Lo que debes") : "Cuentas pendientes"}
        title={lockKind ? (initialKind === "cobrar" ? "Por cobrar" : "Por pagar") : "Deudas"}
        onBack={onBack}
        action={
          <button onClick={() => setSheet(tab)}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95">
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <div className="px-[20px] pt-[6px]">
        {/* tabs */}
        {!lockKind && <div className="flex items-center gap-[6px] p-[4px] rounded-full mb-[14px]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["cobrar", "pagar"] as const).map((k) => {
            const active = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)}
                className="flex-1 h-[34px] rounded-full font-['Geist'] text-[12.5px] font-medium flex items-center justify-center gap-[6px] transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.95)" : "transparent",
                  color: active ? "#000" : "rgba(255,255,255,0.65)",
                }}>
                {k === "cobrar" ? <ArrowDownLeft className="h-[12px] w-[12px]" strokeWidth={2} />
                  : <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2} />}
                {k === "cobrar" ? "Por cobrar" : "Por pagar"}
              </button>
            );
          })}
        </div>}

        {/* summary */}
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-[20px] overflow-hidden mb-[14px]"
          style={{
            background: tab === "cobrar"
              ? "linear-gradient(135deg, rgba(74,222,128,0.10), rgba(255,255,255,0.025))"
              : "linear-gradient(135deg, rgba(248,113,113,0.10), rgba(255,255,255,0.025))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <div className="px-[18px] py-[16px]">
            <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">
              {tab === "cobrar" ? "Te deben" : "Debes"}
            </div>
            <div className="mt-[4px] font-['Bai_Jamjuree'] text-[32px] font-bold text-white tracking-[-1px] tabular-nums">
              S/ {total.toFixed(2)}
            </div>
            <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45">
              {pending.length} pendiente{pending.length === 1 ? "" : "s"}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-[50px]">
            <div className="h-[60px] w-[60px] rounded-[18px] flex items-center justify-center mb-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Wallet className="h-[24px] w-[24px] text-white/55" strokeWidth={1.5} />
            </div>
            <p className="font-['Geist'] text-[13.5px] text-white/55 max-w-[260px] leading-[1.5]">
              {tab === "cobrar" ? "No tienes cuentas por cobrar." : "No tienes cuentas por pagar."}
            </p>
          </div>
        ) : (
          <ListGroup>
            {filtered.map((d, idx) => {
              const overdue = !d.paid && d.due_date && new Date(d.due_date) < new Date();
              return (
                <div key={d.id}>
                  <div className="flex items-center gap-[12px] px-[16px] py-[13px]">
                    <div className="flex-1 min-w-0">
                      <div className={`font-['Geist'] text-[14.5px] truncate ${d.paid ? "text-white/50 line-through" : "text-white"}`}>
                        {d.customer_name}
                      </div>
                      <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
                        S/ {Number(d.amount).toFixed(2)}
                        {d.due_date && (
                          <span className={`ml-[8px] ${overdue ? "text-[#F87171]" : ""}`}>
                            · {overdue ? "Vencida" : `Vence ${new Date(d.due_date).toLocaleDateString("es-PE")}`}
                          </span>
                        )}
                        {d.paid && <span className="ml-[8px] text-[#4ADE80]">· Saldada</span>}
                      </div>
                    </div>
                    {!d.paid && (
                      <button onClick={() => markPaid(d.id)}
                        className="h-[32px] w-[32px] rounded-full grid place-items-center active:scale-95"
                        style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
                        aria-label="Marcar saldada">
                        <Check className="h-[14px] w-[14px] text-[#4ADE80]" strokeWidth={2.2} />
                      </button>
                    )}
                    <button onClick={() => del(d.id)}
                      className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]"
                      aria-label="Eliminar">
                      <Trash2 className="h-[13px] w-[13px] text-white/40" strokeWidth={1.7} />
                    </button>
                  </div>
                  {idx < filtered.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
                </div>
              );
            })}
          </ListGroup>
        )}
      </div>

      <AnimatePresence>
        {sheet && <DebtSheet kind={sheet} onClose={() => setSheet(null)} onSaved={load} />}
      </AnimatePresence>
    </SubScreen>
  );
}
