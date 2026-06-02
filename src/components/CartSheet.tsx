import { useEffect, useState } from "react";
import { Plus, Minus, ArrowRight, X } from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  unitPrice: number;
  qty: number;
};

const INITIAL: CartItem[] = [
  { id: "inca", name: "Inca Kola 500ml", unitPrice: 3.5, qty: 1 },
  { id: "pan", name: "Pan Francés", unitPrice: 0.3, qty: 5 },
  { id: "lays", name: "Papas Lay's", unitPrice: 4.2, qty: 2 },
];

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSheet({ open, onClose }: CartSheetProps) {
  const [items, setItems] = useState<CartItem[]>(INITIAL);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const update = (id: string, delta: number) =>
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
        .filter((it) => it.qty > 0),
    );

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const fee = 2.5;
  const total = subtotal + fee;
  const totalItems = items.reduce((s, it) => s + it.qty, 0);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[430px] bg-black rounded-t-[28px] border-t border-white/10 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "92vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Mi Carrito"
      >
        {/* Drag handle */}
        <div className="pt-[10px] pb-[6px] flex justify-center">
          <div className="h-[4px] w-[36px] rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-[20px] pt-[8px] pb-[16px] flex items-center justify-between">
          <h2 className="font-['Bai_Jamjuree',sans-serif] font-semibold text-white text-[24px] tracking-[-0.5px]">
            Mi Carrito
          </h2>
          <div className="flex items-center gap-[8px]">
            <span className="px-[12px] py-[6px] rounded-full bg-white/[0.06] border border-white/10 text-white text-[12px] font-['Geist',sans-serif] font-medium">
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="size-[36px] rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-transform"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-[16px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-[12px] pb-[16px]">
            {items.length === 0 && (
              <div className="text-center text-white/50 text-[14px] py-[40px] font-['Geist',sans-serif]">
                Tu carrito está vacío
              </div>
            )}
            {items.map((it) => (
              <div
                key={it.id}
                className="bg-white/[0.04] border border-white/[0.06] rounded-[20px] p-[12px] flex items-center gap-[12px]"
              >
                {/* Thumb */}
                <div className="size-[72px] rounded-[16px] bg-white/[0.06] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <span className="text-white/50 text-[10px] font-['Geist',sans-serif] text-center leading-tight px-[6px]">
                    {it.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-['Geist',sans-serif] font-medium text-white text-[15px] leading-[20px] truncate">
                    {it.name}
                  </p>
                  <p className="font-['Geist',sans-serif] text-white/50 text-[12px] mt-[2px]">
                    {fmt(it.unitPrice)}
                  </p>
                  <p className="font-['Bai_Jamjuree',sans-serif] font-bold text-white text-[16px] mt-[4px]">
                    {fmt(it.unitPrice * it.qty)}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex flex-col items-center gap-[2px] bg-white/[0.06] border border-white/[0.06] rounded-full px-[6px] py-[8px]">
                  <button
                    type="button"
                    onClick={() => update(it.id, +1)}
                    aria-label="Agregar uno"
                    className="size-[28px] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    <Plus size={16} strokeWidth={2} />
                  </button>
                  <span className="font-['Bai_Jamjuree',sans-serif] font-semibold text-white text-[15px] min-w-[20px] text-center">
                    {it.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => update(it.id, -1)}
                    aria-label="Quitar uno"
                    className="size-[28px] rounded-full flex items-center justify-center text-white/70 active:scale-90 transition-transform"
                  >
                    <Minus size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: totals + CTA */}
        <div className="px-[20px] pt-[16px] pb-[24px] border-t border-white/[0.06] bg-black">
          <div className="flex flex-col gap-[8px] mb-[16px]">
            <div className="flex justify-between font-['Geist',sans-serif] text-[14px]">
              <span className="text-white/60">Subtotal</span>
              <span className="text-white font-['Bai_Jamjuree',sans-serif] font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between font-['Geist',sans-serif] text-[14px]">
              <span className="text-white/60">Delivery Fee / IGV</span>
              <span className="text-white font-['Bai_Jamjuree',sans-serif] font-medium">{fmt(fee)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-[8px] border-t border-white/[0.06]">
              <span className="font-['Geist',sans-serif] font-semibold text-white text-[16px]">Total</span>
              <span className="font-['Bai_Jamjuree',sans-serif] font-bold text-white text-[22px] tracking-[-0.5px]">
                {fmt(total)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            className="w-full h-[56px] rounded-full bg-white text-black flex items-center justify-between px-[24px] active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <span className="font-['Geist',sans-serif] font-bold text-[16px]">
              Cobrar {fmt(total)}
            </span>
            <ArrowRight size={20} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
