import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ExternalLink, TrendingUp, Building2, Sprout, ArrowRight } from "lucide-react";
import { PageHeader, SectionLabel, ListGroup, FooterMark } from "./business/shared";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";

/* ---------- opportunity types ---------- */
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

/* ---------- credit product types ---------- */
type CreditProduct = {
  id: string;
  institution: string;
  logo: string;
  product: string;
  maxAmount: number;
  minMonths: number;
  highlight: string;
  requirement: string;
  tag?: "popular" | "mujeres" | "nuevo";
};

const CREDIT_PRODUCTS: CreditProduct[] = [
  {
    id: "c1",
    institution: "MiBanco",
    logo: "🏦",
    product: "Préstamo para negocios",
    maxAmount: 15000,
    minMonths: 6,
    highlight: "Con historial Trax",
    requirement: "6+ meses de operación",
    tag: "popular",
  },
  {
    id: "c2",
    institution: "Caja Arequipa",
    logo: "🏛️",
    product: "Mi Crédito",
    maxAmount: 5000,
    minMonths: 3,
    highlight: "Sin garante",
    requirement: "3+ meses de actividad",
  },
  {
    id: "c3",
    institution: "Financiera Confianza",
    logo: "💼",
    product: "Crédito Emprende Mujer",
    maxAmount: 3000,
    minMonths: 1,
    highlight: "Aprobación rápida",
    requirement: "Cualquier negocio activo",
    tag: "mujeres",
  },
];

/* ---------- government program types ---------- */
type GovProgram = {
  id: string;
  entity: string;
  logo: string;
  name: string;
  benefit: string;
  description: string;
};

const GOV_PROGRAMS: GovProgram[] = [
  {
    id: "g1",
    entity: "PRODUCE",
    logo: "🇵🇪",
    name: "Fondo Crecer",
    benefit: "Hasta S/ 2,000",
    description: "Capital de trabajo para microemprendedores. Sin devolución.",
  },
  {
    id: "g2",
    entity: "COFIDE",
    logo: "🏗️",
    name: "Garantía Emprende",
    benefit: "Garantía del Estado",
    description: "El Estado avala tu crédito ante bancos. Tasas más bajas.",
  },
];

/* ---------- TraxScore (gamified credit indicator) ---------- */
function traxScore(txCount: number, streak: number, monthsActive: number): number {
  const base = 400;
  const txPoints = Math.min(txCount * 3, 200);
  const streakPoints = Math.min(streak * 2, 100);
  const monthPoints = Math.min(monthsActive * 15, 150);
  return Math.min(base + txPoints + streakPoints + monthPoints, 850);
}

function scoreColor(score: number): string {
  if (score >= 700) return "#4ADE80";
  if (score >= 550) return "#FCD34D";
  return "#F87171";
}

function scoreLabel(score: number): string {
  if (score >= 700) return "Muy bueno";
  if (score >= 550) return "Bueno";
  return "En construcción";
}

