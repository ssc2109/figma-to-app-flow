import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, Circle, AlertCircle, ChevronRight,
  FileText, Package, CreditCard, Users, Wallet, Truck, Megaphone, FileBadge, UserCog,
  Clock, MapPin, Phone, Instagram, Globe, Sparkles, ArrowUpRight, Building2, ArrowRight, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/data/inventory";

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
   Trax · Business Hub (v2 – premium, ligero, animado)
   ============================================================ */

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

/* ---------- ambient background ---------- */
function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-[200px] -left-[100px] h-[420px] w-[420px] rounded-full opacity-[0.35]"
        style={{
          background: "radial-gradient(closest-side, rgba(74,222,128,0.13), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute top-[120px] -right-[140px] h-[360px] w-[360px] rounded-full opacity-[0.30]"
        style={{
          background: "radial-gradient(closest-side, rgba(120,180,255,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}

/* ---------- surface ---------- */
function Surface({
  children, className = "", glow = false, onClick, animate = true,
}: {
  children: React.ReactNode; className?: string; glow?: boolean; onClick?: () => void; animate?: boolean;
}) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 10 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={`relative rounded-[22px] overflow-hidden text-left ${onClick ? "transition-transform" : ""} ${className}`}
      style={{
        background: glow
          ? "linear-gradient(180deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.025) 100%)"
          : "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: glow ? "inset 0 1px 0 0 rgba(255,255,255,0.07)" : undefined,
      }}
    >
      {children}
    </Tag>
  );
}

/* ============================================================
   Header / Identity
   ============================================================ */
function IdentityHeader() {
  const { profile } = useAuth();
  const name = profile?.business_name || "Mi negocio";
  const type = profile?.business_type || "Define tu rubro";
  const open = isOpenNow(profile?.open_time ?? null, profile?.close_time ?? null);
  const closeAt = fmtTime(profile?.close_time);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase()).join("") || "N";
  const addressShort = (profile?.address || "").split(",")[0] || null;

  return (
    <div className="relative px-[20px] pt-[26px] pb-[6px]">
      <div className="flex items-center gap-[14px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[56px] w-[56px] rounded-[18px] shrink-0 grid place-items-center overflow-hidden"
          style={{
            background: "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.20), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 28px -10px rgba(74,222,128,0.18)",
          }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tracking-[-0.5px]">{initials}</span>
          )}
        </motion.div>
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
        {open !== null && (
          <span className="inline-flex items-center gap-[6px]">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-[6px] w-[6px] rounded-full"
              style={{
                background: open ? "#4ADE80" : "#F87171",
                boxShadow: open ? "0 0 10px rgba(74,222,128,0.7)" : "0 0 10px rgba(248,113,113,0.5)",
              }} />
            <span className="font-['Geist'] text-[11.5px] text-white/65">{open ? "Abierto ahora" : "Cerrado"}</span>
          </span>
        )}
        {open && closeAt && (
          <span className="inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/45">
            <Clock className="h-[12px] w-[12px]" strokeWidth={1.8} /> Cierra {closeAt}
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
   Readiness
   ============================================================ */
function useReadiness(go: { info: () => void; inventory: () => void; payments: () => void }) {
  const { profile } = useAuth();
  const { productCount } = useInventory();
  return useMemo<Step[]>(() => {
    const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return [
      { id: "identity", label: "Identidad del negocio", hint: "Nombre y rubro",
        status: has(profile?.business_name) && has(profile?.business_type) ? "done" : "pending",
        weight: 1, go: go.info },
      { id: "logo", label: "Logo o foto", hint: "Tu marca visible",
        status: has(profile?.avatar_url) ? "done" : "recommended", weight: 1 },
      { id: "address", label: "Dirección física", hint: "Dónde encontrarte",
        status: has(profile?.address) ? "done" : "pending", weight: 1, go: go.info },
      { id: "schedule", label: "Horario de atención", hint: "Apertura y cierre",
        status: has(profile?.open_time) && has(profile?.close_time) ? "done" : "pending",
        weight: 1, go: go.info },
      { id: "phone", label: "Teléfono o WhatsApp", hint: "Contacto directo",
        status: has(profile?.phone) ? "done" : "recommended", weight: 1, go: go.info },
      { id: "catalog", label: "Catálogo de productos",
        hint: productCount > 0 ? `${productCount} en catálogo` : "Sin productos",
        status: productCount >= 3 ? "done" : productCount > 0 ? "recommended" : "pending",
        weight: 1.4, go: go.inventory },
      { id: "payments", label: "Métodos de pago", hint: "Efectivo, Yape, Plin",
        status: "recommended", weight: 1.2, go: go.payments },
    ];
  }, [profile, productCount, go]);
}

function ReadinessHero({ steps, onSeeAll }: { steps: Step[]; onSeeAll: () => void }) {
  const totalW = steps.reduce((s, x) => s + x.weight, 0);
  const doneW = steps.filter((x) => x.status === "done").reduce((s, x) => s + x.weight, 0);
  const pct = Math.round((doneW / totalW) * 100);
  const doneCount = steps.filter((x) => x.status === "done").length;
  const R = 56;
  const C = 2 * Math.PI * R;
  const offset = C - (C * pct) / 100;

  return (
    <Surface glow className="mx-[20px]">
      <div className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(120% 90% at 85% 0%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(80% 60% at 0% 100%, rgba(74,222,128,0.08), transparent 60%)",
        }} />
      <div className="relative px-[18px] pt-[18px] pb-[16px] flex items-center gap-[16px]">
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="progGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#4ADE80" />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={R} stroke="rgba(255,255,255,0.07)" strokeWidth={7} fill="none" />
            <motion.circle cx="70" cy="70" r={R} stroke="url(#progGrad)" strokeWidth={7}
              strokeLinecap="round" fill="none" strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-['Bai_Jamjuree'] text-[38px] font-bold text-white tracking-[-1.4px] leading-[0.9] tabular-nums">
              {pct}<span className="text-[19px] font-medium text-white/45 align-top ml-[1px]">%</span>
            </motion.div>
            <div className="mt-[2px] font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/40">Listo</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/40">
            Madurez del negocio
          </div>
          <h2 className="mt-[4px] font-['Bai_Jamjuree'] text-[18px] font-semibold text-white leading-[1.2] tracking-[-0.4px]">
            {pct === 100 ? "Tu negocio está completo" : `Listo al ${pct}%`}
          </h2>
          <p className="mt-[5px] font-['Geist'] text-[12px] text-white/55 leading-[1.4]">
            {doneCount} de {steps.length} pasos completados.
          </p>
          <button onClick={onSeeAll}
            className="mt-[10px] inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/85 px-[10px] py-[5px] rounded-full bg-white/[0.06] border border-white/[0.09] active:bg-white/[0.10] transition-colors">
            Ver checklist
            <ArrowRight className="h-[11px] w-[11px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </Surface>
  );
}

/* ============================================================
   Next step (compact replacement of long checklist)
   ============================================================ */
function NextStepCard({ steps, onSeeAll }: { steps: Step[]; onSeeAll: () => void }) {
  const next = steps.filter((s) => s.status !== "done");
  if (next.length === 0) return null;
  const top = next[0];
  const pendingCount = next.length;

  return (
    <Surface glow className="mx-[20px]" onClick={top.go ?? onSeeAll}>
      <div className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(80% 60% at 100% 0%, rgba(120,180,255,0.07), transparent 60%)",
        }} />
      <div className="relative px-[16px] py-[14px] flex items-center gap-[12px]">
        <div className="h-[40px] w-[40px] rounded-[12px] grid place-items-center shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}>
          <Sparkles className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[10px] uppercase tracking-[1.4px] text-white/40">
            Siguiente paso
          </div>
          <div className="mt-[2px] font-['Geist'] text-[14px] font-medium text-white truncate">
            {top.label}
          </div>
          <div className="mt-[1px] font-['Geist'] text-[11.5px] text-white/45 truncate">
            {pendingCount > 1 ? `+ ${pendingCount - 1} más por completar` : top.hint}
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/40 shrink-0" strokeWidth={1.7} />
      </div>
    </Surface>
  );
}

/* ============================================================
   Checklist Sheet (expanded view, only on demand)
   ============================================================ */
function ChecklistSheet({ steps, onClose }: { steps: Step[]; onClose: () => void }) {
  const sorted = [...steps].sort((a, b) => {
    const order = { pending: 0, recommended: 1, done: 2 } as const;
    return order[a.status] - order[b.status];
  });
  const StatusIcon = ({ status }: { status: Status }) => {
    if (status === "done") return <CheckCircle2 className="h-[18px] w-[18px] text-[#4ADE80]" strokeWidth={1.7} />;
    if (status === "recommended") return <AlertCircle className="h-[18px] w-[18px] text-white/55" strokeWidth={1.7} />;
    return <Circle className="h-[18px] w-[18px] text-white/30" strokeWidth={1.6} />;
  };

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] pt-[14px] pb-[24px] max-h-[80vh] overflow-y-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[10px]" />
        <div className="flex items-center justify-between px-[20px] mb-[12px]">
          <h3 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white">Checklist del negocio</h3>
          <button onClick={onClose} className="h-[32px] w-[32px] rounded-full grid place-items-center active:bg-white/[0.05]">
            <X className="h-[15px] w-[15px] text-white/55" strokeWidth={1.8} />
          </button>
        </div>
        <div className="px-[16px]">
          <div className="rounded-[16px] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
            {sorted.map((s, i) => (
              <div key={s.id}>
                <button onClick={() => { s.go?.(); onClose(); }}
                  disabled={!s.go}
                  className="w-full flex items-center gap-[12px] px-[14px] py-[12px] text-left active:bg-white/[0.03] transition-colors">
                  <StatusIcon status={s.status} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-['Geist'] text-[14px] truncate ${s.status === "done" ? "text-white/55" : "text-white"}`}>
                      {s.label}
                    </div>
                    <div className="mt-[1px] font-['Geist'] text-[11.5px] text-white/40 truncate">{s.hint}</div>
                  </div>
                  {s.go && s.status !== "done" && (
                    <ChevronRight className="h-[15px] w-[15px] text-white/25" strokeWidth={1.6} />
                  )}
                </button>
                {i < sorted.length - 1 && <div className="h-px bg-white/[0.05] mx-[14px]" />}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   socIA tips (2 visibles, animados)
   ============================================================ */
function SociaTips({ steps }: { steps: Step[] }) {
  const { productCount } = useInventory();
  type Tip = { id: string; title: string; body: string; cta?: string; onClick?: () => void };
  const tips: Tip[] = [];
  const stepBy = (id: string) => steps.find((s) => s.id === id);

  if ((stepBy("catalog")?.status ?? "done") !== "done")
    tips.push({
      id: "catalog", title: "Amplía tu catálogo",
      body: productCount === 0 ? "Aún no tienes productos. Agrega los principales."
        : `Solo tienes ${productCount} producto${productCount === 1 ? "" : "s"}. Agrega más.`,
      cta: "Ir al catálogo", onClick: stepBy("catalog")?.go,
    });
  if (stepBy("payments")?.status !== "done")
    tips.push({
      id: "pay", title: "Activa pagos digitales",
      body: "Configura Yape o Plin para no perder ventas.",
      cta: "Configurar", onClick: stepBy("payments")?.go,
    });
  if (stepBy("schedule")?.status !== "done")
    tips.push({
      id: "sched", title: "Define tu horario",
      body: "Tus clientes sabrán cuándo encontrarte.",
      cta: "Definir", onClick: stepBy("schedule")?.go,
    });
  if (stepBy("address")?.status !== "done")
    tips.push({
      id: "addr", title: "Completa tu ubicación",
      body: "Aparecer en oportunidades cercanas.",
      cta: "Agregar", onClick: stepBy("address")?.go,
    });

  const visible = tips.slice(0, 2);

  if (visible.length === 0) {
    return (
      <Surface>
        <div className="px-[18px] py-[16px] flex items-center gap-[12px]">
          <div className="h-[36px] w-[36px] rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08]">
            <Sparkles className="h-[16px] w-[16px] text-white/75" strokeWidth={1.7} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[14px] text-white">Negocio bien configurado</div>
            <div className="mt-[1px] font-['Geist'] text-[12px] text-white/45">
              socIA vigila oportunidades de mejora.
            </div>
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {visible.map((t, i) => (
        <motion.div key={t.id}
          initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}>
          <Surface glow animate={false}>
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(80% 60% at 100% 0%, rgba(74,222,128,0.06), transparent 60%)" }} />
            <div className="relative px-[16px] py-[14px] flex items-start gap-[12px]">
              <div className="h-[30px] w-[30px] rounded-full grid place-items-center shrink-0 mt-[1px] bg-white/[0.05] border border-white/[0.08]">
                <Sparkles className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.25]">{t.title}</div>
                <p className="mt-[3px] font-['Geist'] text-[12px] text-white/55 leading-[1.45]">{t.body}</p>
                {t.cta && (
                  <button onClick={t.onClick}
                    className="mt-[8px] inline-flex items-center gap-[5px] font-['Geist'] text-[11.5px] text-white/85 px-[10px] py-[5px] rounded-full bg-white/[0.06] border border-white/[0.09] active:bg-white/[0.10] transition-colors">
                    {t.cta}<ArrowUpRight className="h-[11px] w-[11px]" strokeWidth={1.9} />
                  </button>
                )}
              </div>
            </div>
          </Surface>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================================================
   Modules
   ============================================================ */
function ModuleCard({
  icon: Icon, label, meta, onClick, soon, accent,
}: {
  icon: typeof Building2; label: string; meta: string; onClick: () => void;
  soon?: boolean; accent?: string;
}) {
  return (
    <motion.button
      type="button" onClick={onClick}
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative text-left rounded-[18px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      {accent && (
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(80% 60% at 100% 0%, ${accent}, transparent 60%)` }} />
      )}
      <div className="relative px-[14px] pt-[14px] pb-[14px] h-[108px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-[34px] w-[34px] rounded-[11px] grid place-items-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            <Icon className="h-[16px] w-[16px] text-white/90" strokeWidth={1.7} />
          </div>
          {soon && (
            <span className="font-['Geist'] text-[9.5px] uppercase tracking-[1.2px] px-[7px] py-[2px] rounded-full bg-white/[0.05] border border-white/[0.07] text-white/45">
              Pronto
            </span>
          )}
        </div>
        <div>
          <div className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.15]">{label}</div>
          <div className="mt-[3px] font-['Geist'] text-[11.5px] text-white/45 leading-[1.25] truncate">{meta}</div>
        </div>
      </div>
    </motion.button>
  );
}

