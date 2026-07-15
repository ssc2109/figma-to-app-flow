import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Truck, FileBadge, UserCog } from "lucide-react";
import InventoryView from "./business/InventoryView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";
import ClientsView from "./business/ClientsView";
import DebtsView from "./business/DebtsView";
import ComingSoonView from "./business/ComingSoonView";
import BusinessHub from "./business/BusinessHub";
import CatalogView from "./business/CatalogView";
import PurchasesView from "./business/PurchasesView";
import CalendarView from "./business/CalendarView";
import CashActivityView from "./business/CashActivityView";
import UpgradeGate from "./business/UpgradeGate";
import { usePlan } from "@/hooks/usePlan";

type View =
  | "hub"
  | "inventory"
  | "payments"
  | "info"
  | "clients"
  | "receivables"
  | "payables"
  | "suppliers"
  | "documents"
  | "team"
  | "catalog"
  | "purchases"
  | "calendar"
  | "cashHistory";

const COMING: Record<
  Exclude<
    View,
    | "hub" | "inventory" | "payments" | "info" | "clients" | "receivables" | "payables"
    | "catalog" | "purchases" | "calendar" | "cashHistory"
  >,
  { title: string; icon: any; description: string; bullets: string[] }
> = {
  suppliers: {
    title: "Proveedores",
    icon: Truck,
    description: "Pronto podrás registrar a quién le compras, condiciones y comparar precios para mejorar tu margen.",
    bullets: ["Registrar proveedores y contactos", "Historial de compras", "Alertas de mejores precios"],
  },
  documents: {
    title: "Documentos",
    icon: FileBadge,
    description: "Guarda RUC, licencias y permisos en un solo lugar para tener tu negocio en regla.",
    bullets: ["Guardar RUC y licencias", "Recordatorios de vencimiento", "Compartir con tu contador"],
  },
  team: {
    title: "Equipo",
    icon: UserCog,
    description: "Suma a las personas que te ayudan en el negocio y controla sus permisos y horarios.",
    bullets: ["Invitar a empleados", "Definir roles y permisos", "Asistencia y horarios"],
  },
};

type BusinessScreenProps = {
  initialView?: View;
  onNewSale: () => void;
  onNewExpense: () => void;
  onOpenPlans?: () => void;
};

export default function BusinessScreen({
  initialView = "hub",
  onNewSale,
  onNewExpense,
  onOpenPlans,
}: BusinessScreenProps) {
  const [view, setView] = useState<View>(initialView);
  const back = () => setView("hub");
  const { limits } = usePlan();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [view]);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div key="hub"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}>
            <BusinessHub
              onInfo={() => setView("info")}
              onInventory={() => setView("inventory")}
              onPayments={() => setView("payments")}
              onClients={() => setView("clients")}
              onReceivables={() => setView("receivables")}
              onPayables={() => setView("payables")}
              onSuppliers={() => setView("suppliers")}
              onDocuments={() => setView("documents")}
              onTeam={() => setView("team")}
              onCatalog={() => setView("catalog")}
              onPurchases={() => setView("purchases")}
              onCalendar={() => setView("calendar")}
              onCashHistory={() => setView("cashHistory")}
              onNewSale={onNewSale}
              onNewExpense={onNewExpense}
            />
          </motion.div>
        )}

        {view === "inventory" && <InventoryView key="inventory" onBack={back} />}
        {view === "payments" && <PaymentsView key="payments" onBack={back} />}
        {view === "info" && <InfoView key="info" onBack={back} />}
        {view === "clients" && <ClientsView key="clients" onBack={back} />}
        {view === "receivables" && <DebtsView key="receivables" onBack={back} initialKind="cobrar" lockKind />}
        {view === "payables" && <DebtsView key="payables" onBack={back} initialKind="pagar" lockKind />}
        {view === "catalog" && <CatalogView key="catalog" onBack={back} />}
        {view === "purchases" && (
          limits.hasSupplierPurchases ? (
            <PurchasesView key="purchases" onBack={back} />
          ) : (
            <UpgradeGate
              key="purchases-gate"
              title="Compras a proveedores"
              eyebrow="Función Pro"
              onBack={back}
              onUpgrade={onOpenPlans}
              message="Registra a tus proveedores, controla lo que compras y mejora tus márgenes. Disponible desde el plan Pro."
              requiredPlan="Pro"
            />
          )
        )}
        {view === "calendar" && (
          limits.hasCalendarAgenda ? (
            <CalendarView key="calendar" onBack={back} />
          ) : (
            <UpgradeGate
              key="calendar-gate"
              title="Calendario y agenda"
              eyebrow="Función Pro"
              onBack={back}
              onUpgrade={onOpenPlans}
              message="Organiza pagos, cobros, pedidos y recordatorios en un solo lugar. Disponible desde el plan Pro."
              requiredPlan="Pro"
            />
          )
        )}
        {view === "cashHistory" && <CashActivityView key="cashHistory" onBack={back} />}

        {(view === "suppliers" || view === "documents" || view === "team") && (
          <ComingSoonView key={view} onBack={back} {...COMING[view]} />
        )}
      </AnimatePresence>
    </div>
  );
}
