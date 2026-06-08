import { useMemo, useState } from "react";
import { Search, Plus, Minus, PackagePlus } from "lucide-react";
import { useInventory, LOW_STOCK_THRESHOLD, type InventoryItem } from "@/data/inventory";
import { SubHeader, SubScreen, ListGroup } from "./shared";

function Stepper({ value, onDelta }: { value: number; onDelta: (d: number) => void }) {
  return (
    <div className="flex items-center gap-[4px]">
      <button
        type="button"
        onClick={() => onDelta(-1)}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full active:bg-white/[0.06]"
        style={{ border: "1px solid rgba(255,255,255,0.10)" }}
        aria-label="Restar"
      >
        <Minus className="h-[12px] w-[12px] text-white/75" strokeWidth={2} />
      </button>
      <span className="min-w-[32px] text-center font-['Bai_Jamjuree'] text-[13.5px] font-semibold text-white tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onDelta(1)}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full active:bg-white/[0.06]"
        style={{ border: "1px solid rgba(255,255,255,0.10)" }}
        aria-label="Sumar"
      >
        <Plus className="h-[12px] w-[12px] text-white/75" strokeWidth={2} />
      </button>
    </div>
  );
}

function InventoryRow({ item, last }: { item: InventoryItem; last?: boolean }) {
  const { adjustStock } = useInventory();
  const isLow = item.stock <= LOW_STOCK_THRESHOLD;
  return (
    <>
      <div className="flex items-center gap-[14px] px-[16px] py-[12px]">
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[14.5px] text-white truncate">{item.name}</div>
          <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
            S/ {item.price.toFixed(2)}
            {isLow && (
              <span className="ml-[8px]" style={{ color: "#F87171" }}>
                · stock bajo
              </span>
            )}
          </div>
        </div>
        <Stepper value={item.stock} onDelta={(d) => adjustStock(item.id, d)} />
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

export default function InventoryView({ onBack }: { onBack: () => void }) {
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
    <SubScreen>
      <SubHeader
        eyebrow={`${items.length} productos`}
        title="Inventario"
        onBack={onBack}
        action={
          <button
            type="button"
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
            aria-label="Añadir producto"
          >
            <PackagePlus className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        }
      />

      <div className="flex flex-col gap-[14px] px-[20px] pt-[6px]">
        <div
          className="flex items-center gap-[10px] h-[44px] px-[16px] rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="h-[15px] w-[15px] text-white/40" strokeWidth={1.8} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
          />
        </div>

        <div className="-mx-[20px] overflow-x-auto no-scrollbar">
          <div className="flex gap-[8px] px-[20px]">
            {categories.map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className="shrink-0 h-[32px] px-[14px] rounded-full font-['Geist'] text-[12.5px] font-medium transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.95)" : "transparent",
                    color: active ? "#000" : "rgba(255,255,255,0.65)",
                    border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <ListGroup>
          {filtered.length === 0 && (
            <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">
              Sin productos
            </div>
          )}
          {filtered.map((item, idx) => (
            <InventoryRow key={item.id} item={item} last={idx === filtered.length - 1} />
          ))}
        </ListGroup>
      </div>
    </SubScreen>
  );
}
