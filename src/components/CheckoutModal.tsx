import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { formatSoles } from "@/data/products";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

interface CartModalProps {
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function CheckoutModal({
  items,
  subtotal,
  deliveryFee,
  onChangeQty,
  onRemove,
  onClose,
}: CartModalProps) {
  const total = subtotal + deliveryFee;
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);

  useEffect(() => {
    const r1 = requestAnimationFrame(() => {
      setBackdropVisible(true);
      const r2 = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleStart = (clientY: number, target: HTMLElement) => {
    if (
      target.closest('[data-name="Swipe Handle"]') ||
      target.closest('[data-name="Header"]') ||
      target.closest('[data-name="Header:margin"]')
    ) {
      setStartY(clientY);
      setIsDragging(true);
    }
  };
  const handleMove = (clientY: number) => {
    if (startY === null || !isDragging) return;
    const deltaY = clientY - startY;
    if (deltaY > 0) setCurrentY(deltaY);
  };
  const handleEnd = () => {
    if (!isDragging) return;
    if (currentY > 120) onClose();
    else setCurrentY(0);
    setStartY(null);
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center" role="dialog" aria-modal="true" aria-label="Mi Carrito">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-[6px] transition-opacity duration-300 ${backdropVisible ? "opacity-100" : "opacity-0"}`}
      />
      <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col justify-end pt-[64px] pointer-events-none">
        <div
          className="relative w-full bg-black rounded-tl-[40px] rounded-tr-[40px] flex flex-col pointer-events-auto"
          style={{
            height: "100%",
            transform: mounted ? `translateY(${currentY}px)` : "translateY(100%)",
            transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
          onTouchStart={(e) => handleStart(e.touches[0].clientY, e.target as HTMLElement)}
          onTouchMove={(e) => handleMove(e.touches[0].clientY)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientY, e.target as HTMLElement)}
          onMouseMove={isDragging ? (e) => handleMove(e.clientY) : undefined}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        >
          {/* Swipe Handle */}
          <div className="content-stretch flex items-start justify-center py-[16px]" data-name="Swipe Handle">
            <div className="bg-[rgba(255,255,255,0.1)] h-[6px] relative rounded-[9999px] shrink-0 w-[48px]" />
          </div>

          {/* Header */}
          <div className="pb-[24px]" data-name="Header:margin">
            <div className="relative shrink-0 w-full" data-name="Header">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
                  <div className="content-stretch flex flex-col items-start relative shrink-0">
                    <div className="[word-break:break-word] flex flex-col font-['Geist:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[24px] text-white whitespace-nowrap">
                      <p className="leading-[32px]">Mi Carrito</p>
                    </div>
                  </div>
                  <div className="bg-[#201f1f] content-stretch flex flex-col items-start px-[16px] py-[6px] relative rounded-[9999px] shrink-0">
                    <div className="[word-break:break-word] flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#c4c7c8] text-[14px] whitespace-nowrap">
                      <p className="leading-[20px]">{ITEMS.length} Items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Product List */}
          <div className="flex-1 overflow-y-auto px-[20px] pb-[24px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="content-stretch flex flex-col gap-[16px] items-start">
              {ITEMS.map((item) => (
                <div key={item.name} className="bg-[#1c1b1b] relative rounded-[32px] shrink-0 w-full">
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex gap-[16px] items-center p-[16px] relative size-full">
                      <div className="aspect-square w-[80px] bg-black content-stretch flex items-center justify-center overflow-clip relative rounded-[16px] shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="content-stretch flex flex-col items-start flex-1 relative shrink-0">
                        <div className="[word-break:break-word] flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[18px] text-white">
                          <p className="leading-[28px]">{item.name}</p>
                        </div>
                        <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#c4c7c8] text-[14px]">
                          <p className="leading-[20px]">{item.unit}</p>
                        </div>
                        <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0">
                          <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white">
                            <p className="leading-[28px]">{item.total}</p>
                          </div>
                        </div>
                      </div>
                      <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] content-stretch flex flex-col gap-[16px] items-center px-px py-[13px] relative rounded-[9999px] shrink-0 w-[48px] border border-[rgba(255,255,255,0.1)]">
                        <button className="relative shrink-0 size-[24px] flex items-center justify-center text-white">
                          <Plus size={18} strokeWidth={2.4} />
                        </button>
                        <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#e5e2e1] text-[16px] whitespace-nowrap">
                          <p className="leading-[24px]">{item.qty}</p>
                        </div>
                        <button className="relative shrink-0 size-[24px] flex items-center justify-center text-[#C4C7C8]/50">
                          <Minus size={18} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="bg-[#0e0e0e] content-stretch drop-shadow-[0px_-20px_25px_rgba(0,0,0,0.5)] flex flex-col gap-[16px] items-start p-[24px] rounded-tl-[32px] rounded-tr-[32px]">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                <div className="font-['Geist:Regular',sans-serif] text-[#c4c7c8] text-[16px] leading-[24px]">Subtotal</div>
                <div className="font-['Bai_Jamjuree:Medium',sans-serif] text-[16px] text-white leading-[24px]">S/ 13.40</div>
              </div>
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                <div className="font-['Geist:Regular',sans-serif] text-[#c4c7c8] text-[16px] leading-[24px]">Delivery Fee / IGV</div>
                <div className="font-['Bai_Jamjuree:Medium',sans-serif] text-[16px] text-white leading-[24px]">S/ 2.50</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-px relative shrink-0 w-full" />
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                <div className="font-['Geist:Bold',sans-serif] font-bold text-[18px] text-white leading-[28px]">Total</div>
                <div className="font-['Bai_Jamjuree:SemiBold',sans-serif] text-[24px] text-white leading-[32px]">S/ 15.90</div>
              </div>
            </div>
            <button
              type="button"
              className="drop-shadow-[0px_10px_15px_rgba(255,255,255,0.15)] h-[64px] relative rounded-[9999px] shrink-0 w-full cursor-pointer active:scale-95 transition-transform"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(226, 226, 226) 100%)" }}
            >
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center justify-between px-[32px] relative size-full">
                  <div className="font-['Geist:Bold',sans-serif] font-bold text-[#0a0b14] text-[18px] leading-[28px]">
                    Cobrar S/ 15.90
                  </div>
                  <ArrowRight size={18} strokeWidth={2.4} className="text-[#0a0b14]" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
