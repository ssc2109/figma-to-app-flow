import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Truck, Megaphone, FileBadge, UserCog } from "lucide-react";
import InventoryView from "./business/InventoryView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";
import ClientsView from "./business/ClientsView";
import DebtsView from "./business/DebtsView";
import ComingSoonView from "./business/ComingSoonView";
import BusinessHub from "./business/BusinessHub";

type View =
  | "hub"
  | "inventory"
  | "payments"
  | "info"
  | "clients"
  | "receivables"
  | "payables"
  | "suppliers"
  | "channels"
  | "documents"
  | "team";

const COMING: Record<
  Exclude<View, "hub" | "inventory" | "payments" | "info" | "clients" | "receivables" | "payables">,
  { title: string; icon: any; description: string; bullets: string[] }
> = {
  suppliers: {
    title: "Proveedores",
    icon: Truck,
    description: "Pronto podrás registrar a quién le compras, condiciones y comparar precios para mejorar tu margen.",
    bullets: ["Registrar proveedores y contactos", "Historial de compras", "Alertas de mejores precios"],
  },
  channels: {
    title: "Canales de venta",
    icon: Megaphone,
    description: "Conecta tu tienda, delivery, redes y WhatsApp para centralizar pedidos en un solo lugar.",
    bullets: ["Pedidos por WhatsApp", "Catálogo público compartible", "Integración con delivery"],
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
              onChannels={() => setView("channels")}
              onDocuments={() => setView("documents")}
              onTeam={() => setView("team")}
            />
          </motion.div>
        )}

        {view === "inventory" && <InventoryView key="inventory" onBack={back} />}
        {view === "payments" && <PaymentsView key="payments" onBack={back} />}
        {view === "info" && <InfoView key="info" onBack={back} />}
        {view === "clients" && <ClientsView key="clients" onBack={back} />}
        {view === "receivables" && <DebtsView key="receivables" onBack={back} initialKind="cobrar" lockKind />}
        {view === "payables" && <DebtsView key="payables" onBack={back} initialKind="pagar" lockKind />}

        {(view === "suppliers" || view === "channels" || view === "documents" || view === "team") && (
          <ComingSoonView key={view} onBack={back} {...COMING[view]} />
        )}
      </AnimatePresence>
    </div>
  );
}
