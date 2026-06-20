import { useMemo } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  FileText,
  Package,
  CreditCard,
  Users,
  Truck,
  Megaphone,
  ShieldCheck,
  UserCog,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Globe,
  Sparkles,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";
import { toast } from "sonner";
import { SectionLabel } from "./shared";

type Status = "done" | "pending" | "recommended";

type Step = {
  id: string;
  label: string;
  hint: string;
  status: Status;
  weight: number;
  go?: () => void;
};

/* ============================================================
   Trax · Business Hub
   Perfil operativo del negocio (no es otro dashboard de ventas).
   ============================================================ */

function timeFmt(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":");
  if (!h) return null;
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:${m ?? "00"} ${ampm}`;
}

function isOpenNow(open: string | null, close: string | null) {
  if (!open || !close) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const o = oh * 60 + (om || 0);
  const c = ch * 60 + (cm || 0);
  if (c > o) return cur >= o && cur < c;
  // overnight
  return cur >= o || cur < c;
}

/* ---------- atomic surfaces ---------- */
function Surface({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-[22px] overflow-hidden ${className}`}
      style={{
        background: glow
          ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)"
          : "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: glow ? "inset 0 1px 0 0 rgba(255,255,255,0.06)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function StatusDot({ open }: { open: boolean | null }) {
  if (open === null)
    return (
      <span className="inline-flex items-center gap-[6px]">
        <span className="h-[6px] w-[6px] rounded-full bg-white/30" />
        <span className="font-['Geist'] text-[11.5px] text-white/45">Sin horario</span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-[6px]">
      <span
        className="h-[6px] w-[6px] rounded-full"
        style={{
          background: open ? "#4ADE80" : "#F87171",
          boxShadow: open ? "0 0 8px rgba(74,222,128,0.55)" : "0 0 8px rgba(248,113,113,0.45)",
        }}
      />
      <span className="font-['Geist'] text-[11.5px] text-white/65">
        {open ? "Abierto ahora" : "Cerrado"}
      </span>
    </span>
  );
}

/* ============================================================
   1 · Identity header
   ============================================================ */
function IdentityHeader() {
  const { profile } = useAuth();
  const name = profile?.business_name || "Mi negocio";
  const type = profile?.business_type || "Define tu rubro";
  const open = isOpenNow(profile?.open_time ?? null, profile?.close_time ?? null);
  const closeAt = timeFmt(profile?.close_time);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "N";

  const addressShort = (profile?.address || "").split(",")[0] || null;

  return (
    <div className="px-[20px] pt-[26px] pb-[8px]">
      <div className="flex items-center gap-[14px]">
        <div
          className="relative h-[56px] w-[56px] rounded-[18px] shrink-0 grid place-items-center overflow-hidden"
          style={{
            background:
              "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.20), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tracking-[-0.5px]">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
            Perfil del negocio
          </div>
          <h1 className="mt-[2px] font-['Bai_Jamjuree'] text-[24px] font-semibold text-white tracking-[-0.7px] leading-[1.1] truncate">
            {name}
          </h1>
          <p className="mt-[2px] font-['Geist'] text-[12.5px] text-white/45 truncate">{type}</p>
        </div>
      </div>

      <div className="mt-[14px] flex flex-wrap items-center gap-x-[14px] gap-y-[6px] pl-[2px]">
        <StatusDot open={open} />
        {open && closeAt && (
          <span className="inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/45">
            <Clock className="h-[12px] w-[12px]" strokeWidth={1.8} />
            Cierra {closeAt}
          </span>
        )}
        {addressShort && (
          <span className="inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/45 truncate max-w-[55%]">
            <MapPin className="h-[12px] w-[12px] shrink-0" strokeWidth={1.8} />
            <span className="truncate">{addressShort}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   2 · Readiness card (hero) + 3 · Checklist + 4 · socIA tips
   share the same `steps` model.
   ============================================================ */
function useReadiness(go: { info: () => void; inventory: () => void; payments: () => void }) {
  const { profile } = useAuth();
  const { productCount } = useInventory();

  return useMemo<Step[]>(() => {
    const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return [
      {
        id: "identity",
        label: "Identidad del negocio",
        hint: "Nombre y rubro listos",
        status: has(profile?.business_name) && has(profile?.business_type) ? "done" : "pending",
        weight: 1,
        go: go.info,
      },
      {
        id: "logo",
        label: "Logo o foto del negocio",
        hint: "Tu marca visible en la app",
        status: has(profile?.avatar_url) ? "done" : "recommended",
        weight: 1,
      },
      {
        id: "address",
        label: "Dirección física",
        hint: "Para que tus clientes te encuentren",
        status: has(profile?.address) ? "done" : "pending",
        weight: 1,
        go: go.info,
      },
      {
        id: "schedule",
        label: "Horario de atención",
        hint: "Apertura y cierre definidos",
        status:
          has(profile?.open_time) && has(profile?.close_time) ? "done" : "pending",
        weight: 1,
        go: go.info,
      },
      {
        id: "phone",
        label: "Teléfono o WhatsApp",
        hint: "Canal directo de contacto",
        status: has(profile?.phone) ? "done" : "recommended",
        weight: 1,
        go: go.info,
      },
      {
        id: "catalog",
        label: "Catálogo de productos",
        hint: productCount > 0 ? `${productCount} en catálogo` : "Sin productos",
        status: productCount >= 3 ? "done" : productCount > 0 ? "recommended" : "pending",
        weight: 1.4,
        go: go.inventory,
      },
      {
        id: "payments",
        label: "Métodos de pago",
        hint: "Efectivo, Yape, Plin, tarjeta",
        status: "recommended",
        weight: 1.2,
        go: go.payments,
      },
      {
        id: "suppliers",
        label: "Proveedores",
        hint: "Registra a quién compras",
        status: "recommended",
        weight: 0.8,
      },
    ];
  }, [profile, productCount, go]);
}

function ReadinessHero({ steps }: { steps: Step[] }) {
  const totalW = steps.reduce((s, x) => s + x.weight, 0);
  const doneW = steps.filter((x) => x.status === "done").reduce((s, x) => s + x.weight, 0);
  const pct = Math.round((doneW / totalW) * 100);
  const doneCount = steps.filter((x) => x.status === "done").length;

  // ring geometry
  const R = 56;
  const C = 2 * Math.PI * R;
  const offset = C - (C * pct) / 100;

  return (
    <Surface glow className="mx-[20px]">
      {/* ambient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 85% 0%, rgba(255,255,255,0.07), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(74,222,128,0.05), transparent 60%)",
        }}
      />
      <div className="relative px-[20px] pt-[20px] pb-[18px] flex items-center gap-[18px]">
        <div className="relative h-[136px] w-[136px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={R}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={7}
              fill="none"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={R}
              stroke="#ffffff"
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-['Bai_Jamjuree'] text-[40px] font-bold text-white tracking-[-1.6px] leading-[0.9] tabular-nums">
              {pct}
              <span className="text-[20px] font-medium text-white/45 align-top ml-[1px]">%</span>
            </div>
            <div className="mt-[2px] font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/40">
              Listo
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
            Madurez del negocio
          </div>
          <h2 className="mt-[4px] font-['Bai_Jamjuree'] text-[20px] font-semibold text-white leading-[1.15] tracking-[-0.5px]">
            Tu negocio está listo al {pct}%
          </h2>
          <p className="mt-[6px] font-['Geist'] text-[12.5px] text-white/55 leading-[1.4]">
            {doneCount} de {steps.length} pasos completados. Completa los datos para que socIA pueda
            ayudarte mejor.
          </p>
        </div>
      </div>
    </Surface>
  );
}

/* ============================================================
   3 · Checklist
   ============================================================ */
function StatusIcon({ status }: { status: Status }) {
  if (status === "done")
    return <CheckCircle2 className="h-[18px] w-[18px] text-[#4ADE80]" strokeWidth={1.7} />;
  if (status === "recommended")
    return <AlertCircle className="h-[18px] w-[18px] text-white/55" strokeWidth={1.7} />;
  return <Circle className="h-[18px] w-[18px] text-white/30" strokeWidth={1.6} />;
}

function Checklist({ steps }: { steps: Step[] }) {
  const sorted = [...steps].sort((a, b) => {
    const order = { pending: 0, recommended: 1, done: 2 } as const;
    return order[a.status] - order[b.status];
  });
  return (
    <Surface>
      {sorted.map((s, i) => {
        const Tag = s.go ? "button" : ("div" as const);
        return (
          <div key={s.id}>
            <Tag
              type={s.go ? "button" : undefined}
              onClick={s.go}
              className={`w-full flex items-center gap-[14px] px-[16px] py-[13px] text-left ${
                s.go ? "active:bg-white/[0.03] transition-colors" : ""
              }`}
            >
              <StatusIcon status={s.status} />
              <div className="flex-1 min-w-0">
                <div
                  className={`font-['Geist'] text-[14.5px] leading-[1.2] truncate ${
                    s.status === "done" ? "text-white/55" : "text-white"
                  }`}
                >
                  {s.label}
                </div>
                <div className="mt-[2px] font-['Geist'] text-[12px] text-white/40 truncate">
                  {s.hint}
                </div>
              </div>
              {s.status !== "done" && (
                <span
                  className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] px-[8px] py-[3px] rounded-full shrink-0"
                  style={{
                    background:
                      s.status === "pending"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.04)",
                    color: s.status === "pending" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {s.status === "pending" ? "Pendiente" : "Sugerido"}
                </span>
              )}
              {s.go && (
                <ChevronRight className="h-[15px] w-[15px] text-white/25 shrink-0" strokeWidth={1.6} />
              )}
            </Tag>
            {i < sorted.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
          </div>
        );
      })}
    </Surface>
  );
}

/* ============================================================
   4 · socIA recomienda mejorar
   ============================================================ */
function SociaTips({ steps }: { steps: Step[] }) {
  const { productCount } = useInventory();

  type Tip = { id: string; title: string; body: string; cta?: string; onClick?: () => void };
  const tips: Tip[] = [];

  const stepBy = (id: string) => steps.find((s) => s.id === id);

  if ((stepBy("catalog")?.status ?? "done") !== "done") {
    tips.push({
      id: "catalog",
      title: "Amplía tu catálogo",
      body:
        productCount === 0
          ? "Aún no tienes productos. Agrega los principales para que socIA entienda tu negocio."
          : `Solo tienes ${productCount} producto${productCount === 1 ? "" : "s"}. Agrega más para mejores recomendaciones.`,
      cta: "Ir al catálogo",
      onClick: stepBy("catalog")?.go,
    });
  }
  if (stepBy("payments")?.status !== "done") {
    tips.push({
      id: "pay",
      title: "Activa pagos digitales",
      body: "Configura Yape o Plin para no perder ventas cuando el cliente no trae efectivo.",
      cta: "Configurar pagos",
      onClick: stepBy("payments")?.go,
    });
  }
  if (stepBy("schedule")?.status !== "done") {
    tips.push({
      id: "sched",
      title: "Define tu horario",
      body: "Sin horario, tus clientes no saben cuándo encontrarte y socIA no puede sugerir mejor.",
      cta: "Definir horario",
      onClick: stepBy("schedule")?.go,
    });
  }
  if (stepBy("address")?.status !== "done") {
    tips.push({
      id: "addr",
      title: "Completa tu ubicación",
      body: "Una dirección clara te ayuda a aparecer en oportunidades cercanas más adelante.",
      cta: "Agregar dirección",
      onClick: stepBy("address")?.go,
    });
  }
  if (stepBy("suppliers")?.status !== "done") {
    tips.push({
      id: "sup",
      title: "Registra tus proveedores",
      body: "Saber a quién compras te permitirá detectar mejores precios y márgenes.",
    });
  }

  if (tips.length === 0) {
    return (
      <Surface>
        <div className="px-[18px] py-[18px] flex items-center gap-[12px]">
          <div className="h-[36px] w-[36px] rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08]">
            <Sparkles className="h-[16px] w-[16px] text-white/75" strokeWidth={1.7} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[14px] text-white">Negocio bien configurado</div>
            <div className="mt-[2px] font-['Geist'] text-[12px] text-white/45">
              socIA seguirá vigilando oportunidades de mejora.
            </div>
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {tips.slice(0, 4).map((t) => (
        <Surface key={t.id} glow>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,0.05), transparent 60%)",
            }}
          />
          <div className="relative px-[16px] py-[14px] flex items-start gap-[12px]">
            <div className="h-[30px] w-[30px] rounded-full grid place-items-center shrink-0 mt-[1px] bg-white/[0.05] border border-white/[0.08]">
              <Sparkles className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.25]">
                {t.title}
              </div>
              <p className="mt-[4px] font-['Geist'] text-[12.5px] text-white/55 leading-[1.45]">
                {t.body}
              </p>
              {t.cta && (
                <button
                  type="button"
                  onClick={t.onClick}
                  className="mt-[10px] inline-flex items-center gap-[5px] font-['Geist'] text-[12px] text-white/85 px-[10px] py-[6px] rounded-full bg-white/[0.06] border border-white/[0.09] active:bg-white/[0.10] transition-colors"
                >
                  {t.cta}
                  <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={1.9} />
                </button>
              )}
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}

/* ============================================================
   5 · Módulos del negocio
   ============================================================ */
function ModuleCard({
  icon: Icon,
  label,
  meta,
  onClick,
  soon,
}: {
  icon: typeof Building2;
  label: string;
  meta: string;
  onClick: () => void;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-left rounded-[18px] overflow-hidden active:scale-[0.98] transition-transform"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="px-[14px] pt-[14px] pb-[14px] h-[112px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div
            className="h-[34px] w-[34px] rounded-[11px] grid place-items-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Icon className="h-[16px] w-[16px] text-white/85" strokeWidth={1.7} />
          </div>
          {soon && (
            <span className="font-['Geist'] text-[9.5px] uppercase tracking-[1.2px] px-[6px] py-[2px] rounded-full bg-white/[0.05] border border-white/[0.07] text-white/45">
              Pronto
            </span>
          )}
        </div>
        <div>
          <div className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.15]">
            {label}
          </div>
          <div className="mt-[3px] font-['Geist'] text-[11.5px] text-white/45 leading-[1.25] truncate">
            {meta}
          </div>
        </div>
      </div>
    </button>
  );
}

function ModulesGrid({
  onInfo,
  onInventory,
  onPayments,
  onFinanzas,
}: {
  onInfo: () => void;
  onInventory: () => void;
  onPayments: () => void;
  onFinanzas: () => void;
}) {
  const { productCount } = useInventory();
  const soon = () => toast.message("Próximamente", { description: "Este módulo estará disponible muy pronto." });

  return (
    <div className="grid grid-cols-2 gap-[10px]">
      <ModuleCard icon={FileText} label="Información" meta="Datos comerciales y RUC" onClick={onInfo} />
      <ModuleCard icon={Package} label="Catálogo" meta={`${productCount} producto${productCount === 1 ? "" : "s"}`} onClick={onInventory} />
      <ModuleCard icon={CreditCard} label="Métodos de pago" meta="Efectivo · Yape · Plin" onClick={onPayments} />
      <ModuleCard icon={Users} label="Clientes y fiados" meta="Cuentas por cobrar" onClick={onFinanzas} />
      <ModuleCard icon={Truck} label="Proveedores" meta="Registra a quién compras" onClick={soon} soon />
      <ModuleCard icon={Megaphone} label="Canales de venta" meta="Tienda, delivery, online" onClick={soon} soon />
      <ModuleCard icon={ShieldCheck} label="Documentos" meta="RUC, licencias, permisos" onClick={soon} soon />
      <ModuleCard icon={UserCog} label="Equipo" meta="Personas que te ayudan" onClick={soon} soon />
    </div>
  );
}

/* ============================================================
   6 · Presencia del negocio
   ============================================================ */
function PresenceRow({
  icon: Icon,
  label,
  value,
  set,
  last,
}: {
  icon: typeof Globe;
  label: string;
  value: string | null;
  set: boolean;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-[12px] px-[16px] py-[13px]">
        <div className="h-[32px] w-[32px] rounded-[10px] grid place-items-center bg-white/[0.05] border border-white/[0.07] shrink-0">
          <Icon className="h-[14px] w-[14px] text-white/75" strokeWidth={1.7} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.3px] text-white/40">
            {label}
          </div>
          <div
            className={`mt-[2px] font-['Geist'] text-[13.5px] truncate ${
              set ? "text-white" : "text-white/35"
            }`}
          >
            {value || "Sin configurar"}
          </div>
        </div>
        <span
          className="h-[7px] w-[7px] rounded-full shrink-0"
          style={{
            background: set ? "#4ADE80" : "rgba(255,255,255,0.18)",
            boxShadow: set ? "0 0 8px rgba(74,222,128,0.5)" : undefined,
          }}
        />
      </div>
      {!last && <div className="h-px bg-white/[0.05] mx-[16px]" />}
    </>
  );
}

function Presence() {
  const { profile } = useAuth();
  const items = [
    { label: "Nombre público", value: profile?.business_name || null, icon: Building2 },
    { label: "Logo", value: profile?.avatar_url ? "Imagen cargada" : null, icon: Globe },
    { label: "Dirección", value: profile?.address || null, icon: MapPin },
    { label: "WhatsApp", value: profile?.phone || null, icon: Phone },
    { label: "Instagram / TikTok", value: null, icon: Instagram },
  ];
  const setCount = items.filter((i) => !!i.value).length;
  const score = Math.round((setCount / items.length) * 100);

  return (
    <Surface>
      <div className="px-[16px] pt-[14px] pb-[10px] flex items-center justify-between">
        <div>
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.3px] text-white/40">
            Cómo te ven afuera
          </div>
          <div className="mt-[2px] font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tracking-[-0.3px]">
            Presencia · {score}%
          </div>
        </div>
        <div
          className="h-[36px] px-[10px] rounded-full grid place-items-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold text-white/85 tabular-nums">
            {setCount}/{items.length}
          </span>
        </div>
      </div>
      <div className="h-px bg-white/[0.05] mx-[16px]" />
      {items.map((it, i) => (
        <PresenceRow
          key={it.label}
          icon={it.icon}
          label={it.label}
          value={it.value}
          set={!!it.value}
          last={i === items.length - 1}
        />
      ))}
    </Surface>
  );
}

/* ============================================================
   Public composition
   ============================================================ */
export default function BusinessHub({
  onInfo,
  onInventory,
  onPayments,
  onFinanzas,
}: {
  onInfo: () => void;
  onInventory: () => void;
  onPayments: () => void;
  onFinanzas: () => void;
}) {
  const steps = useReadiness({ info: onInfo, inventory: onInventory, payments: onPayments });

  return (
    <div className="relative">
      <IdentityHeader />

      <div className="mt-[14px]">
        <ReadinessHero steps={steps} />
      </div>

      <div className="mt-[28px] px-[20px]">
        <div className="mb-[12px]">
          <SectionLabel>Configura tu negocio</SectionLabel>
        </div>
        <Checklist steps={steps} />
      </div>

      <div className="mt-[28px] px-[20px]">
        <div className="mb-[12px] flex items-center gap-[8px]">
          <SectionLabel>socIA recomienda mejorar</SectionLabel>
        </div>
        <SociaTips steps={steps} />
      </div>

      <div className="mt-[28px] px-[20px]">
        <div className="mb-[12px]">
          <SectionLabel>Módulos del negocio</SectionLabel>
        </div>
        <ModulesGrid
          onInfo={onInfo}
          onInventory={onInventory}
          onPayments={onPayments}
          onFinanzas={onFinanzas}
        />
      </div>

      <div className="mt-[28px] px-[20px]">
        <div className="mb-[12px]">
          <SectionLabel>Presencia del negocio</SectionLabel>
        </div>
        <Presence />
      </div>

      <p className="font-['Geist'] text-[11px] text-white/25 text-center pt-[28px] pb-[8px] tracking-[0.2px]">
        Perfil operativo · Trax
      </p>
    </div>
  );
}
