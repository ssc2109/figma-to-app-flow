import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Minus, PackagePlus, Package, X, Trash2 } from "lucide-react";
import { useInventory, type InventoryItem } from "@/data/inventory";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";

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

function InventoryRow({
  item,
  last,
  onOpen,
}: {
  item: InventoryItem;
  last?: boolean;
  onOpen: () => void;
}) {
  const { adjustStock } = useInventory();
  const isLow = item.stock <= item.lowStockThreshold;

  return (
    <>
      <div className="flex items-center gap-[14px] px-[16px] py-[12px]">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 min-w-0 text-left active:opacity-70"
        >
          <div className="font-['Geist'] text-[14.5px] text-white truncate">{item.name}</div>
          <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
            S/ {item.price.toFixed(2)}
            {isLow && (
              <span className="ml-[8px]" style={{ color: "#F87171" }}>
                · stock bajo
              </span>
            )}
          </div>
        </button>
        <Stepper value={item.stock} onDelta={(d) => adjustStock(item.id, d)} />
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
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
      <p className="font-['Geist'] text-[13.5px] text-white/50 max-w-[280px] leading-[1.5] mb-[20px]">
        Agrega tu primer producto para empezar a controlar tu inventario y registrar ventas.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="h-[44px] px-[20px] rounded-full bg-white text-black font-['Geist'] text-[13.5px] font-semibold active:scale-95 flex items-center gap-[8px]"
      >
        <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
        Agregar producto
      </button>
    </div>
  );
}

function ProductSheet({
  item,
  onClose,
}: {
  item: InventoryItem | "new";
  onClose: () => void;
}) {
  const { addProduct, updateProduct, removeProduct, items } = useInventory();
  const { limits, plan } = usePlan();
  const isNew = item === "new";
  const current = isNew ? null : item;

  const [name, setName] = useState(current?.name ?? "");
  const [price, setPrice] = useState(current ? String(current.price) : "");
  const [cost, setCost] = useState(current ? String(current.cost) : "");
  const [stock, setStock] = useState(current ? String(current.stock) : "");
  const [category, setCategory] = useState(current?.category ?? "General");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Pon un nombre al producto");
      return;
    }
    const p = parseFloat(price.replace(",", ".")) || 0;
    if (p <= 0) {
      toast.error("Pon un precio válido");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        if (Number.isFinite(limits.maxCatalogProducts) && items.length >= limits.maxCatalogProducts) {
          toast.error(
            `Tu plan ${plan} permite hasta ${limits.maxCatalogProducts} productos. Sube al plan Avanzado para catálogo ilimitado.`,
          );
          setSaving(false);
          return;
        }
        await addProduct({
          name: name.trim(),
          price: p,
          cost: parseFloat(cost.replace(",", ".")) || 0,
          stock: parseInt(stock, 10) || 0,
          category: category.trim() || "General",
        });
        toast.success("Producto agregado");
      } else if (current) {
        await updateProduct(current.id, {
          name: name.trim(),
          price: p,
          cost: parseFloat(cost.replace(",", ".")) || 0,
          stock: parseInt(stock, 10) || 0,
          category: category.trim() || "General",
        });
        toast.success("Producto actualizado");
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!current) return;
    if (!confirm(`¿Eliminar "${current.name}"?`)) return;
    await removeProduct(current.id);
    toast.success("Producto eliminado");
    onClose();
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-[16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div
        initial={{ y: 20, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-[24px] pt-[18px] pb-[24px] px-[20px] max-h-[calc(100dvh-32px)] overflow-y-auto"
        style={{
          background: "rgba(14,14,16,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
            aria-label="Cerrar"
          >
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col gap-[10px]">
          <Field label="Nombre" value={name} onChange={setName} placeholder="Ej. Inca Kola 500ml" />
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="Precio (S/)" value={price} onChange={setPrice} placeholder="0.00" type="number" />
            <Field label="Costo (S/)" value={cost} onChange={setCost} placeholder="0.00" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="Stock" value={stock} onChange={setStock} placeholder="0" type="number" />
            <Field label="Categoría" value={category} onChange={setCategory} placeholder="General" />
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="mt-[18px] w-full h-[52px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={del}
            className="mt-[10px] w-full h-[44px] rounded-[14px] font-['Geist'] text-[13px] text-[#F87171] active:bg-white/[0.04] flex items-center justify-center gap-[8px]"
            style={{ border: "1px solid rgba(248,113,113,0.20)" }}
          >
            <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.8} />
            Eliminar producto
          </button>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}


function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-['Geist'] uppercase tracking-[1.2px] text-white/40">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        className="h-[46px] rounded-[12px] px-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/30 outline-none focus:border-white/30 transition"
      />
    </label>
  );
}

export default function InventoryView({ onBack }: { onBack: () => void }) {
  const { items, loading } = useInventory();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todos");
  const [sheet, setSheet] = useState<InventoryItem | "new" | null>(null);

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
        eyebrow={`${items.length} producto${items.length === 1 ? "" : "s"}`}
        title="Inventario"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => setSheet("new")}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
            aria-label="Añadir producto"
          >
            <PackagePlus className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        }
      />

      {loading ? (
        <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">
          Cargando…
        </div>
      ) : items.length === 0 ? (
        <EmptyState onAdd={() => setSheet("new")} />
      ) : (
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
              <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">
                Nada coincide
              </div>
            ) : (
              filtered.map((item, idx) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  last={idx === filtered.length - 1}
                  onOpen={() => setSheet(item)}
                />
              ))
            )}
          </ListGroup>
        </div>
      )}

      <AnimatePresence>{sheet && <ProductSheet item={sheet} onClose={() => setSheet(null)} />}</AnimatePresence>
    </SubScreen>
  );
}