/* ---------- CreditSheet ---------- */
function CreditSheet({
  product,
  score,
  onClose,
}: {
  product: CreditProduct;
  score: number;
  onClose: () => void;
}) {
  const color = scoreColor(score);
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
        className="relative w-full max-w-[430px] max-h-[85vh] rounded-t-[28px] overflow-hidden flex flex-col"
        style={{
          background: "rgba(14,14,16,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="px-[24px] pt-[14px] pb-[18px] border-b border-white/[0.05]">
          <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[16px]" />
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              {product.institution}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
            >
              <X className="h-[16px] w-[16px] text-white/55" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[20px]">
          <div>
            <h2 className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.5px]">
              {product.product}
            </h2>
            <p className="font-['Geist'] text-[13px] text-white/50 mt-[4px]">{product.requirement}</p>
          </div>

          {/* Amount */}
          <div
            className="rounded-[18px] p-[18px] flex flex-col gap-[4px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/40">
              Hasta
            </span>
            <span className="font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.5px] tabular-nums leading-none">
              <span className="text-white/40 text-[20px] mr-[4px] font-medium">S/</span>
              {product.maxAmount.toLocaleString()}
            </span>
            <span className="font-['Geist'] text-[13px] text-white/55 mt-[4px]">
              {product.highlight}
            </span>
          </div>

          {/* Trax score */}
          <div
            className="rounded-[18px] p-[16px] flex items-center gap-[16px]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-[52px] w-[52px] rounded-full flex items-center justify-center shrink-0"
              style={{ border: `2px solid ${color}`, boxShadow: `0 0 14px ${color}30` }}
            >
              <span className="font-['Bai_Jamjuree'] text-[16px] font-bold tabular-nums" style={{ color }}>
                {score}
              </span>
            </div>
            <div>
              <div className="font-['Geist'] text-[13px] font-semibold text-white">
                Puntaje Trax: {scoreLabel(score)}
              </div>
              <div className="font-['Geist'] text-[12px] text-white/45 mt-[2px] leading-relaxed">
                Tu historial de ventas en Trax respalda tu solicitud ante esta institución.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <h3 className="font-['Geist'] text-[12px] font-semibold uppercase tracking-[1.2px] text-white/40">
              Qué necesitas
            </h3>
            {[
              "DNI vigente",
              `Negocio con ${product.minMonths}+ meses de actividad`,
              "No estar en Infocorp",
              "Registro de ventas (Trax lo genera por ti)",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-[10px]">
                <div
                  className="h-[5px] w-[5px] rounded-full mt-[7px] shrink-0"
                  style={{ background: "rgba(255,255,255,0.35)" }}
                />
                <span className="font-['Geist'] text-[13.5px] text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-[20px] pt-[14px] border-t border-white/[0.05]">
          <button
            type="button"
            className="w-full h-[52px] rounded-full bg-white text-black font-['Geist'] text-[15px] font-semibold flex items-center justify-center gap-[8px] active:scale-[0.98] transition-transform"
          >
            Quiero aplicar <ExternalLink className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- OppSheet ---------- */
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
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
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
            {opp.cta} <ExternalLink className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- FeaturedCard ---------- */
function FeaturedCard({ opp, onOpen }: { opp: Opportunity; onOpen: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onOpen}
      className="w-full rounded-[24px] overflow-hidden text-left"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
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

/* ---------- Credit card tile ---------- */
function CreditCard({
  product,
  score,
  onOpen,
}: {
  product: CreditProduct;
  score: number;
  onOpen: () => void;
}) {
  const TAG_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    popular: { bg: "rgba(252,211,77,0.15)", color: "#FCD34D", label: "Popular" },
    mujeres: { bg: "rgba(249,168,212,0.15)", color: "#F9A8D4", label: "Para mujeres" },
    nuevo: { bg: "rgba(124,195,255,0.15)", color: "#7CC3FF", label: "Nuevo" },
  };
  const tag = product.tag ? TAG_STYLE[product.tag] : null;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onOpen}
      className="snap-start shrink-0 w-[200px] rounded-[20px] p-[16px] text-left flex flex-col gap-[12px]"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[22px]">{product.logo}</span>
        {tag && (
          <span
            className="px-[8px] py-[3px] rounded-full font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[0.6px]"
            style={{ background: tag.bg, color: tag.color }}
          >
            {tag.label}
          </span>
        )}
      </div>

      <div>
        <div className="font-['Geist'] text-[10.5px] text-white/40 uppercase tracking-[1px]">
          {product.institution}
        </div>
        <div className="font-['Geist'] text-[14px] font-medium text-white mt-[2px] leading-tight">
          {product.product}
        </div>
      </div>

      <div>
        <span className="font-['Bai_Jamjuree'] text-[24px] font-bold text-white tabular-nums tracking-[-0.5px]">
          <span className="text-white/40 text-[12px] mr-[2px] font-medium">S/</span>
          {product.maxAmount.toLocaleString()}
        </span>
        <div className="font-['Geist'] text-[11px] text-white/40 mt-[2px]">{product.highlight}</div>
      </div>

      <div className="flex items-center gap-[4px] font-['Geist'] text-[12px] text-white/70">
        Ver requisitos <ArrowRight className="h-[11px] w-[11px]" strokeWidth={2} />
      </div>
    </motion.button>
  );
}

/* ---------- Government program card ---------- */
function GovProgramCard({ program }: { program: GovProgram }) {
  return (
    <div
      className="flex items-center gap-[14px] p-[14px] rounded-[16px]"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {program.logo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[10px] uppercase tracking-[1.2px] text-white/35">
          {program.entity}
        </div>
        <div className="font-['Geist'] text-[14px] font-medium text-white mt-[1px]">
          {program.name}
        </div>
        <div className="font-['Geist'] text-[12px] text-white/50 mt-[2px] leading-tight">
          {program.description}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className="font-['Bai_Jamjuree'] text-[12px] font-bold text-white/90 tabular-nums px-[10px] py-[4px] rounded-full"
          style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          {program.benefit}
        </div>
      </div>
    </div>
  );
}

/* ---------- TraxScore banner ---------- */
function TraxScoreBanner({ score }: { score: number }) {
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const pct = ((score - 400) / 450) * 100;

  return (
    <div
      className="rounded-[20px] p-[16px] flex flex-col gap-[12px]"
      style={{
        background: "linear-gradient(135deg, rgba(22,22,28,0.95), rgba(16,16,20,0.98))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-white/40">
            Tu puntaje Trax
          </div>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span
              className="font-['Bai_Jamjuree'] text-[40px] font-bold tabular-nums tracking-[-1px] leading-none"
              style={{ color }}
            >
              {score}
            </span>
            <span className="font-['Geist'] text-[13px] text-white/40">/ 850</span>
          </div>
        </div>
        <div
          className="h-[52px] w-[52px] rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 70%)`,
            border: `1.5px solid ${color}55`,
          }}
        >
          <TrendingUp className="h-[22px] w-[22px]" style={{ color }} strokeWidth={2} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-[6px]">
          <span className="font-['Geist'] text-[12px] font-medium" style={{ color }}>
            {label}
          </span>
          <span className="font-['Geist'] text-[11px] text-white/35">
            Crece con cada venta
          </span>
        </div>
        <div className="h-[4px] rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, pct)}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          />
        </div>
        <p className="font-['Geist'] text-[11.5px] text-white/35 mt-[8px] leading-relaxed">
          Tu historial de ventas en Trax sirve como respaldo para acceder a crédito formal — sin papeleos ni historial bancario tradicional.
        </p>
      </div>
    </div>
  );
}

/* ---------- screen ---------- */
export default function GrowScreen() {
  const { profile } = useAuth();
  const fin = useFinance();

  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null);
  const [activeCredit, setActiveCredit] = useState<CreditProduct | null>(null);

  const featured = OPPS.find((o) => o.featured) ?? OPPS[0];
  const rest = OPPS.filter((o) => o.id !== featured.id);

  // Compute Trax score from real data
  const txCount = fin.tx.length;
  const streak = Number((() => {
    try { return localStorage.getItem("trax_streak_count") || "1"; } catch { return "1"; }
  })());
  const monthsActive = Math.max(1, Math.ceil(txCount / 30));
  const score = traxScore(txCount, streak, monthsActive);

  const businessType = profile?.business_type ?? null;

  return (
    <div className="relative w-full">
      <PageHeader
        eyebrow="Más allá del día a día"
        title="Crecer"
        subtitle="Conexiones y oportunidades que Trax detecta para ti."
      />

      {/* Trax Score + Crédito */}
      <div className="px-[20px] mt-[24px] flex flex-col gap-[16px]">
        <div className="flex items-center justify-between">
          <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.3px] flex items-center gap-[8px]">
            <Building2 className="h-[18px] w-[18px] text-white/60" strokeWidth={1.8} />
            Crédito para tu negocio
          </h2>
        </div>

        <TraxScoreBanner score={score} />

        {/* Credit cards horizontal scroll */}
        <div>
          <p className="font-['Geist'] text-[12px] text-white/40 mb-[12px]">
            Instituciones que pueden prestarte con tu historial Trax
          </p>
          <div className="-mx-[20px] px-[20px] flex gap-[12px] overflow-x-auto no-scrollbar pb-[4px] snap-x snap-mandatory">
            {CREDIT_PRODUCTS.map((p) => (
              <CreditCard
                key={p.id}
                product={p}
                score={score}
                onOpen={() => setActiveCredit(p)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Programas del Estado */}
      <div className="px-[20px] mt-[36px]">
        <div className="flex items-center gap-[8px] mb-[14px]">
          <Sprout className="h-[16px] w-[16px] text-white/50" strokeWidth={1.8} />
          <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.3px]">
            Programas del Estado
          </h2>
        </div>
        <p className="font-['Geist'] text-[12px] text-white/40 mb-[12px]">
          Fondos y apoyos del gobierno peruano que puedes solicitar
        </p>
        <div className="flex flex-col gap-[10px]">
          {GOV_PROGRAMS.map((p) => (
            <GovProgramCard key={p.id} program={p} />
          ))}
        </div>
      </div>

      {/* Destaque del día */}
      <div className="px-[20px] mt-[36px]">
        <SectionLabel>Destaque del día</SectionLabel>
        <FeaturedCard opp={featured} onOpen={() => setActiveOpp(featured)} />
      </div>

      {/* More opportunities */}
      <div className="px-[20px] mt-[36px]">
        <SectionLabel>Más para revisar</SectionLabel>
        <ListGroup>
          {rest.map((o, i) => (
            <div key={o.id}>
              <button
                type="button"
                onClick={() => setActiveOpp(o)}
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
        {activeOpp && <OppSheet opp={activeOpp} onClose={() => setActiveOpp(null)} />}
        {activeCredit && (
          <CreditSheet
            product={activeCredit}
            score={score}
            onClose={() => setActiveCredit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
