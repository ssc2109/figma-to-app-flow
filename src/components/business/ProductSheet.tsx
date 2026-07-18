import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, Trash2, Camera, Package } from "lucide-react";
import { toast } from "sonner";
import { useInventory, type InventoryItem } from "@/data/inventory";
import { usePlan } from "@/hooks/usePlan";
import { useConfirm } from "@/components/ui/confirm";

const CATEGORIES = ["Producto", "Servicio", "Oferta/Combo"] as const;
const UNITS = ["unidad", "kg", "g", "L", "ml", "docena", "six-pack", "paquete", "caja"] as const;

async function fileToResizedDataUrl(file: File, maxSize = 720, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no soportado");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ProductSheet({
  item,
  onClose,
}: {
  item: InventoryItem | "new";
  onClose: () => void;
}) {
  const { addProduct, updateProduct, removeProduct, items } = useInventory();
  const { limits, plan } = usePlan();
  const confirm = useConfirm();
  const isNew = item === "new";
  const current = isNew ? null : item;

  const [name, setName] = useState(current?.name ?? "");
  const [price, setPrice] = useState(current ? String(current.price) : "");
  const [cost, setCost] = useState(current ? String(current.cost) : "");
  const [stock, setStock] = useState(current ? String(current.stock) : "");
  const [category, setCategory] = useState<string>(
    current && (CATEGORIES as readonly string[]).includes(current.category) ? current.category : "Producto",
  );
  const [unit, setUnit] = useState<string>(current?.unit || "unidad");
  const [image, setImage] = useState<string>(current?.image ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // reset on open
  useEffect(() => {
    if (isNew) {
      setName(""); setPrice(""); setCost(""); setStock("");
      setCategory("Producto"); setUnit("unidad"); setImage("");
    }
  }, [isNew]);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await fileToResizedDataUrl(f);
      setImage(url);
    } catch (e) {
      toast.error("No se pudo cargar la imagen");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) return toast.error("Pon un nombre al producto");
    const p = parseFloat(price.replace(",", ".")) || 0;
    if (p <= 0) return toast.error("Pon un precio válido");

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
          category,
          unit,
          image,
        });
        toast.success("Producto agregado");
      } else if (current) {
        await updateProduct(current.id, {
          name: name.trim(),
          price: p,
          cost: parseFloat(cost.replace(",", ".")) || 0,
          stock: parseInt(stock, 10) || 0,
          category,
          unit,
          image,
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
    if (!confirm(`¿Eliminar "${current.name}" del catálogo?`)) return;
    await removeProduct(current.id);
    toast.success("Producto eliminado");
    onClose();
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-[16px]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div
        initial={{ y: 20, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-[24px] pt-[18px] pb-[24px] px-[20px] max-h-[calc(100dvh-32px)] overflow-y-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h3>
          <button type="button" onClick={onClose}
            className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
            aria-label="Cerrar">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        {/* Foto */}
        <div className="flex items-center gap-[14px] mb-[14px]">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative h-[88px] w-[88px] rounded-[18px] overflow-hidden grid place-items-center active:opacity-80"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)" }}
          >
            {image ? (
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Package className="h-[24px] w-[24px] text-white/45" strokeWidth={1.6} />
            )}
            <div className="absolute bottom-[6px] right-[6px] h-[26px] w-[26px] rounded-full bg-black/70 grid place-items-center border border-white/15">
              <Camera className="h-[12px] w-[12px] text-white" strokeWidth={1.8} />
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-['Geist'] text-[13px] text-white/75">Foto del producto</div>
            <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[3px] leading-[1.4]">
              {uploading ? "Procesando…" : image ? "Toca para cambiar" : "Toca para elegir una imagen"}
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="mt-[8px] font-['Geist'] text-[11.5px] text-[#F87171] active:opacity-70"
              >
                Quitar foto
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <Field label="Nombre" value={name} onChange={setName} placeholder="Ej. Inca Kola 500ml" />
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="Precio (S/)" value={price} onChange={setPrice} placeholder="0.00" type="number" />
            <Field label="Costo (S/)" value={cost} onChange={setCost} placeholder="0.00" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <Field label="Stock" value={stock} onChange={setStock} placeholder="0" type="number" />
            <SelectField label="Unidad" value={unit} onChange={setUnit} options={UNITS as unknown as string[]} />
          </div>
          <SelectField
            label="Categoría"
            value={category}
            onChange={setCategory}
            options={CATEGORIES as unknown as string[]}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving || uploading}
          className="mt-[18px] w-full h-[52px] rounded-[16px] bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
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
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
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

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10.5px] font-['Geist'] uppercase tracking-[1.2px] text-white/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] rounded-[12px] px-[12px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-['Geist'] outline-none focus:border-white/30 transition appearance-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-opacity='0.5' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "34px",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#0e0e10" }}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
