import { ChevronRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { SubHeader, SubScreen, ListGroup } from "./shared";
import { usePlan } from "@/hooks/usePlan";

const MEMBERS = [
  { name: "Alberto Ramos", role: "Dueño · acceso total" },
  { name: "Lucía Mendoza", role: "Cajera · ventas y caja" },
  { name: "Diego Paredes", role: "Repositor · inventario" },
];

export default function TeamView({ onBack }: { onBack: () => void }) {
  const { limits, plan } = usePlan();
  const handleInvite = () => {
    if (Number.isFinite(limits.maxTeamMembers) && MEMBERS.length >= limits.maxTeamMembers) {
      toast.error(
        `Tu plan ${plan} permite hasta ${limits.maxTeamMembers} miembros. Sube al plan Avanzado para equipo ilimitado.`,
      );
      return;
    }
    toast.info("Próximamente: invitar miembro por correo.");
  };
  return (
    <SubScreen>
      <SubHeader
        eyebrow={`${MEMBERS.length} personas`}
        title="Equipo"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={handleInvite}
            className="h-[36px] w-[36px] rounded-full bg-[#3b82f6] text-white flex items-center justify-center active:scale-95"
            aria-label="Invitar"
          >
            <UserPlus className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        }
      />

      <div className="px-[20px] pt-[6px]">
        <ListGroup>
          {MEMBERS.map((m, idx) => (
            <div key={m.name}>
              <button
                type="button"
                className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[14.5px] text-white truncate">{m.name}</div>
                  <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45 truncate">{m.role}</div>
                </div>
                <ChevronRight className="h-[16px] w-[16px] text-white/25" strokeWidth={1.6} />
              </button>
              {idx < MEMBERS.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
            </div>
          ))}
        </ListGroup>
      </div>
    </SubScreen>
  );
}
