import { useEffect, useState } from "react";
import Container from "@/imports/Container/Container";
import BottomNavBar, { type Screen } from "@/imports/BottomNavBar/BottomNavBar";
import Grainient from "@/components/Grainient.jsx";
import BusinessScreen from "@/components/BusinessScreen";
import GrowScreen from "@/components/GrowScreen";
import MeScreen from "@/components/MeScreen";
import SociaScreen from "@/components/SociaScreen";
import SalesOverlay from "@/components/SalesOverlay";
import QuickActionsScreen from "@/components/QuickActionsScreen";
import AuthScreen from "@/components/AuthScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import { InventoryProvider } from "@/data/inventory";
import { FinanceProvider } from "@/data/finance";
import { MeProvider } from "@/data/me";
import { QuickActionsProvider, useQuickActions, type ActionId } from "@/data/quickActions";
import { ScreenTransition } from "@/components/motion/ScreenTransition";
import { AppSkeleton } from "@/components/motion/AppSkeleton";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";


function NavShell() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("inicio");
  const [booting, setBooting] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [negocioInitialView, setNegocioInitialView] = useState<"hub" | "finanzas">("hub");
  const { setHandler } = useQuickActions();

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 700);
    return () => clearTimeout(t);
  }, []);

  // wire quick action handlers
  useEffect(() => {
    setHandler((id: ActionId) => {
      switch (id) {
        case "venta":
        case "cobrar":
        case "fiar":
          setSalesOpen(true);
          break;
        case "escanear":
          // placeholder — could open scanner; for now open sales
          setSalesOpen(true);
          break;
        case "registrar_gasto":
        case "cobrar_fiado":
          setCurrentScreen("negocio");
          break;
        case "reponer_stock":
        case "nuevo_producto":
          setCurrentScreen("negocio");
          break;
        case "promocion":
          setCurrentScreen("crecer");
          break;
        case "pedir_proveedor":
          setCurrentScreen("crecer");
          break;
      }
    });
  }, [setHandler]);

  return (
    <div
      className={`bg-black relative ${
        currentScreen === "socia" ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
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
      <div
        className={`relative z-10 mx-auto w-full max-w-[430px] ${
          currentScreen === "socia" ? "h-[100dvh] overflow-hidden" : "pb-[140px]"
        }`}
      >
        <AnimatePresence mode="wait">
          {booting ? (
            <motion.div
              key="boot"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.3 }}
            >
              <AppSkeleton />
            </motion.div>
          ) : (
            <ScreenTransition key={currentScreen} screenKey={currentScreen}>
              {currentScreen === "inicio" && (
                <Container
                  onSeeAllActions={() => setQuickActionsOpen(true)}
                  onSeeAllActivity={() => {
                    setNegocioInitialView("finanzas");
                    setCurrentScreen("negocio");
                  }}
                />
              )}
              {currentScreen === "negocio" && (
                <BusinessScreen
                  key={negocioInitialView}
                  initialView={negocioInitialView}
                />
              )}
              {currentScreen === "socia" && <SociaScreen />}
              {currentScreen === "yo" && <MeScreen />}
              {currentScreen === "crecer" && <GrowScreen />}
            </ScreenTransition>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setSalesOpen(false);
            setQuickActionsOpen(false);
            window.scrollTo({ top: 0, behavior: "auto" });
            if (s === "negocio") setNegocioInitialView("hub");
            setCurrentScreen(s);
          }}
        />
      </div>

      <SalesOverlay open={salesOpen} onClose={() => setSalesOpen(false)} />
      <QuickActionsScreen open={quickActionsOpen} onClose={() => setQuickActionsOpen(false)} />
    </div>
  );
}

function AuthGate() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40 text-sm font-['Geist']">Cargando…</div>
      </div>
    );
  }
  if (!session) return <AuthScreen />;
  if (profile && !profile.onboarding_done) return <OnboardingFlow />;

  return (
    <InventoryProvider>
      <FinanceProvider>
        <MeProvider>
          <QuickActionsProvider>
            <NavShell />
          </QuickActionsProvider>
        </MeProvider>
      </FinanceProvider>
    </InventoryProvider>
  );
}

export default function TraxNavigation() {
  return (
    <AuthProvider>
      <AuthGate />
      <Toaster />
    </AuthProvider>
  );
}

