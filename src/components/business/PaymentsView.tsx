import { useState } from "react";
import { Banknote, Smartphone, CreditCard, Check } from "lucide-react";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./shared";

type Method = {
  id: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  default: boolean;
};

const INITIAL: Method[] = [
  { id: "cash", label: "Efectivo", desc: "Siempre disponible", Icon: Banknote, default: true },
  { id: "yape", label: "Yape", desc: "QR · 987 654 321", Icon: Smartphone, default: true },
  { id: "plin", label: "Plin", desc: "QR · 987 654 321", Icon: Smartphone, default: true },
  { id: "card", label: "Tarjeta", desc: "Próximamente", Icon: CreditCard, default: false },
];

export default function PaymentsView({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL.map((m) => [m.id, m.default])),
  );
  const enabledCount = Object.values(active).filter(Boolean).length;

  return (
    <SubScreen>
      <SubHeader eyebrow="Cómo cobras" title="Métodos de pago" onBack={onBack} />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <GlassCard>
          <div className="p-[16px] flex items-center gap-[12px]">
            <div
              className="h-[40px] w-[40px] rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)" }}
            >
              <Check className="h-[16px] w-[16px] text-[#4ADE80]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="font-['Geist'] text-[13.5px] font-medium text-white">
                {enabledCount} método{enabledCount === 1 ? "" : "s"} activo{enabledCount === 1 ? "" : "s"}
              </div>
              <div className="font-['Geist'] text-[11.5px] text-white/55">
                7 de cada 10 ventas en bodegas se pagan con Yape o Plin
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-[10px]">
          <Eyebrow>Configura tus métodos</Eyebrow>
          <GlassCard>
            <div className="flex flex-col">
              {INITIAL.map((m, idx) => {
                const isOn = active[m.id];
                const disabled = m.id === "card";
                return (
                  <div key={m.id}>
                    <div className="flex items-center gap-[12px] p-[14px]">
                      <div
                        className="h-[40px] w-[40px] rounded-[12px] flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <m.Icon className="h-[16px] w-[16px] text-white/80" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1">
                        <div className="font-['Geist'] text-[14px] font-medium text-white">{m.label}</div>
                        <div className="font-['Geist'] text-[11.5px] text-white/50">{m.desc}</div>
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setActive((a) => ({ ...a, [m.id]: !a[m.id] }))}
                        className={`relative h-[28px] w-[48px] rounded-full transition-colors ${
                          disabled
                            ? "bg-white/[0.04] opacity-40"
                            : isOn
                              ? "bg-white"
                              : "bg-white/[0.08]"
                        }`}
                        aria-pressed={isOn}
                      >
                        <span
                          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-black transition-all ${
                            isOn ? "left-[23px]" : "left-[3px]"
                          }`}
                        />
                      </button>
                    </div>
                    {idx < INITIAL.length - 1 && <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </SubScreen>
  );
}
