import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Search,
  User,
  Mail,
  ShieldCheck,
  Store,
  Coins,
  Target,
  Users,
  Palette,
  Bell,
  Sparkles,
  CreditCard,
  Database,
  LifeBuoy,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { PlanChip } from "./shared";
import { useConfirm } from "@/components/ui/confirm";

export type SettingsRoute =
  | "profile"
  | "email"
  | "sessions"
  | "business"
  | "currency"
  | "goals"
  | "team"
  | "appearance"
  | "notifications"
  | "socia"
  | "plans"
  | "data"
  | "help";

type Item = {
  key: SettingsRoute;
  icon: LucideIcon;
  title: string;
  hint: string;
  right?: string;
};

type Group = {
  title: string;
  items: Item[];
};

export default function SettingsHub({
  onBack,
  onNavigate,
  onSignOut,
}: {
  onBack: () => void;
  onNavigate: (route: SettingsRoute) => void;
  onSignOut: () => void;
}) {
  const { user, profile } = useAuth();
  const { plan, isTrialing, daysLeft } = usePlan();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");

  const handleSignOut = async () => {
    if (!(await confirm({
      title: "Cerrar sesión",
      description: "Vas a cerrar tu sesión en Trax. Podrás volver a entrar cuando quieras.",
      confirmText: "Cerrar sesión",
      tone: "danger",
    }))) return;
    onSignOut();
  };

  const groups: Group[] = useMemo(
    () => [
      {
        title: "Cuenta",
        items: [
          { key: "email", icon: Mail, title: "Correo y contraseña", hint: "Datos de acceso" },
          { key: "sessions", icon: ShieldCheck, title: "Sesiones y dispositivos", hint: "Cambio de cuentas y seguridad" },
        ],
      },
      {
        title: "Negocio",
        items: [
          { key: "business", icon: Store, title: "Datos del negocio", hint: "Nombre, tipo, dirección" },
          { key: "goals", icon: Target, title: "Metas y umbrales", hint: "Ventas diarias, stock crítico" },
          { key: "team", icon: Users, title: "Equipo", hint: "Invita a colaboradores", right: "Avanzado" },
        ],
      },
      {
        title: "Preferencias",
        items: [
          { key: "appearance", icon: Palette, title: "Apariencia", hint: "Tema, tamaño, accesibilidad" },
          { key: "notifications", icon: Bell, title: "Notificaciones", hint: "Qué alertas quieres recibir" },
          { key: "socia", icon: Sparkles, title: "socIA", hint: "Personalidad e historial" },
        ],
      },
      {
        title: "Plan y sistema",
        items: [
          {
            key: "plans",
            icon: CreditCard,
            title: "Suscripción",
            hint: "Cambia o gestiona tu plan",
            right: isTrialing ? `Prueba ${daysLeft}d` : plan,
          },
          { key: "data", icon: Database, title: "Datos y privacidad", hint: "Exportar, eliminar cuenta" },
          { key: "help", icon: LifeBuoy, title: "Ayuda y legal", hint: "Soporte, términos, versión" },
        ],
      },
    ],
    [plan, isTrialing, daysLeft],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => (i.title + " " + i.hint).toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const initials =
    (profile?.owner_name || profile?.business_name || "TU")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "TU";

  return (
    <div className="relative w-full text-white pb-[200px]">
      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(0,0,0,0.72)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
          <button
            type="button"
            onClick={onBack}
            className="h-[40px] w-[40px] grid place-items-center rounded-full bg-white/[0.05] border border-white/[0.08] active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
          <div className="flex-1">
            <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
              Ajustes
            </div>
            <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold tracking-[-0.3px]">
              Preferencias
            </div>
          </div>
          <PlanChip compact />
        </div>
      </div>

      {/* Identity card */}
      <div className="px-[16px] pt-[18px]">
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className="w-full flex items-center gap-[14px] rounded-[22px] px-[16px] py-[16px] text-left"
          style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-[52px] w-[52px] rounded-full overflow-hidden grid place-items-center shrink-0"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-['Bai_Jamjuree'] text-[18px] font-bold">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold tracking-[-0.2px] truncate">
              {profile?.owner_name || "Tu nombre"}
            </div>
            <div className="font-['Geist'] text-[12.5px] text-white/50 truncate">
              {profile?.business_name || user?.email}
            </div>
          </div>
          <ChevronRight className="h-[18px] w-[18px] text-white/30 shrink-0" />
        </button>
      </div>

      {/* Search */}
      <div className="px-[16px] mt-[14px]">
        <div
          className="flex items-center gap-[10px] rounded-full px-[14px] h-[44px]"
          style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Search className="h-[15px] w-[15px] text-white/40" strokeWidth={1.7} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en ajustes"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[13.5px] text-white placeholder:text-white/35"
          />
        </div>
      </div>

      {/* Groups */}
      {filtered.map((g, gi) => (
        <div key={g.title} className="px-[16px] mt-[22px]">
          <div className="px-[4px] mb-[10px] font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.6px] text-white/40">
            {g.title}
          </div>
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {g.items.map((it, idx) => (
              <motion.button
                key={it.key}
                type="button"
                onClick={() => onNavigate(it.key)}
                whileTap={{ scale: 0.985 }}
                className="w-full flex items-center gap-[12px] px-[16px] py-[13px] text-left active:bg-white/[0.03]"
              >
                <div className="h-[36px] w-[36px] rounded-[11px] grid place-items-center shrink-0 bg-white/[0.05] border border-white/[0.07]">
                  <it.icon className="h-[16px] w-[16px] text-white/80" strokeWidth={1.7} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Geist'] text-[14.5px] text-white leading-[1.2] truncate">
                    {it.title}
                  </div>
                  <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px] truncate">
                    {it.hint}
                  </div>
                </div>
                {it.right && (
                  <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/50 mr-[2px]">
                    {it.right}
                  </span>
                )}
                <ChevronRight className="h-[16px] w-[16px] text-white/25 shrink-0" />
                {idx < g.items.length - 1 && (
                  <div className="absolute left-[68px] right-[16px] bottom-0 h-px bg-white/[0.05]" />
                )}
              </motion.button>
            ))}
          </div>
          {gi === filtered.length - 1 && (
            <div className="mt-[18px]">
              <button
                type="button"
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-[10px] h-[48px] rounded-full font-['Geist'] text-[14px] font-semibold text-[#F87171]"
                style={{
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.22)",
                }}
              >
                <LogOut className="h-[15px] w-[15px]" strokeWidth={1.8} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="text-center mt-[26px] font-['Geist'] text-[11px] text-white/25">
        Trax · Hecho con cariño en Perú
      </div>
    </div>
  );
}