/* ============================================================
   Presence (compact)
   ============================================================ */
function Presence() {
  const { profile } = useAuth();
  const items = [
    { label: "Nombre público", value: !!profile?.business_name, icon: Building2 },
    { label: "Logo", value: !!profile?.avatar_url, icon: Globe },
    { label: "Dirección", value: !!profile?.address, icon: MapPin },
    { label: "WhatsApp", value: !!profile?.phone, icon: Phone },
    { label: "Redes sociales", value: false, icon: Instagram },
  ];
  const setCount = items.filter((i) => i.value).length;
  const score = Math.round((setCount / items.length) * 100);

  return (
    <Surface>
      <div className="px-[16px] pt-[14px] pb-[12px] flex items-center justify-between">
        <div>
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.3px] text-white/40">
            Cómo te ven afuera
          </div>
          <div className="mt-[2px] font-['Bai_Jamjuree'] text-[15px] font-semibold text-white tracking-[-0.3px]">
            Presencia · {score}%
          </div>
        </div>
        <div className="h-[34px] px-[10px] rounded-full grid place-items-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="font-['Bai_Jamjuree'] text-[12px] font-semibold text-white/85 tabular-nums">
            {setCount}/{items.length}
          </span>
        </div>
      </div>
      {/* progress bar */}
      <div className="mx-[16px] h-[4px] rounded-full overflow-hidden bg-white/[0.05]">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #4ADE80, #ffffff)" }} />
      </div>
      <div className="flex flex-wrap gap-[6px] px-[16px] py-[14px]">
        {items.map((i) => (
          <span key={i.label}
            className="inline-flex items-center gap-[6px] px-[10px] h-[28px] rounded-full font-['Geist'] text-[11.5px]"
            style={{
              background: i.value ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
              color: i.value ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
              border: i.value ? "1px solid rgba(74,222,128,0.20)" : "1px solid rgba(255,255,255,0.06)",
            }}>
            <i.icon className="h-[11px] w-[11px]" strokeWidth={1.9} />
            {i.label}
          </span>
        ))}
      </div>
    </Surface>
  );
}

