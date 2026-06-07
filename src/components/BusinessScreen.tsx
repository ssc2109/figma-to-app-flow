import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  ChevronRight,
  Store,
  Package,
  Wallet,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  FileText,
  Users,
  Tag,
  CreditCard,
  Smartphone,
  Banknote,
  Printer,
  BarChart3,
  Settings,
  Pencil,
  PackagePlus,
} from "lucide-react";
import { useInventory, LOW_STOCK_THRESHOLD, type InventoryItem } from "@/data/inventory";

const fmtSoles = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(2);

/* ---------- shared surfaces ---------- */

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[20px] overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-['Geist'] text-[11px] font-semibold uppercase tracking-[1.4px] text-white/45">
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="flex items-end justify-between w-full px-[4px]">
      <h2 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.2px]">
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="font-['Geist'] text-[13px] text-white/55 hover:text-white transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ---------- header ---------- */

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
      <button
        type="button"
        className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95 transition-transform"
        aria-label="Ajustes"
      >
        <Settings className="h-[18px] w-[18px] text-white/75" strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* ---------- business identity ---------- */

function BusinessCard() {
  return (
    <GlassCard>
      <div className="p-[18px] flex items-start gap-[14px]">
        <div
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Store className="h-[22px] w-[22px] text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px]">
            <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.3px] truncate">
              Bodega Ecoarom
            </h3>
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
          </div>
          <div className="mt-[6px] flex items-center gap-[6px] text-white/55">
            <MapPin className="h-[12px] w-[12px]" strokeWidth={1.8} />
            <span className="font-['Geist'] text-[12.5px] truncate">
              Av. Los Próceres 142, San Juan de Lurigancho
            </span>
          </div>
          <div className="mt-[3px] flex items-center gap-[6px] text-white/55">
            <Clock className="h-[12px] w-[12px]" strokeWidth={1.8} />
            <span className="font-['Geist'] text-[12.5px]">Hoy · 7:00 AM — 10:00 PM</span>
          </div>
        </div>
        <button
          type="button"
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95"
          aria-label="Editar negocio"
        >
          <Pencil className="h-[13px] w-[13px] text-white/70" strokeWidth={1.8} />
        </button>
      </div>
    </GlassCard>
  );
}

/* ---------- stats ---------- */

