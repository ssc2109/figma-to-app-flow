import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Search, Package, Sparkles, Plus, Pencil, Trash2 } from "lucide-react";
import { SubHeader, SubScreen } from "./shared";
import { useInventory, type InventoryItem } from "@/data/inventory";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import ProductSheet from "./ProductSheet";

/**
 * Catálogo (vitrina pública). Aquí se crean, editan y eliminan productos.
 * Inventario solo gestiona stock.
 */
export default function CatalogView({ onBack }: { onBack: () => void }) {
  const inv = useInventory();
  const { limits } = usePlan();
  const showTraxBadge = !limits.hasCatalogBranding;
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState<InventoryItem | "new" | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return inv.items.filter((i) => !s || i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
  }, [inv.items, q]);

  const share = async () => {
    const url = `${window.location.origin}/c/${inv.items[0]?.dbId?.slice(0, 8) ?? "demo"}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace del catálogo copiado", { description: url });
    } catch {
      toast.info(url);
    }
  };

  const remove = async (p: InventoryItem) => {
    if (!confirm(`¿Eliminar "${p.name}" del catálogo?`)) return;
    await inv.removeProduct(p.id);
    toast.success("Producto eliminado");
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Vitrina pública"
        title="Catálogo"
        onBack={onBack}
        action={
          <button
            onClick={() => setSheet("new")}
            className="h-[36px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-black bg-white flex items-center gap-[6px] active:scale-95"
            aria-label="Añadir producto"
          >
            <Plus className="h-[13px] w-[13px]" strokeWidth={2.2} />
            Añadir
          </button>
        }
      />

      <div className="px-[20px] pt-[4px] pb-[40px]">
        <div className="mb-[14px] font-['Geist'] text-[12.5px] text-white/50 leading-[1.5]">
          Así se verían tus productos si compartes tu catálogo con clientes por WhatsApp.
        </div>

        <button
          onClick={share}
          className="w-full h-[46px] rounded-[14px] flex items-center justify-center gap-[8px] font-['Geist'] text-[13.5px] font-semibold text-white mb-[14px] active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <Share2 className="h-[14px] w-[14px]" strokeWidth={1.9} />
          Compartir catálogo
        </button>

        <div
          className="flex items-center gap-[10px] h-[44px] px-[14px] rounded-[14px] mb-[14px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="h-[15px] w-[15px] text-white/45" strokeWidth={1.8} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en catálogo…"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
          />
        </div>

        {inv.loading ? (
          <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando…</div>
        ) : inv.items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-[60px] px-[20px]">
            <div
              className="h-[60px] w-[60px] rounded-[18px] grid place-items-center mb-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Package className="h-[24px] w-[24px] text-white/55" strokeWidth={1.5} />
            </div>
            <p className="font-['Geist'] text-[13px] text-white/55 max-w-[260px] leading-[1.5] mb-[18px]">
              Aún no tienes productos en tu catálogo. Añade el primero para empezar.
            </p>
            <button
              onClick={() => setSheet("new")}
              className="h-[44px] px-[20px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[13.5px] font-semibold active:scale-95 flex items-center gap-[8px]"
            >
              <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
              Añadir producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[10px]">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="relative rounded-[18px] overflow-hidden p-[10px] flex flex-col gap-[10px]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="relative aspect-square rounded-[12px] grid place-items-center overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-[24px] w-[24px] text-white/45" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-['Geist'] text-[13px] text-white truncate">{p.name}</div>
                  <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tabular-nums mt-[2px]">
                    S/ {p.price.toFixed(2)}
                    {p.unit && p.unit !== "unidad" && (
                      <span className="ml-[4px] text-[11px] font-['Geist'] font-normal text-white/45">/{p.unit}</span>
                    )}
                  </div>
                  <div className="mt-[4px] flex items-center gap-[6px]">
                    <span
                      className="text-[10px] font-['Geist'] px-[6px] py-[2px] rounded-full"
                      style={{
                        background: p.stock > 0 ? "rgba(74,222,128,0.14)" : "rgba(248,113,113,0.14)",
                        color: p.stock > 0 ? "#4ADE80" : "#F87171",
                      }}
                    >
                      {p.stock > 0 ? "Disponible" : "Agotado"}
                    </span>
                    {p.category && (
                      <span className="text-[10px] font-['Geist'] text-white/40 truncate">{p.category}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-[6px] pt-[2px]">
                  <button
                    type="button"
                    onClick={() => setSheet(p)}
                    className="flex-1 h-[32px] rounded-[10px] flex items-center justify-center gap-[6px] font-['Geist'] text-[11.5px] font-medium text-white active:scale-95"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Pencil className="h-[11px] w-[11px]" strokeWidth={1.8} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="h-[32px] w-[32px] rounded-[10px] grid place-items-center active:scale-95"
                    style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.20)" }}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-[12px] w-[12px] text-[#F87171]" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showTraxBadge && (
          <div className="mt-[24px] flex items-center justify-center gap-[6px] font-['Geist'] text-[11px] text-white/45">
            <Sparkles className="h-[11px] w-[11px]" strokeWidth={1.8} />
            <span>Hecho con Trax</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {sheet && <ProductSheet item={sheet} onClose={() => setSheet(null)} />}
      </AnimatePresence>
    </SubScreen>
  );
}
