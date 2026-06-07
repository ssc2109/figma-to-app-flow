import { useState } from "react";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import { SubHeader, SubScreen, ListGroup } from "./shared";

type Method = {
  id: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  default: boolean;
};

const INITIAL: Method[] = [
  { id: "cash", label: "Efectivo", desc: "Siempre disponible", Icon: Banknote, default: true },
  { id: "yape", label: "Yape", desc: "987 654 321", Icon: Smartphone, default: true },
  { id: "plin", label: "Plin", desc: "987 654 321", Icon: Smartphone, default: true },
  { id: "card", label: "Tarjeta", desc: "Próximamente", Icon: CreditCard, default: false },
];

export default function PaymentsView({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL.map((m) => [m.id, m.default])),
  );

  return (
    <SubScreen>
      <SubHeader eyebrow="Cómo cobras" title="Métodos de pago" onBack={onBack} />

      <div className="px-[20px] pt-[6px]">
        <ListGroup>
          {INITIAL.map((m, idx) => {
            const isOn = active[m.id];
            const disabled = m.id === "card";
            const Icon = m.Icon;
            return (
              <div key={m.id}>
                <div className="flex items-center gap-[14px] px-[16px] py-[14px]">
                  <Icon className="h-[18px] w-[18px] text-white/70 shrink-0" strokeWidth={1.6} />
                  <div className="flex-1 min-w-0">
                    <div className="font-['Geist'] text-[14.5px] text-white">{m.label}</div>
                    <div className="font-['Geist'] text-[12px] text-white/45 mt-[2px]">{m.desc}</div>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setActive((a) => ({ ...a, [m.id]: !a[m.id] }))}
                    className={`relative h-[28px] w-[46px] rounded-full transition-colors ${
                      disabled ? "opacity-30" : ""
                    }`}
                    style={{
                      background: isOn ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.08)",
                    }}
                    aria-pressed={isOn}
                  >
                    <span
                      className="absolute top-[3px] h-[22px] w-[22px] rounded-full transition-all"
                      style={{
                        left: isOn ? "21px" : "3px",
                        background: isOn ? "#000" : "rgba(255,255,255,0.85)",
                      }}
                    />
                  </button>
                </div>
                {idx < INITIAL.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
              </div>
            );
          })}
        </ListGroup>
      </div>
    </SubScreen>
  );
}
