import { ChevronRight, UserPlus } from "lucide-react";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./shared";

const MEMBERS = [
  { name: "Alberto Ramos", role: "Dueño", initials: "AR", access: "Total" },
  { name: "Lucía Mendoza", role: "Cajera", initials: "LM", access: "Ventas y caja" },
  { name: "Diego Paredes", role: "Repositor", initials: "DP", access: "Inventario" },
];

export default function TeamView({ onBack }: { onBack: () => void }) {
  return (
    <SubScreen>
      <SubHeader
        eyebrow="Quiénes trabajan contigo"
        title="Equipo"
        onBack={onBack}
        action={
          <button
            type="button"
            className="flex h-[40px] items-center gap-[6px] rounded-full bg-white text-black px-[14px] active:scale-95"
          >
            <UserPlus className="h-[15px] w-[15px]" strokeWidth={2} />
            <span className="font-['Geist'] text-[13px] font-semibold">Invitar</span>
          </button>
        }
      />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <p className="font-['Geist'] text-[13px] text-white/55 px-[4px] leading-[1.5]">
          Cada persona en tu negocio entra con su propio acceso. Tú controlas qué pueden ver y hacer.
        </p>

        <GlassCard>
          <div className="flex flex-col">
            {MEMBERS.map((m, idx) => (
              <div key={m.name}>
                <button
                  type="button"
                  className="w-full flex items-center gap-[12px] p-[14px] active:bg-white/[0.03]"
                >
                  <div
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="font-['Bai_Jamjuree'] text-[13px] font-semibold text-white">
                      {m.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-['Geist'] text-[14px] font-medium text-white truncate">
                      {m.name}
                    </div>
                    <div className="mt-[2px] flex items-center gap-[6px]">
                      <span className="font-['Geist'] text-[12px] text-white/55">{m.role}</span>
                      <span className="text-white/20 text-[10px]">·</span>
                      <span className="font-['Geist'] text-[12px] text-white/45">{m.access}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-[16px] w-[16px] text-white/35" strokeWidth={1.8} />
                </button>
                {idx < MEMBERS.length - 1 && <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />}
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-[10px]">
          <Eyebrow>Roles disponibles</Eyebrow>
          <GlassCard>
            <div className="p-[14px] flex flex-col gap-[10px]">
              {[
                { r: "Dueño", d: "Acceso total al negocio y configuración" },
                { r: "Cajera", d: "Registra ventas, cobra y cuadra caja" },
                { r: "Repositor", d: "Ajusta stock y recibe mercadería" },
              ].map((x) => (
                <div key={x.r} className="flex items-start gap-[10px]">
                  <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-white/35" />
                  <div className="flex-1">
                    <span className="font-['Geist'] text-[13px] font-medium text-white">{x.r}</span>
                    <span className="font-['Geist'] text-[12.5px] text-white/55"> — {x.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </SubScreen>
  );
}
