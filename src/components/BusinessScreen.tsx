import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import InventoryView from "./business/InventoryView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";
import FinanceScreen from "./FinanceScreen";
import BusinessHub from "./business/BusinessHub";

type View = "hub" | "inventory" | "payments" | "info" | "finanzas";

/* ---------- screen ---------- */
export default function BusinessScreen({ initialView = "hub" }: { initialView?: View } = {}) {
  const [view, setView] = useState<View>(initialView);
  const back = () => setView("hub");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [view]);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <BusinessHub
              onInfo={() => setView("info")}
              onInventory={() => setView("inventory")}
              onPayments={() => setView("payments")}
              onFinanzas={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                setView("finanzas");
              }}
            />
          </motion.div>
        )}



        {view === "inventory" && <InventoryView key="inventory" onBack={back} />}
        {view === "payments" && <PaymentsView key="payments" onBack={back} />}
        {view === "info" && <InfoView key="info" onBack={back} />}
        {view === "finanzas" && (
          <motion.div
            key="finanzas"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-[20px] pt-[22px] pb-[2px]">
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-[4px] h-[34px] pl-[6px] pr-[12px] -ml-[6px] rounded-full active:bg-white/[0.05] transition-colors"
              >
                <ChevronLeft className="h-[18px] w-[18px] text-white/75" strokeWidth={1.8} />
                <span className="font-['Geist'] text-[13.5px] text-white/75">Mi Negocio</span>
              </button>
            </div>
            <FinanceScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
