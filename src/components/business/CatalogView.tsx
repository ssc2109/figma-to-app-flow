import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "motion/react";
import { Share2, Tag, Search, Package, X, Check } from "lucide-react";
import { SubHeader, SubScreen } from "./shared";
import { useInventory } from "@/data/inventory";
import { toast } from "sonner";

/**
 * Catálogo (vitrina pública). Distinto de Inventario: aquí lo importante
 * es cómo lo verían tus clientes — no muestra costo ni stock detallado.
 */
export default function CatalogView({ onBack }: { onBack: () => void }) {
  const inv = useInventory();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);

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

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Vitrina pública"
        title="Catálogo"
        onBack={onBack}
        action={
          <button
            onClick={() => setEditing(true)}
            className="h-[36px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-white flex items-center gap-[6px] active:scale-95"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <Tag className="h-[13px] w-[13px]" strokeWidth={1.8} />
            Precios
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
            <p className="font-['Geist'] text-[13px] text-white/55 max-w-[260px] leading-[1.5]">
              Aún no tienes productos en tu catálogo. Agrégalos desde Inventario.
            </p>
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
                  className="aspect-square rounded-[12px] grid place-items-center overflow-hidden"
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
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && <PriceEditor onClose={() => setEditing(false)} />}
      </AnimatePresence>
    </SubScreen>
  );
}

function PriceEditor({ onClose }: { onClose: () => void }) {
  const inv = useInventory();
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(inv.items.map((i) => [i.id, i.price.toString()])),
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const jobs = inv.items
        .map((i) => {
          const n = parseFloat(prices[i.id]?.replace(",", ".") ?? "");
          if (!Number.isFinite(n) || n < 0 || n === i.price) return null;
          return inv.updateProduct(i.id, { price: n });
        })
        .filter(Boolean) as Promise<void>[];
      await Promise.all(jobs);
      toast.success(`Precios actualizados`);
      onClose();
    } catch (e) {
      toast.error((e as Error)?.message ?? "No se pudieron guardar los precios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[24px] px-[20px] max-h-[85vh] flex flex-col"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[14px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">Editar precios</h3>
          <button
            onClick={onClose}
            className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]"
          >
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-[8px] pb-[8px]">
          {inv.items.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-[10px] p-[10px] rounded-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-['Geist'] text-[13.5px] text-white truncate">{p.name}</div>
                <div className="font-['Geist'] text-[11px] text-white/40 tabular-nums">Antes S/ {p.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-[4px]">
                <span className="font-['Geist'] text-[12px] text-white/50">S/</span>
                <input
                  value={prices[p.id] ?? ""}
                  onChange={(e) => setPrices((cur) => ({ ...cur, [p.id]: e.target.value }))}
                  inputMode="decimal"
                  className="w-[80px] h-[36px] px-[10px] rounded-[10px] bg-white/[0.05] border border-white/[0.10] text-white text-right font-['Bai_Jamjuree'] text-[14px] tabular-nums outline-none focus:border-white/30 transition"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-[14px] w-full h-[52px] rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-[8px]"
        >
          <Check className="h-[15px] w-[15px]" strokeWidth={2.4} />
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </motion.div>
    </motion.div>
  );
}
