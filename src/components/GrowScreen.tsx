import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ExternalLink } from "lucide-react";
import { PageHeader, SectionLabel, ListGroup, FooterMark } from "./business/shared";

/* ---------- types ---------- */
type Opportunity = {
  id: string;
  category: "tendencia" | "financiamiento" | "capacitacion" | "evento" | "proveedor" | "marketing";
  title: string;
  meta: string;
  body: string;
  cta: string;
  featured?: boolean;
};

const CATEGORY_LABEL: Record<Opportunity["category"], string> = {
  tendencia: "Tendencia",
  financiamiento: "Financiamiento",
  capacitacion: "Capacitación",
  evento: "Evento",
  proveedor: "Proveedor",
  marketing: "Marketing",
};

const OPPS: Opportunity[] = [
  {
    id: "o1",
    category: "tendencia",
    title: "Helados y bebidas frías subieron 32% en bodegas de SJL",
    meta: "Esta semana",
    body: "Pide hielo y refrescos extra. Las bodegas de tu zona reportan quiebres de stock de Inca Kola 1L y agua San Luis los fines de semana.",
    cta: "Ver productos en alza",
    featured: true,
  },
  {
    id: "o2",
    category: "evento",
    title: "Feria del barrio en Plaza Cívica SJL",
    meta: "Sábado 14 · 9 AM - 8 PM",
    body: "Más de 2,000 vecinos pasarán por tu zona. Bodegas cercanas reportaron 40-60% más ventas en días de feria.",
    cta: "Recordar y preparar",
  },
  {
    id: "o3",
    category: "financiamiento",
    title: "Mi Crédito Bodeguero — Caja Arequipa",
    meta: "Hasta S/ 5,000",
    body: "Crédito sin garante para bodegueros con 6+ meses. Tu nivel y movimiento en Trax te califican para el tramo Plata.",
    cta: "Ver requisitos",
  },
  {
    id: "o4",
    category: "capacitacion",
    title: "Vende más por WhatsApp Business",
    meta: "PRODUCE · curso gratis",
    body: "Aprende a usar catálogo, etiquetas y respuestas rápidas. 92% de bodegueros aumentaron pedidos a domicilio tras el curso.",
    cta: "Inscribirme",
  },
  {
    id: "o5",
    category: "marketing",
    title: "Tu primera promoción de fin de semana",
    meta: "Plantilla lista",
    body: "2 Inca Kola + 1 papitas Lay's por S/ 12. Trax ya armó el flyer con tus precios. Solo tienes que enviarlo.",
    cta: "Personalizar",
  },
  {
    id: "o6",
    category: "proveedor",
    title: "Distribuidora Andina llega a tu zona",
    meta: "Reparto martes y viernes",
    body: "Precios mayoristas en abarrotes y limpieza. 8 bodegueros de SJL ya cambiaron y reportan 12% menos de costo.",
    cta: "Ver catálogo",
  },
  {
    id: "o7",
    category: "evento",
    title: "Día del Padre — domingo en 9 días",
    meta: "Pico esperado",
    body: "Histórico del barrio: las bodegas suben 22% de ventas el sábado y domingo. Sube stock de chocolates y bebidas grandes.",
    cta: "Planificar pedido",
  },
];

/* ---------- screen ---------- */
export default function GrowScreen() {
  const [active, setActive] = useState<Opportunity | null>(null);
  const featured = OPPS.find((o) => o.featured) ?? OPPS[0];
  const rest = OPPS.filter((o) => o.id !== featured.id);

  return (
    <div className="relative w-full">
      <PageHeader
        eyebrow="Lo que pasa afuera"
        title="Crecer"
        subtitle="Una oportunidad por día, no diez al mismo tiempo."
      />

      <div className="px-[20px] mt-[24px]">
        <FeaturedCard opp={featured} onOpen={() => setActive(featured)} />
      </div>

      <div className="px-[20px] mt-[36px]">
        <SectionLabel>Más para revisar</SectionLabel>
        <ListGroup>
          {rest.map((o, i) => (
            <div key={o.id}>
              <button
                type="button"
                onClick={() => setActive(o)}
                className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/35">
                    {CATEGORY_LABEL[o.category]}
                  </div>
                  <div className="mt-[3px] font-['Geist'] text-[14.5px] text-white leading-[1.3] line-clamp-2">
                    {o.title}
                  </div>
                </div>
                <ChevronRight className="h-[16px] w-[16px] text-white/25 shrink-0" strokeWidth={1.6} />
              </button>
              {i < rest.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
            </div>
          ))}
        </ListGroup>
      </div>

      <FooterMark>Lo que pasa fuera, llega antes a ti</FooterMark>

      <AnimatePresence>
        {active && <OppSheet opp={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ---------- pieces ---------- */
function FeaturedCard({ opp, onOpen }: { opp: Opportunity; onOpen: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onOpen}
      className="w-full rounded-[24px] overflow-hidden text-left"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="p-[22px] flex flex-col gap-[14px]">
        <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
          Hoy · {CATEGORY_LABEL[opp.category]}
        </div>
        <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white leading-[1.2] tracking-[-0.4px]">
          {opp.title}
        </h2>
        <p className="font-['Geist'] text-[13.5px] text-white/55 leading-[1.55]">{opp.body}</p>
        <div className="flex items-center gap-[6px] mt-[2px] font-['Geist'] text-[13px] text-white">
          <span>{opp.cta}</span>
          <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.8} />
        </div>
      </div>
    </motion.button>
  );
}

function OppSheet({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative w-full max-w-[430px] max-h-[80vh] rounded-t-[28px] overflow-hidden flex flex-col"
        style={{
          background: "rgba(14,14,16,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="px-[24px] pt-[14px] pb-[18px]">
          <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[16px]" />
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              {CATEGORY_LABEL[opp.category]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
              aria-label="Cerrar"
            >
              <X className="h-[16px] w-[16px] text-white/55" strokeWidth={1.6} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] pb-[8px] flex flex-col gap-[16px]">
          <h2 className="font-['Bai_Jamjuree'] text-[24px] font-semibold text-white tracking-[-0.5px] leading-[1.2]">
            {opp.title}
          </h2>
          <div className="font-['Geist'] text-[12.5px] text-white/45">{opp.meta}</div>
          <p className="font-['Geist'] text-[14.5px] text-white/80 leading-[1.6]">{opp.body}</p>
        </div>
        <div className="p-[20px] pt-[14px]">
          <button
            type="button"
            className="w-full h-[52px] rounded-full bg-white text-black font-['Geist'] text-[15px] font-semibold flex items-center justify-center gap-[8px] active:scale-[0.98] transition-transform"
          >
            {opp.cta}
            <ExternalLink className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
