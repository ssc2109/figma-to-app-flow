import { Lock, Sparkles } from "lucide-react";
import { SubHeader, SubScreen } from "./shared";

type Props = {
  title: string;
  eyebrow?: string;
  onBack: () => void;
  onUpgrade?: () => void;
  message: string;
  requiredPlan?: "Pro" | "Avanzado";
};

/** Pantalla de bloqueo por plan. Se muestra cuando el usuario intenta acceder a
 *  una función que su plan actual no incluye. */
export default function UpgradeGate({
  title,
  eyebrow = "Función premium",
  onBack,
  onUpgrade,
  message,
  requiredPlan = "Pro",
}: Props) {
  return (
    <SubScreen>
      <SubHeader eyebrow={eyebrow} title={title} onBack={onBack} />
      <div className="px-[20px] pt-[10px] pb-[40px] flex flex-col items-center text-center">
        <div
          className="h-[72px] w-[72px] rounded-[22px] grid place-items-center mb-[18px]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <Lock className="h-[26px] w-[26px] text-white/70" strokeWidth={1.6} />
        </div>
        <h3 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.3px] mb-[8px]">
          Disponible en {requiredPlan}
        </h3>
        <p className="font-['Geist'] text-[13.5px] text-white/60 max-w-[300px] leading-[1.55] mb-[24px]">
          {message}
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="h-[48px] px-[22px] rounded-full bg-white text-black font-['Geist'] text-[14px] font-semibold flex items-center gap-[8px] active:scale-95"
          >
            <Sparkles className="h-[14px] w-[14px]" strokeWidth={2} />
            Ver planes
          </button>
        )}
      </div>
    </SubScreen>
  );
}
