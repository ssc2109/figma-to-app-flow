import { ArrowRight, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import imgIncaKola500Ml from "@/imports/HtmlBody/7a7a1a54128ef8e3dee020a1832b332677bb1994.png";
import imgPanFrances from "@/imports/HtmlBody/1c39aebd1210a98a2c75e829f94bd8645a88f4eb.png";
import imgPapasLays from "@/imports/HtmlBody/3a77978991e368fdd70c8d4fe2924a0360f31f6e.png";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const initialItems: CartItem[] = [
  { id: "inca-kola", name: "Inca Kola 500ml", price: 3.5, quantity: 1, image: imgIncaKola500Ml },
  { id: "pan-frances", name: "Pan Francés", price: 0.3, quantity: 5, image: imgPanFrances },
  { id: "papas-lays", name: "Papas Lay's", price: 4.2, quantity: 2, image: imgPapasLays },
];

const deliveryAndTax = 2.5;

function formatSoles(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState(initialItems);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const total = subtotal + deliveryAndTax;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const updateQuantity = (id: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Mi Carrito"
    >
      {/* Backdrop: lets the screen behind show through, dimmed + blurred */}
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
      />

      {/* Bottom sheet */}
      <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col justify-end">
        <div className="pointer-events-auto flex max-h-[92%] flex-col overflow-hidden rounded-t-[28px] bg-black text-white shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
          {/* Drag handle */}
          <div className="flex shrink-0 justify-center pt-[10px] pb-[6px]">
            <div className="h-[4px] w-[44px] rounded-full bg-white/25" />
          </div>

          {/* Title row */}
          <div className="flex shrink-0 items-center justify-between px-[20px] pt-[14px] pb-[18px]">
            <h1 className="font-['Bai_Jamjuree:Bold',sans-serif] text-[28px] leading-[32px] tracking-[-0.5px]">
              Mi Carrito
            </h1>
            <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-[14px] py-[6px] font-['Geist:Regular',sans-serif] text-[13px] text-white/80">
              {items.length} Items
            </span>
          </div>

          {/* Items */}
          <div className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-[220px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ul className="space-y-[14px]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-stretch gap-[14px] rounded-[24px] bg-[rgba(255,255,255,0.04)] p-[14px]"
                >
                  <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[18px] bg-[rgba(255,255,255,0.06)]">
                    <img src={item.image} alt={item.name} className="size-full object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h2 className="truncate font-['Geist:Regular',sans-serif] text-[16px] font-semibold leading-[20px]">
                      {item.name}
                    </h2>
                    <p className="mt-[2px] font-['Geist:Regular',sans-serif] text-[13px] text-white/45">
                      {formatSoles(item.price)}
                    </p>
                    <p className="mt-[6px] font-['Bai_Jamjuree:Bold',sans-serif] text-[20px] leading-[24px]">
                      {formatSoles(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Vertical quantity stepper */}
                  <div className="flex w-[52px] shrink-0 flex-col items-center justify-between rounded-full bg-[rgba(255,255,255,0.06)] py-[8px]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex size-[32px] items-center justify-center rounded-full text-white active:scale-95"
                      aria-label={`Agregar ${item.name}`}
                    >
                      <Plus size={20} strokeWidth={2.2} />
                    </button>
                    <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-[16px] leading-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity > 1 ? updateQuantity(item.id, -1) : removeItem(item.id)
                      }
                      className="flex size-[32px] items-center justify-center rounded-full text-white/80 active:scale-95"
                      aria-label={`Quitar ${item.name}`}
                    >
                      {item.quantity > 1 ? (
                        <Minus size={20} strokeWidth={2.2} />
                      ) : (
                        <span className="block size-[12px] rounded-[2px] bg-white/80" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sticky footer */}
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 rounded-t-[24px] bg-[#0a0a0a]/95 px-[20px] pt-[18px] pb-[calc(20px+env(safe-area-inset-bottom))] backdrop-blur-[20px]">
            <div className="space-y-[10px] pb-[16px]">
              <div className="flex items-center justify-between font-['Geist:Regular',sans-serif] text-[14px] text-white/60">
                <span>Subtotal</span>
                <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-white">
                  {formatSoles(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between font-['Geist:Regular',sans-serif] text-[14px] text-white/60">
                <span>Delivery Fee / IGV</span>
                <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-white">
                  {formatSoles(deliveryAndTax)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-[6px] font-['Geist:Regular',sans-serif] text-[18px] font-semibold">
                <span>Total</span>
                <span className="font-['Bai_Jamjuree:Bold',sans-serif] text-[24px] leading-[28px]">
                  {formatSoles(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="flex h-[56px] w-full items-center justify-between rounded-full bg-white px-[28px] font-['Geist:Regular',sans-serif] text-[16px] font-bold text-black active:scale-[0.98]"
            >
              <span className="flex-1 text-center">Cobrar {formatSoles(total)}</span>
              <ArrowRight size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
