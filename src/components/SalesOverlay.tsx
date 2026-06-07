import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import HtmlBody from "@/imports/HtmlBody/HtmlBody";
import CheckoutModal from "@/components/CheckoutModal";
import { PRODUCTS_BY_ID } from "@/data/products";

const DELIVERY_FEE = 2.5;

export default function SalesOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const updateQty = (id: string, delta: number) =>
    setCart((c) => {
      const next = (c[id] ?? 0) + delta;
      const copy = { ...c };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  const removeItem = (id: string) =>
    setCart((c) => {
      const copy = { ...c };
      delete copy[id];
      return copy;
    });

  const { count, subtotal, items } = useMemo(() => {
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const p = PRODUCTS_BY_ID[id];
        if (!p) return null;
        return { ...p, qty };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return {
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      items,
    };
  }, [cart]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] bg-black"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto w-full max-w-[430px] h-full overflow-y-auto pb-[40px] relative">
            <button
              type="button"
              onClick={onClose}
              className="fixed top-[18px] right-[16px] z-[78] h-[40px] w-[40px] rounded-full flex items-center justify-center active:scale-95"
              style={{
                background: "rgba(20,20,22,0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              aria-label="Cerrar venta"
            >
              <X className="h-[16px] w-[16px] text-white" strokeWidth={1.9} />
            </button>
            <HtmlBody
              onOpenCart={() => count > 0 && setCartOpen(true)}
              cart={cart}
              onAdd={addToCart}
              onRemove={removeItem}
              count={count}
              subtotal={subtotal}
            />
          </div>
          {cartOpen && (
            <CheckoutModal
              items={items}
              subtotal={subtotal}
              deliveryFee={DELIVERY_FEE}
              onChangeQty={updateQty}
              onRemove={removeItem}
              onClose={() => setCartOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
