import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Search, Package, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { useFinance, type PayMethod } from "@/data/finance";
import { toast } from "sonner";

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

type Mode = "cobrar" | "fiar";

export default function SalesOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const inv = useInventory();
  const fin = useFinance();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("cobrar");
  const [method, setMethod] = useState<PayMethod>("Efectivo");
  const [customer, setCustomer] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string | null }>>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCart({});
      setQuery("");
      setCheckoutOpen(false);
      setMode("cobrar");
      setMethod("Efectivo");
      setCustomer("");
      setCustomerId(null);
      setNote("");
      return;
    }
    if (!user) return;
    // cargar clientes recientes para el picker de fiado
    supabase
      .from("customers")
      .select("id,name,phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setCustomers((data as any) ?? []));
  }, [open, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inv.items.filter((i) => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [inv.items, query]);

  const lines = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = inv.items.find((x) => x.id === id);
        if (!p) return null;
        return { ...p, qty };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, inv.items]);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const add = (id: string) => {
    const p = inv.items.find((x) => x.id === id);
    if (!p) return;
    setCart((c) => {
      const cur = c[id] ?? 0;
      if (cur + 1 > p.stock) {
        toast.error(`Stock insuficiente · ${p.stock} disponible${p.stock === 1 ? "" : "s"}`);
        return c;
      }
      return { ...c, [id]: cur + 1 };
    });
  };
  const sub = (id: string) =>
    setCart((c) => {
      const next = (c[id] ?? 0) - 1;
      const copy = { ...c };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  const remove = (id: string) =>
    setCart((c) => {
      const copy = { ...c };
      delete copy[id];
      return copy;
    });

  const submitSale = async () => {
    if (!user) return;
    if (lines.length === 0) return;
    if (mode === "fiar" && !customer.trim()) {
      toast.error("Pon el nombre del cliente para fiar");
      return;
    }
    setSaving(true);
    try {
      const isCredit = mode === "fiar";

      // Si es fiado y no hay customerId pero sí nombre nuevo, crea el cliente
      let finalCustomerId = customerId;
      if (isCredit && !finalCustomerId && customer.trim()) {
        const { data: newC } = await supabase
          .from("customers")
          .insert({ user_id: user.id, name: customer.trim() })
          .select("id")
          .single();
        finalCustomerId = newC?.id ?? null;
      }

      const { data: sale, error: sErr } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          total: subtotal,
          payment_method: isCredit ? "fiado" : method.toLowerCase(),
          note: note.trim() || null,
          customer_name: customer.trim() || null,
          customer_id: finalCustomerId,
          is_credit: isCredit,
          paid: !isCredit,
        })
        .select("id")
        .single();
      if (sErr || !sale) throw sErr ?? new Error("No se pudo registrar la venta");

      const itemsPayload = lines.map((l) => ({
        sale_id: sale.id,
        user_id: user.id,
        product_id: l.dbId,
        name: l.name,
        qty: l.qty,
        unit_price: l.price,
      }));
      const { error: iErr } = await supabase.from("sale_items").insert(itemsPayload);
      if (iErr) throw iErr;

      // Decrementar stock (en paralelo)
      await Promise.all(
        lines.map((l) =>
          supabase
            .from("products")
            .update({ stock: Math.max(0, l.stock - l.qty) })
            .eq("id", l.dbId),
        ),
      );

      if (isCredit) {
        await supabase.from("fiados").insert({
          user_id: user.id,
          sale_id: sale.id,
          customer_name: customer.trim(),
          amount: subtotal,
        });
      }

      await Promise.all([inv.refresh(), fin.refresh()]);
      toast.success(isCredit ? "Fiado registrado" : `Venta registrada · ${fmt(subtotal)}`);
      onClose();
    } catch (err) {
      console.error("submitSale", err);
      toast.error((err as Error)?.message ?? "No se pudo registrar la venta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] bg-black"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto w-full max-w-[430px] h-full overflow-y-auto pb-[200px] relative">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/85 backdrop-blur-xl px-[20px] pt-[18px] pb-[14px] border-b border-white/[0.05]">
              <div className="flex items-center justify-between mb-[14px]">
                <div>
                  <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
                    Nueva venta
                  </div>
                  <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.4px]">
                    Registrar venta
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[40px] w-[40px] rounded-full flex items-center justify-center active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  aria-label="Cerrar"
                >
                  <X className="h-[16px] w-[16px] text-white" strokeWidth={1.9} />
                </button>
              </div>

              {/* Search */}
              <div
                className="flex items-center gap-[10px] h-[44px] px-[14px] rounded-[14px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Search className="h-[16px] w-[16px] text-white/45" strokeWidth={1.8} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto…"
                  className="flex-1 bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/30"
                />
              </div>
            </div>

            {/* List */}
            <div className="px-[20px] pt-[14px]">
              {inv.loading ? (
                <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">
                  Cargando inventario…
                </div>
              ) : inv.items.length === 0 ? (
                <EmptyInventory onClose={onClose} />
              ) : filtered.length === 0 ? (
                <div className="text-center py-[40px] font-['Geist'] text-[13px] text-white/40">
                  Nada coincide con "{query}".
                </div>
              ) : (
                <div className="flex flex-col gap-[8px]">
                  {filtered.map((p) => {
                    const qty = cart[p.id] ?? 0;
                    const out = p.stock === 0;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-[12px] p-[12px] rounded-[16px]"
                        style={{
                          background: "rgba(255,255,255,0.035)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          opacity: out ? 0.5 : 1,
                        }}
                      >
                        <div
                          className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center shrink-0"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover rounded-[12px]" />
                          ) : (
                            <Package className="h-[18px] w-[18px] text-white/45" strokeWidth={1.6} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Geist'] text-[14.5px] text-white truncate">{p.name}</div>
                          <div className="font-['Geist'] text-[11.5px] text-white/45 mt-[2px] tabular-nums">
                            {fmt(p.price)} · {out ? "Sin stock" : `${p.stock} u`}
                          </div>
                        </div>
                        {qty === 0 ? (
                          <button
                            type="button"
                            disabled={out}
                            onClick={() => add(p.id)}
                            className="h-[34px] px-[14px] rounded-full bg-white text-black font-['Geist'] text-[13px] font-semibold active:scale-95 disabled:opacity-30"
                          >
                            Agregar
                          </button>
                        ) : (
                          <div
                            className="flex items-center gap-[10px] h-[34px] px-[6px] rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => sub(p.id)}
                              className="h-[26px] w-[26px] rounded-full flex items-center justify-center text-white/75 active:scale-90"
                              aria-label="Quitar"
                            >
                              <Minus className="h-[14px] w-[14px]" strokeWidth={2.2} />
                            </button>
                            <span className="font-['Bai_Jamjuree'] text-[14px] font-semibold text-white tabular-nums min-w-[14px] text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => add(p.id)}
                              className="h-[26px] w-[26px] rounded-full bg-white text-black flex items-center justify-center active:scale-90"
                              aria-label="Agregar"
                            >
                              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sticky cart bar */}
          {count > 0 && !checkoutOpen && (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="fixed bottom-[24px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] h-[60px] rounded-[20px] flex items-center justify-between px-[20px] active:scale-[0.98] transition-transform z-[76]"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #e6e6e6 100%)",
                boxShadow: "0 18px 40px -12px rgba(255,255,255,0.18)",
              }}
            >
              <div className="flex items-center gap-[10px]">
                <div className="h-[28px] w-[28px] rounded-full bg-black/8 flex items-center justify-center font-['Bai_Jamjuree'] text-[13px] font-bold text-black">
                  {count}
                </div>
                <span className="font-['Geist'] text-[14px] font-semibold text-black">Ir a cobrar</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="font-['Bai_Jamjuree'] text-[16px] font-bold text-black tabular-nums">
                  {fmt(subtotal)}
                </span>
                <ArrowRight className="h-[16px] w-[16px] text-black" strokeWidth={2.4} />
              </div>
            </motion.button>
          )}

          {/* Checkout sheet */}
          <AnimatePresence>
            {checkoutOpen && (
              <motion.div
                className="fixed inset-0 z-[80] flex items-end justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => !saving && setCheckoutOpen(false)}
                />
                <motion.div
                  initial={{ y: 80 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[28px] px-[20px] max-h-[90vh] overflow-y-auto"
                  style={{
                    background: "rgba(14,14,16,0.97)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[18px]" />

                  <h3 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white mb-[6px]">
                    Cobrar {fmt(subtotal)}
                  </h3>
                  <p className="font-['Geist'] text-[12.5px] text-white/45 mb-[18px]">
                    {count} producto{count === 1 ? "" : "s"} · {lines.length} línea{lines.length === 1 ? "" : "s"}
                  </p>

                  {/* Items mini */}
                  <div className="flex flex-col gap-[6px] mb-[20px]">
                    {lines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-[13px] font-['Geist'] text-white/80">
                        <span className="truncate flex-1">
                          {l.qty}× {l.name}
                        </span>
                        <span className="font-['Bai_Jamjuree'] tabular-nums">{fmt(l.price * l.qty)}</span>
                        <button
                          type="button"
                          onClick={() => remove(l.id)}
                          className="ml-[10px] text-white/30 active:text-white/60"
                          aria-label={`Quitar ${l.name}`}
                        >
                          <X className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mode */}
                  <div className="grid grid-cols-2 gap-[8px] mb-[16px]">
                    {(["cobrar", "fiar"] as Mode[]).map((m) => {
                      const active = mode === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMode(m)}
                          className="h-[44px] rounded-[14px] font-['Geist'] text-[13.5px] font-medium transition-colors"
                          style={{
                            background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                            color: active ? "#000" : "#fff",
                            border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                          }}
                        >
                          {m === "cobrar" ? "Cobrar ahora" : "Fiar"}
                        </button>
                      );
                    })}
                  </div>

                  {mode === "cobrar" && (
                    <>
                      <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/40 mb-[8px]">
                        Método de pago
                      </div>
                      <div className="grid grid-cols-4 gap-[6px] mb-[16px]">
                        {(["Efectivo", "Yape", "Plin", "Tarjeta"] as PayMethod[]).map((m) => {
                          const active = method === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMethod(m)}
                              className="h-[40px] rounded-[12px] font-['Geist'] text-[12px] font-medium flex items-center justify-center gap-[4px]"
                              style={{
                                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                                border: `1px solid ${active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                              }}
                            >
                              {active && <Check className="h-[11px] w-[11px]" strokeWidth={2.4} />}
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {mode === "fiar" && (
                    <div className="mb-[12px] flex flex-col gap-[10px]">
                      <div
                        className="flex items-center gap-[10px] h-[46px] px-[14px] rounded-[14px]"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        <Search className="h-[15px] w-[15px] text-white/45 shrink-0" strokeWidth={1.8} />
                        <input
                          value={customer}
                          onChange={(e) => {
                            setCustomer(e.target.value);
                            setCustomerId(null);
                          }}
                          placeholder="Buscar o crear cliente…"
                          className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
                        />
                        {customerId && (
                          <span className="font-['Geist'] text-[11px] text-[#4ADE80] flex items-center gap-[4px] shrink-0">
                            <Check className="h-[11px] w-[11px]" strokeWidth={2.4} />
                            Seleccionado
                          </span>
                        )}
                      </div>
                      {(() => {
                        const q = customer.trim().toLowerCase();
                        const list = q
                          ? customers.filter((c) => c.name.toLowerCase().includes(q))
                          : customers;
                        const exact = customers.find(
                          (c) => c.name.trim().toLowerCase() === q,
                        );
                        return (
                          <>
                            {list.length > 0 && !customerId && (
                              <div
                                className="rounded-[12px] max-h-[180px] overflow-y-auto no-scrollbar"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                {list.slice(0, 8).map((c, i) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setCustomer(c.name);
                                      setCustomerId(c.id);
                                    }}
                                    className="w-full flex items-center justify-between px-[12px] py-[10px] text-left active:bg-white/[0.05]"
                                    style={{
                                      borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                                    }}
                                  >
                                    <span className="font-['Geist'] text-[13.5px] text-white truncate">
                                      {c.name}
                                    </span>
                                    {c.phone && (
                                      <span className="font-['Geist'] text-[11px] text-white/40 shrink-0 ml-[10px]">
                                        {c.phone}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                            {!customerId && q.length > 0 && !exact && (
                              <div className="font-['Geist'] text-[11px] text-white/40 px-[4px]">
                                Se creará “{customer.trim()}” al confirmar el fiado.
                              </div>
                            )}
                            {customers.length === 0 && !q && (
                              <div className="font-['Geist'] text-[11.5px] text-white/40 px-[4px]">
                                Aún no tienes clientes. Escribe el nombre para crear uno nuevo.
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nota (opcional)"
                    className="w-full h-[46px] px-[14px] rounded-[14px] bg-white/[0.04] border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 mb-[18px] focus:border-white/30 transition"
                  />

                  <button
                    type="button"
                    onClick={submitSale}
                    disabled={saving}
                    className="w-full h-[54px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
                  >
                    {saving ? "Guardando…" : mode === "fiar" ? `Fiar ${fmt(subtotal)}` : `Cobrar ${fmt(subtotal)}`}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyInventory({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-[60px] px-[20px]">
      <div
        className="h-[64px] w-[64px] rounded-[20px] flex items-center justify-center mb-[18px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Package className="h-[26px] w-[26px] text-white/55" strokeWidth={1.5} />
      </div>
      <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white mb-[8px]">
        Aún no tienes productos
      </h3>
      <p className="font-['Geist'] text-[13.5px] text-white/50 max-w-[280px] leading-[1.5] mb-[20px]">
        Agrega tu primer producto en Negocio → Inventario para poder registrar ventas.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="h-[44px] px-[20px] rounded-full bg-white text-black font-['Geist'] text-[13.5px] font-semibold active:scale-95"
      >
        Ir a inventario
      </button>
    </div>
  );
}