function StatTile({
  label,
  value,
  unit,
  Icon,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: "positive" | "negative";
}) {
  const color =
    accent === "positive" ? "text-[#4ADE80]" : accent === "negative" ? "text-[#F87171]" : "text-white";
  return (
    <GlassCard>
      <div className="p-[14px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <Eyebrow>{label}</Eyebrow>
          <Icon className="h-[14px] w-[14px] text-white/45" strokeWidth={1.8} />
        </div>
        <div className="flex items-baseline gap-[3px]">
          {unit && (
            <span className="font-['Bai_Jamjuree'] text-[13px] font-medium text-white/55">
              {unit}
            </span>
          )}
          <span className={`font-['Bai_Jamjuree'] text-[22px] font-bold tracking-[-0.6px] ${color}`}>
            {value}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function StatsGrid() {
  const { productCount, totalValue, lowStock, totalUnits } = useInventory();
  return (
    <div className="grid grid-cols-2 gap-[10px] w-full">
      <StatTile label="Productos" value={String(productCount)} Icon={Package} />
      <StatTile
        label="Valor inventario"
        value={fmtSoles(totalValue)}
        unit="S/"
        Icon={Wallet}
      />
      <StatTile
        label="Bajo stock"
        value={String(lowStock.length)}
        Icon={AlertTriangle}
        accent={lowStock.length > 0 ? "negative" : undefined}
      />
      <StatTile label="Unidades" value={String(totalUnits)} Icon={TrendingUp} />
    </div>
  );
}

/* ---------- quick actions ---------- */

function QuickActions() {
  const actions = [
    { label: "Producto", Icon: PackagePlus },
    { label: "Categoría", Icon: Tag },
    { label: "Reportes", Icon: BarChart3 },
    { label: "Imprimir", Icon: Printer },
    { label: "Equipo", Icon: Users },
  ];
  return (
    <div className="-mx-[20px] overflow-x-auto no-scrollbar">
      <div className="flex gap-[8px] px-[20px]">
        {actions.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            className="shrink-0 flex items-center gap-[8px] h-[40px] px-[14px] rounded-full bg-white/[0.05] border border-white/[0.06] active:scale-95 transition-transform"
          >
            <Icon className="h-[14px] w-[14px] text-white/80" strokeWidth={1.8} />
            <span className="font-['Geist'] text-[13px] font-medium text-white/85">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- stepper ---------- */

function Stepper({
  value,
  onDelta,
}: {
  value: number;
  onDelta: (d: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-[2px] rounded-full p-[2px]"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        type="button"
        onClick={() => onDelta(-1)}
        className="flex h-[28px] w-[28px] items-center justify-center rounded-full hover:bg-white/[0.06] active:scale-90"
        aria-label="Restar"
      >
        <Minus className="h-[13px] w-[13px] text-white/75" strokeWidth={2} />
      </button>
      <span className="min-w-[28px] text-center font-['Bai_Jamjuree'] text-[13px] font-semibold text-white">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onDelta(1)}
        className="flex h-[28px] w-[28px] items-center justify-center rounded-full hover:bg-white/[0.06] active:scale-90"
        aria-label="Sumar"
      >
        <Plus className="h-[13px] w-[13px] text-white/75" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ---------- low stock list ---------- */

function LowStockSection() {
  const { lowStock, adjustStock, setStock } = useInventory();
  if (lowStock.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px] w-full">
      <SectionTitle title="Stock crítico" />
      <GlassCard>
        <div className="flex flex-col">
          {lowStock.map((item, idx) => (
            <div key={item.id}>
              <div className="flex items-center gap-[12px] p-[14px]">
                <div
                  className="h-[44px] w-[44px] shrink-0 rounded-[14px] overflow-hidden flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[14px] font-medium text-white truncate">
                    {item.name}
                  </div>
                  <div className="mt-[2px] flex items-center gap-[6px]">
                    <span
                      className="inline-flex items-center gap-[4px] rounded-full px-[7px] py-[1px]"
                      style={{
                        background:
                          item.stock === 0
                            ? "rgba(248,113,113,0.12)"
                            : "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.22)",
                      }}
                    >
                      <span className="font-['Bai_Jamjuree'] text-[11px] font-semibold text-[#F87171]">
                        {item.stock}
                      </span>
                      <span className="font-['Geist'] text-[10px] text-[#F87171]/80">
                        {item.stock === 1 ? "unidad" : "unidades"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStock(item.id, 30)}
                      className="font-['Geist'] text-[11px] font-medium text-white/55 hover:text-white underline-offset-2 hover:underline"
                    >
                      Reponer +30
                    </button>
                  </div>
                </div>
                <Stepper value={item.stock} onDelta={(d) => adjustStock(item.id, d)} />
              </div>
              {idx < lowStock.length - 1 && (
                <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------- inventory ---------- */

function InventoryRow({ item }: { item: InventoryItem }) {
  const { adjustStock } = useInventory();
  const isLow = item.stock <= LOW_STOCK_THRESHOLD;
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <div
        className="h-[44px] w-[44px] shrink-0 rounded-[14px] overflow-hidden flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14px] font-medium text-white truncate">
          {item.name}
        </div>
        <div className="mt-[2px] flex items-center gap-[8px]">
          <span className="font-['Bai_Jamjuree'] text-[12.5px] font-medium text-white/65">
            S/ {item.price.toFixed(2)}
          </span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="font-['Geist'] text-[11px] text-white/45">{item.category}</span>
          {isLow && (
            <>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="font-['Geist'] text-[11px] text-[#F87171]">
                {item.stock} u.
              </span>
            </>
          )}
        </div>
      </div>
      <Stepper value={item.stock} onDelta={(d) => adjustStock(item.id, d)} />
    </div>
  );
}

function InventorySection() {
  const { items } = useInventory();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todos");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["Todos", ...Array.from(set)];
  }, [items]);

  const filtered = items.filter(
    (i) =>
      (cat === "Todos" || i.category === cat) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-[10px] w-full">
      <SectionTitle title="Inventario" action={{ label: "Ver todo" }} />
      <div
        className="flex items-center gap-[10px] h-[44px] px-[14px] rounded-full"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Search className="h-[15px] w-[15px] text-white/45" strokeWidth={1.8} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto…"
          className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/35"
        />
      </div>

      <div className="-mx-[20px] overflow-x-auto no-scrollbar">
        <div className="flex gap-[6px] px-[20px]">
          {categories.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`shrink-0 h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "bg-white/[0.04] text-white/65 border border-white/[0.06]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col px-[14px]">
          {filtered.length === 0 && (
            <div className="py-[28px] text-center font-['Geist'] text-[13px] text-white/45">
              Sin productos
            </div>
          )}
          {filtered.map((item, idx) => (
            <div key={item.id}>
              <InventoryRow item={item} />
              {idx < filtered.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------- payments + info + team ---------- */

function PaymentMethods() {
  const methods = [
    { label: "Efectivo", Icon: Banknote, active: true },
    { label: "Yape", Icon: Smartphone, active: true },
    { label: "Plin", Icon: Smartphone, active: true },
    { label: "Tarjeta", Icon: CreditCard, active: false },
  ];
  return (
    <div className="flex flex-col gap-[10px] w-full">
      <SectionTitle title="Métodos de pago" action={{ label: "Editar" }} />
      <GlassCard>
        <div className="p-[12px] grid grid-cols-2 gap-[8px]">
          {methods.map(({ label, Icon, active }) => (
            <div
              key={label}
              className="flex items-center gap-[10px] h-[44px] px-[12px] rounded-[14px]"
              style={{
                background: active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: active ? 1 : 0.5,
              }}
            >
              <Icon className="h-[15px] w-[15px] text-white/80" strokeWidth={1.8} />
              <span className="font-['Geist'] text-[13px] font-medium text-white/85">
                {label}
              </span>
              {active && (
                <span className="ml-auto h-[6px] w-[6px] rounded-full bg-[#4ADE80]" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function TeamSection() {
  const members = [
    { name: "Alberto R.", role: "Dueño", initials: "AR" },
    { name: "Lucía M.", role: "Cajera", initials: "LM" },
    { name: "Diego P.", role: "Repositor", initials: "DP" },
  ];
  return (
    <div className="flex flex-col gap-[10px] w-full">
      <SectionTitle title="Tu equipo" action={{ label: "Añadir" }} />
      <GlassCard>
        <div className="flex flex-col">
          {members.map((m, idx) => (
            <div key={m.name}>
              <div className="flex items-center gap-[12px] p-[14px]">
                <div
                  className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="font-['Bai_Jamjuree'] text-[12px] font-semibold text-white">
                    {m.initials}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-['Geist'] text-[14px] font-medium text-white">
                    {m.name}
                  </div>
                  <div className="font-['Geist'] text-[12px] text-white/45">{m.role}</div>
                </div>
                <ChevronRight className="h-[16px] w-[16px] text-white/35" strokeWidth={1.8} />
              </div>
              {idx < members.length - 1 && (
                <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function InfoSection() {
  const rows = [
    { Icon: FileText, label: "RUC", value: "10456789012" },
    { Icon: MapPin, label: "Dirección", value: "Av. Los Próceres 142, SJL" },
    { Icon: Clock, label: "Horario", value: "Lun — Dom · 7:00 AM a 10:00 PM" },
    { Icon: Phone, label: "Contacto", value: "+51 987 654 321" },
  ];
  return (
    <div className="flex flex-col gap-[10px] w-full">
      <SectionTitle title="Información" action={{ label: "Editar" }} />
      <GlassCard>
        <div className="flex flex-col">
          {rows.map(({ Icon, label, value }, idx) => (
            <div key={label}>
              <div className="flex items-center gap-[12px] p-[14px]">
                <div
                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[11px] uppercase tracking-[0.8px] text-white/45">
                    {label}
                  </div>
                  <div className="mt-[2px] font-['Geist'] text-[13.5px] text-white/85 truncate">
                    {value}
                  </div>
                </div>
              </div>
              {idx < rows.length - 1 && (
                <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------- screen ---------- */

export default function BusinessScreen() {
  return (
    <div className="relative w-full">
      <PageHeader />
      <div className="flex flex-col gap-[22px] px-[20px] pt-[8px]">
        <BusinessCard />
        <StatsGrid />
        <QuickActions />
        <LowStockSection />
        <InventorySection />
        <PaymentMethods />
        <TeamSection />
        <InfoSection />
      </div>
    </div>
  );
}
