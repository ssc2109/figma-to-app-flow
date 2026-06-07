import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Target,
  Megaphone,
  TrendingUp,
  Truck,
  Gift,
  MessageCircle,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./business/shared";

type Opportunity = {
  id: string;
  title: string;
  pitch: string;
  why: string;
  effort: "fácil" | "medio" | "alto";
  impact: "alto" | "medio" | "bajo";
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  steps: string[];
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "promo-2x1",
    title: "Promo 2x1 en lo que más sale",
    pitch: "Saca lo que ya vende solo, ofrécelo en combo y subes ticket promedio.",
    why: "Tu Inca Kola sale 24 u/semana. Una promo 2x1 podría subir tus ventas un 15%.",
    effort: "fácil",
    impact: "alto",
    Icon: Gift,
    steps: [
      "Elige tu producto estrella (Trax te lo sugiere)",
      "Define el descuento (sugerido: 15%)",
      "Imprime el cartel desde la app",
      "Mide en 7 días si funcionó",
    ],
  },
  {
    id: "whatsapp-cliente",
    title: "WhatsApp para tus mejores clientes",
    pitch: "Tienes clientes fieles. Avísales primero cuando llega algo nuevo.",
    why: "12 clientes vinieron 3+ veces este mes. Es tu base de oro.",
    effort: "fácil",
    impact: "medio",
    Icon: MessageCircle,
    steps: [
      "Trax junta tus clientes frecuentes",
      "Eliges qué quieres avisar",
      "Mandas el mensaje en 1 toque",
    ],
  },
  {
    id: "delivery",
    title: "Empieza con delivery del barrio",
    pitch: "5 cuadras a la redonda. Sin apps de delivery. Pedidos por WhatsApp.",
    why: "El 78% de bodegas que activaron delivery local crecen 22% en 2 meses.",
    effort: "medio",
    impact: "alto",
    Icon: Truck,
    steps: [
      "Define tu radio (1-5 cuadras)",
      "Fija costo (sugerido: S/ 2)",
      "Crea un horario fijo de entregas",
      "Cobras por Yape contra entrega",
    ],
  },
  {
    id: "fidelidad",
    title: "Tarjeta de fidelidad simple",
    pitch: "10 compras = 1 gratis. La gente vuelve por el sticker.",
    why: "Aumenta la frecuencia de compra en 35% en 90 días.",
    effort: "fácil",
    impact: "medio",
    Icon: Trophy,
    steps: [
      "Imprime tarjetas desde Trax",
      "Pon sello cada compra",
      "Premias la 10ª compra",
    ],
  },
  {
    id: "catalogo",
    title: "Amplía con productos de mayor margen",
    pitch: "Gaseosa deja 20%. Cuidado personal puede dejar 40%.",
    why: "Trax detectó que vendes mucho volumen pero poco margen. Hay espacio.",
    effort: "medio",
    impact: "alto",
    Icon: TrendingUp,
    steps: [
      "Trax sugiere 3 categorías con buen margen",
      "Empiezas con 5 productos de prueba",
      "Mides margen real a los 30 días",
    ],
  },
  {
    id: "cartel",
    title: "Cartel afuera con tu mejor oferta",
    pitch: "70% de gente entra por lo que ve en la calle. Aprovecha.",
    why: "Un cartel claro sube tráfico 12% sin costo recurrente.",
    effort: "fácil",
    impact: "medio",
    Icon: Megaphone,
    steps: [
      "Trax te da el diseño",
      "Imprimes en cualquier ploteo (S/ 15)",
      "Cambias cada 2 semanas para que no aburra",
    ],
  },
];

function PageHeader() {
  return (
    <div className="flex items-center justify-between px-[20px] pt-[18px] pb-[8px]">
      <div className="flex flex-col">
        <span className="font-['Geist'] text-[12px] uppercase tracking-[1.4px] text-white/45">
          Tu próximo nivel
        </span>
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.6px]">
          Crecer
        </h1>
      </div>
    </div>
  );
}

