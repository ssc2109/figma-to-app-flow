import { ArrowRight, Bell, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";

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

  const updateQuantity = (id: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white" role="dialog" aria-modal="true" aria-label="Mi Carrito">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-black">
        <header className="flex h-[64px] shrink-0 items-center justify-between px-[20px]">
          <div className="font-['Bai_Jamjuree:Bold',sans-serif] text-[20px] tracking-[-0.5px]">Trax</div>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              className="flex size-[40px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-white/70 active:scale-95"
              aria-label="Notificaciones"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-[40px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-white active:scale-95"
              aria-label="Cerrar carrito"
            >
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-[24px] pt-[8px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <section className="mb-[28px] flex items-end justify-between">
            <div>
              <h1 className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-[28px] leading-[34px] tracking-[-0.5px]">
                Mi Carrito
              </h1>
              <p className="mt-[4px] font-['Geist:Regular',sans-serif] text-[14px] text-white/50">
                {items.length} Items
              </p>
            </div>
            <div className="flex size-[48px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)]">
              <ShoppingCart size={22} strokeWidth={1.8} />
            </div>
          </section>

          <section className="space-y-[12px]">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-[14px] rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-[12px]"
              >
                <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[18px] bg-[rgba(255,255,255,0.06)]">
                  <img src={item.image} alt={item.name} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-['Geist:Regular',sans-serif] text-[16px] font-semibold leading-[20px]">
                    {item.name}
                  </h2>
                  <p className="mt-[4px] font-['Bai_Jamjuree:SemiBold',sans-serif] text-[14px] text-white/60">
                    {formatSoles(item.price)}
                  </p>
                  <div className="mt-[12px] flex w-[104px] items-center justify-between rounded-full bg-[rgba(0,0,0,0.35)] p-[4px]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex size-[28px] items-center justify-center rounded-full bg-white text-black active:scale-95"
                      aria-label={`Agregar ${item.name}`}
                    >
                      <Plus size={16} strokeWidth={2.2} />
                    </button>
                    <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-[15px] leading-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex size-[28px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)] text-white active:scale-95"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Minus size={16} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>

                <div className="self-start pt-[2px] text-right font-['Bai_Jamjuree:Bold',sans-serif] text-[16px] leading-[20px]">
                  {formatSoles(item.price * item.quantity)}
                </div>
              </article>
            ))}
          </section>
        </main>

        <footer className="shrink-0 border-t border-white/10 bg-black/95 px-[20px] pb-[calc(20px+env(safe-area-inset-bottom))] pt-[16px] backdrop-blur-[20px]">
          <div className="space-y-[12px] pb-[18px]">
            <div className="flex items-center justify-between font-['Geist:Regular',sans-serif] text-[14px] text-white/55">
              <span>Subtotal</span>
              <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-white">{formatSoles(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-['Geist:Regular',sans-serif] text-[14px] text-white/55">
              <span>Delivery Fee / IGV</span>
              <span className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-white">{formatSoles(deliveryAndTax)}</span>
            </div>
            <div className="flex items-center justify-between pt-[4px] font-['Geist:Regular',sans-serif] text-[18px] font-semibold">
              <span>Total</span>
              <span className="font-['Bai_Jamjuree:Bold',sans-serif] text-[24px] leading-[28px]">{formatSoles(total)}</span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full bg-white font-['Geist:Regular',sans-serif] text-[16px] font-bold text-black active:scale-[0.98]"
          >
            Cobrar {formatSoles(total)}
            <ArrowRight size={20} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}