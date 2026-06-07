import { FileText, MapPin, Phone, Clock, Store, ChevronRight } from "lucide-react";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./shared";

export default function InfoView({ onBack }: { onBack: () => void }) {
  const identity = [
    { Icon: Store, label: "Nombre", value: "Bodega Ecoarom" },
    { Icon: FileText, label: "RUC", value: "10456789012" },
  ];
  const contact = [
    { Icon: MapPin, label: "Dirección", value: "Av. Los Próceres 142, San Juan de Lurigancho" },
    { Icon: Phone, label: "Contacto", value: "+51 987 654 321" },
  ];
  const schedule = [
    { d: "Lunes a Viernes", h: "7:00 AM — 10:00 PM" },
    { d: "Sábado", h: "7:00 AM — 11:00 PM" },
    { d: "Domingo", h: "8:00 AM — 9:00 PM" },
  ];

  return (
    <SubScreen>
      <SubHeader eyebrow="Datos del negocio" title="Información" onBack={onBack} />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[18px]">
        <Group title="Identidad" rows={identity} />
        <Group title="Contacto" rows={contact} />

        <div className="flex flex-col gap-[10px]">
          <Eyebrow>Horario de atención</Eyebrow>
          <GlassCard>
            <div className="flex flex-col">
              {schedule.map((s, idx) => (
                <div key={s.d}>
                  <div className="flex items-center justify-between p-[14px]">
                    <div className="flex items-center gap-[10px]">
                      <Clock className="h-[14px] w-[14px] text-white/45" strokeWidth={1.8} />
                      <span className="font-['Geist'] text-[13.5px] text-white/85">{s.d}</span>
                    </div>
                    <span className="font-['Bai_Jamjuree'] text-[12.5px] font-medium text-white/65 tabular-nums">
                      {s.h}
                    </span>
                  </div>
                  {idx < schedule.length - 1 && <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </SubScreen>
  );
}

function Group({
  title,
  rows,
}: {
  title: string;
  rows: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <Eyebrow>{title}</Eyebrow>
      <GlassCard>
        <div className="flex flex-col">
          {rows.map(({ Icon, label, value }, idx) => (
            <div key={label}>
              <button
                type="button"
                className="w-full flex items-center gap-[12px] p-[14px] active:bg-white/[0.03]"
              >
                <div
                  className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-['Geist'] text-[11px] uppercase tracking-[0.8px] text-white/45">
                    {label}
                  </div>
                  <div className="mt-[2px] font-['Geist'] text-[13.5px] text-white/85 truncate">
                    {value}
                  </div>
                </div>
                <ChevronRight className="h-[15px] w-[15px] text-white/30" strokeWidth={1.8} />
              </button>
              {idx < rows.length - 1 && <div className="h-px w-[92%] mx-auto bg-white/[0.06]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
