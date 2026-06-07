import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Flame,
  TrendingUp,
  Megaphone,
  GraduationCap,
  Banknote,
  CalendarDays,
  Truck,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { GlassCard, Eyebrow, SubHeader, SubScreen } from "./business/shared";

/* ---------- types ---------- */

type Opportunity = {
  id: string;
  category: "tendencia" | "financiamiento" | "capacitacion" | "evento" | "proveedor" | "marketing";
  title: string;
  meta: string;
  body: string;
  cta: string;
  heat?: "hot" | "warm" | "fresh";
  badge?: string;
};

const CATEGORY_META: Record<
  Opportunity["category"],
  { label: string; Icon: typeof Compass; tint: string }
> = {
  tendencia: { label: "Tendencia", Icon: TrendingUp, tint: "#F59E0B" },
  financiamiento: { label: "Financiamiento", Icon: Banknote, tint: "#4ADE80" },
  capacitacion: { label: "Capacitación", Icon: GraduationCap, tint: "#A78BFA" },
  evento: { label: "Evento cerca", Icon: CalendarDays, tint: "#60A5FA" },
  proveedor: { label: "Proveedor nuevo", Icon: Truck, tint: "#F472B6" },
  marketing: { label: "Marketing", Icon: Megaphone, tint: "#22D3EE" },
};

const OPPS: Opportunity[] = [
  {
    id: "o1",
    category: "tendencia",
    title: "Helados y bebidas frías subieron 32% en bodegas de SJL",
    meta: "Tendencia esta semana · Calor 28°C",
    body: "Pide hielo y refrescos extra. Las bodegas de tu zona reportan quiebres de stock de Inca Kola 1L y agua San Luis los fines de semana.",
    cta: "Ver productos en alza",
    heat: "hot",
    badge: "+32%",
  },
  {
    id: "o2",
    category: "evento",
    title: "Feria del barrio — Plaza Cívica SJL",
    meta: "Sábado 14 · 9 AM - 8 PM",
    body: "Más de 2,000 vecinos pasarán por tu zona. Bodegas cercanas reportaron 40-60% más ventas en días de feria.",
    cta: "Recordar y preparar",
    heat: "warm",
  },
  {
    id: "o3",
    category: "financiamiento",
    title: "Mi Crédito Bodeguero — Caja Arequipa",
    meta: "Hasta S/ 5,000 · 1.8% mensual",
    body: "Crédito sin garante para bodegueros con 6+ meses. Tu nivel y movimiento en Trax te califican para el tramo Plata.",
    cta: "Ver requisitos",
    heat: "fresh",
    badge: "Calificas",
  },
  {
    id: "o4",
    category: "capacitacion",
    title: "Curso gratis: 'Vende más por WhatsApp Business'",
    meta: "PRODUCE · 4 sesiones online",
    body: "Aprende a usar catálogo, etiquetas y respuestas rápidas. 92% de bodegueros aumentaron pedidos a domicilio tras el curso.",
    cta: "Inscribirme gratis",
  },
  {
    id: "o5",
    category: "marketing",
    title: "Crea tu primera promoción de fin de semana",
    meta: "Plantilla lista para WhatsApp",
    body: "Llevate 2 Inca Kola + 1 papitas Lay's por S/ 12. Trax ya armó el flyer con tus precios. Solo tienes que enviarlo.",
    cta: "Personalizar y enviar",
    heat: "warm",
  },
  {
    id: "o6",
    category: "proveedor",
    title: "Distribuidora Andina llega a tu zona",
    meta: "Reparto martes y viernes · Min. S/ 200",
    body: "Precios mayoristas en abarrotes y limpieza. 8 bodegueros de SJL ya cambiaron y reportan 12% menos de costo.",
    cta: "Ver catálogo",
  },
  {
    id: "o7",
    category: "tendencia",
    title: "Cuidado capilar natural: en alza",
    meta: "Búsqueda local +18%",
    body: "Shampoo sin sal y aceite de romero están moviéndose en bodegas y minimarkets cerca. Considera 2-3 SKUs de prueba.",
    cta: "Ver productos sugeridos",
  },
  {
    id: "o8",
    category: "evento",
    title: "Día del Padre — domingo en 9 días",
    meta: "Pico esperado: galletas, gaseosas, panetón mini",
    body: "Histórico del barrio: las bodegas suben 22% de ventas el sábado y domingo. Sube stock de chocolates y bebidas grandes.",
    cta: "Planificar pedido",
    heat: "warm",
  },
];

/* ---------- screen ---------- */

