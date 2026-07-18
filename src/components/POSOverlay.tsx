import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Search, Package, Check, Trash2, LogOut, ShoppingCart, ChevronDown } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { useFinance, type PayMethod } from "@/data/finance";
import { submitSale as runSubmitSale } from "@/lib/sales/submit-sale";
import { toast } from "sonner";

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

type Mode = "cobrar" | "fiar";

/**
 * Caja Rápida (POS) — pantalla continua para registrar múltiples ventas
 * sin salir. Reutiliza la misma lógica de submitSale del flujo tradicional.
 * Al cobrar, limpia el carrito y deja la pantalla lista para la siguiente venta.
 */
export default function POSOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const inv = useInventory();
  const fin = useFinance();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("cobrar");
  const [method, setMethod] = useState<PayMethod>("Efectivo");
  const [customer, setCustomer] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string | null }>>([]);
  const [customerPicker, setCustomerPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salesToday, setSalesToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);


  useEffect(() => {
    if (!open) {
      setCart({});
      setQuery("");
      setMode("cobrar");
      setMethod("Efectivo");
      setCustomer("");
      setCustomerId(null);
      setCustomerPicker(false);
      setSalesToday(0);
      setTotalToday(0);
      setCheckoutOpen(false);
      return;
    }

    if (!user) return;
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
    return inv.items.filter(
      (i) => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    );
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

  const clearCart = () => {
    setCart({});
    setCustomer("");
    setCustomerId(null);
    setMode("cobrar");
    setMethod("Efectivo");
  };

  const cobrar = async () => {
    if (!user || lines.length === 0 || saving) return;
    setSaving(true);
    try {
      const result = await runSubmitSale({
        userId: user.id,
        lines: lines.map((l) => ({
          dbId: l.dbId,
          name: l.name,
          price: l.price,
          stock: l.stock,
          qty: l.qty,
        })),
        mode,
        method,
        customerName: customer,
        customerId,
      });
      await Promise.all([inv.refresh(), fin.refresh()]);
      setSalesToday((n) => n + 1);
      setTotalToday((t) => t + result.total);
      toast.success(
        result.isCredit ? `Fiado · ${fmt(result.total)}` : `Cobrado · ${fmt(result.total)}`,
      );
      clearCart();
      setCheckoutOpen(false);

    } catch (err) {
      console.error("POS submitSale", err);
      toast.error((err as Error)?.message ?? "No se pudo registrar la venta");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = lines.length > 0 && !saving && (mode === "cobrar" || customer.trim().length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] bg-black flex flex-col"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mx-auto w-full max-w-[430px] h-full flex flex-col">
            {/* Header */}
            <div className="shrink-0 bg-black/85 backdrop-blur-xl px-[20px] pt-[18px] pb-[12px] border-b border-white/[0.05]">
              <div className="flex items-center justify-between mb-[12px]">
                <div>
                  <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
                    Caja rápida · POS
                  </div>
                  <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.4px]">
                    {salesToday > 0 ? `${salesToday} venta${salesToday === 1 ? "" : "s"} · ${fmt(totalToday)}` : "Registrar ventas"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[40px] px-[14px] rounded-full flex items-center gap-[6px] active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  aria-label="Salir de Caja rápida"
                >
                  <LogOut className="h-[14px] w-[14px] text-white" strokeWidth={1.9} />
                  <span className="font-['Geist'] text-[12.5px] text-white">Salir</span>
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
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-white/40 active:text-white"
                    aria-label="Limpiar"
                  >
                    <X className="h-[14px] w-[14px]" strokeWidth={1.9} />
                  </button>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto px-[16px] pt-[14px] pb-[14px]">
              {inv.loading ? (
                <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">
                  Cargando inventario…
                </div>
              ) : inv.items.length === 0 ? (
                <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/50">
                  Aún no tienes productos. Agrégalos desde Inventario.
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-[40px] font-['Geist'] text-[13px] text-white/40">
                  Nada coincide con "{query}".
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[10px]">
                  {filtered.map((p) => {
                    const qty = cart[p.id] ?? 0;
                    const out = p.stock === 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={out}
                        onClick={() => add(p.id)}
                        className="text-left rounded-[18px] p-[12px] flex flex-col gap-[8px] active:scale-[0.98] transition-transform disabled:opacity-40 relative"
                        style={{
                          background: qty > 0 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.035)",
                          border: `1px solid ${qty > 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"}`,
                          minHeight: 118,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className="h-[40px] w-[40px] rounded-[12px] flex items-center justify-center shrink-0"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover rounded-[12px]" />
                            ) : (
                              <Package className="h-[18px] w-[18px] text-white/45" strokeWidth={1.6} />
                            )}
                          </div>
                          {qty > 0 && (
                            <div className="h-[24px] min-w-[24px] px-[7px] rounded-full bg-[#3b82f6] text-white font-['Bai_Jamjuree'] text-[12px] font-bold flex items-center justify-center tabular-nums">
                              {qty}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Geist'] text-[13.5px] text-white leading-tight line-clamp-2">
                            {p.name}
                          </div>
                          <div className="font-['Bai_Jamjuree'] text-[14.5px] font-semibold text-white mt-[4px] tabular-nums">
                            {fmt(p.price)}
                          </div>
                          <div className="font-['Geist'] text-[10.5px] text-white/40 mt-[2px] tabular-nums">
                            {out ? "Sin stock" : `${p.stock} u`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Floating "Ver carrito" pill (silent cart flow) */}
            <AnimatePresence>
              {lines.length > 0 && !checkoutOpen && (
                <motion.div
                  key="cart-pill"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="pointer-events-none absolute left-0 right-0 flex justify-center px-[16px]"
                  style={{ bottom: `calc(env(safe-area-inset-bottom) + 16px)` }}
                >
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="pointer-events-auto w-full max-w-[400px] h-[58px] rounded-[20px] flex items-center justify-between pl-[16px] pr-[20px] active:scale-[0.98] transition-transform"
                    style={{
                      background: "linear-gradient(135deg, #ffffff 0%, #ececec 100%)",
                      boxShadow: "0 24px 44px -18px rgba(255,255,255,0.28), 0 4px 14px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="flex items-center gap-[12px] min-w-0">
                      <div className="relative h-[34px] w-[34px] rounded-full bg-black flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-[15px] w-[15px] text-white" strokeWidth={2} />
                        <div className="absolute -top-[4px] -right-[4px] h-[20px] min-w-[20px] px-[5px] rounded-full bg-black text-white font-['Bai_Jamjuree'] text-[11px] font-bold flex items-center justify-center tabular-nums border-2 border-white">
                          {count}
                        </div>
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-['Geist'] text-[13px] font-semibold text-black leading-tight">
                          Pasar a cobrar
                        </div>
                        <div className="font-['Geist'] text-[11px] text-black/55 tabular-nums leading-tight mt-[1px]">
                          {count} ítem{count === 1 ? "" : "s"} · {fmt(subtotal)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-[34px] w-[34px] rounded-full bg-black/10 flex items-center justify-center shrink-0"
                    >
                      <ChevronDown className="h-[15px] w-[15px] text-black rotate-180" strokeWidth={2.2} />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkout sheet (only when explicitly opened) */}
            <AnimatePresence>
              {checkoutOpen && lines.length > 0 && (
                <motion.div
                  key="checkout-sheet"
                  className="absolute inset-0 z-[5] flex items-end justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => !saving && setCheckoutOpen(false)}
                  />
                  <motion.div
                    initial={{ y: 80 }}
                    animate={{ y: 0 }}
                    exit={{ y: 80 }}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    className="relative w-full max-w-[430px] rounded-t-[28px] flex flex-col"
                    style={{
                      background: "rgba(10,10,12,0.98)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      maxHeight: "min(85dvh, 720px)",
                    }}
                  >
                    <div className="shrink-0 pt-[10px] px-[16px]">
                      <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[10px]" />
                      <div className="flex items-center justify-between mb-[6px]">
                        <div>
                          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/40">
                            Carrito · {count} ítem{count === 1 ? "" : "s"}
                          </div>
                          <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tabular-nums">
                            {fmt(subtotal)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCheckoutOpen(false)}
                          className="h-[36px] w-[36px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
                          aria-label="Cerrar cobro"
                        >
                          <X className="h-[16px] w-[16px] text-white/60" strokeWidth={1.9} />
                        </button>
                      </div>
                    </div>

                    {/* Cart lines (scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-[16px] pt-[6px]">
                      <div className="flex flex-col gap-[6px]">
                        {lines.map((l) => (
                          <div key={l.id} className="flex items-center gap-[10px] py-[6px]">
                            <div className="flex-1 min-w-0">
                              <div className="font-['Geist'] text-[13px] text-white truncate">{l.name}</div>
                              <div className="font-['Geist'] text-[11px] text-white/45 tabular-nums">
                                {fmt(l.price)} c/u · {fmt(l.price * l.qty)}
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-[8px] h-[32px] px-[6px] rounded-full"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => sub(l.id)}
                                className="h-[24px] w-[24px] rounded-full flex items-center justify-center text-white/75 active:scale-90"
                                aria-label="Restar"
                              >
                                <Minus className="h-[13px] w-[13px]" strokeWidth={2.2} />
                              </button>
                              <span className="font-['Bai_Jamjuree'] text-[13px] font-semibold text-white tabular-nums min-w-[14px] text-center">
                                {l.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => add(l.id)}
                                className="h-[24px] w-[24px] rounded-full bg-[#3b82f6] text-white flex items-center justify-center active:scale-90"
                                aria-label="Sumar"
                              >
                                <Plus className="h-[13px] w-[13px]" strokeWidth={2.4} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(l.id)}
                              className="h-[30px] w-[30px] rounded-full flex items-center justify-center text-white/40 active:text-white/80"
                              aria-label={`Quitar ${l.name}`}
                            >
                              <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mode + method + cobrar */}
                    <div
                      className="shrink-0 px-[16px] pt-[10px] pb-[calc(env(safe-area-inset-bottom)+16px)] border-t border-white/[0.06]"
                    >
                      <div className="grid grid-cols-2 gap-[6px] mb-[8px]">
                        {(["cobrar", "fiar"] as Mode[]).map((m) => {
                          const active = mode === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMode(m)}
                              className="h-[38px] rounded-[12px] font-['Geist'] text-[12.5px] font-medium transition-colors"
                              style={{
                                background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.04)",
                                color: active ? "#000" : "#fff",
                                border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.10)"}`,
                              }}
                            >
                              {m === "cobrar" ? "Cobrar" : "Fiar"}
                            </button>
                          );
                        })}
                      </div>

                      {mode === "cobrar" ? (
                        <div className="grid grid-cols-4 gap-[6px]">
                          {(["Efectivo", "Yape", "Plin", "Tarjeta"] as PayMethod[]).map((m) => {
                            const active = method === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m)}
                                className="h-[36px] rounded-[11px] font-['Geist'] text-[11.5px] font-medium flex items-center justify-center gap-[3px]"
                                style={{
                                  background: active ? "rgba(255,255,255,0.10)" : "transparent",
                                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                                  border: `1px solid ${active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                                }}
                              >
                                {active && <Check className="h-[10px] w-[10px]" strokeWidth={2.4} />}
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            className="flex items-center gap-[10px] h-[42px] px-[12px] rounded-[12px]"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.10)",
                            }}
                          >
                            <Search className="h-[14px] w-[14px] text-white/45 shrink-0" strokeWidth={1.8} />
                            <input
                              value={customer}
                              onChange={(e) => {
                                setCustomer(e.target.value);
                                setCustomerId(null);
                                setCustomerPicker(true);
                              }}
                              onFocus={() => setCustomerPicker(true)}
                              placeholder="Buscar o crear cliente…"
                              className="flex-1 bg-transparent outline-none font-['Geist'] text-[13.5px] text-white placeholder:text-white/30"
                            />
                            {customerId && (
                              <Check className="h-[13px] w-[13px] text-[#4ADE80]" strokeWidth={2.4} />
                            )}
                          </div>
                          {customerPicker && customers.length > 0 && !customerId && (
                            <div
                              className="absolute bottom-full left-0 right-0 mb-[6px] max-h-[160px] overflow-y-auto rounded-[12px] p-[4px] z-10"
                              style={{
                                background: "rgba(20,20,22,0.98)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                backdropFilter: "blur(20px)",
                              }}
                            >
                              {customers
                                .filter(
                                  (c) =>
                                    !customer.trim() ||
                                    c.name.toLowerCase().includes(customer.trim().toLowerCase()),
                                )
                                .slice(0, 6)
                                .map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setCustomer(c.name);
                                      setCustomerId(c.id);
                                      setCustomerPicker(false);
                                    }}
                                    className="w-full text-left px-[10px] py-[8px] rounded-[8px] font-['Geist'] text-[13px] text-white hover:bg-white/[0.05]"
                                  >
                                    {c.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={cobrar}
                        className="mt-[10px] w-full h-[56px] rounded-[18px] flex items-center justify-between px-[20px] active:scale-[0.98] transition-transform disabled:opacity-30"
                        style={{
                          background: "linear-gradient(135deg, #ffffff 0%, #e6e6e6 100%)",
                          boxShadow: canSubmit ? "0 18px 40px -12px rgba(255,255,255,0.18)" : "none",
                        }}
                      >
                        <div className="flex items-center gap-[10px]">
                          <div className="h-[28px] w-[28px] rounded-full bg-black/10 flex items-center justify-center font-['Bai_Jamjuree'] text-[13px] font-bold text-black tabular-nums">
                            {count}
                          </div>
                          <span className="font-['Geist'] text-[14.5px] font-semibold text-black">
                            {saving ? "Registrando…" : mode === "fiar" ? "Registrar fiado" : "Cobrar"}
                          </span>
                        </div>
                        <span className="font-['Bai_Jamjuree'] text-[18px] font-bold text-black tabular-nums">
                          {fmt(subtotal)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          clearCart();
                          setCheckoutOpen(false);
                        }}
                        className="w-full h-[36px] mt-[6px] font-['Geist'] text-[12px] text-white/50 active:text-white"
                      >
                        Vaciar venta
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