function NorthStarCard() {
  const { monthNet, monthIncome } = useFinance();
  const target = 12000;
  const pct = Math.min(100, (monthIncome / target) * 100);
  return (
    <GlassCard>
      <div className="p-[18px]">
        <div className="flex items-center gap-[10px] mb-[10px]">
          <div
            className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Target className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/45">
              Meta del mes
            </div>
            <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tracking-[-0.2px]">
              S/ {monthIncome.toFixed(0)} <span className="text-white/45">de S/ {target.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="h-[8px] w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #4ADE80, #ffffff)" }}
          />
        </div>
        <div className="mt-[10px] font-['Geist'] text-[12px] text-white/55 leading-[1.5]">
          Vas {pct.toFixed(0)}% de tu meta. Cierra el mes con S/ {(monthNet).toFixed(0)} netos si sigues así.
        </div>
      </div>
    </GlassCard>
  );
}

function ImpactBadge({ value }: { value: "alto" | "medio" | "bajo" }) {
  const map = {
    alto: { bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.25)", color: "#4ADE80" },
    medio: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" },
    bajo: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" },
  }[value];
  return (
    <span
      className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[0.6px] px-[8px] py-[2px] rounded-full"
      style={{ background: map.bg, border: `1px solid ${map.border}`, color: map.color }}
    >
      Impacto {value}
    </span>
  );
}

function OppCard({ opp, onOpen }: { opp: Opportunity; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-[20px] overflow-hidden trax-lift"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="p-[16px] flex gap-[12px]">
        <div
          className="h-[44px] w-[44px] rounded-[14px] shrink-0 flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <opp.Icon className="h-[18px] w-[18px] text-white/85" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[4px]">
            <ImpactBadge value={opp.impact} />
            <span className="font-['Geist'] text-[10px] text-white/45">· {opp.effort}</span>
          </div>
          <div className="font-['Geist'] text-[14px] font-semibold text-white leading-[1.3]">
            {opp.title}
          </div>
          <div className="font-['Geist'] text-[12px] text-white/55 mt-[3px] leading-[1.5]">
            {opp.pitch}
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/30 shrink-0 mt-[4px]" strokeWidth={1.8} />
      </div>
    </button>
  );
}

