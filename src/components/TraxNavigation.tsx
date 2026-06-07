import { useMemo, useState } from "react";
import Container from "@/imports/Container/Container";
import HtmlBody from "@/imports/HtmlBody/HtmlBody";
import BottomNavBar from "@/imports/BottomNavBar/BottomNavBar";
import CheckoutModal from "@/components/CheckoutModal";
import { PRODUCTS_BY_ID } from "@/data/products";

type Screen = "inicio" | "ventas" | "negocio" | "crecer";

const DELIVERY_FEE = 2.5;

export default function TraxNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("inicio");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

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
    const entries = Object.entries(cart);
    const items = entries
      .map(([id, qty]) => {
        const p = PRODUCTS_BY_ID[id];
        if (!p) return null;
        return { ...p, qty };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { count, subtotal, items };
  }, [cart]);

  return (
    <div className="fixed inset-0 bg-black glass-bg overflow-hidden">
      <div className="absolute inset-0 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto w-full max-w-[430px] pb-[120px]">
          {currentScreen === "inicio" && <Container />}
          {currentScreen === "ventas" && (
            <HtmlBody
              onOpenCart={() => count > 0 && setCartOpen(true)}
              cart={cart}
              onAdd={addToCart}
              onRemove={removeItem}
              count={count}
              subtotal={subtotal}
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setCartOpen(false);
            setCurrentScreen(s);
          }}
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
    </div>
  );
}

