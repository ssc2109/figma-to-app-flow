import { useState, useMemo } from "react";
import {
  Package,
  Wallet,
  FileText,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  HandCoins,
  Smartphone,
  Calendar,
  Receipt,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import { useAuth } from "@/hooks/useAuth";
import {
  PageHeader,
  SectionLabel,
  ListGroup,
  PlainRow,
  RowDivider,
  FooterMark,
} from "./business/shared";
import InventoryView from "./business/InventoryView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";
import FinanceScreen from "./FinanceScreen";

type View = "hub" | "inventory" | "payments" | "info" | "finanzas";

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(0);
const fmtPct = (n: number) => `${Math.round(n)}%`;

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

/* ---------- insights ---------- */
type Insight = {
  id: string;
  Icon: typeof TrendingUp;
  eyebrow: string;
  value: string;
  unit?: string;
  caption: string;
  tone?: "pos" | "neg" | "neutral";
};

function InsightCard({ ins }: { ins: Insight }) {
  const accent =
    ins.tone === "pos" ? "#4ADE80" : ins.tone === "neg" ? "#F87171" : "rgba(255,255,255,0.55)";
  return (
    <div
      className="snap-center shrink-0 w-[78%] h-[168px] rounded-[22px] p-[18px] flex flex-col justify-between"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-[8px]">
        <ins.Icon className="h-[14px] w-[14px]" strokeWidth={1.8} style={{ color: accent }} />
        <span className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/45">
          {ins.eyebrow}
        </span>
      </div>
      <div className="flex items-baseline gap-[4px] -mb-[2px]">
        {ins.unit === "S/" && (
          <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/40 tracking-[-0.6px]">
            S/
          </span>
        )}
        <span
          className="font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.6px] tabular-nums leading-none"
        >
          {ins.value}
        </span>
        {ins.unit && ins.unit !== "S/" && (
          <span className="font-['Bai_Jamjuree'] text-[18px] font-medium text-white/40 ml-[2px]">
            {ins.unit}
          </span>
        )}
      </div>
      <p className="font-['Geist'] text-[12.5px] leading-[1.4] text-white/55">{ins.caption}</p>
    </div>
  );
}

function InsightsCarousel({ insights }: { insights: Insight[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div
        className="flex gap-[12px] overflow-x-auto snap-x snap-mandatory no-scrollbar px-[20px] -mx-[20px]"
        style={{ scrollPaddingLeft: 20, scrollPaddingRight: 20 }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const cardW = el.children[0]?.clientWidth ?? 1;
          const i = Math.round(el.scrollLeft / (cardW + 12));
          if (i !== active) setActive(i);
        }}
      >
        {insights.map((ins) => (
          <InsightCard key={ins.id} ins={ins} />
        ))}
        <div className="shrink-0 w-[12px]" />
      </div>
      <div className="flex items-center justify-center gap-[5px] mt-[14px]">
        {insights.map((_, i) => (
          <div
            key={i}
            className="h-[4px] rounded-full transition-all"
            style={{
              width: i === active ? 16 : 4,
              background: i === active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.16)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- screen ---------- */
export default function BusinessScreen() {
  const [view, setView] = useState<View>("hub");
  const { productCount, totalValue, totalUnits, lowStock, items } = useInventory();
  const fin = useFinance();
  const { profile } = useAuth();
  const back = () => setView("hub");

  const businessName = profile?.business_name || "Mi negocio";

  const insights = useMemo<Insight[]>(() => {
    // ticket promedio del mes
    const monthIncomeTx = fin.tx.filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      return t.kind === "ingreso" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const ticket = monthIncomeTx.length ? fin.monthIncome / monthIncomeTx.length : 0;

    // % digital (yape/plin/tarjeta) vs efectivo
    const digital = monthIncomeTx
      .filter((t) => t.method && t.method !== "Efectivo")
      .reduce((s, t) => s + t.amount, 0);
    const pctDigital = fin.monthIncome > 0 ? (digital / fin.monthIncome) * 100 : 0;

    // mejor día de la semana (últimos 7)
    const best = [...fin.last7Days].sort((a, b) => b.income - a.income)[0];

    // margen estimado del mes (ingreso - egreso) / ingreso
    const margen = fin.monthIncome > 0 ? (fin.monthNet / fin.monthIncome) * 100 : 0;

    // categoría de inventario con más valor
    const topProduct = [...items].sort((a, b) => b.stock * b.cost - a.stock * a.cost)[0];

    const arr: Insight[] = [
      {
        id: "neto",
        Icon: TrendingUp,
        eyebrow: "Neto del mes",
        value: fmtK(Math.abs(fin.monthNet)),
        unit: "S/",
        caption: fin.monthNet >= 0 ? "Vas en ganancia este mes." : "Estás en pérdida este mes.",
        tone: fin.monthNet >= 0 ? "pos" : "neg",
      },
      {
        id: "ticket",
        Icon: Receipt,
        eyebrow: "Ticket promedio",
        value: fmtK(ticket),
        unit: "S/",
        caption: `${monthIncomeTx.length} ventas registradas este mes.`,
      },
      {
        id: "margen",
        Icon: Target,
        eyebrow: "Margen del mes",
        value: fmtPct(margen),
        caption: margen >= 20 ? "Margen saludable." : "Revisa costos para mejorar margen.",
        tone: margen >= 20 ? "pos" : "neutral",
      },
      {
        id: "digital",
        Icon: Smartphone,
        eyebrow: "Pagos digitales",
        value: fmtPct(pctDigital),
        caption: `${fmtPct(pctDigital)} de tus ventas llegan por Yape, Plin o tarjeta.`,
      },
      {
        id: "best-day",
        Icon: Calendar,
        eyebrow: "Mejor día (7d)",
        value: best?.day?.toUpperCase() ?? "—",
        caption: best ? `S/ ${fmtK(best.income)} vendidos ese día.` : "Aún sin datos.",
      },
      {
        id: "fiados",
        Icon: HandCoins,
        eyebrow: "Por cobrar",
        value: fmtK(fin.fiadosPending),
        unit: "S/",
        caption:
          fin.fiadosPending > 0
            ? `${fin.fiados.filter((f) => !f.settled).length} clientes te deben.`
            : "Sin fiados pendientes.",
        tone: fin.fiadosOverdue > 0 ? "neg" : "neutral",
      },
      {
        id: "stock-value",
        Icon: Package,
        eyebrow: "Valor de inventario",
        value: fmtK(totalValue),
        unit: "S/",
        caption: `${totalUnits} unidades · ${productCount} productos.`,
      },
      {
        id: "top-product",
        Icon: TrendingUp,
        eyebrow: "Mayor stock invertido",
        value: topProduct?.name?.split(" ")[0]?.toUpperCase() ?? "—",
        caption: topProduct
          ? `S/ ${fmtK(topProduct.stock * topProduct.cost)} en ${topProduct.name}.`
          : "Sin productos.",
      },
    ];
    return arr;
  }, [fin, items, totalValue, totalUnits, productCount]);

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
            <PageHeader
              eyebrow={businessName}
              title="Mi Negocio"
              subtitle="Abierto · cierra a las 10 PM"
            />

            <div className="px-[20px]">
              <StockAlert count={lowStock.length} onOpen={() => setView("inventory")} />
            </div>

            {/* Insights activos */}
            <div className="mt-[32px]">
              <div className="px-[20px] mb-[14px]">
                <SectionLabel>Tu negocio hoy</SectionLabel>
              </div>
              <div className="pl-[20px]">
                <InsightsCarousel insights={insights} />
              </div>
            </div>

            {/* Gestión core */}
            <div className="mt-[36px] px-[20px]">
              <SectionLabel>Gestión</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={Wallet}
                  label="Finanzas"
                  meta={`Neto del mes · S/ ${fmtK(fin.monthNet)}`}
                  onClick={() => setView("finanzas")}
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