function OppDetailView({ opp, onBack }: { opp: Opportunity; onBack: () => void }) {
  return (
    <SubScreen>
      <SubHeader eyebrow="Oportunidad" title={opp.title} onBack={onBack} />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <GlassCard>
          <div className="p-[18px] flex gap-[14px] items-start">
            <div
              className="h-[52px] w-[52px] rounded-[16px] flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <opp.Icon className="h-[22px] w-[22px] text-white" strokeWidth={1.7} />
            </div>
            <div>
              <div className="flex items-center gap-[6px] mb-[6px]">
                <ImpactBadge value={opp.impact} />
                <span className="font-['Geist'] text-[10px] text-white/45 uppercase tracking-[0.6px]">
                  Esfuerzo {opp.effort}
                </span>
              </div>
              <p className="font-['Geist'] text-[13.5px] text-white/85 leading-[1.55]">{opp.pitch}</p>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-[8px]">
          <Eyebrow>Por qué te lo proponemos</Eyebrow>
          <GlassCard>
            <div className="p-[16px] flex items-start gap-[10px]">
              <Sparkles className="h-[16px] w-[16px] text-white/65 mt-[2px] shrink-0" strokeWidth={1.8} />
              <p className="font-['Geist'] text-[13px] text-white/80 leading-[1.55]">{opp.why}</p>
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-col gap-[8px]">
          <Eyebrow>Cómo lo hacemos juntos</Eyebrow>
          <GlassCard>
            <div className="p-[16px] flex flex-col gap-[12px]">
              {opp.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-[12px]">
                  <div
                    className="h-[24px] w-[24px] rounded-full flex items-center justify-center shrink-0 mt-[1px]"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span className="font-['Bai_Jamjuree'] text-[11px] font-semibold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <span className="font-['Geist'] text-[13px] text-white/85 leading-[1.5]">{s}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <button
          type="button"
          className="w-full h-[52px] rounded-full bg-white text-black font-['Geist'] text-[14.5px] font-semibold active:scale-[0.98] transition-transform"
        >
          Empezar ahora
        </button>
      </div>
    </SubScreen>
  );
}

function TopClientsCard() {
  const clients = [
    { name: "Sra. Rosa", visits: 18, spent: 420 },
    { name: "Don Julio", visits: 14, spent: 380 },
    { name: "Marta", visits: 12, spent: 295 },
  ];
  return (
    <div className="flex flex-col gap-[8px]">
      <Eyebrow>Tus mejores clientes este mes</Eyebrow>
      <GlassCard>
        <div className="flex flex-col px-[14px]">
          {clients.map((c, i) => (
            <div key={c.name}>
              <div className="flex items-center gap-[12px] py-[12px]">
                <div
                  className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="font-['Bai_Jamjuree'] text-[11px] font-semibold text-white">
                    {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-['Geist'] text-[13.5px] font-medium text-white">{c.name}</div>
                  <div className="font-['Geist'] text-[11px] text-white/50">
                    {c.visits} visitas este mes
                  </div>
                </div>
                <span className="font-['Bai_Jamjuree'] text-[13px] font-bold text-white tabular-nums">
                  S/ {c.spent.toFixed(0)}
                </span>
              </div>
              {i < clients.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function StarProductsCard() {
  const { items } = useInventory();
  const stars = items.slice(0, 3);
  return (
    <div className="flex flex-col gap-[8px]">
      <Eyebrow>Productos estrella</Eyebrow>
      <GlassCard>
        <div className="flex flex-col px-[14px]">
          {stars.map((p, i) => (
            <div key={p.id}>
              <div className="flex items-center gap-[12px] py-[12px]">
                <div
                  className="h-[40px] w-[40px] rounded-[12px] overflow-hidden shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[13px] font-medium text-white truncate">
                    {p.name}
                  </div>
                  <div className="font-['Geist'] text-[11px] text-white/50 tabular-nums">
                    Margen ~{(((p.price - p.cost) / p.price) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-['Bai_Jamjuree'] text-[13px] font-bold text-white tabular-nums">
                    S/ {p.price.toFixed(2)}
                  </span>
                </div>
              </div>
              {i < stars.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function BenchmarkCard() {
  return (
    <GlassCard>
      <div className="p-[16px]">
        <Eyebrow>Vs. bodegas como la tuya</Eyebrow>
        <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
          <Bench label="Ventas/día" value="+8%" positive />
          <Bench label="Margen" value="-3%" />
          <Bench label="Fiados" value="OK" positive />
        </div>
        <p className="mt-[12px] font-['Geist'] text-[11.5px] text-white/55 leading-[1.5]">
          Vendes más que el promedio. Tu margen tiene espacio para mejorar — Trax tiene 2 ideas.
        </p>
      </div>
    </GlassCard>
  );
}

function Bench({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div
      className="rounded-[14px] p-[10px] text-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-['Geist'] text-[10px] uppercase tracking-[0.6px] text-white/45">
        {label}
      </div>
      <div
        className={`mt-[3px] font-['Bai_Jamjuree'] text-[16px] font-bold tabular-nums ${
          positive ? "text-[#4ADE80]" : "text-white/85"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function GrowScreen() {
  const [selected, setSelected] = useState<Opportunity | null>(null);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {selected ? (
          <OppDetailView key={selected.id} opp={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div
            key="hub"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader />
            <div className="flex flex-col gap-[16px] px-[20px] pt-[8px]">
              <NorthStarCard />

              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center justify-between px-[4px]">
                  <Eyebrow>Oportunidades para ti</Eyebrow>
                  <span className="font-['Geist'] text-[11px] text-white/40">{OPPORTUNITIES.length}</span>
                </div>
                <div className="flex flex-col gap-[10px]">
                  {OPPORTUNITIES.map((o) => (
                    <OppCard key={o.id} opp={o} onOpen={() => setSelected(o)} />
                  ))}
                </div>
              </div>

              <TopClientsCard />
              <StarProductsCard />
              <BenchmarkCard />

              <p className="font-['Geist'] text-[11.5px] text-white/35 text-center pt-[6px]">
                Trax · Crecer es decisión, no suerte
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
