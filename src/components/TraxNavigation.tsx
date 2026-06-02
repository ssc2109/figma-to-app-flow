import { useState } from "react";
import Container from "@/imports/Container/Container";
import HtmlBody from "@/imports/HtmlBody/HtmlBody";
import BottomNavBar from "@/imports/BottomNavBar/BottomNavBar";
import CheckoutModal from "@/components/CheckoutModal";

type Screen = "inicio" | "ventas" | "negocio" | "crecer";

export default function TraxNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("inicio");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="size-full bg-black overflow-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mx-auto w-full max-w-[430px] pb-[80px]">
        {currentScreen === "inicio" && <Container />}
        {currentScreen === "ventas" && <HtmlBody onOpenCart={() => setCartOpen(true)} />}
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[80px] z-50">
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setCartOpen(false);
            setCurrentScreen(s);
          }}
        />
      </div>

      {cartOpen && <CheckoutModal onClose={() => setCartOpen(false)} />}
    </div>
  );
}
