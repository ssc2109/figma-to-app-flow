import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Package, Clock, CreditCard, Truck,
  Users, ArrowDownLeft, History,
  ArrowUpRight, FileBadge, Receipt,
  Image as ImageIcon, MapPin, Phone, Instagram, Megaphone,
  ChevronRight, Sparkles, ArrowRight, FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";

/* ============================================================
   Trax · Business HQ (v3 — Command Center)
   Header compacto + Panel operativo + Tabs por área
   ============================================================ */

type Props = {
  onInfo: () => void;
  onInventory: () => void;
  onPayments: () => void;
  onClients: () => void;
  onReceivables: () => void;
  onPayables: () => void;
  onSuppliers: () => void;
  onChannels: () => void;
  onDocuments: () => void;
  onTeam: () => void;
};

type Area = "operacion" | "clientes" | "dinero" | "presencia";

function fmtTime(t: string | null | undefined) {
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
  return cur >= o || cur < c;
}

/* ---------- ambient ---------- */
function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 h-[420px] w-[520px] rounded-full opacity-[0.45]"
        style={{ background: "radial-gradient(closest-side, rgba(74,222,128,0.10), transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute top-[280px] -right-[160px] h-[380px] w-[380px] rounded-full opacity-[0.35]"
        style={{ background: "radial-gradient(closest-side, rgba(120,180,255,0.10), transparent 70%)", filter: "blur(60px)" }} />
    </div>
  );
}

/* ============================================================
   Compact header
   ============================================================ */
