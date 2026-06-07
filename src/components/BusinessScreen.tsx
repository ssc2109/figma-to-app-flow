import { useState } from "react";
import {
  Pencil,
  MapPin,
  Store,
  Package,
  Users,
  Wallet,
  FileText,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInventory } from "@/data/inventory";
import { GlassCard, Eyebrow } from "./business/shared";
import InventoryView from "./business/InventoryView";
import TeamView from "./business/TeamView";
import PaymentsView from "./business/PaymentsView";
import InfoView from "./business/InfoView";

type View = "hub" | "inventory" | "team" | "payments" | "info";

const fmtSoles = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(0);

/* ---------- hub pieces ---------- */

function PageHeader() {
  return (
    <div className="flex items-center justify-between px-[20px] pt-[18px] pb-[8px]">
      <div className="flex flex-col">
        <span className="font-['Geist'] text-[12px] uppercase tracking-[1.4px] text-white/45">
          Tu tienda
        </span>
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.6px]">
          Mi Negocio
        </h1>
      </div>
    </div>
  );
}

function IdentityCard() {
  return (
    <GlassCard>
      <div className="p-[18px] flex items-start gap-[14px]">
        <div
          className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Store className="h-[24px] w-[24px] text-white" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px]">
            <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.4px] truncate">
              Bodega Ecoarom
            </h3>
          </div>
          <div className="mt-[2px] flex items-center gap-[8px]">
            <span
              className="inline-flex items-center gap-[5px] rounded-full px-[8px] py-[2px]"
              style={{
                background: "rgba(74,222,128,0.10)",
                border: "1px solid rgba(74,222,128,0.25)",
              }}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-[#4ADE80]" />
              <span className="font-['Geist'] text-[10px] font-medium uppercase tracking-[0.6px] text-[#4ADE80]">
                Abierto
              </span>
            </span>
            <span className="font-['Geist'] text-[11.5px] text-white/50">Hasta 10:00 PM</span>
          </div>
          <div className="mt-[8px] flex items-center gap-[6px] text-white/55">
            <MapPin className="h-[12px] w-[12px]" strokeWidth={1.8} />
            <span className="font-['Geist'] text-[12.5px] truncate">
              Av. Los Próceres 142, SJL
            </span>
          </div>
        </div>
        <button
          type="button"
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95"
          aria-label="Editar negocio"
        >
          <Pencil className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
        </button>
      </div>
    </GlassCard>
  );
}

function CriticalAlert({ count, onOpen }: { count: number; onOpen: () => void }) {
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full relative rounded-[20px] overflow-hidden active:scale-[0.99] transition-transform text-left"
      style={{
        background: "linear-gradient(180deg, rgba(248,113,113,0.10), rgba(248,113,113,0.04))",
        border: "1px solid rgba(248,113,113,0.22)",
      }}
    >
      <div className="p-[14px] flex items-center gap-[12px]">
        <div
          className="h-[40px] w-[40px] rounded-full flex items-center justify-center"
          style={{
            background: "rgba(248,113,113,0.14)",
            border: "1px solid rgba(248,113,113,0.30)",
          }}
        >
          <AlertTriangle className="h-[16px] w-[16px] text-[#F87171]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[13.5px] font-medium text-white">
            {count} producto{count === 1 ? "" : "s"} por agotarse
          </div>
          <div className="font-['Geist'] text-[11.5px] text-white/55 mt-[1px]">
            Toca para reponer stock
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/45" strokeWidth={1.8} />
      </div>
    </button>
  );
}

function NavRow({
  Icon,
  title,
  meta,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-[14px] p-[14px] active:bg-white/[0.03] transition-colors"
    >
      <div
        className="h-[40px] w-[40px] rounded-[12px] flex items-center justify-center shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Icon className="h-[16px] w-[16px] text-white/85" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="font-['Geist'] text-[14.5px] font-medium text-white truncate">{title}</div>
        <div className="font-['Geist'] text-[12px] text-white/50 mt-[1px] truncate">{meta}</div>
      </div>
      <ChevronRight className="h-[16px] w-[16px] text-white/30" strokeWidth={1.8} />
    </button>
  );
}

/* ---------- screen ---------- */

export default function BusinessScreen() {
  const [view, setView] = useState<View>("hub");
  const { productCount, totalValue, totalUnits, lowStock } = useInventory();

  const back = () => setView("hub");

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader />
            <div className="flex flex-col gap-[18px] px-[20px] pt-[8px]">
              <IdentityCard />
              <CriticalAlert count={lowStock.length} onOpen={() => setView("inventory")} />

              <div className="flex flex-col gap-[10px]">
                <Eyebrow>Gestionar</Eyebrow>
                <GlassCard>
                  <div className="flex flex-col">
                    <NavRow
                      Icon={Package}
                      title="Inventario"
                      meta={`${productCount} productos · ${totalUnits} unidades · S/ ${fmtSoles(totalValue)}`}
                      onClick={() => setView("inventory")}
                    />
                    <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
                    <NavRow
                      Icon={Wallet}
                      title="Métodos de pago"
                      meta="Efectivo · Yape · Plin"
                      onClick={() => setView("payments")}
                    />
                    <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
                    <NavRow
                      Icon={Users}
                      title="Equipo"
                      meta="3 personas con acceso"
                      onClick={() => setView("team")}
                    />
                    <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
                    <NavRow
                      Icon={FileText}
                      title="Información"
                      meta="RUC, dirección y horario"
                      onClick={() => setView("info")}
                    />
                  </div>
                </GlassCard>
              </div>

              <p className="font-['Geist'] text-[11.5px] text-white/35 text-center pt-[6px]">
                Trax · Tu bodega, ordenada
              </p>
            </div>
          </motion.div>
        )}

        {view === "inventory" && <InventoryView key="inventory" onBack={back} />}
        {view === "team" && <TeamView key="team" onBack={back} />}
        {view === "payments" && <PaymentsView key="payments" onBack={back} />}
        {view === "info" && <InfoView key="info" onBack={back} />}
      </AnimatePresence>
    </div>
  );
}
