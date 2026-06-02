import { useState } from "react";
import Container from "@/imports/Container/Container";
import HtmlBody from "@/imports/HtmlBody/HtmlBody";
import HtmlBodyCart from "@/imports/HtmlBodyCart/HtmlBodyCart";
import BottomNavBar from "@/imports/BottomNavBar/BottomNavBar";

type Screen = "inicio" | "ventas" | "negocio" | "crecer";

export default function TraxNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("inicio");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="size-full bg-black overflow-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mx-auto w-full max-w-[430px] pb-[180px]">
        {currentScreen === "inicio" && <Container />}
        {currentScreen === "ventas" && !cartOpen && (
          <HtmlBody onOpenCart={() => setCartOpen(true)} />
        )}
        {currentScreen === "ventas" && cartOpen && <HtmlBodyCart />}
      </div>

      <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] h-[80px] z-50">
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setCartOpen(false);
            setCurrentScreen(s);
          }}
        />
      </div>
    </div>
  );
}
