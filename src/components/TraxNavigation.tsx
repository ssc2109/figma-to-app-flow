import { useEffect, useMemo, useState } from "react";
import Container from "@/imports/Container/Container";
import HtmlBody from "@/imports/HtmlBody/HtmlBody";
import BottomNavBar from "@/imports/BottomNavBar/BottomNavBar";
import CheckoutModal from "@/components/CheckoutModal";
import Grainient from "@/components/Grainient.jsx";
import BusinessScreen from "@/components/BusinessScreen";
import { InventoryProvider } from "@/data/inventory";
import { PRODUCTS_BY_ID } from "@/data/products";
import { ScreenTransition } from "@/components/motion/ScreenTransition";
import { AppSkeleton } from "@/components/motion/AppSkeleton";
import { AnimatePresence, motion } from "motion/react";


type Screen = "inicio" | "ventas" | "negocio" | "crecer";

const DELIVERY_FEE = 2.5;

export default function TraxNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("inicio");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 700);
    return () => clearTimeout(t);
  }, []);

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
    <InventoryProvider>
    <div className="min-h-screen bg-black relative">
      {currentScreen === "inicio" && (
        <div
          className="fixed top-0 left-0 right-0 h-[55vh] z-0 pointer-events-none overflow-hidden"
          style={{
            maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
          }}
        >
          <Grainient
            color1="#000000"
            color2="#3c58f3"
            color3="#97accf"
            timeSpeed={0.25}
            colorBalance={0.01}
            warpStrength={2.8}
            warpFrequency={5.4}
            warpSpeed={4}
            warpAmplitude={50}
            blendAngle={9}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0.08}
            zoom={0.9}
          />
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-[430px] pb-[140px]">
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
        {currentScreen === "negocio" && <BusinessScreen />}
        {currentScreen === "crecer" && (
          <div className="px-[20px] pt-[80px] text-center">
            <h1 className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.6px]">
              Crecer
            </h1>
            <p className="mt-[8px] font-['Geist'] text-[13.5px] text-white/55">
              Próximamente: campañas, descuentos y métricas para hacer crecer tu negocio.
            </p>
          </div>
        )}
      </div>


      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
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
    </InventoryProvider>
  );
}


