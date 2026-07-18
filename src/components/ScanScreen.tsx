import { useMemo, useState } from "react";
import { ScanLine, Search, Package, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useInventory } from "@/data/inventory";

export default function ScanScreen({ open, onClose, onOpenInventory }: { open: boolean; onClose: () => void; onOpenInventory: () => void }) {
  const inv = useInventory();
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return inv.items
      .filter((i) => i.name.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, inv.items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[75] bg-black"
        >
          <div className="mx-auto w-full max-w-[430px] h-full overflow-y-auto pb-[120px]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/85 backdrop-blur-xl px-[20px] pt-[18px] pb-[14px] border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
                    Escanear
                  </div>
                  <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.4px]">
                    Lector de códigos
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="h-[40px] w-[40px] rounded-full grid place-items-center active:scale-95"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  aria-label="Cerrar"
                >
                  <X className="h-[16px] w-[16px] text-white" strokeWidth={1.9} />
                </button>
              </div>
            </div>

            {/* Viewfinder placeholder */}
            <div className="px-[20px] pt-[20px]">
              <div
                className="relative aspect-square w-full rounded-[24px] overflow-hidden grid place-items-center"
                style={{
                  background: "radial-gradient(circle at 50% 40%, rgba(28,124,255,0.10), rgba(0,0,0,0.6) 65%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="absolute inset-[24px] rounded-[18px] border border-white/15" />
                <div className="absolute inset-x-[24px] top-1/2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className="relative flex flex-col items-center text-center px-[24px]">
                  <div
                    className="h-[62px] w-[62px] rounded-[20px] grid place-items-center mb-[14px]"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    <ScanLine className="h-[26px] w-[26px] text-white/80" strokeWidth={1.7} />
                  </div>
                  <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.3px]">
                    Preparando el escáner
                  </div>
                  <p className="mt-[8px] font-['Geist'] text-[12.5px] text-white/50 leading-[1.5] max-w-[260px]">
                    Aún estamos activando la cámara para leer códigos de barras. Mientras tanto puedes buscar el producto por nombre.
                  </p>
                </div>
              </div>
            </div>

            {/* Manual search */}
            <div className="px-[20px] pt-[20px]">
              <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45 mb-[8px]">
                Buscar producto manualmente
              </div>
              <div
                className="flex items-center gap-[10px] h-[46px] px-[14px] rounded-[14px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Search className="h-[16px] w-[16px] text-white/45" strokeWidth={1.8} />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Código o nombre del producto"
                  className="flex-1 bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/30"
                />
              </div>

              <div className="mt-[12px] flex flex-col gap-[8px]">
                {q.trim() === "" ? (
                  <div className="font-['Geist'] text-[12px] text-white/40 text-center py-[24px]">
                    Escribe para buscar en tu inventario.
                  </div>
                ) : matches.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-[24px]">
                    <p className="font-['Geist'] text-[13px] text-white/55">Nada coincide con “{q}”.</p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInventory();
                      }}
                      className="mt-[12px] h-[38px] px-[16px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[12.5px] font-semibold active:scale-95"
                    >
                      Ir a inventario
                    </button>
                  </div>
                ) : (
                  matches.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onOpenInventory();
                      }}
                      className="flex items-center gap-[12px] p-[12px] rounded-[16px] text-left active:scale-[0.98]"
                      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-[42px] w-[42px] rounded-[12px] grid place-items-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover rounded-[12px]" />
                        ) : (
                          <Package className="h-[18px] w-[18px] text-white/45" strokeWidth={1.6} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Geist'] text-[14px] text-white truncate">{p.name}</div>
                        <div className="font-['Geist'] text-[11.5px] text-white/45 tabular-nums">
                          S/ {p.price.toFixed(2)} · {p.stock} u
                        </div>
                      </div>
                      <ArrowRight className="h-[15px] w-[15px] text-white/30" strokeWidth={1.7} />
                    </button>
                  ))
                )}
              </div>

              <p className="mt-[24px] font-['Geist'] text-[11px] text-white/35 text-center leading-[1.5]">
                El lector de códigos de barras con cámara llegará en la próxima versión.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