export default function GrowScreen() {
  const [active, setActive] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState<"todos" | Opportunity["category"]>("todos");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const filtered = filter === "todos" ? OPPS : OPPS.filter((o) => o.category === filter);

  const toggleSave = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="relative w-full">
      {/* hero */}
      <div className="px-[20px] pt-[18px] pb-[12px]">
        <div className="flex items-center gap-[10px]">
          <div
            className="h-[34px] w-[34px] rounded-[10px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <Compass className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/45">
              Explora · Lo que pasa afuera
            </span>
            <h1 className="font-['Bai_Jamjuree'] text-[24px] font-semibold text-white tracking-[-0.5px] mt-[4px]">
              Crecer
            </h1>
          </div>
        </div>
        <p className="mt-[10px] font-['Geist'] text-[13px] text-white/55 leading-[1.45]">
          Tendencias, ferias, créditos y capacitaciones de tu zona — para que tu bodega no se quede quieta.
        </p>
      </div>

      {/* hot strip */}
      <div className="pl-[20px] pb-[14px]">
        <div className="flex gap-[12px] overflow-x-auto pr-[20px] no-scrollbar">
          {OPPS.filter((o) => o.heat === "hot").map((o) => (
            <HotCard key={o.id} opp={o} onOpen={() => setActive(o)} />
          ))}
          <NearbyCard />
        </div>
      </div>

      {/* filters */}
      <div className="px-[20px] pb-[10px] flex gap-[6px] overflow-x-auto no-scrollbar">
        <FilterChip label="Todos" active={filter === "todos"} onClick={() => setFilter("todos")} />
        {(Object.keys(CATEGORY_META) as Opportunity["category"][]).map((c) => (
          <FilterChip
            key={c}
            label={CATEGORY_META[c].label}
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </div>

      {/* list */}
      <div className="px-[20px] flex flex-col gap-[12px] pb-[20px]">
        <Eyebrow>Oportunidades cerca de ti</Eyebrow>
        {filtered.map((o) => (
          <OppCard
            key={o.id}
            opp={o}
            saved={saved.has(o.id)}
            onSave={() => toggleSave(o.id)}
            onOpen={() => setActive(o)}
          />
        ))}
        <p className="font-['Geist'] text-[11.5px] text-white/35 text-center pt-[6px]">
          Trax · Lo que pasa fuera, llega antes a ti
        </p>
      </div>

      <AnimatePresence>
        {active && (
          <OppSheet
            opp={active}
            saved={saved.has(active.id)}
            onSave={() => toggleSave(active.id)}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- pieces ---------- */

function HotCard({ opp, onOpen }: { opp: Opportunity; onOpen: () => void }) {
  const meta = CATEGORY_META[opp.category];
  const Icon = meta.Icon;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onOpen}
      className="shrink-0 w-[260px] h-[150px] rounded-[22px] relative overflow-hidden text-left"
      style={{
        background: `linear-gradient(160deg, ${hexA(meta.tint, 0.22)}, rgba(20,20,22,0.7))`,
        border: `1px solid ${hexA(meta.tint, 0.32)}`,
      }}
    >
      <div className="absolute -right-[30px] -top-[30px] h-[120px] w-[120px] rounded-full"
        style={{ background: hexA(meta.tint, 0.18), filter: "blur(20px)" }} />
      <div className="relative p-[16px] flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div
            className="h-[30px] px-[10px] rounded-full flex items-center gap-[6px]"
            style={{ background: hexA(meta.tint, 0.18), border: `1px solid ${hexA(meta.tint, 0.30)}` }}
          >
            <Flame className="h-[11px] w-[11px]" style={{ color: meta.tint }} strokeWidth={2.2} />
            <span className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: meta.tint }}>
              Hot
            </span>
          </div>
          {opp.badge && (
            <span
              className="font-['Bai_Jamjuree'] text-[14px] font-bold"
              style={{ color: meta.tint }}
            >
              {opp.badge}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-[6px] mb-[4px]">
            <Icon className="h-[12px] w-[12px]" style={{ color: meta.tint }} strokeWidth={2} />
            <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1px] text-white/55">
              {meta.label}
            </span>
          </div>
          <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white leading-[1.25] tracking-[-0.2px]">
            {opp.title}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function NearbyCard() {
  return (
    <div
      className="shrink-0 w-[200px] h-[150px] rounded-[22px] relative overflow-hidden p-[16px] flex flex-col justify-between"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-[6px]">
        <MapPin className="h-[12px] w-[12px] text-white/55" strokeWidth={2} />
        <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1px] text-white/55">
          Tu zona
        </span>
      </div>
      <div>
        <div className="font-['Bai_Jamjuree'] text-[28px] font-semibold text-white tabular-nums leading-none">
          14
        </div>
        <div className="font-['Geist'] text-[11.5px] text-white/60 mt-[4px]">
          bodegas activas en SJL este mes
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium transition-colors"
      style={{
        background: active ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.04)",
        color: active ? "#000" : "rgba(255,255,255,0.75)",
        border: active ? "1px solid rgba(255,255,255,0.94)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {label}
    </button>
  );
}

function OppCard({
  opp,
  saved,
  onSave,
  onOpen,
}: {
  opp: Opportunity;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[opp.category];
  const Icon = meta.Icon;
  return (
    <GlassCard>
      <div className="p-[14px] flex flex-col gap-[10px]">
        <div className="flex items-start justify-between gap-[10px]">
          <div className="flex items-center gap-[8px]">
            <div
              className="h-[28px] w-[28px] rounded-[8px] flex items-center justify-center"
              style={{ background: hexA(meta.tint, 0.14), border: `1px solid ${hexA(meta.tint, 0.25)}` }}
            >
              <Icon className="h-[13px] w-[13px]" style={{ color: meta.tint }} strokeWidth={2} />
            </div>
            <span
              className="font-['Geist'] text-[10.5px] uppercase tracking-[0.9px] font-medium"
              style={{ color: meta.tint }}
            >
              {meta.label}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="h-[28px] w-[28px] rounded-full bg-white/[0.04] flex items-center justify-center active:scale-90"
            aria-label="Guardar"
          >
            {saved ? (
              <BookmarkCheck className="h-[13px] w-[13px] text-white" strokeWidth={2} />
            ) : (
              <Bookmark className="h-[13px] w-[13px] text-white/65" strokeWidth={1.8} />
            )}
          </button>
        </div>
        <div>
          <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tracking-[-0.2px] leading-[1.3]">
            {opp.title}
          </div>
          <div className="font-['Geist'] text-[12px] text-white/55 mt-[3px]">{opp.meta}</div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="self-start h-[32px] pl-[12px] pr-[10px] rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-[5px] active:scale-95"
        >
          <span className="font-['Geist'] text-[12px] text-white/85">{opp.cta}</span>
          <ChevronRight className="h-[12px] w-[12px] text-white/65" strokeWidth={2} />
        </button>
      </div>
    </GlassCard>
  );
}

function OppSheet({
  opp,
  saved,
  onSave,
  onClose,
}: {
  opp: Opportunity;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const meta = CATEGORY_META[opp.category];
  const Icon = meta.Icon;
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
          background: "rgba(14,14,16,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="px-[20px] pt-[14px] pb-[16px] border-b border-white/[0.05]">
          <div className="mx-auto h-[4px] w-[44px] rounded-full bg-white/15 mb-[14px]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <div
                className="h-[32px] w-[32px] rounded-[10px] flex items-center justify-center"
                style={{ background: hexA(meta.tint, 0.16), border: `1px solid ${hexA(meta.tint, 0.30)}` }}
              >
                <Icon className="h-[14px] w-[14px]" style={{ color: meta.tint }} strokeWidth={2} />
              </div>
              <span className="font-['Geist'] text-[11.5px] uppercase tracking-[1px] text-white/65">
                {meta.label}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] w-[32px] rounded-full bg-white/[0.06] flex items-center justify-center active:scale-95"
            >
              <X className="h-[13px] w-[13px] text-white/70" strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[20px] py-[18px] flex flex-col gap-[14px]">
          <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.4px] leading-[1.2]">
            {opp.title}
          </h2>
          <div className="font-['Geist'] text-[12.5px] text-white/55">{opp.meta}</div>
          <p className="font-['Geist'] text-[14px] text-white/80 leading-[1.55]">{opp.body}</p>
          {opp.badge && (
            <div
              className="self-start rounded-[12px] px-[12px] py-[8px]"
              style={{ background: hexA(meta.tint, 0.10), border: `1px solid ${hexA(meta.tint, 0.25)}` }}
            >
              <span className="font-['Geist'] text-[10.5px] uppercase tracking-[0.8px] font-semibold" style={{ color: meta.tint }}>
                {opp.badge}
              </span>
            </div>
          )}
        </div>
        <div className="p-[16px] flex gap-[10px] border-t border-white/[0.05]">
          <button
            type="button"
            onClick={onSave}
            className="h-[48px] w-[48px] rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center active:scale-95"
            aria-label="Guardar"
          >
            {saved ? (
              <BookmarkCheck className="h-[16px] w-[16px] text-white" strokeWidth={2} />
            ) : (
              <Bookmark className="h-[16px] w-[16px] text-white/75" strokeWidth={1.8} />
            )}
          </button>
          <button
            type="button"
            className="flex-1 h-[48px] rounded-full bg-white text-black font-['Geist'] text-[14px] font-semibold flex items-center justify-center gap-[7px] active:scale-95"
          >
            {opp.cta}
            <ExternalLink className="h-[13px] w-[13px]" strokeWidth={2.2} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function hexA(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
