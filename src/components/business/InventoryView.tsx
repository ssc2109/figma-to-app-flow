import { useMemo, useState } from "react";
import { Search, Package, Pencil, Check, Plus, Minus } from "lucide-react";
import { useInventory, type InventoryItem } from "@/data/inventory";
import { toast } from "sonner";

import { SubHeader, SubScreen, ListGroup } from "./shared";

function StockInput({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
      inputMode="numeric"
      className="h-[36px] w-[68px] rounded-[10px] px-[10px] text-right font-['Bai_Jamjuree'] text-[14px] font-semibold text-white tabular-nums outline-none transition"
      style={{
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}`,
        opacity: disabled ? 0.65 : 1,
      }}
    />
  );
}

function InventoryRow({
  item,
  last,
  editing,
  draft,
  onDraftChange,
}: {
  item: InventoryItem;
  last?: boolean;
  editing: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
}) {
  const isLow = item.stock <= item.lowStockThreshold;

  return (
    <>
      <div className="flex items-center gap-[14px] px-[16px] py-[12px]">
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[14.5px] text-white truncate">{item.name}</div>
          <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
            S/ {item.price.toFixed(2)}
            {item.unit && item.unit !== "unidad" && <span className="ml-[3px] text-white/35">/{item.unit}</span>}
            {isLow && (
              <span className="ml-[8px]" style={{ color: "#F87171" }}>
                · stock bajo
              </span>
            )}
          </div>
        </div>
        <StockInput value={draft} disabled={!editing} onChange={onDraftChange} />
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-[60px] px-[20px]">
      <div
        className="h-[64px] w-[64px] rounded-[20px] flex items-center justify-center mb-[18px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Package className="h-[26px] w-[26px] text-white/55" strokeWidth={1.5} />
      </div>
      <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white mb-[8px]">
        Aún no tienes productos
      </h3>
      <p className="font-['Geist'] text-[13.5px] text-white/50 max-w-[280px] leading-[1.5]">
        Añade productos desde la sección <span className="text-white/80">Catálogo</span> para gestionarlos aquí.
      </p>
    </div>
  );
}

export default function InventoryView({ onBack }: { onBack: () => void }) {
  const { items, loading, updateProduct } = useInventory();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todos");
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["Todos", ...Array.from(set)];
  }, [items]);

  const filtered = items.filter(
    (i) =>
      (cat === "Todos" || i.category === cat) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );

  const startEditing = () => {
    setDrafts(Object.fromEntries(items.map((i) => [i.id, String(i.stock)])));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDrafts({});
  };

  const commit = async () => {
    setSaving(true);
    try {
      const jobs: Promise<void>[] = [];
      for (const it of items) {
        const raw = drafts[it.id];
        if (raw === undefined) continue;
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 0 || n === it.stock) continue;
        jobs.push(updateProduct(it.id, { stock: n }));
      }
      await Promise.all(jobs);
      toast.success(jobs.length ? "Inventario actualizado" : "Sin cambios");
      setEditing(false);
      setDrafts({});
    } catch (e) {
      toast.error((e as Error)?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow={`${items.length} producto${items.length === 1 ? "" : "s"}`}
        title="Inventario"
        onBack={onBack}
        action={
          items.length > 0 ? (
            editing ? (
              <button
                type="button"
                onClick={cancelEditing}
                className="h-[36px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-white/70 active:scale-95"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="h-[36px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-white flex items-center gap-[6px] active:scale-95"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <Pencil className="h-[12px] w-[12px]" strokeWidth={1.9} />
                Editar Inventario
              </button>
            )
          ) : null
        }
      />

      {loading ? (
        <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-[14px] px-[20px] pt-[6px] pb-[120px]">
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

          {categories.length > 1 && (
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
          )}

          <ListGroup>
            {filtered.length === 0 ? (
              <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">Nada coincide</div>
            ) : (
              filtered.map((item, idx) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  last={idx === filtered.length - 1}
                  editing={editing}
                  draft={editing ? (drafts[item.id] ?? String(item.stock)) : String(item.stock)}
                  onDraftChange={(v) => setDrafts((d) => ({ ...d, [item.id]: v }))}
                />
              ))
            )}
          </ListGroup>
        </div>
      )}

      {editing && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] px-[20px] pt-[14px] pb-[calc(env(safe-area-inset-bottom)+18px)]"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 40%, #000 100%)",
          }}
        >
          <div className="mx-auto max-w-[430px]">
            <button
              type="button"
              onClick={commit}
              disabled={saving}
              className="w-full h-[54px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-[8px]"
            >
              <Check className="h-[15px] w-[15px]" strokeWidth={2.4} />
              {saving ? "Guardando…" : "Terminé"}
            </button>
          </div>
        </div>
      )}
    </SubScreen>
  );
}