/* ============================================================
   SectionTitle
   ============================================================ */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-[26px]">
      <div className="px-[26px] pb-[10px] font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.6px] text-white/35">
        {title}
      </div>
      <div className="px-[20px]">{children}</div>
    </div>
  );
}

/* ============================================================
   Public composition
   ============================================================ */
export default function BusinessHub({
  onInfo, onInventory, onPayments, onClients, onDebts,
  onSuppliers, onChannels, onDocuments, onTeam,
}: {
  onInfo: () => void; onInventory: () => void; onPayments: () => void;
  onClients: () => void; onDebts: () => void;
  onSuppliers: () => void; onChannels: () => void; onDocuments: () => void; onTeam: () => void;
}) {
  const { productCount } = useInventory();
  const steps = useReadiness({ info: onInfo, inventory: onInventory, payments: onPayments });
  const [showChecklist, setShowChecklist] = useState(false);

  return (
    <div className="relative">
      <Ambient />

      <div className="relative">
        <IdentityHeader />

        <div className="mt-[14px]">
          <ReadinessHero steps={steps} onSeeAll={() => setShowChecklist(true)} />
        </div>

        <div className="mt-[12px]">
          <NextStepCard steps={steps} onSeeAll={() => setShowChecklist(true)} />
        </div>

        <Section title="socIA recomienda">
          <SociaTips steps={steps} />
        </Section>

        <Section title="Módulos del negocio">
          <div className="grid grid-cols-2 gap-[10px]">
            <ModuleCard icon={FileText} label="Información" meta="Datos del negocio" onClick={onInfo}
              accent="rgba(120,180,255,0.10)" />
            <ModuleCard icon={Package} label="Catálogo"
              meta={`${productCount} producto${productCount === 1 ? "" : "s"}`} onClick={onInventory}
              accent="rgba(74,222,128,0.10)" />
            <ModuleCard icon={CreditCard} label="Métodos de pago" meta="Efectivo · Yape · Plin" onClick={onPayments} />
            <ModuleCard icon={Users} label="Clientes" meta="Lista y contactos" onClick={onClients}
              accent="rgba(255,200,120,0.08)" />
            <ModuleCard icon={Wallet} label="Deudas" meta="Por cobrar y por pagar" onClick={onDebts}
              accent="rgba(248,113,113,0.08)" />
          </div>
        </Section>

        <Section title="Próximamente">
          <div className="grid grid-cols-2 gap-[10px]">
            <ModuleCard icon={Truck} label="Proveedores" meta="A quién compras" onClick={onSuppliers} soon />
            <ModuleCard icon={Megaphone} label="Canales" meta="Tienda · delivery" onClick={onChannels} soon />
            <ModuleCard icon={FileBadge} label="Documentos" meta="RUC · licencias" onClick={onDocuments} soon />
            <ModuleCard icon={UserCog} label="Equipo" meta="Quién te ayuda" onClick={onTeam} soon />
          </div>
        </Section>

        <Section title="Presencia">
          <Presence />
        </Section>

        <p className="font-['Geist'] text-[11px] text-white/25 text-center pt-[28px] pb-[8px] tracking-[0.2px]">
          Perfil operativo · Trax
        </p>
      </div>

      <AnimatePresence>
        {showChecklist && <ChecklistSheet steps={steps} onClose={() => setShowChecklist(false)} />}
      </AnimatePresence>
    </div>
  );
}
