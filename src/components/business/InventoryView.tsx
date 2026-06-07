import { useMemo, useState } from "react";
import { Search, Plus, Minus, PackagePlus } from "lucide-react";
import { useInventory, LOW_STOCK_THRESHOLD, type InventoryItem } from "@/data/inventory";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./shared";

function Stepper({ value, onDelta }: { value: number; onDelta: (d: number) => void }) {
  return (
    <div
      className="flex items-center gap-[2px] rounded-full p-[2px]"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button
        type="button"
        onClick={() => onDelta(-1)}
        className="flex h-[28px] w-[28px] items-center justify-center rounded-full hover:bg-white/[0.06] active:scale-90"
        aria-label="Restar"
      >
        <Minus className="h-[13px] w-[13px] text-white/75" strokeWidth={2} />
      </button>
      <span className="min-w-[28px] text-center font-['Bai_Jamjuree'] text-[13px] font-semibold text-white tabular-nums">
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

function InventoryRow({ item }: { item: InventoryItem }) {
  const { adjustStock } = useInventory();
  const isLow = item.stock <= LOW_STOCK_THRESHOLD;
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <div
        className="h-[44px] w-[44px] shrink-0 rounded-[14px] overflow-hidden flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14px] font-medium text-white truncate">{item.name}</div>
        <div className="mt-[2px] flex items-center gap-[8px]">
          <span className="font-['Bai_Jamjuree'] text-[12.5px] font-medium text-white/65 tabular-nums">
            S/ {item.price.toFixed(2)}
          </span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="font-['Geist'] text-[11px] text-white/45">{item.category}</span>
          {isLow && (
            <>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="font-['Geist'] text-[11px] text-[#F87171] tabular-nums">{item.stock} u.</span>
            </>
          )}
        </div>
      </div>
      <Stepper value={item.stock} onDelta={(d) => adjustStock(item.id, d)} />
    </div>
  );
}

export default function InventoryView({ onBack }: { onBack: () => void }) {
  const { items, productCount, totalUnits, totalValue, lowStock } = useInventory();
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

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(2);

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Tu inventario"
        title="Productos"
        onBack={onBack}
        action={
          <button
            type="button"
            className="flex h-[40px] items-center gap-[6px] rounded-full bg-white text-black px-[14px] active:scale-95 transition-transform"
          >
            <PackagePlus className="h-[15px] w-[15px]" strokeWidth={2} />
            <span className="font-['Geist'] text-[13px] font-semibold">Añadir</span>
          </button>
        }
      />

      <div className="flex flex-col gap-[16px] px-[20px] pt-[6px]">
        {/* mini-pulse */}
        <GlassCard>
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            <div className="p-[12px] flex flex-col gap-[4px]">
              <Eyebrow>SKUs</Eyebrow>
              <div className="font-['Bai_Jamjuree'] text-[18px] font-bold text-white tabular-nums">
                {productCount}
              </div>
            </div>
            <div className="p-[12px] flex flex-col gap-[4px]">
              <Eyebrow>Unidades</Eyebrow>
              <div className="font-['Bai_Jamjuree'] text-[18px] font-bold text-white tabular-nums">
                {totalUnits}
              </div>
            </div>
            <div className="p-[12px] flex flex-col gap-[4px]">
              <Eyebrow>Valor</Eyebrow>
              <div className="font-['Bai_Jamjuree'] text-[18px] font-bold text-white tabular-nums">
                <span className="text-white/55 text-[12px] mr-[2px]">S/</span>
                {fmt(totalValue)}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* search */}
        <div
          className="flex items-center gap-[10px] h-[44px] px-[14px] rounded-full"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
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

        {/* categories */}
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
                  {c !== "Todos" && (
                    <span className={`ml-[6px] tabular-nums ${active ? "text-black/55" : "text-white/35"}`}>
                      {items.filter((i) => i.category === c).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {lowStock.length > 0 && cat === "Todos" && query === "" && (
          <div className="font-['Geist'] text-[11.5px] text-[#F87171]/85 px-[6px]">
            {lowStock.length} producto{lowStock.length === 1 ? "" : "s"} con stock crítico
          </div>
        )}

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
    </SubScreen>
  );
}
