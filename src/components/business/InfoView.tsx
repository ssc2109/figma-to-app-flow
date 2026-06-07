import { ChevronRight } from "lucide-react";
import { SubHeader, SubScreen, SectionLabel, ListGroup } from "./shared";

const IDENTITY = [
  { label: "Nombre", value: "Bodega Ecoarom" },
  { label: "RUC", value: "10456789012" },
];

const CONTACT = [
  { label: "Dirección", value: "Av. Los Próceres 142, SJL" },
  { label: "Teléfono", value: "+51 987 654 321" },
];

const SCHEDULE = [
  { d: "Lun — Vie", h: "7:00 AM — 10:00 PM" },
  { d: "Sábado", h: "7:00 AM — 11:00 PM" },
  { d: "Domingo", h: "8:00 AM — 9:00 PM" },
];

function Group({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <ListGroup>
      {rows.map((r, idx) => (
        <div key={r.label}>
          <button
            type="button"
            className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-['Geist'] text-[12px] text-white/45">{r.label}</div>
              <div className="mt-[3px] font-['Geist'] text-[14.5px] text-white truncate">{r.value}</div>
            </div>
            <ChevronRight className="h-[16px] w-[16px] text-white/25" strokeWidth={1.6} />
          </button>
          {idx < rows.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
        </div>
      ))}
    </ListGroup>
  );
}

export default function InfoView({ onBack }: { onBack: () => void }) {
  return (
    <SubScreen>
      <SubHeader eyebrow="Datos del negocio" title="Información" onBack={onBack} />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[28px]">
        <div>
          <SectionLabel>Identidad</SectionLabel>
          <Group rows={IDENTITY} />
        </div>
        <div>
          <SectionLabel>Contacto</SectionLabel>
          <Group rows={CONTACT} />
        </div>
        <div>
          <SectionLabel>Horario</SectionLabel>
          <ListGroup>
            {SCHEDULE.map((s, idx) => (
              <div key={s.d}>
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <span className="font-['Geist'] text-[14.5px] text-white">{s.d}</span>
                  <span className="font-['Bai_Jamjuree'] text-[13px] font-medium text-white/70 tabular-nums">
                    {s.h}
                  </span>
                </div>
                {idx < SCHEDULE.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
              </div>
            ))}
          </ListGroup>
        </div>
      </div>
    </SubScreen>
  );
}
