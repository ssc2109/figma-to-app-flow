import { useEffect, useState } from "react";
import Container from "@/imports/Container/Container";
import BottomNavBar, { type Screen } from "@/imports/BottomNavBar/BottomNavBar";
import Grainient from "@/components/Grainient.jsx";
import BusinessScreen from "@/components/BusinessScreen";
import GrowScreen from "@/components/GrowScreen";
import MeScreen from "@/components/MeScreen";
import SociaScreen from "@/components/SociaScreen";
import SalesOverlay from "@/components/SalesOverlay";
import ExpenseOverlay from "@/components/ExpenseOverlay";
import ScanScreen from "@/components/ScanScreen";
import QuickActionsScreen from "@/components/QuickActionsScreen";
import AuthScreen from "@/components/AuthScreen";
import OnboardingFlow from "@/components/OnboardingFlow";
import SettingsScreen from "@/components/SettingsScreen";
import PlansScreen from "@/components/PlansScreen";
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
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [negocioInitialView, setNegocioInitialView] = useState<"hub" | "receivables">("hub");
  const [sociaPrompt, setSociaPrompt] = useState<string | undefined>(undefined);
  const { setHandler } = useQuickActions();

  const goToInventory = () => {
    setNegocioInitialView("hub");
    setCurrentScreen("negocio");
  };

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
          setScanOpen(true);
          break;
        case "registrar_gasto":
          setExpenseOpen(true);
          break;
        case "cobrar_fiado":
          setNegocioInitialView("receivables");
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
    <div className="min-h-screen bg-black relative">
      <div
        className={`relative z-10 mx-auto w-full max-w-[430px] ${
          currentScreen === "socia" ? "pb-0" : "pb-[140px]"
        }`}
      >
        {booting ? (
          <AppSkeleton />
        ) : (
          <ScreenTransition screenKey={currentScreen}>
            {currentScreen === "inicio" && (
              <Container
                onSeeAllActions={() => setQuickActionsOpen(true)}
                onSeeAllActivity={() => {
                  setNegocioInitialView("receivables");
                  setCurrentScreen("negocio");
                }}
                onOpenSettings={() => setSettingsOpen(true)}
                onIntent={(intent) => {
                  if (intent.kind === "chat") {
                    setSociaPrompt(intent.prompt);
                    setCurrentScreen("socia");
                  } else if (intent.kind === "sales") {
                    setSalesOpen(true);
                  } else if (intent.kind === "reponer") {
                    setCurrentScreen("negocio");
                  } else if (intent.kind === "screen") {
                    if (intent.screen === "negocio" && intent.subview === "finanzas") {
                      setNegocioInitialView("receivables");
                    }
                    setCurrentScreen(intent.screen);
                  }
                }}
              />
            )}

            {currentScreen === "negocio" && (
              <BusinessScreen
                key={negocioInitialView}
                initialView={negocioInitialView}
                onNewSale={() => setSalesOpen(true)}
                onNewExpense={() => setExpenseOpen(true)}
                onOpenPlans={() => setPlansOpen(true)}
              />
            )}
            {currentScreen === "socia" && (
              <SociaScreen initialPrompt={sociaPrompt} />
            )}
            {currentScreen === "yo" && <MeScreen />}
            {currentScreen === "crecer" && <GrowScreen />}
          </ScreenTransition>
        )}

      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(s) => {
            setSalesOpen(false);
            setExpenseOpen(false);
            setScanOpen(false);
            setQuickActionsOpen(false);
            window.scrollTo({ top: 0, behavior: "auto" });
            if (s === "negocio") setNegocioInitialView("hub");
            if (s !== "socia") setSociaPrompt(undefined);
            setCurrentScreen(s);
          }}
        />
      </div>

      <SalesOverlay open={salesOpen} onClose={() => setSalesOpen(false)} />
      <ExpenseOverlay open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <ScanScreen open={scanOpen} onClose={() => setScanOpen(false)} onOpenInventory={goToInventory} />
      <QuickActionsScreen open={quickActionsOpen} onClose={() => setQuickActionsOpen(false)} />
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            key="settings-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[430px] min-h-screen">
              <SettingsScreen
                onBack={() => setSettingsOpen(false)}
                onOpenPlans={() => setPlansOpen(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {plansOpen && (
          <motion.div
            key="plans-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[430px] min-h-screen">
              <PlansScreen onBack={() => setPlansOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
