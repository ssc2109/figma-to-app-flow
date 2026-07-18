import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Truck, Trash2, Package, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { SubHeader, SubScreen, ListGroup } from "./shared";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

type Purchase = {
  id: string;
  supplier_name: string | null;
  total: number;
  note: string | null;
  created_at: string;
};

type Line = { productId: string; name: string; qty: number; unitCost: number };

export default function PurchasesView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("id, supplier_name, total, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) console.error(error);
    setItems((data as Purchase[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const totalMonth = useMemo(() => {
    const first = new Date();
    first.setDate(1);
    first.setHours(0, 0, 0, 0);
    return items
      .filter((p) => new Date(p.created_at) >= first)
      .reduce((s, p) => s + Number(p.total), 0);
  }, [items]);

  const del = async (id: string) => {
    if (!confirm("¿Eliminar esta compra?")) return;
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Reposiciones"
        title="Compras"
        onBack={onBack}
        action={
          <button
            onClick={() => setSheet(true)}
            className="h-[36px] w-[36px] rounded-full bg-[#3b82f6] text-white grid place-items-center active:scale-95"
            aria-label="Nueva compra"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <div className="px-[20px] pt-[6px] pb-[40px]">
        <div
          className="rounded-[20px] p-[16px] mb-[14px]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">Comprado este mes</div>
          <div className="mt-[4px] font-['Bai_Jamjuree'] text-[30px] font-bold text-white tracking-[-1px] tabular-nums">
            S/ {totalMonth.toFixed(2)}
          </div>
          <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45">
            {items.length} compra{items.length === 1 ? "" : "s"} registrada{items.length === 1 ? "" : "s"}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-[50px]">
            <div
              className="h-[60px] w-[60px] rounded-[18px] grid place-items-center mb-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Truck className="h-[24px] w-[24px] text-white/55" strokeWidth={1.5} />
            </div>
            <p className="font-['Geist'] text-[13.5px] text-white/55 max-w-[260px] leading-[1.5]">
              Registra tus compras a proveedores para llevar control de reposiciones y costos.
            </p>
          </div>
        ) : (
          <ListGroup>
            {items.map((p, idx) => (
              <div key={p.id}>
                <div className="flex items-center gap-[12px] px-[16px] py-[13px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-['Geist'] text-[14.5px] text-white truncate">
                      {p.supplier_name || "Sin proveedor"}
                    </div>
                    <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
                      S/ {Number(p.total).toFixed(2)} · {new Date(p.created_at).toLocaleDateString("es-PE")}
                    </div>
                    {p.note && (
                      <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/40 truncate">{p.note}</div>
                    )}
                  </div>
                  <button
                    onClick={() => del(p.id)}
                    className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-[13px] w-[13px] text-white/40" strokeWidth={1.7} />
                  </button>
                </div>
                {idx < items.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
              </div>
            ))}
          </ListGroup>
        )}
      </div>

      <AnimatePresence>{sheet && <PurchaseSheet onClose={() => setSheet(false)} onSaved={load} />}</AnimatePresence>
    </SubScreen>
  );
}

function PurchaseSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const inv = useInventory();
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const total = lines.reduce((s, l) => s + l.qty * l.unitCost, 0);

  const addProduct = (p: { id: string; name: string; cost: number }) => {
    setLines((cur) => {
      if (cur.some((l) => l.productId === p.id)) return cur;
      return [...cur, { productId: p.id, name: p.name, qty: 1, unitCost: p.cost || 0 }];
    });
    setPickerOpen(false);
  };

  const submit = async () => {
    if (!user) return;
    if (lines.length === 0) return toast.error("Agrega al menos un producto");
    setSaving(true);
    try {
      const { data: purchase, error } = await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          supplier_name: supplier.trim() || null,
          total,
          note: note.trim() || null,
        })
        .select("id")
        .single();
      if (error || !purchase) throw error;

      await supabase.from("purchase_items").insert(
        lines.map((l) => ({
          purchase_id: purchase.id,
          user_id: user.id,
          product_id: l.productId,
          name: l.name,
          qty: l.qty,
          unit_cost: l.unitCost,
        })),
      );

      // Actualiza stock y costo del producto
      await Promise.all(
        lines.map((l) => {
          const cur = inv.items.find((i) => i.id === l.productId);
          if (!cur) return Promise.resolve();
          return supabase
            .from("products")
            .update({ stock: cur.stock + l.qty, cost: l.unitCost || cur.cost })
            .eq("id", cur.dbId);
        }),
      );
      await inv.refresh();
      toast.success("Compra registrada");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error)?.message ?? "No se pudo registrar la compra");
    } finally {
      setSaving(false);
    }
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
        className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[24px] px-[20px] max-h-[90vh] flex flex-col"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[16px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">Nueva compra</h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-[10px]">
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Proveedor (opcional)"
            className="h-[46px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 focus:border-white/30 transition"
          />

          {lines.length === 0 ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="h-[52px] rounded-[14px] border border-dashed border-white/15 font-['Geist'] text-[13.5px] text-white/60 active:bg-white/[0.03] flex items-center justify-center gap-[6px]"
            >
              <Plus className="h-[14px] w-[14px]" strokeWidth={2} />
              Agregar producto
            </button>
          ) : (
            <>
              <div className="flex flex-col gap-[8px]">
                {lines.map((l) => (
                  <div
                    key={l.productId}
                    className="p-[10px] rounded-[14px] flex items-center gap-[8px]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-['Geist'] text-[13.5px] text-white truncate">{l.name}</div>
                      <div className="mt-[2px] font-['Geist'] text-[11px] text-white/40 tabular-nums">
                        Subtotal S/ {(l.qty * l.unitCost).toFixed(2)}
                      </div>
                    </div>
                    <input
                      value={l.qty}
                      onChange={(e) =>
                        setLines((cur) =>
                          cur.map((x) =>
                            x.productId === l.productId ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x,
                          ),
                        )
                      }
                      inputMode="numeric"
                      className="w-[56px] h-[34px] px-[8px] rounded-[10px] bg-white/[0.05] border border-white/[0.10] text-white text-center font-['Bai_Jamjuree'] text-[14px] tabular-nums outline-none focus:border-white/30"
                    />
                    <div className="flex items-center gap-[3px]">
                      <span className="font-['Geist'] text-[11px] text-white/50">S/</span>
                      <input
                        value={l.unitCost}
                        onChange={(e) =>
                          setLines((cur) =>
                            cur.map((x) =>
                              x.productId === l.productId
                                ? { ...x, unitCost: Math.max(0, parseFloat(e.target.value.replace(",", ".")) || 0) }
                                : x,
                            ),
                          )
                        }
                        inputMode="decimal"
                        className="w-[72px] h-[34px] px-[8px] rounded-[10px] bg-white/[0.05] border border-white/[0.10] text-white text-right font-['Bai_Jamjuree'] text-[13px] tabular-nums outline-none focus:border-white/30"
                      />
                    </div>
                    <button
                      onClick={() => setLines((cur) => cur.filter((x) => x.productId !== l.productId))}
                      className="h-[30px] w-[30px] rounded-full grid place-items-center active:bg-white/[0.05]"
                    >
                      <X className="h-[12px] w-[12px] text-white/45" strokeWidth={1.9} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="h-[42px] rounded-[12px] font-['Geist'] text-[12.5px] text-white/70 active:bg-white/[0.03] flex items-center justify-center gap-[6px]"
                style={{ border: "1px dashed rgba(255,255,255,0.14)" }}
              >
                <Plus className="h-[13px] w-[13px]" strokeWidth={2} />
                Agregar otro producto
              </button>
            </>
          )}

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota (opcional)"
            className="h-[46px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 focus:border-white/30 transition"
          />
        </div>

        <div className="mt-[14px] flex items-center justify-between mb-[8px]">
          <span className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/45">Total</span>
          <span className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tabular-nums">
            S/ {total.toFixed(2)}
          </span>
        </div>
        <button
          onClick={submit}
          disabled={saving || lines.length === 0}
          className="w-full h-[52px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Guardando…" : "Registrar compra"}
        </button>
      </motion.div>

      <AnimatePresence>
        {pickerOpen && <ProductPicker onPick={addProduct} onClose={() => setPickerOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductPicker({
  onPick,
  onClose,
}: {
  onPick: (p: { id: string; name: string; cost: number }) => void;
  onClose: () => void;
}) {
  const inv = useInventory();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return inv.items.filter((i) => !s || i.name.toLowerCase().includes(s));
  }, [inv.items, q]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end"
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
        className="relative w-full max-w-[430px] mx-auto rounded-t-[28px] pt-[14px] pb-[24px] px-[20px] max-h-[75vh] flex flex-col"
        style={{ background: "rgba(14,14,16,0.98)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white mb-[12px]">Elegir producto</h3>
        <div
          className="flex items-center gap-[10px] h-[44px] px-[14px] rounded-[14px] mb-[10px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="h-[15px] w-[15px] text-white/45" strokeWidth={1.8} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Buscar…"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-[6px]">
          {list.length === 0 ? (
            <div className="text-center py-[40px] font-['Geist'] text-[12.5px] text-white/40">
              Sin productos. Créalos primero en Inventario.
            </div>
          ) : (
            list.map((p) => (
              <button
                key={p.id}
                onClick={() => onPick({ id: p.id, name: p.name, cost: p.cost })}
                className="flex items-center gap-[10px] p-[10px] rounded-[12px] active:bg-white/[0.04] text-left"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="h-[36px] w-[36px] rounded-[10px] grid place-items-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Package className="h-[14px] w-[14px] text-white/55" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[13.5px] text-white truncate">{p.name}</div>
                  <div className="font-['Geist'] text-[11px] text-white/40 tabular-nums">Costo actual S/ {p.cost.toFixed(2)}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
