import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

const CATEGORIES = [
  "Mercadería",
  "Servicios",
  "Alquiler",
  "Sueldos",
  "Transporte",
  "Otros",
];

export default function ExpenseOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const fin = useFinance();
  const confirm = useConfirm();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Mercadería");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setCategory("Mercadería");
      setNote("");
    }
  }, [open]);

  const submit = async () => {
    if (!user) return;
    const n = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Pon un monto válido");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: n,
        category: category.toLowerCase(),
        note: note.trim() || null,
      });
      if (error) throw error;
      await fin.refresh();
      toast.success(`Gasto registrado · S/ ${n.toFixed(2)}`);
      onClose();
    } catch (e) {
      toast.error((e as Error)?.message ?? "No se pudo registrar el gasto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[28px] px-[20px]"
            style={{
              background: "rgba(14,14,16,0.97)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[16px]" />

            <div className="flex items-center gap-[10px] mb-[16px]">
              <div
                className="h-[36px] w-[36px] rounded-[12px] grid place-items-center"
                style={{ background: "rgba(248,113,113,0.14)", border: "1px solid rgba(248,113,113,0.28)" }}
              >
                <Receipt className="h-[16px] w-[16px] text-[#F87171]" strokeWidth={1.9} />
              </div>
              <div className="flex-1">
                <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/45">
                  Nuevo movimiento
                </div>
                <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.4px]">
                  Registrar gasto
                </h3>
              </div>
              <button
                onClick={onClose}
                className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
                aria-label="Cerrar"
              >
                <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
              </button>
            </div>

            <label className="flex flex-col gap-[6px] mb-[14px]">
              <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/40">Monto (S/)</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
                className="h-[54px] rounded-[14px] px-[16px] bg-white/[0.04] border border-white/[0.10] text-white font-['Bai_Jamjuree'] text-[22px] font-semibold tabular-nums placeholder:text-white/25 outline-none focus:border-white/30 transition"
              />
            </label>

            <div className="mb-[14px]">
              <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/40 mb-[8px]">
                Categoría
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="h-[34px] px-[12px] rounded-full font-['Geist'] text-[12.5px] font-medium transition-colors"
                      style={{
                        background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                        color: active ? "#000" : "rgba(255,255,255,0.7)",
                        border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="w-full h-[46px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 mb-[18px] focus:border-white/30 transition"
            />

            <button
              onClick={submit}
              disabled={saving}
              className="w-full h-[54px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Registrar gasto"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
