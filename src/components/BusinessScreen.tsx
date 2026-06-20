import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import InventoryView from "./business/InventoryView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";
import FinanceScreen from "./FinanceScreen";
import BusinessHub from "./business/BusinessHub";

type View = "hub" | "inventory" | "payments" | "info" | "finanzas";


const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(0);

/* ---------- alert ---------- */
function StockAlert({ count, onOpen }: { count: number; onOpen: () => void }) {
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full mt-[18px] flex items-center gap-[12px] px-[16px] py-[14px] text-left rounded-[18px] active:bg-white/[0.025] transition-colors"
      style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.18)" }}
    >
      <AlertTriangle className="h-[18px] w-[18px] text-[#F87171] shrink-0" strokeWidth={1.7} />
      <span className="flex-1 font-['Geist'] text-[14.5px] text-white">
        {count} producto{count === 1 ? "" : "s"} por agotarse
      </span>
      <ChevronRight className="h-[16px] w-[16px] text-white/30" strokeWidth={1.6} />
    </button>
  );
}

/* ---------- screen ---------- */
export default function BusinessScreen({ initialView = "hub" }: { initialView?: View } = {}) {
  const [view, setView] = useState<View>(initialView);
  const { productCount, totalValue, lowStock } = useInventory();
  const fin = useFinance();
  const { profile } = useAuth();
  const back = () => setView("hub");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [view]);

  const businessName = profile?.business_name || "Mi negocio";
  const initials = businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "N";

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
            {/* Personalized header */}
            <div className="flex items-center gap-[14px] px-[24px] pt-[26px] pb-[8px]">
              <div
                className="relative h-[52px] w-[52px] rounded-full shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tracking-[-0.5px]">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
                  Tu negocio
                </div>
                <h1 className="mt-[2px] font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.7px] leading-[1.1] truncate">
                  {businessName}
                </h1>
                <p className="mt-[2px] font-['Geist'] text-[12px] text-white/40">
                  Abierto · cierra a las 10 PM
                </p>
              </div>
            </div>

            <div className="px-[20px]">
              <StockAlert count={lowStock.length} onOpen={() => setView("inventory")} />
            </div>


            {/* Insights activos — auto-rotating */}
            <div className="mt-[32px]">
              <div className="px-[20px] mb-[12px]">
                <SectionLabel>Tu negocio hoy</SectionLabel>
              </div>
              <BusinessInsights />
            </div>

            {/* Gestión core */}
            <div className="mt-[32px] px-[20px]">
              <SectionLabel>Gestión</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={Wallet}
                  label="Finanzas"
                  meta={`Neto del mes · S/ ${fmtK(fin.monthNet)}`}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "auto" });
                    setView("finanzas");
                  }}
                />
                <RowDivider />
                <PlainRow
                  Icon={Package}
                  label="Inventario"
                  meta={`${productCount} productos · S/ ${fmtK(totalValue)}`}
                  onClick={() => setView("inventory")}
                />
              </ListGroup>
            </div>

            {/* Configuración — secundario */}
            <div className="mt-[28px] px-[20px]">
              <SectionLabel>Configuración</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={FileText}
                  label="Información"
                  meta="RUC, dirección, horario"
                  onClick={() => setView("info")}
                />
                <RowDivider />
                <PlainRow
                  Icon={CreditCard}
                  label="Métodos de pago"
                  meta="Efectivo · Yape · Plin"
                  onClick={() => setView("payments")}
                />
              </ListGroup>
            </div>

            <FooterMark>{businessName} · Trax</FooterMark>
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