function CompactHeader() {
  const { profile } = useAuth();
  const name = profile?.business_name || "Mi negocio";
  const type = profile?.business_type || "Define tu rubro";
  const open = isOpenNow(profile?.open_time ?? null, profile?.close_time ?? null);
  const closeAt = fmtTime(profile?.close_time);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase()).join("") || "N";

  const status =
    open === null ? "Sin horario configurado"
      : open ? `Operando${closeAt ? ` · cierra ${closeAt}` : ""}`
        : "Cerrado ahora";

  return (
    <div className="relative px-[20px] pt-[22px] pb-[14px]">
      <div className="flex items-center gap-[12px]">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[44px] w-[44px] rounded-[14px] shrink-0 grid place-items-center overflow-hidden"
          style={{
            background: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[15px] font-bold text-white tracking-[-0.4px]">{initials}</span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h1 className="font-['Bai_Jamjuree'] text-[19px] font-semibold text-white tracking-[-0.5px] leading-[1.15] truncate">
            {name}
          </h1>
          <div className="mt-[3px] flex items-center gap-[8px] font-['Geist'] text-[11.5px] text-white/50 truncate">
            <span className="truncate">{type}</span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-[5px] shrink-0">
              {open !== null && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-[5px] w-[5px] rounded-full"
                  style={{
                    background: open ? "#4ADE80" : "#F87171",
                    boxShadow: open ? "0 0 8px rgba(74,222,128,0.7)" : "0 0 8px rgba(248,113,113,0.5)",
                  }} />
              )}
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Operational status panel (HQ terminal)
   ============================================================ */
type StepLite = { id: string; label: string; hint: string; done: boolean; weight: number; go?: () => void; why: string };

function useSteps(p: Props): StepLite[] {
  const { profile } = useAuth();
  const { productCount } = useInventory();
  return useMemo(() => {
    const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return [
      { id: "identity", label: "Identidad del negocio", hint: "Nombre y rubro", weight: 1,
        done: has(profile?.business_name) && has(profile?.business_type), go: p.onInfo,
        why: "Define cómo se llama y a qué se dedica tu negocio." },
      { id: "address", label: "Agrega tu dirección física", hint: "Dónde encontrarte", weight: 1,
        done: has(profile?.address), go: p.onInfo,
        why: "Ayuda a que tus clientes te encuentren y a que socIA entienda mejor tu operación." },
      { id: "schedule", label: "Configura tu horario", hint: "Apertura y cierre", weight: 1,
        done: has(profile?.open_time) && has(profile?.close_time), go: p.onInfo,
        why: "Define cuándo estás abierto para ordenar tu día y reportes." },
      { id: "phone", label: "Teléfono o WhatsApp", hint: "Contacto directo", weight: 1,
        done: has(profile?.phone), go: p.onInfo,
        why: "Tus clientes podrán contactarte rápido para pedidos o consultas." },
      { id: "catalog", label: "Agrega tu catálogo", hint: productCount > 0 ? `${productCount} productos` : "Sin productos", weight: 1.4,
        done: productCount >= 3, go: p.onInventory,
        why: "socIA podrá detectar tus productos más vendidos y stock crítico." },
      { id: "payments", label: "Activa métodos de pago", hint: "Efectivo, Yape, Plin", weight: 1.2,
        done: false, go: p.onPayments,
        why: "Acepta más formas de cobro para no perder ninguna venta." },
      { id: "logo", label: "Sube tu logo o foto", hint: "Tu marca visible", weight: 0.8,
        done: has(profile?.avatar_url),
        why: "Una marca visible da más confianza a tus clientes." },
    ];
  }, [profile, productCount, p]);
}

function OperationalPanel({ steps }: { steps: StepLite[] }) {
  const totalW = steps.reduce((s, x) => s + x.weight, 0);
  const doneW = steps.filter((x) => x.done).reduce((s, x) => s + x.weight, 0);
  const pct = Math.round((doneW / totalW) * 100);
  const next = steps.find((s) => !s.done);
  const R = 30;
  const C = 2 * Math.PI * R;
  const offset = C - (C * pct) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-[20px] rounded-[24px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.07), 0 18px 50px -28px rgba(74,222,128,0.18)",
      }}
    >
      {/* terminal grid bg */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(120% 80% at 88% 0%, rgba(120,180,255,0.10), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(74,222,128,0.10), transparent 60%)",
        }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

      <div className="relative px-[18px] pt-[18px] pb-[16px]">
        {/* terminal head */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#4ADE80]" style={{ boxShadow: "0 0 10px rgba(74,222,128,0.7)" }} />
            <span className="font-['Geist'] text-[10px] uppercase tracking-[1.8px] text-white/55">Estado operativo</span>
          </div>
          <span className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/30 tabular-nums">
            HQ · v1
          </span>
        </div>

        {/* main row */}
        <div className="mt-[14px] flex items-center gap-[16px]">
          <div className="relative h-[78px] w-[78px] shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="hqGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
              <motion.circle cx="40" cy="40" r={R} stroke="url(#hqGrad)" strokeWidth={5}
                strokeLinecap="round" fill="none" strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Bai_Jamjuree'] text-[22px] font-bold text-white tracking-[-0.8px] tabular-nums">
                {pct}<span className="text-[11px] text-white/45 align-top ml-[1px]">%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
              {pct === 100 ? "Tu negocio está listo" : `Tu negocio está listo al ${pct}%`}
            </div>
            {next ? (
              <>
                <div className="mt-[4px] font-['Geist'] text-[11.5px] text-white/60 leading-[1.4]">
                  <span className="text-white/40">Siguiente paso:</span> {next.label}
                </div>
              </>
            ) : (
              <div className="mt-[4px] font-['Geist'] text-[12px] text-white/55">Todo configurado. Mantén tus datos al día.</div>
            )}
          </div>
        </div>

        {/* socIA whisper */}
        {next && (
          <div className="mt-[14px] rounded-[14px] px-[12px] py-[10px] flex gap-[10px]"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Sparkles className="h-[13px] w-[13px] text-white/70 shrink-0 mt-[2px]" strokeWidth={1.8} />
            <p className="font-['Geist'] text-[11.5px] text-white/60 leading-[1.45]">
              <span className="text-white/85">socIA · </span>{next.why}
            </p>
          </div>
        )}

        {next && (
          <button
            onClick={next.go}
            className="mt-[12px] w-full h-[46px] rounded-[14px] bg-white text-black font-['Geist'] text-[13.5px] font-semibold active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-[7px]"
          >
            Continuar configuración
            <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Area tabs
   ============================================================ */
const AREAS: { id: Area; label: string }[] = [
  { id: "operacion", label: "Operación" },
  { id: "clientes", label: "Clientes" },
  { id: "dinero", label: "Dinero" },
  { id: "presencia", label: "Presencia" },
];

function AreaTabs({ area, onChange }: { area: Area; onChange: (a: Area) => void }) {
  return (
    <LayoutGroup id="biz-area-tabs">
      <div className="mx-[20px] flex items-center gap-[4px] p-[4px] rounded-full overflow-x-auto no-scrollbar"
        style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {AREAS.map((a) => {
          const active = area === a.id;
          return (
            <button key={a.id} onClick={() => onChange(a.id)}
              className="relative flex-1 min-w-fit h-[34px] px-[12px] rounded-full font-['Geist'] text-[12.5px] font-medium transition-colors"
              style={{ color: active ? "#000" : "rgba(255,255,255,0.65)" }}>
              {active && (
                <motion.span
                  layoutId="biz-tab-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{a.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ============================================================
   Item Row (compact, premium)
   ============================================================ */
function AreaRow({
  Icon, label, meta, status, onClick, soon,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  meta?: string;
  status?: { tone: "ok" | "warn" | "muted"; text: string };
  onClick?: () => void;
  soon?: boolean;
}) {
  const toneColor =
    status?.tone === "ok" ? "#4ADE80"
    : status?.tone === "warn" ? "#F8B86C"
    : "rgba(255,255,255,0.45)";
  return (
    <button onClick={onClick} disabled={!onClick}
      className="w-full flex items-center gap-[12px] px-[14px] py-[13px] text-left active:bg-white/[0.03] transition-colors disabled:active:bg-transparent">
      <div className="h-[34px] w-[34px] rounded-[11px] grid place-items-center shrink-0"
        style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Icon className="h-[15px] w-[15px] text-white/75" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14px] text-white truncate">{label}</div>
        {meta && <div className="mt-[1px] font-['Geist'] text-[11.5px] text-white/40 truncate">{meta}</div>}
      </div>
      {status && (
        <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] tabular-nums shrink-0"
          style={{ color: toneColor }}>
          {status.text}
        </span>
      )}
      {soon ? (
        <span className="font-['Geist'] text-[10px] uppercase tracking-[1.2px] text-white/35 shrink-0">Pronto</span>
      ) : (
        onClick && <ChevronRight className="h-[15px] w-[15px] text-white/25 shrink-0" strokeWidth={1.6} />
      )}
    </button>
  );
}

function AreaCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-[20px] rounded-[20px] overflow-hidden divide-y divide-white/[0.05]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {children}
    </div>
  );
}

/* ============================================================
   socIA tip per area
   ============================================================ */
function SociaTip({ title, body, cta, onClick }: { title: string; body: string; cta?: string; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-[20px] rounded-[18px] overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, rgba(120,180,255,0.07), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="px-[14px] py-[13px] flex gap-[11px]">
        <div className="h-[28px] w-[28px] rounded-full grid place-items-center shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <Sparkles className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/40">socIA recomienda</div>
          <div className="mt-[3px] font-['Geist'] text-[13px] text-white font-medium leading-[1.3]">{title}</div>
          <p className="mt-[3px] font-['Geist'] text-[11.5px] text-white/55 leading-[1.45]">{body}</p>
          {cta && onClick && (
            <button onClick={onClick}
              className="mt-[8px] inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/85 px-[10px] py-[5px] rounded-full bg-white/[0.06] border border-white/[0.09] active:bg-white/[0.10] transition-colors">
              {cta}
              <ArrowRight className="h-[10px] w-[10px]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Area panels
   ============================================================ */
function OperationArea(p: Props) {
  const { profile } = useAuth();
  const { productCount } = useInventory();
  const hasSchedule = !!(profile?.open_time && profile?.close_time);
  return (
    <div className="flex flex-col gap-[14px]">
      <AreaCard>
        <AreaRow Icon={Package} label="Catálogo"
          meta={productCount > 0 ? `${productCount} producto${productCount === 1 ? "" : "s"}` : "Sin productos"}
          status={{ tone: productCount >= 3 ? "ok" : productCount > 0 ? "warn" : "muted",
            text: productCount >= 3 ? "Listo" : productCount > 0 ? "Parcial" : "Vacío" }}
          onClick={p.onInventory} />
        <AreaRow Icon={Clock} label="Horario de atención"
          meta={hasSchedule ? `${fmtTime(profile?.open_time)} – ${fmtTime(profile?.close_time)}` : "Sin configurar"}
          status={hasSchedule ? { tone: "ok", text: "Listo" } : { tone: "warn", text: "Falta" }}
          onClick={p.onInfo} />
        <AreaRow Icon={CreditCard} label="Métodos de pago" meta="Efectivo, Yape, Plin" onClick={p.onPayments} />
        <AreaRow Icon={Truck} label="Proveedores" meta="Registra a quién le compras" onClick={p.onSuppliers} soon />
      </AreaCard>

      {productCount < 3 ? (
        <SociaTip title="Agrega tus productos más vendidos"
          body="Con al menos 3 productos socIA puede detectar stock crítico y sugerir reposición."
          cta="Ir al catálogo" onClick={p.onInventory} />
      ) : !hasSchedule ? (
        <SociaTip title="Configura tu horario"
          body="Sin horario los reportes diarios pierden contexto y socIA no sabe cuándo recomendar acciones."
          cta="Definir horario" onClick={p.onInfo} />
      ) : (
        <SociaTip title="Tu operación va sólida"
          body="Mantén tu catálogo actualizado y registra precios reales para mejorar tus márgenes." />
      )}
    </div>
  );
}

function ClientsArea(p: Props) {
  return (
    <div className="flex flex-col gap-[14px]">
      <AreaCard>
        <AreaRow Icon={Users} label="Clientes" meta="Tus contactos frecuentes" onClick={p.onClients} />
        <AreaRow Icon={ArrowDownLeft} label="Deudas por cobrar" meta="Lo que te deben tus clientes" onClick={p.onReceivables} />
        <AreaRow Icon={History} label="Historial de clientes" meta="Compras y visitas (pronto)" onClick={p.onClients} soon />
      </AreaCard>

      <SociaTip title="Separa clientes de deudas"
        body="Registra a tus clientes en Clientes y sus deudas en Por cobrar. Así sabes quién compra y quién debe."
        cta="Agregar cliente" onClick={p.onClients} />
    </div>
  );
}

function MoneyArea(p: Props) {
  return (
    <div className="flex flex-col gap-[14px]">
      <AreaCard>
        <AreaRow Icon={ArrowUpRight} label="Deudas por pagar" meta="Lo que le debes a otros" onClick={p.onPayables} />
        <AreaRow Icon={FileBadge} label="Documentos" meta="RUC, licencias, permisos" onClick={p.onDocuments} soon />
        <AreaRow Icon={Receipt} label="Datos fiscales" meta="RUC y datos tributarios" onClick={p.onDocuments} soon />
      </AreaCard>

      <SociaTip title="Registra tus deudas por pagar"
        body="Anotar lo que debes te evita confundir caja con ganancia y te ayuda a no quedarte sin liquidez."
        cta="Registrar deuda" onClick={p.onPayables} />
    </div>
  );
}

function PresenceArea(p: Props) {
  const { profile } = useAuth();
  const has = (v: unknown) => typeof v === "string" && (v as string).trim().length > 0;
  const needWA = !has(profile?.phone);
  const needAddr = !has(profile?.address);
  return (
    <div className="flex flex-col gap-[14px]">
      <AreaCard>
        <AreaRow Icon={ImageIcon} label="Logo o foto"
          status={has(profile?.avatar_url) ? { tone: "ok", text: "Listo" } : { tone: "muted", text: "Falta" }}
          onClick={p.onInfo} />
        <AreaRow Icon={MapPin} label="Dirección"
          meta={profile?.address || "Sin configurar"}
          status={has(profile?.address) ? { tone: "ok", text: "Listo" } : { tone: "warn", text: "Falta" }}
          onClick={p.onInfo} />
        <AreaRow Icon={Phone} label="WhatsApp"
          meta={profile?.phone || "Sin configurar"}
          status={has(profile?.phone) ? { tone: "ok", text: "Listo" } : { tone: "warn", text: "Falta" }}
          onClick={p.onInfo} />
        <AreaRow Icon={Instagram} label="Instagram / TikTok" meta="Conecta tus redes" onClick={p.onChannels} soon />
        <AreaRow Icon={Megaphone} label="Canales de venta" meta="WhatsApp, delivery, web" onClick={p.onChannels} soon />
      </AreaCard>

      {(needWA || needAddr) ? (
        <SociaTip title="Completa tu presencia"
          body={needAddr && needWA
            ? "Agrega tu dirección y WhatsApp para que tus clientes te encuentren y te escriban."
            : needAddr ? "Sin dirección tus clientes no podrán llegar a tu local."
              : "Activa WhatsApp para que te puedan escribir directo."}
          cta="Completar" onClick={p.onInfo} />
      ) : (
        <SociaTip title="Tu presencia está lista"
          body="Cuando conectes redes y canales, socIA podrá ayudarte a vender por más medios sin caos." />
      )}
    </div>
  );
}

/* ============================================================
   Root
   ============================================================ */
export default function BusinessHub(p: Props) {
  const [area, setArea] = useState<Area>("operacion");
  const steps = useSteps(p);

  return (
    <div className="relative w-full">
      <Ambient />
      <div className="relative flex flex-col gap-[18px] pb-[200px]">
        <CompactHeader />
        <OperationalPanel steps={steps} />

        <div className="flex flex-col gap-[14px]">
          <AreaTabs area={area} onChange={setArea} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={area}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              {area === "operacion" && <OperationArea {...p} />}
              {area === "clientes" && <ClientsArea {...p} />}
              {area === "dinero" && <MoneyArea {...p} />}
              {area === "presencia" && <PresenceArea {...p} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-[20px] mt-[6px]">
          <button onClick={p.onInfo}
            className="w-full h-[46px] rounded-[14px] font-['Geist'] text-[12.5px] text-white/65 inline-flex items-center justify-center gap-[7px] active:bg-white/[0.03] transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <FileText className="h-[13px] w-[13px]" strokeWidth={1.7} />
            Ver información completa del negocio
          </button>
        </div>
      </div>
    </div>
  );
}
