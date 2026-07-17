import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useInView } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Lock,
  Sun,
  Target,
  X,
  ListChecks,
  CalendarDays,
  FolderKanban,
  Sparkles,
  Search,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Flame,
  Loader2,
  Newspaper,
  TrendingUp,
  Building2,
  Star,
  PlayCircle,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Compass,
  Calendar as CalendarIcon,
  Clock,
  Check,
  Play,
  Trophy,
  Award,
  Medal,
  Crown,
  Rocket,
  Gem,
  Landmark,
  ScrollText,
  HandCoins,
  Handshake,
  Users,
  Package,
  Megaphone,
  Brain,
  BarChart3,
  Cpu,
  BrainCircuit,
  Activity,
  ShoppingBag,
  AlertOctagon,
  ClipboardCheck,
  RotateCcw,
  Youtube,
} from "lucide-react";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { useServerFn } from "@tanstack/react-start";
import { generateLearnSession, type LearnSession } from "@/lib/learn.functions";
import {
  EXPANDED_LESSONS,
  TIER_LABEL,
  TIER_RANGES,
  expandedTopicTitles,
  isExpanded,
  type LessonKind,
  type LessonNode as LessonNodeT,
  type LessonTier,
  type LessonVideo,
} from "@/lib/learn/lessons";
import {
  useMe,
  type Todo,
  type Lesson,
  type CalendarEvent,
  type Project,
  type Priority,
  type Goal,
  type ProjectStatus,
  type RoutineItem,
  type Recommendation,
} from "@/data/me";
import {
  PageHeader,
  SectionLabel,
  ListGroup,
  PlainRow,
  RowDivider,
  SubHeader,
  SubScreen,
  FooterMark,
} from "./business/shared";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePlan } from "@/hooks/usePlan";
import type { PlanId } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type View =
  | "hub"
  | "priorities"
  | "calendar"
  | "projects"
  | "goals"
  | "learn"
  | "recos";

const PRIO: Record<Priority, { color: string; label: string }> = {
  urgent: { color: "#F87171", label: "Urgente" },
  high: { color: "#FACC15", label: "Alta" },
  normal: { color: "rgba(255,255,255,0.55)", label: "Media" },
  low: { color: "rgba(255,255,255,0.30)", label: "Baja" },
};

const PROJECT_STATUS: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: "Planeación", color: "rgba(255,255,255,0.45)" },
  active: { label: "En proceso", color: "#4ADE80" },
  paused: { label: "Pausado", color: "#FACC15" },
  done: { label: "Finalizado", color: "rgba(255,255,255,0.55)" },
  late: { label: "Retrasado", color: "#F87171" },
};

/* ============ HUB HERO ============ */
/* StreakHero eliminado — hub sin gamificación de racha */


/* ============ AURORA BG + BENTO TILE (Productivity hub only) ============ */

function AuroraBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 0%, #050B14 0%, #030713 55%, #020308 100%)" }} />
      <motion.div
        className="absolute left-1/2 -top-[160px] h-[560px] w-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(96,165,250,0.55) 0%, rgba(59,130,246,0.22) 38%, rgba(59,130,246,0) 72%)", filter: "blur(50px)", transform: "translateX(-50%)" }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[220px] -left-[140px] h-[540px] w-[720px] rounded-[60%]"
        style={{ background: "radial-gradient(circle, #142A5C 0%, #0B1533 42%, rgba(11,21,51,0) 75%)", filter: "blur(90px)" }}
        animate={{ x: [0, 40, 0], y: [0, -18, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[440px] -right-[160px] h-[600px] w-[680px] rounded-[60%]"
        style={{ background: "radial-gradient(circle, #1E40AF 0%, #0B1533 46%, rgba(11,21,51,0) 78%)", filter: "blur(110px)" }}
        animate={{ x: [0, -32, 0], y: [0, 22, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[720px] left-[36%] h-[420px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(76,29,149,0.38) 0%, rgba(76,29,149,0.10) 42%, rgba(76,29,149,0) 72%)", filter: "blur(120px)" }}
        animate={{ x: [0, -34, 0], y: [0, 18, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[980px] right-[8%] h-[300px] w-[340px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.50) 0%, rgba(59,130,246,0) 70%)", filter: "blur(80px)" }}
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div className="absolute bottom-[120px] -left-[80px] h-[360px] w-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(76,29,149,0.28) 0%, rgba(76,29,149,0) 68%)", filter: "blur(110px)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[280px]" style={{ background: "linear-gradient(to bottom, rgba(2,3,8,0) 0%, #020308 82%)" }} />
    </div>
  );
}

/* Blue-tinted row (legacy, kept) */
function BlueRow({
  Icon,
  label,
  meta,
  onClick,
  accent = "#3B82F6",
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  meta: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[20px] p-[14px] flex items-center gap-[14px] active:scale-[0.99] transition-transform"
      style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.75) 0%, rgba(15,23,42,0.9) 100%)", border: "1px solid rgba(96,165,250,0.14)" }}
    >
      <span
        className="h-[46px] w-[46px] rounded-[14px] flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, #1E40AF 100%)`, boxShadow: `0 6px 18px -8px ${accent}` }}
      >
        <Icon className="h-[20px] w-[20px] text-white" strokeWidth={1.9} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white leading-[1.2]">{label}</div>
        <div className="mt-[3px] font-['Geist'] text-[12px] text-[#CBD5E1]/75 leading-[1.35] truncate">{meta}</div>
      </div>
      <ChevronRight className="h-[16px] w-[16px] text-[#93C5FD]/60 shrink-0" strokeWidth={1.8} />
    </button>
  );
}

/* Bento tile — glass over aurora, mixed sizes via grid-column spans */
function BentoTile({
  Icon,
  label,
  meta,
  onClick,
  accent = "#3B82F6",
  className = "",
  span = 1,
  minH,
  children,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  meta?: string;
  onClick?: () => void;
  accent?: string;
  className?: string;
  span?: 1 | 2;
  minH?: number;
  children?: React.ReactNode;
}) {
  const spanClass = span === 2 ? "col-span-2" : "col-span-1";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left rounded-[22px] p-[14px] flex flex-col justify-between overflow-hidden active:scale-[0.98] transition-transform ${spanClass} ${className}`}
      style={{
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(96,165,250,0.15)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 32px -18px rgba(0,0,0,0.65)",
        minHeight: minH ?? 118,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[40px] -right-[40px] h-[140px] w-[140px] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${accent}55 0%, ${accent}00 70%)`, filter: "blur(24px)" }}
      />
      <div className="relative flex items-start justify-between gap-[8px]">
        <span
          className="h-[38px] w-[38px] rounded-full flex items-center justify-center shrink-0"
          style={{ background: `radial-gradient(circle at 30% 28%, ${accent} 0%, #1E3A8A 78%)`, boxShadow: `0 4px 14px -4px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.22)` }}
        >
          <Icon className="h-[17px] w-[17px] text-white" strokeWidth={1.9} />
        </span>
        <ChevronRight className="h-[15px] w-[15px] text-white/25 mt-[10px]" strokeWidth={1.8} />
      </div>
      <div className="relative mt-[12px]">
        <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white leading-[1.2]">{label}</div>
        {meta && <div className="mt-[3px] font-['Geist'] text-[11.5px] text-white/55 leading-[1.35]">{meta}</div>}
        {children && <div className="mt-[10px]">{children}</div>}
      </div>
    </button>
  );
}
/* Today status — reemplaza la racha con datos reales del negocio */
function TodayStatus({
  name,
  tasksDone,
  tasksTotal,
  salesToday,
  alerts,
  lowStock,
  fiadosOverdue,
}: {
  name: string;
  tasksDone: number;
  tasksTotal: number;
  salesToday: number;
  alerts: number;
  lowStock: number;
  fiadosOverdue: number;
}) {
  const items: Array<{
    Icon: typeof Activity;
    accent: string;
    label: string;
    value: string;
    hint: string;
  }> = [
    {
      Icon: ShoppingBag,
      accent: "#60A5FA",
      label: "Ventas hoy",
      value: `S/ ${Math.round(salesToday)}`,
      hint: salesToday > 0 ? "Sigue así" : "Sin registro aún",
    },
    {
      Icon: CheckCircle2,
      accent: "#3B82F6",
      label: "Tareas hoy",
      value: `${tasksDone}/${tasksTotal}`,
      hint:
        tasksTotal === 0
          ? "Sin tareas"
          : tasksDone === tasksTotal
          ? "Todo cerrado"
          : `${tasksTotal - tasksDone} por hacer`,
    },
    {
      Icon: AlertOctagon,
      accent: alerts > 0 ? "#F87171" : "#93C5FD",
      label: "Alertas",
      value: `${alerts}`,
      hint:
        alerts === 0
          ? "Sin urgencias"
          : lowStock > 0 && fiadosOverdue > 0
          ? `Stock bajo y fiados`
          : lowStock > 0
          ? `${lowStock} en stock bajo`
          : fiadosOverdue > 0
          ? `Fiados vencidos`
          : "Revisa prioridades",
    },
  ];

  return (
    <div className="relative">
      <div className="pb-[10px] flex items-center gap-[8px]">
        <Activity className="h-[14px] w-[14px] text-[#93C5FD]" strokeWidth={1.9} />
        <span className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.8px] text-[#93C5FD]/80">
          Estado del negocio hoy
        </span>
      </div>
      <div className="mb-[14px] font-['Bai_Jamjuree'] text-[18px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
        {alerts > 0
          ? `Hay ${alerts} cosa${alerts === 1 ? "" : "s"} que atender`
          : salesToday > 0
          ? `Buen ritmo hoy`
          : `Aún sin movimiento hoy`}
      </div>

      <div className="grid grid-cols-3 gap-[8px]">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-[16px] p-[12px] flex flex-col gap-[8px] min-h-[92px]"
            style={{
              background: "rgba(15,23,42,0.55)",
              border: `1px solid ${it.accent}22`,
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="h-[26px] w-[26px] rounded-full grid place-items-center"
              style={{
                background: `linear-gradient(135deg, ${it.accent}44, ${it.accent}18)`,
                boxShadow: `0 0 12px ${it.accent}33`,
              }}
            >
              <it.Icon className="h-[13px] w-[13px] text-white" strokeWidth={1.9} />
            </div>
            <div>
              <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tabular-nums leading-none">
                {it.value}
              </div>
              <div className="mt-[4px] font-['Geist'] text-[10.5px] text-white/55 leading-[1.3]">
                {it.label}
              </div>
              <div className="mt-[2px] font-['Geist'] text-[10px] text-white/40 leading-[1.3]">
                {it.hint}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* StreakAurora eliminado — hub sin racha */


/* Animated count-up number for stat cards */
function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(prev.current, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {Math.round(display)}
      {suffix}
    </span>
  );
}


/* ============ SHARED MODAL ============ */
function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ bottom: "calc(104px + env(safe-area-inset-bottom))" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={onClose}
          />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="relative w-full max-w-[430px] flex flex-col rounded-[24px] overflow-hidden"
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "calc(100dvh - 8px - 104px - env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex items-center justify-between px-[18px] pt-[16px] pb-[10px] shrink-0">
              <span className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white">{title}</span>
              <div className="flex items-center gap-[6px]">
                <button type="button" onClick={onClose} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]" aria-label="Cerrar">
                  <X className="h-[15px] w-[15px] text-white/60" strokeWidth={1.6} />
                </button>
              </div>
            </div>
            <div
              className="trax-scroll px-[18px] pb-[14px] flex flex-col gap-[12px] overflow-y-auto flex-1 min-h-0 overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {children}
            </div>
            {footer && (
              <div
                className="px-[18px] pt-[10px] pb-[14px] grid grid-cols-2 gap-[10px] shrink-0"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  background: "#0d0d0d",
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="font-['Geist'] text-[11px] font-medium uppercase tracking-[1.4px] text-white/40">{label}</span>
      {children}
    </label>
  );
}

function ProductivityScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`trax-scroll trax-productivity-scroll min-h-0 ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-[38px] px-[12px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="trax-fixed-textarea w-full min-h-[96px] px-[12px] py-[10px] rounded-[12px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 resize-none"
      style={{ border: "1px solid rgba(255,255,255,0.08)", resize: "none" }}
    />
  );
}


const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = isISODate(value) ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative w-full min-h-[52px] rounded-[14px] flex items-center px-[12px] gap-[10px] text-left cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
          aria-label="Elegir fecha"
        >
          <span className="h-[30px] w-[30px] rounded-[10px] bg-white/[0.06] flex items-center justify-center shrink-0">
            <CalendarIcon className="h-[16px] w-[16px] text-white/60" strokeWidth={1.8} />
          </span>
          <span className={`font-['Bai_Jamjuree'] text-[15px] font-semibold tabular-nums flex-1 ${value ? "text-white" : "text-white/40"}`}>
            {value ? formatPickerDate(value) : "Elegir fecha"}
          </span>
        </button>

      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-auto p-0 rounded-[18px] pointer-events-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (!d) return;
            onChange(normalizeDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`));
            setOpen(false);
          }}
          initialFocus
          className="p-2 pointer-events-auto !bg-transparent text-white [&_.rdp-day]:text-white/85 [&_button]:text-white/85"
          classNames={{ root: "!bg-transparent" }}
        />
      </PopoverContent>
    </Popover>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative w-full min-h-[52px] rounded-[14px] flex items-center px-[12px] gap-[10px] text-left cursor-pointer"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
          aria-label="Elegir hora"
        >
          <span className="h-[30px] w-[30px] rounded-[10px] bg-white/[0.06] flex items-center justify-center shrink-0">
            <Clock className="h-[16px] w-[16px] text-white/60" strokeWidth={1.8} />
          </span>
          <span className={`font-['Bai_Jamjuree'] text-[15px] font-semibold tabular-nums flex-1 ${value ? "text-white" : "text-white/40"}`}>
            {value ? formatTimeLabel(value) : "Elegir hora"}
          </span>
        </button>

      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[180px] p-[6px] rounded-[18px] pointer-events-auto"
        style={{ background: "rgba(14,14,16,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-h-[260px] overflow-y-auto trax-scroll flex flex-col gap-[4px]">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onChange(normalizeTime(t));
                setOpen(false);
              }}
              className="h-[38px] rounded-[12px] px-[12px] text-left font-['Bai_Jamjuree'] text-[14px] font-semibold tabular-nums"
              style={{ background: value === t ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.04)", color: value === t ? "#000" : "rgba(255,255,255,0.82)" }}
            >
              {formatTimeLabel(t)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}


function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="w-full h-[44px] px-[16px] rounded-full bg-white text-black font-['Geist'] text-[13px] font-semibold active:scale-95 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="w-full h-[44px] px-[14px] rounded-full font-['Geist'] text-[13px] text-white/75 active:bg-white/[0.05]"
      style={{ border: "1px solid rgba(255,255,255,0.10)" }}
    >
      {children}
    </button>
  );
}

/* ============ DATE / TIME HELPERS (timezone-aware) ============ */
// User timezone resuelto una sola vez desde el navegador (config del sistema).
function userTZ(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Lima";
  } catch {
    return "America/Lima";
  }
}
function userLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "es-PE";
}
// Fecha "hoy" en la zona horaria del usuario, formato ISO YYYY-MM-DD.
function todayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTZ(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts; // en-CA emite YYYY-MM-DD
}
function isISODate(v?: string): v is string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
function isValidTime(v?: string): v is string {
  return !!v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}
function normalizeTime(v?: string): string {
  if (!v) return "";
  // Acepta H:mm o HH:mm:ss y normaliza a HH:mm
  const m = v.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return "";
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const mm = Math.min(59, Math.max(0, Number(m[2])));
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function normalizeDate(v?: string): string {
  if (!v) return "";
  return isISODate(v) ? v : "";
}
function formatDueLabel(v?: string) {
  if (!v) return "";
  if (!isISODate(v)) return v;
  const todayStr = todayISO();
  if (v === todayStr) return "Hoy";
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const tomorrow = new Date(ty, tm - 1, td + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  if (v === tomorrowStr) return "Mañana";
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(userLocale(), {
    day: "2-digit",
    month: "short",
    timeZone: userTZ(),
  });
}
function formatPickerDate(v?: string) {
  if (!v) return "";
  if (!isISODate(v)) return v;
  const todayStr = todayISO();
  if (v === todayStr) return "Hoy";
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const tomorrow = new Date(ty, tm - 1, td + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  if (v === tomorrowStr) return "Mañana";
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(userLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: userTZ(),
  });
}

function formatTimeLabel(v?: string) {
  const t = normalizeTime(v);
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  try {
    return new Intl.DateTimeFormat(userLocale(), {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: userTZ(),
    }).format(d);
  } catch {
    return t;
  }
}

/* ============ PRIORIDADES ============ */
function PrioritiesView({ onBack }: { onBack: () => void }) {
  const { todos, toggleTodo, addTodo, updateTodo, removeTodo, duplicateTodo, projects, goals } = useMe();
  const [query, setQuery] = useState("");
  const [filterPrio, setFilterPrio] = useState<Priority | "all">("all");
  const [editing, setEditing] = useState<Todo | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos
      .filter((t) => (filterPrio === "all" ? true : t.priority === filterPrio))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const p = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
        if (a.done !== b.done) return a.done ? 1 : -1;
        return p[a.priority] - p[b.priority];
      });
  }, [todos, filterPrio, query]);

  const done = todos.filter((t) => t.done).length;
  const total = todos.length;


  return (
    <SubScreen>
      <SubHeader
        eyebrow="Lo importante"
        title="Prioridades"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
            aria-label="Nueva tarea"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
        <div className="relative">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-white/40" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tarea…"
            className="w-full h-[38px] pl-[34px] pr-[12px] rounded-[12px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          />
        </div>

        <div className="flex items-center gap-[6px] overflow-x-auto -mx-[4px] px-[4px]">
          {(["all", "urgent", "high", "normal", "low"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPrio(p)}
              className="shrink-0 h-[28px] px-[12px] rounded-full font-['Geist'] text-[11.5px] font-medium"
              style={{
                background: filterPrio === p ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${filterPrio === p ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`,
                color: p === "all" ? "white" : PRIO[p].color,
              }}
            >
              {p === "all" ? "Todas" : PRIO[p].label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-[40px] text-center font-['Geist'] text-[13px] text-white/40">
            Sin tareas. Pulsa + para crear una.
          </div>
        ) : (
          <ListGroup>
            {filtered.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-center gap-[12px] px-[14px] py-[12px]">
                  <button type="button" onClick={() => toggleTodo(t.id)} className="shrink-0">
                    {t.done ? (
                      <CheckCircle2 className="h-[18px] w-[18px] text-white/55" strokeWidth={1.8} />
                    ) : (
                      <Circle className="h-[18px] w-[18px]" strokeWidth={1.6} style={{ color: PRIO[t.priority].color }} />
                    )}
                  </button>
                  <button type="button" onClick={() => setEditing(t)} className="flex-1 min-w-0 text-left">
                    <div className={`font-['Geist'] text-[14.5px] truncate ${t.done ? "text-white/35 line-through" : "text-white"}`}>
                      {t.title}
                    </div>
                    {(t.due || t.time || t.tag) && (
                      <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/40 truncate">
                        {[formatDueLabel(t.due), t.time, t.tag].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateTodo(t.id)}
                    className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]"
                    aria-label="Duplicar"
                  >
                    <Copy className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTodo(t.id)}
                    className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                  </button>
                </div>
                {i < filtered.length - 1 && <div className="h-px bg-white/[0.05] ml-[46px]" />}
              </div>
            ))}
          </ListGroup>
        )}

        {total > 0 && (
          <div className="mt-[8px] rounded-[16px] p-[14px] flex items-baseline justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/40">Resumen del día</span>
            <span className="font-['Geist'] text-[13px] text-white/70 tabular-nums">
              {done} de {total} completadas
            </span>
          </div>
        )}
      </ProductivityScroll>

      <TaskSheet
        open={creating || !!editing}
        initial={editing ?? undefined}
        projects={projects}
        goals={goals}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(patch) => {
          if (editing) updateTodo(editing.id, patch);
          else addTodo({ due: patch.due ?? "Hoy", priority: patch.priority ?? "normal", title: patch.title ?? "", ...patch });
          setCreating(false);
          setEditing(null);
        }}
      />
    </SubScreen>
  );
}

function TaskSheet({
  open,
  initial,
  projects,
  goals,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Todo;
  projects: Project[];
  goals: Goal[];
  onClose: () => void;
  onSave: (patch: Partial<Todo>) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "normal");
  const [due, setDue] = useState(isISODate(initial?.due) ? initial!.due! : todayISO());
  const [time, setTime] = useState(initial?.time ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");

  // reset when initial changes o al abrir
  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(initial?.priority ?? "normal");
    setDue(isISODate(initial?.due) ? initial!.due! : todayISO());
    setTime(initial?.time ?? "");
    setTag(initial?.tag ?? "");
    setProjectId(initial?.projectId ?? "");
    setGoalId(initial?.goalId ?? "");
  }, [initial, open]);


  const submit = () => {
    if (!title.trim()) return;
    const safeDue = normalizeDate(due);
    const safeTime = normalizeTime(time);
    onSave({ title: title.trim(), description, priority, due: safeDue || undefined, time: safeTime || undefined, tag, projectId: projectId || undefined, goalId: goalId || undefined });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Editar tarea" : "Nueva tarea"}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton onClick={submit} disabled={!title.trim()}>
            Confirmar
          </PrimaryButton>
        </>
      }
    >
      <Field label="Nombre">
        <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Una tarea concreta…" />
      </Field>
      <Field label="Descripción">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
      </Field>
      <div className="grid grid-cols-1 gap-[10px]">
        <Field label="Fecha">
          <DateInput value={due} onChange={setDue} />
        </Field>
        <Field label="Hora">
          <TimeInput value={time} onChange={setTime} />
        </Field>
      </div>
      <Field label="Prioridad">
        <div className="flex flex-wrap gap-[6px]">
          {(["urgent", "high", "normal", "low"] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium"
              style={{
                background: priority === p ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${priority === p ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                color: PRIO[p].color,
              }}
            >
              {PRIO[p].label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Etiqueta">
        <TextInput value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej. Ventas, Personal…" />
      </Field>
      {projects.length > 0 && (
        <Field label="Proyecto relacionado">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full h-[38px] px-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="">— ninguno —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-black">
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {goals.length > 0 && (
        <Field label="Meta relacionada">
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full h-[38px] px-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="">— ninguna —</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id} className="bg-black">
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      )}
    </Sheet>
  );
}

/* ============ CALENDARIO ============ */
function CalendarView({ onBack }: { onBack: () => void }) {
  const { events, addEvent, removeEvent } = useMe();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);

  const monthLabel = cursor.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateOf = (d: number) =>
    `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const eventsByDay = useMemo(() => {
    const m = new Map<string, number>();
    events.forEach((e) => m.set(e.date, (m.get(e.date) ?? 0) + 1));
    return m;
  }, [events]);

  const dayEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
  const upcoming = [...events]
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date + (a.start ?? "")).localeCompare(b.date + (b.start ?? "")))
    .slice(0, 3);

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Tu agenda"
        title="Calendario"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
            aria-label="Nuevo evento"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[18px]">
        <div className="rounded-[18px] p-[14px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-[10px]">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]"
            >
              <ChevronLeft className="h-[16px] w-[16px] text-white/70" strokeWidth={1.8} />
            </button>
            <span className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]"
            >
              <ChevronRight className="h-[16px] w-[16px] text-white/70" strokeWidth={1.8} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-[2px] mb-[6px]">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} className="text-center font-['Geist'] text-[10.5px] uppercase tracking-[1px] text-white/35">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[2px]">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const iso = dateOf(d);
              const isSelected = iso === selectedDate;
              const isToday = iso === new Date().toISOString().slice(0, 10);
              const has = eventsByDay.has(iso);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className="aspect-square rounded-[10px] flex flex-col items-center justify-center relative"
                  style={{
                    background: isSelected ? "white" : isToday ? "rgba(255,255,255,0.08)" : "transparent",
                    color: isSelected ? "black" : "white",
                  }}
                >
                  <span className="font-['Bai_Jamjuree'] text-[13.5px] font-medium tabular-nums">{d}</span>
                  {has && <span className="absolute bottom-[4px] h-[3px] w-[3px] rounded-full" style={{ background: isSelected ? "black" : "#4ADE80" }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>Eventos del día</SectionLabel>
          {dayEvents.length === 0 ? (
            <div className="py-[24px] text-center font-['Geist'] text-[13px] text-white/40">
              Sin eventos. Pulsa + para agendar.
            </div>
          ) : (
            <ListGroup>
              {dayEvents.map((e, i) => (
                <div key={e.id}>
                  <div className="flex items-start gap-[12px] px-[14px] py-[12px]">
                    <div className="mt-[2px] font-['Bai_Jamjuree'] text-[13px] font-semibold text-white/65 tabular-nums shrink-0 w-[48px]">
                      {e.start ?? "—"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-['Geist'] text-[14.5px] text-white truncate">{e.title}</div>
                      {(e.end || e.place) && (
                        <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/40 truncate">
                          {[e.end && `hasta ${e.end}`, e.place].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeEvent(e.id)} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
                      <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                    </button>
                  </div>
                  {i < dayEvents.length - 1 && <div className="h-px bg-white/[0.05] ml-[74px]" />}
                </div>
              ))}
            </ListGroup>
          )}
        </div>

        {upcoming.length > 0 && (
          <div>
            <SectionLabel>Próximos</SectionLabel>
            <ListGroup>
              {upcoming.map((e, i) => (
                <div key={e.id}>
                  <PlainRow
                    label={e.title}
                    meta={`${e.date}${e.start ? ` · ${e.start}` : ""}`}
                    onClick={() => setSelectedDate(e.date)}
                  />
                  {i < upcoming.length - 1 && <RowDivider />}
                </div>
              ))}
            </ListGroup>
          </div>
        )}
      </ProductivityScroll>

      <EventSheet
        open={creating}
        defaultDate={selectedDate}
        onClose={() => setCreating(false)}
        onSave={(e) => {
          addEvent(e);
          setCreating(false);
        }}
      />
    </SubScreen>
  );
}

function EventSheet({
  open,
  defaultDate,
  onClose,
  onSave,
}: {
  open: boolean;
  defaultDate: string;
  onClose: () => void;
  onSave: (e: Omit<CalendarEvent, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDate(defaultDate);
    setStart("");
    setEnd("");
    setPlace("");
    setDescription("");
  }, [open, defaultDate]);


  const submit = () => {
    if (!title.trim()) return;
    const safeDate = normalizeDate(date) || todayISO();
    const safeStart = normalizeTime(start);
    const safeEnd = normalizeTime(end);
    onSave({ title: title.trim(), date: safeDate, start: safeStart || undefined, end: safeEnd || undefined, place: place || undefined, description });
    setTitle("");
    setStart("");
    setEnd("");
    setPlace("");
    setDescription("");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo evento"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton onClick={submit} disabled={!title.trim()}>
            Confirmar
          </PrimaryButton>
        </>
      }
    >
      <Field label="Título">
        <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reunión con proveedor" />
      </Field>
      <Field label="Fecha">
        <DateInput value={date} onChange={setDate} />
      </Field>
      <div className="grid grid-cols-1 gap-[10px]">
        <Field label="Inicio">
          <TimeInput value={start} onChange={setStart} />
        </Field>
        <Field label="Fin">
          <TimeInput value={end} onChange={setEnd} />
        </Field>
      </div>
      <Field label="Lugar">
        <TextInput value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Opcional" />
      </Field>
      <Field label="Descripción">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
      </Field>
    </Sheet>
  );
}

/* ============ RUTINA ============ */
function RoutineView({ onBack }: { onBack: () => void }) {
  const { routine, toggleRoutine, addRoutine, removeRoutine } = useMe();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("");

  const done = routine.filter((r) => r.done).length;
  const total = routine.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const submit = () => {
    if (!label.trim()) return;
    addRoutine({ label: label.trim(), time: time || undefined, frequency: "diaria" });
    setLabel("");
    setTime("");
    setAdding(false);
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Hábitos del día"
        title="Rutina"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <div className="rounded-[18px] p-[16px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-baseline justify-between">
            <span className="font-['Bai_Jamjuree'] text-[32px] font-semibold text-white tabular-nums">{pct}%</span>
            <span className="font-['Geist'] text-[12px] text-white/50 tabular-nums">
              {done} de {total || 0} hábitos
            </span>
          </div>
          <div className="mt-[10px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-[10px] font-['Geist'] text-[12px] text-white/45">
            {pct >= 90 ? "Excelente trabajo, casi completo." : pct >= 50 ? "Vas bien, no pierdas ritmo." : "Retoma tus hábitos para ganar racha."}
          </p>
        </div>

        {adding && (
          <div className="rounded-[16px] p-[14px] flex flex-col gap-[10px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <TextInput autoFocus placeholder="Ej. Revisar pedidos" value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <div className="flex flex-col gap-[10px]">
              <TimeInput value={time} onChange={setTime} />
              <div className="grid grid-cols-2 gap-[10px]">
                <GhostButton onClick={() => setAdding(false)}>Cancelar</GhostButton>
                <PrimaryButton onClick={submit}>Confirmar</PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {routine.length === 0 ? (
          <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">
            Sin hábitos. Pulsa + para agregar tu primero.
          </div>
        ) : (
          <ListGroup>
            {routine.map((r: RoutineItem, i) => (
              <div key={r.id}>
                <div className="flex items-center gap-[12px] px-[14px] py-[13px]">
                  <button type="button" onClick={() => toggleRoutine(r.id)} className="shrink-0">
                    {r.done ? (
                      <CheckCircle2 className="h-[18px] w-[18px] text-white/55" strokeWidth={1.8} />
                    ) : (
                      <Circle className="h-[18px] w-[18px] text-white/30" strokeWidth={1.6} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-['Geist'] text-[14.5px] ${r.done ? "text-white/40 line-through" : "text-white"} truncate`}>{r.label}</div>
                    {r.time && <div className="font-['Geist'] text-[11.5px] text-white/40 tabular-nums">{r.time}</div>}
                  </div>
                  <button type="button" onClick={() => removeRoutine(r.id)} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
                    <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                  </button>
                </div>
                {i < routine.length - 1 && <div className="h-px bg-white/[0.05] ml-[46px]" />}
              </div>
            ))}
          </ListGroup>
        )}
      </ProductivityScroll>
    </SubScreen>
  );
}

/* ============ PROYECTOS ============ */
function ProjectsView({ onBack }: { onBack: () => void }) {
  const { projects, addProject, updateProject, removeProject, duplicateProject, goals } = useMe();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Tu operación"
        title="Proyectos"
        onBack={onBack}
        action={
          <button type="button" onClick={() => setCreating(true)} className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95">
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
        {projects.length === 0 ? (
          <div className="py-[40px] text-center font-['Geist'] text-[13px] text-white/40">
            Sin proyectos. Pulsa + para crear el primero.
          </div>
        ) : (
          projects.map((p) => {
            const s = PROJECT_STATUS[p.status];
            const isLate = p.status === "late";
            return (
              <div
                key={p.id}
                className="rounded-[18px] p-[14px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${isLate ? "rgba(248,113,113,0.30)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-start gap-[10px]">
                  <button type="button" onClick={() => setEditing(p)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-[8px]">
                      <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.color }} />
                      <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">{s.label}</span>
                    </div>
                    <div className="mt-[6px] font-['Bai_Jamjuree'] text-[16px] font-semibold text-white truncate">{p.name}</div>
                    {p.description && (
                      <div className="mt-[2px] font-['Geist'] text-[12.5px] text-white/50 line-clamp-2">{p.description}</div>
                    )}
                  </button>
                  <div className="flex items-center gap-[2px]">
                    <button type="button" onClick={() => duplicateProject(p.id)} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
                      <Copy className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                    </button>
                    <button type="button" onClick={() => removeProject(p.id)} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
                      <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
                {isLate && (
                  <div className="mt-[10px] flex items-center gap-[6px] font-['Geist'] text-[11.5px] text-[#F87171]">
                    <AlertTriangle className="h-[13px] w-[13px]" strokeWidth={1.8} />
                    Este proyecto va retrasado
                  </div>
                )}
              </div>
            );
          })
        )}
      </ProductivityScroll>

      <ProjectSheet
        open={creating || !!editing}
        initial={editing ?? undefined}
        goals={goals}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(patch) => {
          if (editing) updateProject(editing.id, patch);
          else
            addProject({
              name: patch.name ?? "",
              priority: patch.priority ?? "normal",
              ...patch,
            });
          setCreating(false);
          setEditing(null);
        }}
      />
    </SubScreen>
  );
}

function ProjectSheet({
  open,
  initial,
  goals,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Project;
  goals: Goal[];
  onClose: () => void;
  onSave: (patch: Partial<Project>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [owner, setOwner] = useState(initial?.owner ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "planning");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "normal");
  
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setOwner(initial?.owner ?? "");
    setDueDate(initial?.dueDate ?? "");
    setStatus(initial?.status ?? "planning");
    setPriority(initial?.priority ?? "normal");
    setGoalId(initial?.goalId ?? "");
  }, [initial, open]);


  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description,
      owner,
      dueDate: normalizeDate(dueDate) || undefined,
      status,
      priority,
      progress: initial?.progress ?? 0,
      goalId: goalId || undefined,
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Editar proyecto" : "Nuevo proyecto"}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton onClick={submit} disabled={!name.trim()}>
            Confirmar
          </PrimaryButton>
        </>
      }
    >
      <Field label="Nombre">
        <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Expansión regional" />
      </Field>
      <Field label="Descripción">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Responsable">
        <TextInput value={owner} onChange={(e) => setOwner(e.target.value)} />
      </Field>
      <Field label="Fecha límite">
        <DateInput value={dueDate} onChange={setDueDate} />
      </Field>
      <Field label="Estado">
        <div className="flex flex-wrap gap-[6px]">
          {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px]"
              style={{
                background: status === s ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${status === s ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                color: PROJECT_STATUS[s].color,
              }}
            >
              {PROJECT_STATUS[s].label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Prioridad">
        <div className="flex flex-wrap gap-[6px]">
          {(["urgent", "high", "normal", "low"] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px]"
              style={{
                background: priority === p ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${priority === p ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                color: PRIO[p].color,
              }}
            >
              {PRIO[p].label}
            </button>
          ))}
        </div>
      </Field>
      {goals.length > 0 && (
        <Field label="Meta relacionada">
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full h-[38px] px-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="">— ninguna —</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id} className="bg-black">
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      )}
    </Sheet>
  );
}

/* ============ METAS ============ */
function GoalsView({ onBack }: { onBack: () => void }) {
  const { goals, addGoal, updateGoal, removeGoal } = useMe();
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Hacia dónde vas"
        title="Metas"
        onBack={onBack}
        action={
          <button type="button" onClick={() => setCreating(true)} className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95">
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[10px] flex flex-col gap-[22px]">
        {goals.length === 0 ? (
          <div className="py-[40px] text-center font-['Geist'] text-[13px] text-white/40">
            Sin metas. Pulsa + para crear una.
          </div>
        ) : (
          goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
            return (
              <div key={g.id} className="px-[6px]">
                <div className="flex items-baseline justify-between gap-[10px]">
                  <button type="button" onClick={() => setEditing(g)} className="font-['Geist'] text-[14.5px] text-white text-left truncate">
                    {g.label}
                  </button>
                  <div className="flex items-center gap-[6px]">
                    <span className="font-['Bai_Jamjuree'] text-[13.5px] font-semibold text-white tabular-nums">{pct.toFixed(0)}%</span>
                    <button type="button" onClick={() => removeGoal(g.id)} className="h-[28px] w-[28px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
                      <Trash2 className="h-[13px] w-[13px] text-white/40" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
                {g.category && (
                  <div className="mt-[2px] font-['Geist'] text-[11px] text-white/40">{g.category}</div>
                )}
                <div className="mt-[10px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
                <div className="mt-[8px] flex items-center gap-[10px] font-['Geist'] text-[11.5px] text-white/40 tabular-nums">
                  <button
                    type="button"
                    onClick={() => updateGoal(g.id, { current: Math.max(0, g.current - 1) })}
                    className="h-[22px] w-[22px] rounded-full flex items-center justify-center bg-white/[0.06]"
                  >
                    −
                  </button>
                  <span>
                    {g.unit === "S/" ? "S/ " : ""}
                    {g.current.toLocaleString()}
                    {g.unit === "%" ? "%" : g.unit === "u" ? " u" : ""} / {g.unit === "S/" ? "S/ " : ""}
                    {g.target.toLocaleString()}
                    {g.unit === "%" ? "%" : g.unit === "u" ? " u" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGoal(g.id, { current: g.current + 1 })}
                    className="h-[22px] w-[22px] rounded-full flex items-center justify-center bg-white/[0.06]"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </ProductivityScroll>

      <GoalSheet
        open={creating || !!editing}
        initial={editing ?? undefined}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(patch) => {
          if (editing) updateGoal(editing.id, patch);
          else addGoal({ label: patch.label ?? "", target: patch.target ?? 100, unit: patch.unit ?? "u", ...patch });
          setCreating(false);
          setEditing(null);
        }}
      />
    </SubScreen>
  );
}

function GoalSheet({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Goal;
  onClose: () => void;
  onSave: (patch: Partial<Goal>) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [target, setTarget] = useState<number>(initial?.target ?? 100);
  const [unit, setUnit] = useState<Goal["unit"]>(initial?.unit ?? "u");
  const [category, setCategory] = useState<Goal["category"] | undefined>(initial?.category);
  const [due, setDue] = useState(initial?.due ?? "");

  useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? "");
    setDescription(initial?.description ?? "");
    setTarget(initial?.target ?? 100);
    setUnit(initial?.unit ?? "u");
    setCategory(initial?.category);
    setDue(initial?.due ?? "");
  }, [initial, open]);


  const cats: Goal["category"][] = ["Ventas", "Marketing", "Finanzas", "Clientes", "Operaciones", "Personal"];

  const submit = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), description, target, unit, category, due: normalizeDate(due) || undefined });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Editar meta" : "Nueva meta"}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancelar</GhostButton>
          <PrimaryButton onClick={submit} disabled={!label.trim()}>
            Confirmar
          </PrimaryButton>
        </>
      }
    >
      <Field label="Nombre">
        <TextInput autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej. Vender S/ 5000 al mes" />
      </Field>
      <Field label="Descripción">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-[10px]">
        <Field label="Objetivo">
          <TextInput type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
        </Field>
        <Field label="Unidad">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Goal["unit"])}
            className="w-full h-[38px] px-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="u" className="bg-black">unidades</option>
            <option value="S/" className="bg-black">soles</option>
            <option value="%" className="bg-black">%</option>
          </select>
        </Field>
      </div>
      <Field label="Categoría">
        <div className="flex flex-wrap gap-[6px]">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c === category ? undefined : c)}
              className="h-[28px] px-[10px] rounded-full font-['Geist'] text-[11.5px]"
              style={{
                background: category === c ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${category === c ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                color: "white",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Fecha límite">
        <DateInput value={due} onChange={setDue} />
      </Field>
    </Sheet>
  );
}

/* ============ APRENDER ============ */
function LessonNode({ l, onComplete, last }: { l: Lesson; onComplete: () => void; last?: boolean }) {
  const locked = l.status === "bloqueada";
  const done = l.status === "completada";
  return (
    <>
      <button
        type="button"
        disabled={locked}
        onClick={onComplete}
        className="w-full text-left flex items-center gap-[14px] px-[16px] py-[14px] disabled:opacity-45 active:bg-white/[0.025] transition-colors"
      >
        <span className="shrink-0">
          {done ? (
            <CheckCircle2 className="h-[18px] w-[18px] text-white/55" strokeWidth={1.8} />
          ) : locked ? (
            <Lock className="h-[16px] w-[16px] text-white/30" strokeWidth={1.6} />
          ) : (
            <Circle className="h-[18px] w-[18px] text-white" strokeWidth={1.6} />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className={`font-['Geist'] text-[14.5px] truncate ${done ? "text-white/45" : "text-white"}`}>{l.title}</div>
          <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">{l.minutes} min</div>
        </div>
      </button>
      {!last && <div className="h-px bg-white/[0.05] ml-[48px]" />}
    </>
  );
}

/* ============ CENTRO INTELIGENTE DE APRENDIZAJE ============ */
type LearnLevel = "Básico" | "Intermedio" | "Avanzado";
type LearnMinutes = 30 | 45 | 60;

type LearningPath = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  level: LearnLevel;
  totalMinutes: number;
  topics: string[];
  gradient: string;
  /** Estructura extendida a 30 lecciones (checkpoints, recalls, final). Opcional. */
  lessons?: LessonNodeT[];
};

const LEARNING_PATHS: LearningPath[] = [
  { id: "ventas", emoji: "📈", name: "Cómo aumentar las ventas", description: "Estrategias probadas para vender más sin gastar más.", level: "Básico", totalMinutes: 300, gradient: "linear-gradient(135deg,#1f2937,#0f766e)", topics: expandedTopicTitles("ventas"), lessons: EXPANDED_LESSONS.ventas },
  { id: "finanzas", emoji: "💰", name: "Finanzas para pequeños negocios", description: "Domina el flujo de caja, márgenes y decisiones de dinero.", level: "Básico", totalMinutes: 300, gradient: "linear-gradient(135deg,#0f172a,#2563eb)", topics: expandedTopicTitles("finanzas"), lessons: EXPANDED_LESSONS.finanzas },
  { id: "clientes", emoji: "🤝", name: "Atención al Cliente", description: "Convierte compradores ocasionales en fans del negocio.", level: "Básico", totalMinutes: 150, gradient: "linear-gradient(135deg,#7f1d1d,#f97316)", topics: ["Experiencia del cliente", "Manejo de quejas y reclamos", "Programas de fidelización", "Comunicación asertiva", "Post-venta que retiene"] },
  { id: "productividad", emoji: "🧠", name: "Productividad", description: "Menos tiempo perdido, más avances reales cada día.", level: "Básico", totalMinutes: 150, gradient: "linear-gradient(135deg,#111827,#f59e0b)", topics: ["Regla del 80/20 aplicada al negocio", "Bloques de tiempo profundo", "Gestión de energía, no solo tiempo", "Rutinas de dueños de negocio", "Delegar y automatizar"] },
  { id: "organizacion", emoji: "🗂️", name: "Organización y Procesos", description: "Ordena tu negocio con procesos simples que no dependen de ti.", level: "Básico", totalMinutes: 150, gradient: "linear-gradient(135deg,#1e293b,#64748b)", topics: ["Procesos que no dependen del dueño", "Checklists para reducir errores", "Orden del local y del almacén", "Documentar lo que ya funciona", "Delegar tareas repetitivas"] },
  { id: "formalizacion", emoji: "📋", name: "Formalización y Trámites", description: "RUC, régimen tributario y trámites básicos sin dolores de cabeza.", level: "Avanzado", totalMinutes: 150, gradient: "linear-gradient(135deg,#052e2b,#0891b2)", topics: ["Cómo sacar tu RUC y elegir régimen", "SUNAT: obligaciones básicas del pequeño negocio", "Registro de marca y Sunarp", "Licencias municipales básicas", "Errores comunes al formalizarse"] },
  { id: "marketing", emoji: "📢", name: "Marketing Digital", description: "Redes sociales, WhatsApp Business y publicidad rentable.", level: "Intermedio", totalMinutes: 240, gradient: "linear-gradient(135deg,#3b0764,#9333ea)", topics: ["Marketing en redes sociales", "WhatsApp Business avanzado", "Publicidad pagada rentable", "Contenido que vende", "SEO local para pequeños negocios"] },
  { id: "inventario", emoji: "📦", name: "Gestión de Inventario", description: "Evita quiebres de stock y capital dormido en almacén.", level: "Intermedio", totalMinutes: 180, gradient: "linear-gradient(135deg,#0c4a6e,#38bdf8)", topics: ["Rotación de inventario", "Método ABC de productos", "Reabastecimiento óptimo", "Control de mermas y robos", "Proveedores estratégicos"] },
  { id: "administracion", emoji: "📊", name: "Administración", description: "Los procesos que sostienen a un negocio que crece.", level: "Intermedio", totalMinutes: 210, gradient: "linear-gradient(135deg,#1e293b,#0d9488)", topics: ["Indicadores clave (KPIs)", "Toma de decisiones con datos", "Planeación semanal y mensual", "Procesos y manuales operativos", "Gestión de proveedores"] },
  { id: "negociacion", emoji: "🤝", name: "Negociación con Proveedores y Clientes", description: "Negocia mejores condiciones sin dañar la relación.", level: "Intermedio", totalMinutes: 180, gradient: "linear-gradient(135deg,#422006,#ca8a04)", topics: ["Principios de negociación efectiva", "Cómo negociar precios con proveedores", "Manejo de objeciones en la venta", "Cuándo ceder y cuándo sostener postura", "Cerrar acuerdos que se cumplen"] },
  { id: "liderazgo", emoji: "👥", name: "Liderazgo", description: "Guía tu equipo con claridad, cercanía y resultados.", level: "Avanzado", totalMinutes: 240, gradient: "linear-gradient(135deg,#4c1d95,#db2777)", topics: ["Liderazgo situacional", "Delegación efectiva", "Feedback que construye", "Motivación intrínseca del equipo", "Cultura de servicio"] },
  { id: "rrhh", emoji: "🧑‍🤝‍🧑", name: "Recursos Humanos y Equipo", description: "Contrata, integra y retén al equipo que hace crecer tu negocio.", level: "Intermedio", totalMinutes: 210, gradient: "linear-gradient(135deg,#1e1b4b,#6366f1)", topics: ["Cómo contratar a tu primer colaborador", "Contratos y planillas básicas", "Onboarding: primeros 30 días", "Evaluación de desempeño simple", "Retener al buen personal"] },
  { id: "ia", emoji: "🤖", name: "IA aplicada a negocios", description: "Casos reales de IA que ahorran horas y aumentan ingresos.", level: "Avanzado", totalMinutes: 240, gradient: "linear-gradient(135deg,#000000,#7c3aed)", topics: ["IA para atención al cliente 24/7", "IA para marketing y contenido", "IA para análisis de ventas", "IA para inventario predictivo", "Automatización de tareas repetitivas"] },
  { id: "expansion", emoji: "🚀", name: "Expansión y Crecimiento", description: "Escala tu negocio a nuevas sucursales o mercados con orden.", level: "Avanzado", totalMinutes: 240, gradient: "linear-gradient(135deg,#052e16,#16a34a)", topics: ["Cuándo tu negocio está listo para escalar", "Franquicias vs. sucursales propias", "Sistematizar antes de expandir", "Financiamiento para crecer", "Errores comunes al expandirse rápido"] },
  { id: "inversion", emoji: "💹", name: "Finanzas Avanzadas e Inversión", description: "Reinvierte con criterio y entiende cómo acceder a capital.", level: "Avanzado", totalMinutes: 240, gradient: "linear-gradient(135deg,#0c0a09,#dc2626)", topics: ["Cuándo y cómo reinvertir utilidades", "Acceso a crédito para negocios", "Fundamentos para atraer inversionistas", "Evaluar el retorno de una inversión", "Riesgos financieros que evitar"] },
];

/** Plan mínimo requerido para acceder a rutas de un nivel. */
type RequiredPlan = "gratis" | "pro" | "avanzado";
function minPlanForLevel(level: LearnLevel): RequiredPlan {
  if (level === "Básico") return "gratis";
  if (level === "Intermedio") return "pro";
  return "avanzado";
}
function planRank(p: PlanId): number {
  if (p === "gratis") return 0;
  if (p === "pro") return 1;
  return 2; // avanzado y trial (trial = preview de Avanzado)
}
function planMeetsRequirement(plan: PlanId, required: RequiredPlan): boolean {
  const req = required === "gratis" ? 0 : required === "pro" ? 1 : 2;
  return planRank(plan) >= req;
}
function planLabel(required: RequiredPlan): string {
  if (required === "gratis") return "Incluido en tu plan";
  if (required === "pro") return "Plan Pro";
  return "Plan Avanzado";
}

const LEARN_STORAGE_KEY = "trax.learn.v2";

type StoredSession = {
  id: string;
  createdAt: string;
  pathId?: string;
  topic: string;
  level: LearnLevel;
  minutes: LearnMinutes;
  session: LearnSession;
  quizScore?: number;
  quizTotal?: number;
  completed?: boolean;
  /** Metadata de la lección de origen (para video, checkpoint, final). */
  lessonKind?: LessonKind;
  lessonTier?: LessonTier;
  video?: LessonVideo;
};

type FavoriteRef = { type: "book" | "case" | "news" | "trend"; sessionId: string; index: number };

type LearnState = {
  sessions: StoredSession[];
  favorites: FavoriteRef[];
  pathProgress: Record<string, string[]>; // pathId -> completed topics
  startedPaths?: string[]; // paths where the first lesson has been opened
};

const emptyLearnState: LearnState = { sessions: [], favorites: [], pathProgress: {}, startedPaths: [] };

function useLearnStore() {
  const [state, setState] = useState<LearnState>(emptyLearnState);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(LEARN_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...emptyLearnState, ...parsed });
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(state));
    } catch { /* noop */ }
  }, [state]);

  const addSession = (s: StoredSession) => setState((prev) => ({ ...prev, sessions: [s, ...prev.sessions] }));
  const updateSession = (id: string, patch: Partial<StoredSession>) =>
    setState((prev) => ({ ...prev, sessions: prev.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeSession = (id: string) =>
    setState((prev) => ({ ...prev, sessions: prev.sessions.filter((x) => x.id !== id), favorites: prev.favorites.filter((f) => f.sessionId !== id) }));

  const toggleFavorite = (fav: FavoriteRef) =>
    setState((prev) => {
      const exists = prev.favorites.some((f) => f.type === fav.type && f.sessionId === fav.sessionId && f.index === fav.index);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((f) => !(f.type === fav.type && f.sessionId === fav.sessionId && f.index === fav.index))
          : [fav, ...prev.favorites],
      };
    });

  const isFavorite = (fav: FavoriteRef) =>
    state.favorites.some((f) => f.type === fav.type && f.sessionId === fav.sessionId && f.index === fav.index);

  const markPathTopic = (pathId: string, topic: string) =>
    setState((prev) => {
      const done = new Set(prev.pathProgress[pathId] ?? []);
      done.add(topic);
      return { ...prev, pathProgress: { ...prev.pathProgress, [pathId]: [...done] } };
    });

  const markPathStarted = (pathId: string) =>
    setState((prev) => {
      const started = new Set(prev.startedPaths ?? []);
      if (started.has(pathId)) return prev;
      started.add(pathId);
      return { ...prev, startedPaths: [...started] };
    });

  return { state, addSession, updateSession, removeSession, toggleFavorite, isFavorite, markPathTopic, markPathStarted };
}

/* -------- helpers -------- */
function LearnTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="h-[22px] px-[9px] rounded-full flex items-center font-['Geist'] text-[10.5px] font-medium text-white/80" style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.14)" }}>
      {children}
    </span>
  );
}

function LearnCoverTag({ children }: { children: React.ReactNode }) {
  return <LearnTag>{children}</LearnTag>;
}

function LibraryTagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="h-[22px] px-[9px] rounded-full flex items-center font-['Geist'] text-[10.5px] text-white/70" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
      {children}
    </span>
  );
}

function SessionCoverBg({ gradient, children }: { gradient: string; children?: React.ReactNode }) {
  return (
    <div className="relative h-[110px]" style={{ background: gradient }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />
      {children}
    </div>
  );
}

/** Anillo circular de progreso con porcentaje al centro. */
function ProgressRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.45)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.95)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-['Geist'] text-[10.5px] font-semibold text-white tabular-nums">
        {clamped}%
      </div>
    </div>
  );
}

/* -------- Session Setup Sheet -------- */
function SessionSetupSheet({
  open, path, initialTopic, onClose, onGenerate, loading, error,
}: {
  open: boolean;
  path?: LearningPath;
  initialTopic?: string;
  onClose: () => void;
  onGenerate: (topic: string, level: LearnLevel, minutes: LearnMinutes) => void;
  loading: boolean;
  error?: string;
}) {
  const [topic, setTopic] = useState(initialTopic ?? path?.topics[0] ?? "");
  const [level, setLevel] = useState<LearnLevel>(path?.level ?? "Básico");
  const [minutes, setMinutes] = useState<LearnMinutes>(45);

  useEffect(() => {
    setTopic(initialTopic ?? path?.topics[0] ?? "");
    setLevel(path?.level ?? "Básico");
    setMinutes(45);
  }, [initialTopic, path, open]);

  return (
    <Sheet
      open={open}
      onClose={loading ? () => {} : onClose}
      title={path ? `Sesión · ${path.name}` : "Pregúntale a la IA"}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={loading}>Cancelar</GhostButton>
          <PrimaryButton onClick={() => onGenerate(topic.trim(), level, minutes)} disabled={loading || !topic.trim()}>
            {loading ? "Generando…" : "Generar sesión"}
          </PrimaryButton>
        </>
      }
    >
      {path && (
        <Field label="Tema del path">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full h-[38px] px-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {path.topics.map((t) => (
              <option key={t} value={t} className="bg-black">{t}</option>
            ))}
          </select>
        </Field>
      )}
      {!path && (
        <Field label="Pregunta o tema">
          <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej. Cómo negociar el precio de alquiler de mi local" />
        </Field>
      )}
      {!path && (
        <>
          <Field label="Nivel">
            <div className="flex gap-[6px]">
              {(["Básico", "Intermedio", "Avanzado"] as LearnLevel[]).map((l) => (
                <button key={l} type="button" onClick={() => setLevel(l)}
                  className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-white"
                  style={{
                    background: level === l ? "rgba(255,255,255,0.10)" : "transparent",
                    border: `1px solid ${level === l ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >{l}</button>
              ))}
            </div>
          </Field>
          <Field label="Duración">
            <div className="flex gap-[6px]">
              {([30, 45, 60] as LearnMinutes[]).map((m) => (
                <button key={m} type="button" onClick={() => setMinutes(m)}
                  className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium text-white tabular-nums"
                  style={{
                    background: minutes === m ? "rgba(255,255,255,0.10)" : "transparent",
                    border: `1px solid ${minutes === m ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >{m} min</button>
              ))}
            </div>
          </Field>
        </>
      )}
      {path && (
        <div className="rounded-[12px] px-[12px] py-[10px] flex items-center gap-[8px]" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.20)" }}>
          <Sparkles className="h-[13px] w-[13px] text-[#93C5FD]" strokeWidth={1.8} />
          <span className="font-['Geist'] text-[12px] text-white/80">Personalizado para ti según tu diagnóstico</span>
        </div>
      )}
      <div className="font-['Geist'] text-[12px] text-white/45 leading-[1.5]">
        {path
          ? "La IA investigará libros clásicos, casos reales, noticias recientes y tendencias para armarte una sesión clara y accionable."
          : "Pregúntale cualquier duda de tu negocio y la IA investigará y armará una sesión completa para ti."}
      </div>
      {loading && (
        <div className="flex items-center gap-[10px] rounded-[12px] p-[12px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Loader2 className="h-[16px] w-[16px] text-white/70 animate-spin" strokeWidth={2} />
          <span className="font-['Geist'] text-[12.5px] text-white/70">Investigando fuentes y armando tu sesión…</span>
        </div>
      )}
      {error && !loading && (
        <div className="rounded-[12px] p-[12px] font-['Geist'] text-[12.5px] text-[#F87171]" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)" }}>
          {error}
        </div>
      )}
    </Sheet>
  );
}

/* -------- Session Runner (micro-lecciones tipo Duolingo) -------- */
function SessionRunner({
  stored, onClose, onComplete, onRemove,
}: {
  stored: StoredSession;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
  onRemove: () => void;
}) {
  const { session } = stored;
  const steps = session.steps ?? [];
  const quiz = session.quiz ?? [];
  const totalSteps = steps.length;
  const totalQuestions = quiz.length;
  // stages: step 0..N-1 -> "quiz" -> "score"
  const [stepIdx, setStepIdx] = useState(0);
  const [stage, setStage] = useState<"steps" | "quiz" | "score">(totalSteps > 0 ? "steps" : totalQuestions > 0 ? "quiz" : "score");
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const savedRef = useRef(false);

  const path = LEARNING_PATHS.find((p) => p.id === stored.pathId);
  const [c1, c2] = extractGradientColors(path?.gradient ?? "linear-gradient(135deg,#0f172a,#3b0764)");

  const progress =
    stage === "score"
      ? 100
      : stage === "quiz"
      ? Math.round(((totalSteps + Math.min(quizIdx + 1, totalQuestions)) / (totalSteps + Math.max(totalQuestions, 1))) * 100)
      : Math.round(((stepIdx + 1) / Math.max(totalSteps + (totalQuestions > 0 ? 1 : 0), 1)) * 100);

  const goNextFromStep = () => {
    if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1);
    else setStage(totalQuestions > 0 ? "quiz" : "score");
  };
  const goPrevFromStep = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const chooseAnswer = (qi: number, oi: number) => {
    if (revealed[qi]) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
    setRevealed((r) => ({ ...r, [qi]: true }));
  };
  const goNextFromQuiz = () => {
    if (quizIdx < totalQuestions - 1) setQuizIdx((i) => i + 1);
    else setStage("score");
  };

  const score = quiz.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0);

  useEffect(() => {
    if (stage === "score" && !savedRef.current) {
      savedRef.current = true;
      onComplete(score, totalQuestions);
    }
  }, [stage, score, totalQuestions, onComplete]);

  const scoreMessage =
    totalQuestions === 0
      ? { title: "¡Sesión terminada!", body: "Aplica el aprendizaje en tu negocio esta semana." }
      : score === totalQuestions
      ? { title: "¡Perfecto!", body: "Dominas el tema. Pon en práctica lo aprendido en tu negocio." }
      : score >= Math.ceil(totalQuestions * 0.7)
      ? { title: "¡Muy bien!", body: "Aprendiste lo esencial. Revisa las respuestas incorrectas antes de aplicar." }
      : score >= Math.ceil(totalQuestions * 0.4)
      ? { title: "Vas bien", body: "Repasa los pasos y vuelve a intentar el quiz para reforzar." }
      : { title: "Sigue practicando", body: "Repasa los pasos con calma. Es un tema que rinde mucho al dominarlo." };

  return (
    <SubScreen>
      <SubHeader
        eyebrow={path ? path.name : "Sesión de IA"}
        title={session.title || stored.topic}
        onBack={onClose}
        action={
          <button type="button" onClick={onRemove} className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.06]" aria-label="Eliminar sesión">
            <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
          </button>
        }
      />

      {/* Barra de progreso arriba */}
      <div className="px-[20px] pt-[4px] pb-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <div className="font-['Geist'] text-[11px] text-white/45 tabular-nums w-[46px] text-right">
            {stage === "score" ? "Fin" : stage === "quiz" ? `Quiz ${quizIdx + 1}/${totalQuestions}` : `${stepIdx + 1}/${totalSteps}`}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 px-[20px] overflow-y-auto pb-[12px]">
          <AnimatePresence mode="wait" initial={false}>
            {stage === "steps" && steps[stepIdx] && (
              <motion.div
                key={`step-${stepIdx}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-[16px]"
              >
                <div className="rounded-[20px] p-[18px] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}12)`, border: `1px solid ${c2}33` }}>
                  <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px]" style={{ color: c2 }}>
                    Paso {stepIdx + 1} de {totalSteps}
                  </div>
                  <div className="mt-[6px] font-['Bai_Jamjuree'] text-[22px] font-semibold text-white leading-[1.2] tracking-[-0.3px]">
                    {steps[stepIdx].title}
                  </div>
                </div>

                <div className="rounded-[16px] p-[16px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-[8px] mb-[8px]">
                    <Lightbulb className="h-[14px] w-[14px]" style={{ color: c2 }} strokeWidth={1.8} />
                    <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/50">Idea</span>
                  </div>
                  <p className="font-['Geist'] text-[15px] text-white leading-[1.55]">{steps[stepIdx].idea}</p>
                </div>

                {steps[stepIdx].example && (
                  <div className="rounded-[16px] p-[16px]" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)" }}>
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <Building2 className="h-[14px] w-[14px] text-[#4ADE80]" strokeWidth={1.8} />
                      <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-[#4ADE80]/80">Ejemplo real</span>
                    </div>
                    <p className="font-['Geist'] text-[14px] text-white/90 leading-[1.55]">{steps[stepIdx].example}</p>
                  </div>
                )}

                {steps[stepIdx].reflection && (
                  <div className="rounded-[16px] p-[16px]" style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.22)" }}>
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <Sparkles className="h-[14px] w-[14px] text-[#FACC15]" strokeWidth={1.8} />
                      <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-[#FACC15]/85">Reflexiona</span>
                    </div>
                    <p className="font-['Geist'] text-[14px] text-white/90 leading-[1.55] italic">{steps[stepIdx].reflection}</p>
                  </div>
                )}
              </motion.div>
            )}

            {stage === "quiz" && quiz[quizIdx] && (
              <motion.div
                key={`q-${quizIdx}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-[14px]"
              >
                <div className="rounded-[20px] p-[18px]" style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}12)`, border: `1px solid ${c2}33` }}>
                  <div className="flex items-center gap-[8px]">
                    <GraduationCap className="h-[14px] w-[14px]" style={{ color: c2 }} strokeWidth={1.8} />
                    <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px]" style={{ color: c2 }}>
                      Pregunta {quizIdx + 1} de {totalQuestions}
                    </span>
                  </div>
                  <div className="mt-[8px] font-['Bai_Jamjuree'] text-[19px] font-semibold text-white leading-[1.3]">
                    {quiz[quizIdx].question}
                  </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                  {quiz[quizIdx].options.map((opt, oi) => {
                    const chosen = answers[quizIdx];
                    const isRevealed = revealed[quizIdx];
                    const isCorrect = oi === quiz[quizIdx].correctIndex;
                    const isChosen = chosen === oi;
                    let bg = "rgba(255,255,255,0.04)";
                    let border = "rgba(255,255,255,0.08)";
                    let color = "white";
                    if (isRevealed) {
                      if (isCorrect) { bg = "rgba(74,222,128,0.14)"; border = "rgba(74,222,128,0.45)"; color = "#4ADE80"; }
                      else if (isChosen) { bg = "rgba(248,113,113,0.14)"; border = "rgba(248,113,113,0.45)"; color = "#F87171"; }
                    } else if (isChosen) {
                      bg = "rgba(255,255,255,0.10)"; border = "rgba(255,255,255,0.22)";
                    }
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={isRevealed}
                        onClick={() => chooseAnswer(quizIdx, oi)}
                        className="text-left rounded-[14px] px-[14px] py-[12px] font-['Geist'] text-[14px] transition-colors"
                        style={{ background: bg, border: `1px solid ${border}`, color }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {revealed[quizIdx] && (
                  <div className="rounded-[14px] p-[14px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/40 mb-[4px]">Explicación</div>
                    <p className="font-['Geist'] text-[13px] text-white/80 leading-[1.55]">{quiz[quizIdx].explanation}</p>
                  </div>
                )}
              </motion.div>
            )}

            {stage === "score" && (
              <motion.div
                key="score"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center text-center gap-[16px] pt-[16px]"
              >
                <div
                  className="h-[110px] w-[110px] rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    boxShadow: `0 0 0 6px ${c2}22, 0 12px 32px -8px ${c2}88`,
                  }}
                >
                  <GraduationCap className="h-[52px] w-[52px] text-white" strokeWidth={1.6} />
                </div>
                <div className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.3px]">
                  {scoreMessage.title}
                </div>
                {totalQuestions > 0 && (
                  <div className="rounded-[16px] px-[22px] py-[12px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">Puntuación</div>
                    <div className="mt-[2px] font-['Bai_Jamjuree'] text-[32px] font-semibold text-white tabular-nums">{score}<span className="text-white/40 text-[20px]"> / {totalQuestions}</span></div>
                  </div>
                )}
                <p className="font-['Geist'] text-[13.5px] text-white/65 leading-[1.55] max-w-[300px]">{scoreMessage.body}</p>
                {session.summary && (
                  <div className="mt-[6px] rounded-[14px] p-[14px] text-left w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/40 mb-[4px]">Idea clave</div>
                    <p className="font-['Geist'] text-[13.5px] text-white/80 leading-[1.55]">{session.summary}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer con botones */}
        <div className="px-[20px] py-[12px] flex items-center gap-[10px]" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 30%)" }}>
          {stage === "steps" && (
            <>
              <button
                type="button"
                onClick={goPrevFromStep}
                disabled={stepIdx === 0}
                className="h-[46px] px-[16px] rounded-full font-['Geist'] text-[13px] font-medium text-white disabled:opacity-30"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={goNextFromStep}
                className="flex-1 h-[46px] rounded-full font-['Bai_Jamjuree'] text-[14.5px] font-semibold text-white flex items-center justify-center gap-[8px] active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 8px 24px -10px ${c2}` }}
              >
                {stepIdx === totalSteps - 1 ? (totalQuestions > 0 ? "Ir al quiz" : "Terminar") : "Siguiente"}
                <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2} />
              </button>
            </>
          )}
          {stage === "quiz" && (
            <button
              type="button"
              onClick={goNextFromQuiz}
              disabled={!revealed[quizIdx]}
              className="flex-1 h-[46px] rounded-full font-['Bai_Jamjuree'] text-[14.5px] font-semibold text-white flex items-center justify-center gap-[8px] disabled:opacity-40 active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 8px 24px -10px ${c2}` }}
            >
              {quizIdx === totalQuestions - 1 ? "Ver resultado" : "Siguiente pregunta"}
              <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2} />
            </button>
          )}
          {stage === "score" && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[46px] rounded-full font-['Bai_Jamjuree'] text-[14.5px] font-semibold text-black flex items-center justify-center gap-[8px] active:scale-[0.98] transition-transform bg-white"
            >
              Volver a Aprender
            </button>
          )}
        </div>
      </div>
    </SubScreen>
  );
}

/* -------- Path Detail -------- */
function extractGradientColors(g: string): [string, string] {
  const hex = g.match(/#[0-9a-fA-F]{3,8}/g);
  if (hex && hex.length >= 2) return [hex[0], hex[1]];
  return ["#334155", "#94a3b8"];
}

function PathNodesTrail({
  path,
  completedTopics,
  onStartTopic,
  hasStarted,
}: {
  path: LearningPath;
  completedTopics: string[];
  onStartTopic: (topic: string) => void;
  hasStarted: boolean;
}) {
  const done = new Set(completedTopics);
  const [c1, c2] = extractGradientColors(path.gradient);
  const currentIdx = path.topics.findIndex((t) => !done.has(t));
  const allDone = currentIdx === -1;
  const total = path.topics.length;
  // Per-category zigzag pattern + graduation icon
  const PATTERNS: Record<string, number[]> = {
    ventas: [22, 50, 78, 50],
    finanzas: [30, 70, 30, 70],
    clientes: [50, 20, 50, 80],
    productividad: [26, 74, 40, 60],
    organizacion: [50, 28, 50, 72],
    formalizacion: [24, 50, 76, 50],
    marketing: [20, 80, 32, 68],
    inventario: [50, 76, 50, 24],
    administracion: [30, 60, 40, 70],
    negociacion: [28, 72, 28, 72],
    liderazgo: [50, 22, 78, 50],
    ia: [22, 78, 22, 78],
    expansion: [26, 46, 66, 86],
    inversion: [50, 26, 74, 50],
    rrhh: [30, 66, 30, 66],
  };
  const ICONS: Record<string, typeof GraduationCap> = {
    ventas: Trophy,
    finanzas: Landmark,
    clientes: Handshake,
    productividad: Rocket,
    organizacion: ScrollText,
    formalizacion: Award,
    marketing: Megaphone,
    inventario: Package,
    administracion: BarChart3,
    negociacion: HandCoins,
    liderazgo: Crown,
    ia: Cpu,
    expansion: Rocket,
    inversion: Gem,
    rrhh: Users,
  };
  const phases = PATTERNS[path.id] ?? [22, 50, 78, 50];
  const FinalIcon = ICONS[path.id] ?? GraduationCap;
  const rowH = 118;
  const topPad = 44;
  // Expanded paths ya incluyen la lección "final" (pos 30). Los paths clásicos
  // agregan un nodo sintético de graduación al final.
  const items = path.lessons ? [...path.topics] : [...path.topics, "__final__"];
  // Mapa rápido título → LessonNode para expanded paths.
  const lessonByTitle = new Map<string, LessonNodeT>((path.lessons ?? []).map((l) => [l.title, l]));
  const positions = items.map((_, i) => ({
    x: phases[i % phases.length],
    y: topPad + i * rowH,
  }));
  const height = topPad + (items.length - 1) * rowH + 72;
  const width = 320;

  let d = "";
  positions.forEach((p, i) => {
    const x = (p.x / 100) * width;
    const y = p.y;
    if (i === 0) {
      d += `M ${x} ${y}`;
    } else {
      const prev = positions[i - 1];
      const px = (prev.x / 100) * width;
      const py = prev.y;
      const midY = (py + y) / 2;
      d += ` C ${px} ${midY}, ${x} ${midY}, ${x} ${y}`;
    }
  });

  // Reached fraction along the path (based on completion)
  const reachedIdx = allDone ? items.length - 1 : currentIdx; // index of current node
  const reachedFrac = items.length > 1 ? reachedIdx / (items.length - 1) : 0;

  const gradId = `path-grad-${path.id}`;

  // Duolingo-style: on first entry, show ONLY the first lesson centered with "Comenzar"
  if (!hasStarted && !allDone) {
    const firstTopic = path.topics[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-[18px] py-[36px]"
      >
        <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">Lección 1 de {total}</div>
        <button
          type="button"
          onClick={() => onStartTopic(firstTopic)}
          aria-label={`Comenzar: ${firstTopic}`}
          className="relative rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            width: 108,
            height: 108,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            boxShadow: `0 0 0 3px ${c2}44, 0 18px 40px -8px ${c2}`,
          }}
        >
          <Play className="text-white" style={{ width: 40, height: 40, marginLeft: 3 }} strokeWidth={2} fill="white" />
        </button>
        <div className="text-center max-w-[280px]">
          <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white leading-[1.25] tracking-[-0.2px]">
            {firstTopic}
          </div>
          <div className="mt-[6px] font-['Geist'] text-[12px] text-white/45 leading-[1.4]">
            Completa esta lección para desbloquear el resto del camino.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onStartTopic(firstTopic)}
          className="h-[46px] px-[26px] rounded-full font-['Bai_Jamjuree'] text-[14.5px] font-semibold text-black bg-white active:scale-95 transition-transform flex items-center gap-[8px]"
        >
          Comenzar
          <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {/* Base track (dashed, dim) */}
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={2}
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
        {/* Progress overlay (solid, gradient) — clipped by dasharray trick */}
        <path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${reachedFrac} 1`}
          style={{ transition: "stroke-dasharray 400ms ease" }}
        />
      </svg>

      {/* Tier dividers (solo en paths expandidos: entre 10-11 y 20-21) */}
      {path.lessons && [10, 20].map((cutAfter) => {
        if (cutAfter >= items.length) return null;
        const yTop = positions[cutAfter - 1]?.y ?? 0;
        const yBot = positions[cutAfter]?.y ?? 0;
        const yMid = (yTop + yBot) / 2;
        const tierLabel = cutAfter === 10 ? TIER_LABEL[2] : TIER_LABEL[3];
        return (
          <div
            key={`divider-${cutAfter}`}
            className="absolute left-0 right-0 flex items-center gap-[10px] px-[14px] pointer-events-none"
            style={{ top: yMid - 12, transform: "translateY(-50%)" }}
          >
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c2}55, transparent)` }} />
            <div
              className="font-['Geist'] text-[9.5px] uppercase tracking-[1.6px] px-[8px] py-[3px] rounded-full"
              style={{ background: "rgba(0,0,0,0.7)", border: `1px solid ${c2}55`, color: c2 }}
            >
              {tierLabel}
            </div>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c2}55, transparent)` }} />
          </div>
        );
      })}

      {items.map((t, i) => {
        const pos = positions[i];
        const isFinalSynth = t === "__final__"; // solo paths clásicos
        const lesson = lessonByTitle.get(t);
        const kind: LessonKind = lesson?.kind ?? "lesson";
        const isFinalLesson = kind === "final";
        const isCheckpoint = kind === "checkpoint";
        const isRecall = kind === "recall";

        const isDone = !isFinalSynth && done.has(t);
        const isCurrent = !isFinalSynth && i === currentIdx;
        const isLocked = !isFinalSynth && !isDone && !isCurrent;
        const isFinalSynthActive = isFinalSynth && allDone;

        const highlighted = isCurrent || isFinalSynthActive || (isFinalLesson && (isCurrent || isDone));
        const size = highlighted ? 72 : isCheckpoint || isRecall ? 64 : 60;
        const clickable = isDone || isCurrent || isFinalSynthActive;

        // Fondo por kind
        const accentByKind =
          isFinalLesson || isFinalSynth
            ? `linear-gradient(135deg, ${c1}, ${c2})`
            : isCheckpoint
            ? "linear-gradient(135deg,#7c2d12,#f97316)"
            : isRecall
            ? "linear-gradient(135deg,#164e63,#22d3ee)"
            : `linear-gradient(135deg, ${c1}, ${c2})`;

        const bg = isDone
          ? accentByKind
          : isCurrent
          ? "rgba(0,0,0,0.55)"
          : isFinalSynthActive
          ? accentByKind
          : "rgba(255,255,255,0.05)";

        const ringColor = isCheckpoint ? "#f97316" : isRecall ? "#22d3ee" : c2;
        const ring = isCurrent
          ? `0 0 0 2px ${ringColor}, 0 0 24px -4px ${ringColor}`
          : isFinalSynth && !isFinalSynthActive
          ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
          : isFinalSynth
          ? `0 0 0 2px ${c2}, 0 0 28px -4px ${c2}`
          : isLocked
          ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "none";

        const label = isFinalSynth
          ? "Ruta completada"
          : isCurrent
          ? t
          : "";

        // Icono central según kind
        const InnerIcon = isFinalSynth
          ? FinalIcon
          : isFinalLesson
          ? Trophy
          : isCheckpoint
          ? ClipboardCheck
          : isRecall
          ? RotateCcw
          : Play;

        return (
          <div
            key={`${t}-${i}`}
            className="absolute flex flex-col items-center"
            style={{
              left: `${pos.x}%`,
              top: pos.y,
              transform: "translate(-50%, -50%)",
              width: 140,
            }}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => {
                if (isFinalSynthActive) return; // celebratory node classic, no session
                if (clickable && !isFinalSynth) onStartTopic(t);
              }}
              aria-label={isFinalSynth ? "Ruta completada" : t}
              className={`relative rounded-full flex items-center justify-center transition-transform ${
                clickable ? "active:scale-95" : "cursor-default"
              }`}
              style={{
                width: size,
                height: size,
                background: bg,
                boxShadow: ring,
                opacity: isLocked ? 0.55 : 1,
              }}
            >
              {isFinalSynth ? (
                <InnerIcon
                  className="text-white"
                  style={{ width: size * 0.42, height: size * 0.42, opacity: isFinalSynthActive ? 1 : 0.45 }}
                  strokeWidth={1.6}
                />
              ) : isDone ? (
                <Check className="text-white" style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={2.4} />
              ) : isCurrent ? (
                kind === "lesson" ? (
                  <Play
                    className="text-white"
                    style={{ width: size * 0.38, height: size * 0.38, marginLeft: 2 }}
                    strokeWidth={2}
                    fill="white"
                  />
                ) : (
                  <InnerIcon className="text-white" style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={1.9} />
                )
              ) : (
                <Lock
                  className="text-white/40"
                  style={{ width: size * 0.34, height: size * 0.34 }}
                  strokeWidth={1.8}
                />
              )}
              {/* Step number badge for non-final-synth nodes */}
              {!isFinalSynth && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-['Geist'] text-[10px] font-medium tabular-nums text-white/80"
                  style={{
                    width: 20,
                    height: 20,
                    background: "rgba(0,0,0,0.75)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {i + 1}
                </span>
              )}
              {/* Marker de video en la esquina inferior */}
              {lesson?.video && !isDone && (
                <span
                  className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    background: "#ef4444",
                    border: "2px solid rgba(0,0,0,0.85)",
                  }}
                  aria-label="Con video corto"
                >
                  <Youtube className="text-white" style={{ width: 10, height: 10 }} strokeWidth={2.4} />
                </span>
              )}
            </button>
            {label && (
              <div
                className={`mt-[8px] text-center font-['Geist'] leading-[1.2] ${
                  isFinalSynth ? "text-white/70 text-[11.5px]" : "text-white text-[12px]"
                }`}
                style={{ maxWidth: 140 }}
              >
                {label}
                {isCurrent && (
                  <div className="mt-[2px] font-['Geist'] text-[10.5px] uppercase tracking-[1.2px]" style={{ color: isCheckpoint ? "#fdba74" : isRecall ? "#67e8f9" : "rgba(255,255,255,0.45)" }}>
                    {isCheckpoint ? "Checkpoint" : isRecall ? "Repaso activo" : isFinalLesson ? "Examen final" : "Siguiente"}
                  </div>
                )}
              </div>
            )}
            {isFinalSynth && !isFinalSynthActive && (
              <div className="mt-[8px] text-center font-['Geist'] text-[11px] text-white/35 leading-[1.2]" style={{ maxWidth: 140 }}>
                Completa las {total} lecciones
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PathDetail({
  path, completedTopics, hasStarted, onBack, onStartTopic,
}: {
  path: LearningPath;
  completedTopics: string[];
  hasStarted: boolean;
  onBack: () => void;
  onStartTopic: (topic: string) => void;
}) {
  const done = new Set(completedTopics);
  const progress = path.topics.length > 0 ? Math.round((done.size / path.topics.length) * 100) : 0;
  return (
    <SubScreen>
      <LearnAuroraEdges />
      <div className="relative z-10">
      <SubHeader eyebrow="Ruta de aprendizaje" title={`${path.emoji} ${path.name}`} onBack={onBack} />
      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <div className="rounded-[18px] overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="h-[110px]" style={{ background: path.gradient }} />
          <div className="p-[16px]">
            <p className="font-['Geist'] text-[13px] text-white/70 leading-[1.55]">{path.description}</p>
            <div className="mt-[10px] flex items-center gap-[6px] flex-wrap">
              <span className="h-[22px] px-[9px] rounded-full flex items-center gap-[5px] font-['Geist'] text-[10.5px] font-medium text-white/85" style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.22)" }}>
                <Sparkles className="h-[10px] w-[10px] text-[#93C5FD]" strokeWidth={2} />
                Personalizado para ti
              </span>
            </div>
            <div className="mt-[12px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-[6px] font-['Geist'] text-[11.5px] text-white/45 tabular-nums">{done.size} de {path.topics.length} lecciones</div>
          </div>
        </div>

        <SectionLabel>Camino de lecciones</SectionLabel>
        <div className="shrink-0">
          <PathNodesTrail path={path} completedTopics={completedTopics} onStartTopic={onStartTopic} hasStarted={hasStarted} />
        </div>
      </ProductivityScroll>
      </div>
    </SubScreen>
  );
}

/* Aurora azul solo en bordes superior/inferior — centro negro */
function LearnAuroraEdges() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[220px] z-0"
        style={{ background: "radial-gradient(120% 100% at 50% 0%, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0.05) 42%, rgba(0,0,0,0) 80%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] z-0"
        style={{ background: "radial-gradient(120% 100% at 50% 100%, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0.04) 46%, rgba(0,0,0,0) 84%)" }}
      />
    </>
  );
}

/* -------- Diagnostic Test -------- */
type DiagnosticQ = { q: string; options: string[]; correct: number };
const DIAGNOSTIC_QUESTIONS: DiagnosticQ[] = [
  { q: "Si vendes S/ 100 y tu producto te costó S/ 60, ¿cuál es tu ganancia bruta?", options: ["S/ 40", "S/ 60", "S/ 100", "S/ 160"], correct: 0 },
  { q: "¿Qué significa 'margen de ganancia'?", options: ["El total vendido", "La diferencia entre precio y costo, sobre el precio", "El dinero en caja", "Los impuestos que pagas"], correct: 1 },
  { q: "¿Qué es el flujo de caja?", options: ["El total de deudas", "El dinero que entra y sale en un periodo", "Solo las ventas del día", "El inventario disponible"], correct: 1 },
  { q: "Si compras 10 productos a S/ 5 c/u, ¿cuál es tu inventario en valor?", options: ["S/ 15", "S/ 50", "S/ 5", "S/ 100"], correct: 1 },
  { q: "¿Qué es 'fiado' en un negocio?", options: ["Un descuento", "Una venta a crédito por cobrar", "Un impuesto", "Un tipo de producto"], correct: 1 },
  { q: "¿Cuál es la mejor forma de saber si ganas dinero?", options: ["Contar el efectivo en caja", "Restar gastos totales a ingresos totales", "Ver cuántos clientes vinieron", "Comparar con el vecino"], correct: 1 },
  { q: "¿Qué es el 'punto de equilibrio'?", options: ["Cuando cierras el día", "Cuando ingresos igualan a costos totales", "Cuando el stock se agota", "Cuando pagas impuestos"], correct: 1 },
  { q: "¿Por qué es importante separar dinero personal del negocio?", options: ["No importa", "Para saber la salud real del negocio", "Solo por impuestos", "Solo si tienes empleados"], correct: 1 },
  { q: "¿Qué es un cliente recurrente?", options: ["El que compra una sola vez", "El que regresa a comprar seguido", "El que pide fiado", "El que reclama"], correct: 1 },
  { q: "Si un producto rota rápido pero deja poca ganancia, ¿qué conviene?", options: ["Dejar de venderlo", "Analizar volumen vs margen antes de decidir", "Subirle mucho el precio", "Regalarlo"], correct: 1 },
];

function DiagnosticTestSheet({
  open, onClose, onFinish,
}: {
  open: boolean;
  onClose: () => void;
  onFinish: (result: { score: number; total: number; level: LearnLevel }) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  useEffect(() => { if (open) { setIdx(0); setAnswers([]); } }, [open]);

  const q = DIAGNOSTIC_QUESTIONS[idx];
  const total = DIAGNOSTIC_QUESTIONS.length;

  const answer = (i: number) => {
    const next = [...answers, i];
    setAnswers(next);
    if (idx + 1 >= total) {
      const score = next.reduce((acc, a, k) => acc + (a === DIAGNOSTIC_QUESTIONS[k].correct ? 1 : 0), 0);
      const level: LearnLevel = score <= 4 ? "Básico" : score <= 7 ? "Intermedio" : "Avanzado";
      onFinish({ score, total, level });
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Pregunta ${idx + 1} de ${total}`}>
      <div className="flex flex-col gap-[16px] py-[6px]">
        <div className="h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-white" style={{ width: `${((idx) / total) * 100}%` }} />
        </div>
        {q && (
          <>
            <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white leading-[1.35]">{q.q}</div>
            <div className="flex flex-col gap-[8px]">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => answer(i)}
                  className="text-left rounded-[14px] px-[14px] py-[12px] font-['Geist'] text-[13.5px] text-white/90 active:scale-[0.99] transition-transform"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}

/* -------- Main LearnView -------- */
type LearnTab = "rutas" | "historial";



function LearnView({ onBack }: { onBack: () => void }) {
  const store = useLearnStore();
  const generate = useServerFn(generateLearnSession);
  const { plan } = usePlan();
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<LearnTab>("rutas");
  const [pathOpen, setPathOpen] = useState<LearningPath | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupPath, setSetupPath] = useState<LearningPath | undefined>(undefined);
  const [setupTopic, setSetupTopic] = useState<string | undefined>(undefined);
  const [upgradePrompt, setUpgradePrompt] = useState<{ title: string; message: string; plan: "Pro" | "Avanzado" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [running, setRunning] = useState<StoredSession | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const prefs = (profile?.preferences ?? {}) as Record<string, unknown>;
  const hasCompletedDiagnostic = Boolean(prefs?.has_completed_diagnostic_test);

  const markDiagnosticDone = async (result?: Record<string, unknown>) => {
    if (!profile?.id) { setDiagnosticOpen(false); return; }
    const nextPrefs = { ...prefs, has_completed_diagnostic_test: true, ...(result ? { diagnostic_result: result } : {}) };
    try {
      await supabase.from("profiles").update({ preferences: nextPrefs as never }).eq("id", profile.id);
      await refreshProfile?.();
    } catch { /* noop */ }
    setDiagnosticOpen(false);
  };


  const openSetup = (path?: LearningPath, topic?: string) => {
    // Tema libre (sin path) es exclusivo del plan Avanzado.
    if (!path && plan !== "avanzado" && plan !== "trial") {
      setUpgradePrompt({
        title: "Pregúntale a la IA",
        message: "Las preguntas libres a la IA están disponibles en el plan Avanzado. Pregunta cualquier duda de tu negocio y la IA armará una sesión completa.",
        plan: "Avanzado",
      });
      return;
    }
    setSetupPath(path);
    setSetupTopic(topic);
    setError(undefined);
    setSetupOpen(true);
  };

  const tryOpenPath = (p: LearningPath) => {
    const required = minPlanForLevel(p.level);
    if (!planMeetsRequirement(plan, required)) {
      setUpgradePrompt({
        title: p.name,
        message: `Las rutas de nivel ${p.level} están disponibles en el plan ${required === "pro" ? "Pro" : "Avanzado"}. Sube de plan para desbloquear todo el catálogo.`,
        plan: required === "pro" ? "Pro" : "Avanzado",
      });
      return;
    }
    setPathOpen(p);
  };

  const doGenerate = async (topic: string, level: LearnLevel, minutes: LearnMinutes) => {
    setLoading(true);
    setError(undefined);
    try {
      const previousTopics = store.state.sessions.slice(0, 6).map((s) => s.topic);
      // Buscar el LessonNode correspondiente (paths expandidos: kind/tier/video)
      const lesson = setupPath?.lessons?.find((l) => l.title === topic);
      const topicIndex = setupPath ? setupPath.topics.indexOf(topic) : -1;
      const topicTotal = setupPath?.topics.length;
      const baselineLevel = (prefs?.diagnostic_result as { level?: LearnLevel } | undefined)?.level;

      // Para checkpoint/recall/final: pasar el rango de temas cubiertos
      let tierRange: [number, number] | undefined;
      let coveredTopics: string[] | undefined;
      if (lesson && lesson.kind !== "lesson" && setupPath?.lessons) {
        const range: [number, number] =
          lesson.kind === "final"
            ? [1, 29]
            : lesson.kind === "checkpoint" && lesson.id === "l10"
            ? [1, 9]
            : lesson.kind === "checkpoint" && lesson.id === "l20"
            ? [11, 19]
            : lesson.kind === "recall" && lesson.id === "l15"
            ? [1, 14]
            : lesson.kind === "recall" && lesson.id === "l25"
            ? [16, 24]
            : [1, Math.max(1, topicIndex)];
        tierRange = range;
        coveredTopics = setupPath.lessons
          .slice(range[0] - 1, range[1])
          .filter((l) => l.kind === "lesson")
          .map((l) => l.title);
      }

      const session = await generate({ data: {
        topic, level, minutes, previousTopics, pathId: setupPath?.id,
        ...(topicIndex >= 0 ? { topicIndex, topicTotal } : {}),
        ...(lesson ? { lessonKind: lesson.kind } : {}),
        ...(tierRange ? { tierRange } : {}),
        ...(coveredTopics && coveredTopics.length > 0 ? { coveredTopics } : {}),
        ...(baselineLevel ? { baselineLevel } : {}),
        ...(lesson?.video ? { videoRef: lesson.video } : {}),
      } });
      const stored: StoredSession = {
        id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        pathId: setupPath?.id,
        topic,
        level,
        minutes,
        session,
        lessonKind: lesson?.kind,
        lessonTier: lesson?.tier,
        video: lesson?.video,
      };
      store.addSession(stored);
      setSetupOpen(false);
      setRunning(stored);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar la sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const completeRunning = (score: number, total: number) => {
    if (!running) return;
    store.updateSession(running.id, { quizScore: score, quizTotal: total, completed: true });
    if (running.pathId) store.markPathTopic(running.pathId, running.topic);
    setRunning((r) => (r ? { ...r, quizScore: score, quizTotal: total, completed: true } : r));
  };

  const removeRunning = () => {
    if (!running) return;
    store.removeSession(running.id);
    setRunning(null);
  };

  if (running) {
    return (
      <SessionRunner
        stored={running}
        onClose={() => setRunning(null)}
        onComplete={completeRunning}
        onRemove={removeRunning}
      />
    );
  }

  if (pathOpen) {
    const hasStarted = (store.state.startedPaths ?? []).includes(pathOpen.id);
    return (
      <>
        <PathDetail
          path={pathOpen}
          completedTopics={store.state.pathProgress[pathOpen.id] ?? []}
          hasStarted={hasStarted}
          onBack={() => setPathOpen(null)}
          onStartTopic={(t) => { store.markPathStarted(pathOpen.id); openSetup(pathOpen, t); }}
        />
        <SessionSetupSheet
          open={setupOpen}
          path={setupPath}
          initialTopic={setupTopic}
          onClose={() => { if (!loading) setSetupOpen(false); }}
          onGenerate={doGenerate}
          loading={loading}
          error={error}
        />
      </>
    );
  }

  const totalMinutes = store.state.sessions.reduce((s, x) => s + (x.completed ? x.minutes : 0), 0);
  const completedCount = store.state.sessions.filter((s) => s.completed).length;

  if (profile && !hasCompletedDiagnostic) {
    return (
      <SubScreen>
        <LearnAuroraEdges />
        <div className="relative z-10">
          <SubHeader eyebrow="Centro Inteligente de Aprendizaje" title="Aprender" onBack={onBack} />
          <div className="px-[20px] pt-[6px] pb-[40px] flex flex-col items-center text-center gap-[18px]">
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)", boxShadow: "0 12px 40px -8px rgba(59,130,246,0.5)" }}>
              <Compass className="h-[32px] w-[32px] text-white" strokeWidth={1.6} />
            </div>
            <div>
              <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.3px]">Test de diagnóstico</div>
              <p className="mt-[8px] font-['Geist'] text-[13.5px] text-white/60 leading-[1.55] max-w-[320px]">
                Antes de empezar, responde 10 preguntas rápidas de nociones generales de negocio. Con eso personalizamos tus rutas y lecciones.
              </p>
            </div>
            <div className="flex flex-col gap-[10px] w-full max-w-[320px] mt-[8px]">
              <button
                type="button"
                onClick={() => setDiagnosticOpen(true)}
                className="h-[50px] rounded-full bg-white text-black font-['Bai_Jamjuree'] text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-[8px]"
              >
                <Sparkles className="h-[15px] w-[15px]" strokeWidth={2} />
                Empezar test
              </button>
              <button
                type="button"
                onClick={() => markDiagnosticDone()}
                className="h-[44px] rounded-full font-['Geist'] text-[13px] font-medium text-white/70 active:scale-[0.98] transition-transform"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Omitir por ahora
              </button>
            </div>
          </div>
        </div>
        <DiagnosticTestSheet
          open={diagnosticOpen}
          onClose={() => setDiagnosticOpen(false)}
          onFinish={(res) => markDiagnosticDone(res)}
        />
      </SubScreen>
    );
  }

  return (
    <SubScreen>
      <LearnAuroraEdges />
      <div className="relative z-10">
      <SubHeader
        eyebrow="Centro Inteligente de Aprendizaje"
        title="Aprender"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => openSetup(undefined, undefined)}
            className="h-[36px] px-[13px] rounded-full bg-white text-black font-['Geist'] text-[12px] font-semibold flex items-center gap-[6px] active:scale-95"
          >
            <Sparkles className="h-[13px] w-[13px]" strokeWidth={2} />
            Nueva sesión
          </button>
        }
      />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <p className="font-['Geist'] text-[13px] text-white/50 leading-[1.5] -mt-[4px]">
          Aprende con sesiones de 30 a 60 minutos creadas por IA con base en libros, casos reales, noticias y tendencias verificadas.
        </p>

        <div className="rounded-[18px] p-[14px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-3 gap-[8px]">
            <Stat label="Completadas" value={`${completedCount}`} />
            <Stat label="Minutos" value={`${totalMinutes}`} />
            <Stat label="Sesiones" value={`${store.state.sessions.length}`} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[6px] overflow-x-auto -mx-[4px] px-[4px]">
          {(
            [
              { id: "rutas", label: "Rutas", icon: Compass },
              { id: "historial", label: "Historial", icon: PlayCircle },
            ] as { id: LearnTab; label: string; icon: typeof Compass }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="shrink-0 h-[32px] px-[13px] rounded-full font-['Geist'] text-[12px] font-medium flex items-center gap-[6px] text-white"
              style={{
                background: tab === id ? "rgba(255,255,255,0.10)" : "transparent",
                border: `1px solid ${tab === id ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <Icon className="h-[13px] w-[13px]" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        {tab === "rutas" && (
          <div className="flex flex-col gap-[22px]">
            {(["Básico", "Intermedio", "Avanzado"] as LearnLevel[]).map((lvl) => {
              const paths = LEARNING_PATHS.filter((p) => p.level === lvl);
              if (paths.length === 0) return null;
              const required = minPlanForLevel(lvl);
              const unlocked = planMeetsRequirement(plan, required);
              return (
                <div key={lvl} className="flex flex-col gap-[10px]">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-['Bai_Jamjuree'] text-[17px] font-semibold text-white tracking-[-0.2px]">{lvl}</div>
                      <div className="font-['Geist'] text-[11.5px] text-white/45 mt-[2px] flex items-center gap-[6px]">
                        {!unlocked && <Lock className="h-[10px] w-[10px]" strokeWidth={2} />}
                        {planLabel(required)}
                      </div>
                    </div>
                    <div className="font-['Geist'] text-[11px] text-white/35 tabular-nums">{paths.length} rutas</div>
                  </div>
                  <div className="-mx-[20px] px-[20px] overflow-x-auto no-scrollbar">
                    <div className="flex gap-[12px] pb-[4px]" style={{ scrollSnapType: "x mandatory" }}>
                      {paths.map((p) => {
                        const done = store.state.pathProgress[p.id]?.length ?? 0;
                        const pct = p.topics.length > 0 ? Math.round((done / p.topics.length) * 100) : 0;
                        const locked = !unlocked;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => tryOpenPath(p)}
                            className="shrink-0 w-[190px] rounded-[20px] overflow-hidden text-left active:scale-[0.98] transition-transform relative"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", scrollSnapAlign: "start" }}
                          >
                            <div className="h-[130px] relative" style={{ background: p.gradient }}>
                              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />
                              <div className="absolute top-[10px] left-[12px] text-[38px] leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{p.emoji}</div>
                              <div className="absolute bottom-[10px] right-[10px]">
                                <ProgressRing pct={pct} size={44} />
                              </div>
                            </div>
                            <div className="p-[12px]">
                              <div className="font-['Bai_Jamjuree'] text-[14px] font-semibold text-white leading-[1.2] line-clamp-2 min-h-[34px]">{p.name}</div>
                              <div className="mt-[6px] font-['Geist'] text-[11px] text-white/45 tabular-nums">{p.topics.length} lecciones · ~{p.totalMinutes}m</div>
                            </div>
                            {locked && (
                              <div className="absolute inset-0 rounded-[20px] flex flex-col items-center justify-center gap-[8px] backdrop-blur-[2px]" style={{ background: "rgba(0,0,0,0.55)" }}>
                                <div className="h-[36px] w-[36px] rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                                  <Lock className="h-[15px] w-[15px] text-white/85" strokeWidth={2} />
                                </div>
                                <div className="font-['Geist'] text-[11px] text-white/80 px-[10px] text-center leading-[1.3]">
                                  Disponible en plan {required === "pro" ? "Pro" : "Avanzado"}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "historial" && (
          <HistorialView sessions={store.state.sessions} onOpen={setRunning} onRemove={store.removeSession} />
        )}
      </ProductivityScroll>

      <SessionSetupSheet
        open={setupOpen}
        path={setupPath}
        initialTopic={setupTopic}
        onClose={() => { if (!loading) setSetupOpen(false); }}
        onGenerate={doGenerate}
        loading={loading}
        error={error}
      />

      {upgradePrompt && (
        <Sheet
          open
          onClose={() => setUpgradePrompt(null)}
          title={upgradePrompt.title}
          footer={
            <>
              <GhostButton onClick={() => setUpgradePrompt(null)}>Ahora no</GhostButton>
              <PrimaryButton onClick={() => setUpgradePrompt(null)}>Ver planes</PrimaryButton>
            </>
          }
        >
          <div className="flex flex-col items-center text-center gap-[14px] py-[6px]">
            <div className="h-[56px] w-[56px] rounded-[18px] grid place-items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Lock className="h-[22px] w-[22px] text-white/70" strokeWidth={1.6} />
            </div>
            <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.2px]">
              Disponible en plan {upgradePrompt.plan}
            </div>
            <p className="font-['Geist'] text-[13px] text-white/60 leading-[1.5] max-w-[280px]">
              {upgradePrompt.message}
            </p>
          </div>
        </Sheet>
      )}
      <DiagnosticTestSheet
        open={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        onFinish={(res) => markDiagnosticDone(res)}
      />
      </div>
    </SubScreen>
  );
}


function HistorialView({
  sessions, onOpen, onRemove,
}: {
  sessions: StoredSession[];
  onOpen: (s: StoredSession) => void;
  onRemove: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="py-[40px] text-center font-['Geist'] text-[13px] text-white/40 leading-[1.5]">
        Aún no has generado sesiones.<br/>Toca "Nueva sesión" o elige una ruta para empezar.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[10px]">
      {sessions.map((s) => {
        const path = LEARNING_PATHS.find((p) => p.id === s.pathId);
        const date = new Date(s.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
        return (
          <div key={s.id} className="rounded-[14px] p-[14px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start justify-between gap-[10px]">
              <button type="button" onClick={() => onOpen(s)} className="text-left flex-1 min-w-0">
                <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white leading-[1.3]">{s.session.title}</div>
                <div className="mt-[4px] flex items-center gap-[6px] flex-wrap">
                  <LibraryTagPill>{s.level}</LibraryTagPill>
                  <LibraryTagPill>{s.minutes} min</LibraryTagPill>
                  {path && <LibraryTagPill>{path.emoji} {path.name}</LibraryTagPill>}
                  <LibraryTagPill>{date}</LibraryTagPill>
                </div>
                {s.completed && typeof s.quizScore === "number" && (
                  <div className="mt-[6px] font-['Geist'] text-[11.5px] text-[#4ADE80]">Completada · {s.quizScore}/{s.quizTotal}</div>
                )}
              </button>
              <button type="button" onClick={() => onRemove(s.id)} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]" aria-label="Eliminar">
                <Trash2 className="h-[14px] w-[14px] text-white/45" strokeWidth={1.6} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ============ RECOMENDACIONES ============ */
function RecosView({ onBack, goTo }: { onBack: () => void; goTo: (v: View) => void }) {
  const { recommendations: baseRecos, dismissRecommendation, todos, projects, goals } = useMe();
  const finance = useFinance();
  const inventory = useInventory();

  const totalTasks = todos.length;
  const doneTasks = todos.filter((t) => t.done).length;
  const productivity = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const activeGoals = goals.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning").length;
  const lateProjects = projects.filter((p) => p.status === "late").length;

  // Recos derivadas de datos reales del negocio (finanzas + inventario).
  const businessRecos = useMemo<Recommendation[]>(() => {
    const out: Recommendation[] = [];
    if (finance.fiadosOverdue > 0) {
      out.push({
        id: "biz-fiados",
        level: "urgent",
        title: `Tienes S/ ${Math.round(finance.fiadosOverdue)} en fiados vencidos`,
        body: "Envía un recordatorio hoy — cada día que pasa baja la probabilidad de cobrar.",
      });
    }
    if ((inventory.lowStock?.length ?? 0) > 0) {
      const first = inventory.lowStock[0];
      out.push({
        id: "biz-lowstock",
        level: "warn",
        title:
          inventory.lowStock.length === 1
            ? `"${first?.name ?? "Un producto"}" está por agotarse`
            : `${inventory.lowStock.length} productos con stock bajo`,
        body: "Repón antes de que un cliente te pida algo que ya no tienes.",
      });
    }
    if (finance.todayIncome === 0 && new Date().getHours() >= 12) {
      out.push({
        id: "biz-noSales",
        level: "warn",
        title: "Sin ventas registradas hoy",
        body: "Anota cada venta apenas ocurra — la caja de fin de día se llena con los pequeños tickets.",
      });
    }
    if (finance.todayIncome > 0 && (finance.todayNet ?? 0) > 0) {
      out.push({
        id: "biz-good",
        level: "success",
        title: `Vas S/ ${Math.round(finance.todayNet)} en positivo hoy`,
        body: "Aprovecha el impulso: revisa qué producto rota más y refuerza su stock.",
      });
    }
    return out;
  }, [finance.fiadosOverdue, finance.todayIncome, finance.todayNet, inventory.lowStock]);

  const recommendations = useMemo(
    () => [...businessRecos, ...baseRecos].slice(0, 6),
    [businessRecos, baseRecos],
  );
  const routineDone = 0;
  const routineTotal = 0;


  type LevelStyleEntry = {
    accent: string;
    bg: string;
    border: string;
    iconBg: string;
    icon: React.ReactNode;
    label: string;
    cta: string;
  };
  const levelStyle: Record<string, LevelStyleEntry> = {
    info: {
      accent: "#60A5FA",
      bg: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,23,42,0.55))",
      border: "1px solid rgba(96,165,250,0.28)",
      iconBg: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
      icon: <Lightbulb className="h-[16px] w-[16px] text-white" strokeWidth={1.9} />,
      label: "Sugerencia",
      cta: "Revisar",
    },
    success: {
      accent: "#4ADE80",
      bg: "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(6,78,59,0.35))",
      border: "1px solid rgba(74,222,128,0.32)",
      iconBg: "linear-gradient(135deg,#22C55E,#15803D)",
      icon: <CheckCircle2 className="h-[16px] w-[16px] text-white" strokeWidth={2} />,
      label: "Buen momento",
      cta: "Aprovechar",
    },
    warn: {
      accent: "#FBBF24",
      bg: "linear-gradient(135deg, rgba(234,179,8,0.16), rgba(66,32,6,0.45))",
      border: "1px solid rgba(251,191,36,0.30)",
      iconBg: "linear-gradient(135deg,#F59E0B,#B45309)",
      icon: <Flame className="h-[16px] w-[16px] text-white" strokeWidth={1.9} />,
      label: "Atención",
      cta: "Ver detalle",
    },
    urgent: {
      accent: "#F87171",
      bg: "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(69,10,10,0.5))",
      border: "1px solid rgba(248,113,113,0.35)",
      iconBg: "linear-gradient(135deg,#EF4444,#991B1B)",
      icon: <AlertTriangle className="h-[16px] w-[16px] text-white" strokeWidth={2} />,
      label: "Urgente",
      cta: "Resolver",
    },
  };

  return (
    <SubScreen>
      <SubHeader eyebrow="Trax IA" title="Recomendaciones" onBack={onBack} />

      <ProductivityScroll className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <div className="rounded-[18px] p-[16px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/40">Resumen del día</div>
          <div className="mt-[10px] grid grid-cols-2 gap-[12px]">
            <AnimatedStat label="Tareas" value={doneTasks} denom={totalTasks} />
            <AnimatedStat label="Ventas hoy" value={Math.round(finance.todayIncome)} suffix=" S/" />
            <AnimatedStat label="Metas" value={activeGoals} />
            <AnimatedStat label="Proyectos" value={activeProjects} />
            <AnimatedStat label="En riesgo" value={lateProjects} highlight={lateProjects > 0} />
          </div>

        </div>

        <SectionLabel>Recomendaciones</SectionLabel>
        {recommendations.length === 0 ? (
          <div
            className="rounded-[18px] p-[20px] text-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(15,23,42,0.55))",
              border: "1px solid rgba(96,165,250,0.22)",
            }}
          >
            <div className="mx-auto h-[42px] w-[42px] rounded-[14px] flex items-center justify-center mb-[10px]" style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)" }}>
              <BrainCircuit className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
            </div>
            <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white">
              Empieza registrando tus prioridades del día
            </div>
            <div className="mt-[6px] font-['Geist'] text-[12.5px] text-white/60 leading-[1.5]">
              Crea 3 tareas y 1 meta — la IA usará esos datos para sugerirte acciones concretas.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {recommendations.map((r) => {
              const s = levelStyle[r.level] ?? levelStyle.info;
              return (
                <div
                  key={r.id}
                  className="rounded-[18px] p-[14px] flex gap-[12px]"
                  style={{ background: s.bg, border: s.border }}
                >
                  <span
                    className="h-[40px] w-[40px] rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: s.iconBg, boxShadow: `0 6px 18px -8px ${s.accent}` }}
                  >
                    {s.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-['Geist'] text-[10px] uppercase tracking-[1.4px]" style={{ color: s.accent }}>
                      {s.label}
                    </div>
                    <div className="mt-[3px] font-['Bai_Jamjuree'] text-[15px] font-semibold text-white leading-[1.3]">{r.title}</div>
                    {r.body && <div className="mt-[4px] font-['Geist'] text-[12.5px] text-white/70 leading-[1.45]">{r.body}</div>}
                    <div className="mt-[10px] flex flex-wrap gap-[6px]">
                      {r.taskId || (!r.projectId && !r.goalId && r.level !== "success") ? (
                        <button
                          type="button"
                          onClick={() => (r.projectId ? goTo("projects") : r.goalId ? goTo("goals") : goTo("priorities"))}
                          className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[11.5px] font-medium text-white flex items-center gap-[4px]"
                          style={{ background: s.iconBg }}
                        >
                          {s.cta} <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
                        </button>
                      ) : null}
                      {r.projectId && (
                        <button type="button" onClick={() => goTo("projects")} className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[11.5px] font-medium text-white flex items-center gap-[4px]" style={{ background: s.iconBg }}>
                          Ver proyecto <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
                        </button>
                      )}
                      {r.goalId && (
                        <button type="button" onClick={() => goTo("goals")} className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[11.5px] font-medium text-white flex items-center gap-[4px]" style={{ background: s.iconBg }}>
                          Ver meta <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismissRecommendation(r.id)}
                        className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[11.5px] text-white/55 hover:text-white/80"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProductivityScroll>
    </SubScreen>
  );
}

function AnimatedStat({
  label,
  value,
  denom,
  suffix = "",
  highlight,
}: {
  label: string;
  value: number;
  denom?: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/40">{label}</div>
      <div
        className="mt-[4px] font-['Bai_Jamjuree'] text-[20px] font-semibold tabular-nums"
        style={{ color: highlight ? "#F87171" : "white" }}
      >
        <CountUp value={value} suffix={suffix} />
        {typeof denom === "number" && (
          <span className="text-white/40">/{denom}</span>
        )}
      </div>
    </div>
  );
}


function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.2px] text-white/40">{label}</div>
      <div
        className="mt-[4px] font-['Bai_Jamjuree'] text-[20px] font-semibold tabular-nums"
        style={{ color: highlight ? "#F87171" : "white" }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============ SCREEN ============ */
/* ============ Productividad 2.0 — Notion × Linear ============ */

const HOUR_H = 46;
const DAY_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06..22

function FocusRibbon({ pending, atRisk, done }: { pending: number; atRisk: number; done: number }) {
  const items: { label: string; value: number; color: string }[] = [
    { label: "Pendientes", value: pending, color: "#FFFFFF" },
    { label: "En riesgo", value: atRisk, color: "#F5B944" },
    { label: "Hechas hoy", value: done, color: "#4ADE80" },
  ];
  return (
    <div
      className="grid grid-cols-3 gap-[1px] rounded-[14px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {items.map((it) => (
        <div key={it.label} className="bg-black px-[14px] py-[14px] flex flex-col gap-[4px]">
          <span className="font-['Geist'] text-[10px] font-medium uppercase tracking-[1.4px] text-white/45">
            {it.label}
          </span>
          <span
            className="font-['Bai_Jamjuree'] text-[26px] leading-[28px] font-semibold tabular-nums"
            style={{ color: it.color }}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CommandBar({
  onAdd,
  mode,
  setMode,
}: {
  onAdd: (k: "task" | "event" | "project" | "goal") => void;
  mode: "day" | "week";
  setMode: (m: "day" | "week") => void;
}) {
  const [open, setOpen] = useState(false);
  const opts: { k: "task" | "event" | "project" | "goal"; label: string; Icon: typeof ListChecks }[] = [
    { k: "task", label: "Tarea", Icon: ListChecks },
    { k: "event", label: "Evento", Icon: CalendarDays },
    { k: "project", label: "Entregable", Icon: FolderKanban },
    { k: "goal", label: "Meta", Icon: Target },
  ];
  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex-1 relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-[42px] pl-[14px] pr-[10px] rounded-[12px] flex items-center gap-[10px] text-left"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Plus className="h-[14px] w-[14px] text-white/50" strokeWidth={2} />
          <span className="font-['Geist'] text-[13px] text-white/55 flex-1">Añadir…</span>
          <span className="font-['Geist'] tabular-nums text-[10.5px] text-white/30 uppercase tracking-[1.4px]">
            ⌘ K
          </span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-[46px] rounded-[12px] p-[6px] z-30"
              style={{
                background: "#0B0B0F",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              }}
            >
              {opts.map(({ k, label, Icon }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onAdd(k);
                  }}
                  className="w-full h-[38px] px-[10px] rounded-[8px] flex items-center gap-[10px] text-left active:bg-white/[0.05]"
                >
                  <Icon className="h-[14px] w-[14px] text-white/55" strokeWidth={1.8} />
                  <span className="font-['Geist'] text-[13px] text-white/85 flex-1">{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="flex rounded-[12px] p-[2px]"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {(["day", "week"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="h-[38px] px-[12px] rounded-[10px] font-['Geist'] text-[12px] font-medium"
            style={{
              background: mode === m ? "rgba(255,255,255,0.10)" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.55)",
            }}
          >
            {m === "day" ? "Día" : "Semana"}
          </button>
        ))}
      </div>
    </div>
  );
}

function DayTimeline({
  events,
  tasks,
  onEmpty,
  onTaskTap,
  onEventTap,
}: {
  events: CalendarEvent[];
  tasks: Todo[];
  onEmpty: (hour: number) => void;
  onTaskTap: (t: Todo) => void;
  onEventTap: (e: CalendarEvent) => void;
}) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toY = (min: number) => ((min - 6 * 60) / 60) * HOUR_H;

  const eventsWithMin = events
    .filter((e) => e.start)
    .map((e) => {
      const [h, m] = e.start!.split(":").map(Number);
      const min = h * 60 + m;
      let dur = 60;
      if (e.end) {
        const [eh, em] = e.end.split(":").map(Number);
        dur = Math.max(30, eh * 60 + em - min);
      }
      return { ...e, min, dur };
    })
    .filter((e) => e.min >= 6 * 60 && e.min < 22 * 60);

  const tasksWithMin = tasks
    .filter((t) => t.time && !t.done)
    .map((t) => {
      const [h, m] = t.time!.split(":").map(Number);
      return { ...t, min: h * 60 + m };
    })
    .filter((t) => t.min >= 6 * 60 && t.min < 22 * 60);

  return (
    <div
      className="relative rounded-[16px] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        height: DAY_HOURS.length * HOUR_H + 12,
      }}
    >
      {DAY_HOURS.map((h, i) => (
        <button
          key={h}
          type="button"
          onClick={() => onEmpty(h)}
          className="absolute left-0 right-0 flex items-start pl-[14px] active:bg-white/[0.02]"
          style={{ top: i * HOUR_H + 6, height: HOUR_H }}
        >
          <span className="font-['Geist'] tabular-nums text-[10.5px] text-white/35 w-[36px] pt-[2px] text-left">
            {String(h).padStart(2, "0")}:00
          </span>
          <span className="flex-1 h-[1px] mt-[8px]" style={{ background: "rgba(255,255,255,0.05)" }} />
        </button>
      ))}

      {eventsWithMin.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onEventTap(e)}
          className="absolute left-[56px] right-[10px] rounded-[10px] px-[10px] py-[6px] text-left flex flex-col active:opacity-80"
          style={{
            top: toY(e.min) + 6,
            height: Math.max(32, (e.dur / 60) * HOUR_H - 4),
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <span className="font-['Geist'] text-[12.5px] font-medium text-white truncate">{e.title}</span>
          <span className="font-['Geist'] text-[10.5px] text-white/50 tabular-nums truncate">
            {e.start}
            {e.end ? ` – ${e.end}` : ""}
            {e.place ? ` · ${e.place}` : ""}
          </span>
        </button>
      ))}

      {tasksWithMin.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTaskTap(t)}
          className="absolute left-[56px] right-[10px] flex items-center gap-[8px] h-[26px] pl-[8px] pr-[10px] rounded-[8px] active:opacity-80"
          style={{ top: toY(t.min) + 6, background: "rgba(255,255,255,0.03)" }}
        >
          <span className="h-[7px] w-[7px] rounded-full shrink-0" style={{ background: PRIO[t.priority].color }} />
          <span className="font-['Geist'] text-[12.5px] text-white/90 truncate">{t.title}</span>
        </button>
      ))}

      {nowMin >= 6 * 60 && nowMin <= 22 * 60 && (
        <div
          className="absolute left-[46px] right-[8px] flex items-center gap-[6px] pointer-events-none"
          style={{ top: toY(nowMin) + 6 }}
        >
          <span className="h-[6px] w-[6px] rounded-full bg-[#F87171]" />
          <span className="flex-1 h-[1px] bg-[#F87171]/60" />
        </div>
      )}
    </div>
  );
}

function WeekGantt({
  events,
  tasks,
  projects,
  onTaskTap,
  onEventTap,
  onProjectTap,
}: {
  events: CalendarEvent[];
  tasks: Todo[];
  projects: Project[];
  onTaskTap: (t: Todo) => void;
  onEventTap: (e: CalendarEvent) => void;
  onProjectTap: (p: Project) => void;
}) {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const label = (d: Date) =>
    d.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "").toUpperCase();

  const rows: {
    kind: "event" | "task" | "project";
    id: string;
    title: string;
    color: string;
    dayIndex: number;
    span: number;
    onTap: () => void;
  }[] = [];

  events.forEach((e) => {
    const idx = days.findIndex((d) => iso(d) === e.date);
    if (idx >= 0) {
      rows.push({
        kind: "event",
        id: `e-${e.id}`,
        title: e.title,
        color: "#FFFFFF",
        dayIndex: idx,
        span: 1,
        onTap: () => onEventTap(e),
      });
    }
  });
  tasks.forEach((t) => {
    if (!t.due || t.done) return;
    if (t.due === "Hoy") {
      rows.push({
        kind: "task",
        id: `t-${t.id}`,
        title: t.title,
        color: PRIO[t.priority].color,
        dayIndex: 0,
        span: 1,
        onTap: () => onTaskTap(t),
      });
      return;
    }
    const idx = days.findIndex((d) => iso(d) === t.due);
    if (idx >= 0) {
      rows.push({
        kind: "task",
        id: `t-${t.id}`,
        title: t.title,
        color: PRIO[t.priority].color,
        dayIndex: idx,
        span: 1,
        onTap: () => onTaskTap(t),
      });
    }
  });
  projects.forEach((p) => {
    if (!p.dueDate) return;
    const startIdx = 0;
    const endIdx = days.findIndex((d) => iso(d) === p.dueDate);
    if (endIdx < 0) return;
    rows.push({
      kind: "project",
      id: `p-${p.id}`,
      title: p.name,
      color: PROJECT_STATUS[p.status].color,
      dayIndex: startIdx,
      span: Math.max(1, endIdx - startIdx + 1),
      onTap: () => onProjectTap(p),
    });
  });

  const COL_W = `minmax(0, 1fr)`;
  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="grid px-[8px] pt-[10px] pb-[8px]"
        style={{ gridTemplateColumns: `repeat(7, ${COL_W})`, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-[2px]">
            <span className="font-['Geist'] text-[9.5px] uppercase tracking-[1.4px] text-white/40">
              {label(d)}
            </span>
            <span
              className="font-['Bai_Jamjuree'] tabular-nums text-[14px] font-semibold"
              style={{ color: i === 0 ? "#fff" : "rgba(255,255,255,0.7)" }}
            >
              {d.getDate()}
            </span>
          </div>
        ))}
      </div>
      <div className="p-[10px] flex flex-col gap-[6px] min-h-[140px]">
        {rows.length === 0 ? (
          <span className="font-['Geist'] text-[12px] text-white/40 text-center py-[24px]">
            Nada programado esta semana.
          </span>
        ) : (
          rows.slice(0, 12).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={r.onTap}
              className="grid gap-[2px] w-full active:opacity-80"
              style={{ gridTemplateColumns: `repeat(7, ${COL_W})` }}
            >
              {Array.from({ length: 7 }).map((_, i) => {
                const inRange = i >= r.dayIndex && i < r.dayIndex + r.span;
                if (!inRange) return <span key={i} />;
                const isStart = i === r.dayIndex;
                return (
                  <span
                    key={i}
                    className="h-[24px] flex items-center px-[6px] overflow-hidden"
                    style={{
                      background: `${r.color}22`,
                      borderTop: `1px solid ${r.color}55`,
                      borderBottom: `1px solid ${r.color}55`,
                      borderLeft: isStart ? `1px solid ${r.color}55` : "none",
                      borderRight: i === r.dayIndex + r.span - 1 ? `1px solid ${r.color}55` : "none",
                      borderRadius:
                        isStart && i === r.dayIndex + r.span - 1
                          ? 6
                          : isStart
                            ? "6px 0 0 6px"
                            : i === r.dayIndex + r.span - 1
                              ? "0 6px 6px 0"
                              : 0,
                    }}
                  >
                    {isStart && (
                      <span className="font-['Geist'] text-[10.5px] font-medium text-white truncate">
                        {r.title}
                      </span>
                    )}
                  </span>
                );
              })}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function TaskInboxRow({
  todo,
  index,
  onToggle,
  onTap,
}: {
  todo: Todo;
  index: number;
  onToggle: () => void;
  onTap: () => void;
}) {
  const dueLabel = todo.due === "Hoy" || todo.due === "Mañana" ? todo.due : formatDueLabel(todo.due);
  return (
    <div
      className="flex items-center gap-[10px] pl-[8px] pr-[10px] h-[44px]"
      style={{ borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="h-[24px] w-[24px] grid place-items-center rounded-full active:bg-white/[0.06]"
      >
        {todo.done ? (
          <CheckCircle2 className="h-[16px] w-[16px] text-[#4ADE80]" strokeWidth={2} />
        ) : (
          <Circle className="h-[15px] w-[15px] text-white/40" strokeWidth={1.6} />
        )}
      </button>
      <button
        type="button"
        onClick={onTap}
        className="flex-1 min-w-0 flex items-center gap-[10px] text-left active:opacity-80"
      >
        <span className="font-['Geist'] tabular-nums text-[10.5px] text-white/35 shrink-0">
          TRX-{todo.id.slice(-3).toUpperCase()}
        </span>
        <span
          className={`font-['Geist'] text-[13.5px] truncate ${todo.done ? "line-through text-white/35" : "text-white/90"}`}
        >
          {todo.title}
        </span>
      </button>
      <span
        className="shrink-0 h-[20px] px-[7px] rounded-full font-['Geist'] text-[10px] font-semibold uppercase tracking-[0.6px] flex items-center"
        style={{ background: `${PRIO[todo.priority].color}18`, color: PRIO[todo.priority].color }}
      >
        {todo.priority === "urgent" ? "P0" : todo.priority === "high" ? "P1" : todo.priority === "normal" ? "P2" : "P3"}
      </span>
      {dueLabel && (
        <span className="shrink-0 font-['Geist'] tabular-nums text-[11px] text-white/45 w-[52px] text-right truncate">
          {dueLabel}
        </span>
      )}
    </div>
  );
}

function DeliverableRow({
  project,
  index,
  onTap,
}: {
  project: Project;
  index: number;
  onTap: () => void;
}) {
  const st = PROJECT_STATUS[project.status];
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex items-center gap-[10px] pl-[10px] pr-[12px] h-[50px] w-full text-left active:bg-white/[0.02]"
      style={{ borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="h-[8px] w-[8px] rounded-full shrink-0" style={{ background: st.color }} />
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <span className="font-['Geist'] text-[13.5px] font-medium text-white/90 truncate">{project.name}</span>
        <div className="flex items-center gap-[8px]">
          <span className="font-['Geist'] text-[10.5px] text-white/45">{st.label}</span>
          {project.dueDate && (
            <span className="font-['Geist'] tabular-nums text-[10.5px] text-white/35">
              · {formatDueLabel(project.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="w-[68px] flex flex-col gap-[3px] shrink-0">
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full" style={{ width: `${project.progress}%`, background: st.color }} />
        </div>
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[11px] text-white/70 text-right">
          {project.progress}%
        </span>
      </div>
    </button>
  );
}

function GoalRow({ goal, index, onTap }: { goal: Goal; index: number; onTap: () => void }) {
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex flex-col gap-[6px] px-[12px] py-[12px] w-full text-left active:bg-white/[0.02]"
      style={{ borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-between gap-[10px]">
        <span className="font-['Geist'] text-[13.5px] font-medium text-white/90 truncate">{goal.label}</span>
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[13px] text-white shrink-0">
          {goal.unit} {goal.current.toLocaleString("es-PE")} / {goal.target.toLocaleString("es-PE")}
        </span>
      </div>
      <div className="flex items-center gap-[8px]">
        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full bg-white" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-['Geist'] tabular-nums text-[11px] text-white/60 w-[36px] text-right">
          {pct}%
        </span>
      </div>
    </button>
  );
}

/* ============ Productividad 3.0 — Command Deck ============ */

function CountUpMini({ value, className, duration = 700 }: { value: number; className?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{n}</span>;
}

function DayRing({ done, pending }: { done: number; pending: number }) {
  const total = done + pending;
  const pct = total === 0 ? 0 : done / total;
  const size = 60;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={pct >= 1 ? "#4ADE80" : "#FFFFFF"}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 60, damping: 16 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[15px] font-semibold text-white leading-none">
          {Math.round(pct * 100)}
          <span className="text-[9px] text-white/40">%</span>
        </span>
      </div>
    </div>
  );
}

function NextMoveHero({
  candidate,
  onDone,
  onSnooze,
  onTap,
}: {
  candidate: null | {
    kind: "event" | "task";
    title: string;
    subtitle: string;
    accent: string;
    countdown?: string;
    urgent?: boolean;
  };
  onDone: () => void;
  onSnooze: () => void;
  onTap: () => void;
}) {
  if (!candidate) {
    return (
      <div
        className="relative rounded-[22px] overflow-hidden px-[18px] py-[22px]"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.06), rgba(255,255,255,0.015) 60%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[1.6px] text-white/40">
          Siguiente movimiento
        </span>
        <div className="mt-[8px] font-['Bai_Jamjuree'] font-semibold text-[20px] leading-[1.2] text-white">
          Todo despejado. Captura tu próxima acción.
        </div>
        <button
          type="button"
          onClick={onTap}
          className="mt-[14px] h-[42px] px-[16px] rounded-[12px] flex items-center gap-[8px] font-['Geist'] text-[13px] font-semibold text-black"
          style={{ background: "#fff" }}
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} /> Añadir tarea
        </button>
      </div>
    );
  }
  return (
    <motion.div
      key={candidate.title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-[22px] overflow-hidden px-[18px] py-[18px]"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 55%)",
        border: `1px solid ${candidate.urgent ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.10)"}`,
      }}
    >
      <div className="flex items-center gap-[8px]">
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: candidate.accent, boxShadow: `0 0 10px ${candidate.accent}` }}
        />
        <span className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[1.6px] text-white/50">
          {candidate.kind === "event" ? "Próximo evento" : "Siguiente misión"}
        </span>
        {candidate.countdown && (
          <span className="ml-auto font-['Bai_Jamjuree'] tabular-nums text-[11px] font-semibold text-white/70">
            {candidate.countdown}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onTap}
        className="mt-[10px] text-left w-full"
      >
        <div className="font-['Bai_Jamjuree'] font-semibold text-[22px] leading-[1.15] text-white line-clamp-2">
          {candidate.title}
        </div>
        <div className="mt-[4px] font-['Geist'] text-[12px] text-white/50">{candidate.subtitle}</div>
      </button>
      <div className="mt-[16px] flex items-center gap-[8px]">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 h-[44px] rounded-[12px] flex items-center justify-center gap-[8px] font-['Geist'] text-[13.5px] font-semibold"
          style={{ background: "#4ADE80", color: "#04150A" }}
        >
          <Check className="h-[16px] w-[16px]" strokeWidth={2.6} /> Hecho
        </button>
        <button
          type="button"
          onClick={onSnooze}
          className="h-[44px] px-[16px] rounded-[12px] flex items-center gap-[6px] font-['Geist'] text-[12.5px] font-medium text-white/75"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Clock className="h-[13px] w-[13px]" strokeWidth={1.8} /> +15m
        </button>
      </div>
    </motion.div>
  );
}

function MomentumStrip({
  done,
  xp,
  focusMin,
}: {
  done: number;
  xp: number;
  focusMin: number;
}) {
  const items = [
    { label: "Hechas hoy", value: done, color: "#4ADE80" },
    { label: "XP", value: xp, color: "#FFFFFF" },
    { label: "Foco (min)", value: focusMin, color: "#F5B944" },
  ];
  return (
    <div className="grid grid-cols-3 gap-[8px]">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-[14px] px-[12px] py-[12px] flex flex-col gap-[4px]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.3px] text-white/40">
            {it.label}
          </span>
          <CountUpMini
            value={it.value}
            className="font-['Bai_Jamjuree'] tabular-nums text-[24px] leading-[26px] font-semibold"
          />
        </div>
      ))}
    </div>
  );
}

function HorizontalTimeline({
  events,
  tasks,
  onEmpty,
  onTaskTap,
  onEventTap,
}: {
  events: CalendarEvent[];
  tasks: Todo[];
  onEmpty: (hour: number) => void;
  onTaskTap: (t: Todo) => void;
  onEventTap: (e: CalendarEvent) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const HOUR_W = 88;
  const START_H = 6;
  const END_H = 23;
  const hours = Array.from({ length: END_H - START_H }, (_, i) => i + START_H);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const x = ((nowMin - START_H * 60) / 60) * HOUR_W - el.clientWidth / 2 + HOUR_W / 2;
    el.scrollTo({ left: Math.max(0, x), behavior: "smooth" });
  }, [nowMin]);

  const evs = events
    .filter((e) => e.start)
    .map((e) => {
      const [h, m] = e.start!.split(":").map(Number);
      const min = h * 60 + m;
      let dur = 45;
      if (e.end) {
        const [eh, em] = e.end.split(":").map(Number);
        dur = Math.max(30, eh * 60 + em - min);
      }
      return { ...e, min, dur };
    })
    .filter((e) => e.min >= START_H * 60 && e.min < END_H * 60);

  const tks = tasks
    .filter((t) => t.time && !t.done)
    .map((t) => {
      const [h, m] = t.time!.split(":").map(Number);
      return { ...t, min: h * 60 + m };
    })
    .filter((t) => t.min >= START_H * 60 && t.min < END_H * 60);

  const totalW = hours.length * HOUR_W;
  const xFor = (min: number) => ((min - START_H * 60) / 60) * HOUR_W;

  return (
    <div
      ref={scrollRef}
      className="relative rounded-[16px] overflow-x-auto overflow-y-hidden no-scrollbar"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        height: 118,
      }}
    >
      <div className="relative" style={{ width: totalW, height: "100%" }}>
        {/* Hour ticks */}
        {hours.map((h, i) => (
          <button
            key={h}
            type="button"
            onClick={() => onEmpty(h)}
            className="absolute top-0 bottom-0 flex flex-col items-start pt-[8px] pl-[8px] active:bg-white/[0.02]"
            style={{ left: i * HOUR_W, width: HOUR_W, borderLeft: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="font-['Geist'] tabular-nums text-[10px] text-white/35">
              {String(h).padStart(2, "0")}:00
            </span>
          </button>
        ))}

        {/* Events */}
        {evs.map((e) => {
          const w = Math.max(48, (e.dur / 60) * HOUR_W - 4);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onEventTap(e)}
              className="absolute rounded-[10px] px-[8px] py-[6px] text-left flex flex-col active:opacity-80"
              style={{
                left: xFor(e.min) + 2,
                top: 30,
                width: w,
                height: 56,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <span className="font-['Geist'] text-[11.5px] font-medium text-white truncate">{e.title}</span>
              <span className="font-['Geist'] tabular-nums text-[10px] text-white/50 truncate">
                {e.start}
                {e.end ? `–${e.end}` : ""}
              </span>
            </button>
          );
        })}

        {/* Task dots */}
        {tks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTaskTap(t)}
            className="absolute flex flex-col items-center gap-[3px] active:opacity-70"
            style={{ left: xFor(t.min) - 6, bottom: 8, width: 92 }}
          >
            <span
              className="h-[9px] w-[9px] rounded-full"
              style={{ background: PRIO[t.priority].color, boxShadow: `0 0 8px ${PRIO[t.priority].color}88` }}
            />
            <span className="font-['Geist'] text-[9.5px] text-white/60 truncate max-w-[80px]">
              {t.title}
            </span>
          </button>
        ))}

        {/* Now indicator */}
        {nowMin >= START_H * 60 && nowMin <= END_H * 60 && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: xFor(nowMin), width: 1, background: "#F87171", boxShadow: "0 0 12px #F87171" }}
          >
            <div
              className="absolute -top-[1px] -left-[16px] px-[6px] h-[16px] rounded-[4px] flex items-center font-['Bai_Jamjuree'] tabular-nums text-[9.5px] font-semibold text-white"
              style={{ background: "#F87171" }}
            >
              {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MissionCard({
  todo,
  onToggle,
  onTap,
}: {
  todo: Todo;
  onToggle: () => void;
  onTap: () => void;
}) {
  const xpMap = { urgent: 30, high: 20, normal: 10, low: 5 } as const;
  const xp = xpMap[todo.priority];
  const barColor =
    todo.priority === "urgent"
      ? "#F87171"
      : todo.priority === "high"
        ? "#F5B944"
        : "#FFFFFF";
  const dueLabel =
    todo.due === "Hoy" || todo.due === "Mañana" ? todo.due : formatDueLabel(todo.due);
  return (
    <div
      className="relative rounded-[14px] overflow-hidden flex items-center gap-[10px] pl-[14px] pr-[12px] py-[12px]"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span
        className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-[3px]"
        style={{ background: barColor, boxShadow: `0 0 10px ${barColor}66` }}
      />
      <button
        type="button"
        onClick={onToggle}
        className="h-[26px] w-[26px] grid place-items-center rounded-full active:bg-white/[0.06] shrink-0"
      >
        {todo.done ? (
          <CheckCircle2 className="h-[18px] w-[18px] text-[#4ADE80]" strokeWidth={2} />
        ) : (
          <Circle className="h-[17px] w-[17px] text-white/40" strokeWidth={1.6} />
        )}
      </button>
      <button
        type="button"
        onClick={onTap}
        className="flex-1 min-w-0 flex flex-col gap-[2px] text-left active:opacity-80"
      >
        <span
          className={`font-['Geist'] text-[13.5px] font-medium truncate ${todo.done ? "line-through text-white/35" : "text-white/95"}`}
        >
          {todo.title}
        </span>
        <div className="flex items-center gap-[8px]">
          {dueLabel && (
            <span className="font-['Bai_Jamjuree'] tabular-nums text-[10.5px] text-white/50">
              {dueLabel}
              {todo.time ? ` · ${todo.time}` : ""}
            </span>
          )}
          <span
            className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[0.9px]"
            style={{ color: barColor }}
          >
            {todo.priority === "urgent"
              ? "P0"
              : todo.priority === "high"
                ? "P1"
                : todo.priority === "normal"
                  ? "P2"
                  : "P3"}
          </span>
        </div>
      </button>
      <div className="shrink-0 flex flex-col items-end gap-[2px]">
        <span
          className="font-['Bai_Jamjuree'] tabular-nums text-[12px] font-semibold"
          style={{ color: barColor }}
        >
          +{xp}
        </span>
        <span className="font-['Geist'] text-[8.5px] uppercase tracking-[1px] text-white/35">XP</span>
      </div>
    </div>
  );
}

function ProjectFlightCard({
  project,
  onTap,
}: {
  project: Project;
  onTap: () => void;
}) {
  const st = PROJECT_STATUS[project.status];
  const daysLeft = (() => {
    if (!project.dueDate || !isISODate(project.dueDate)) return null;
    const [y, m, d] = project.dueDate.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  })();
  const risk = project.status === "late" || (daysLeft !== null && daysLeft <= 3 && project.progress < 80);
  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full rounded-[16px] p-[14px] text-left flex flex-col gap-[10px] active:opacity-90"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-[10px]">
        <span className="relative flex h-[8px] w-[8px] shrink-0">
          {risk && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
              style={{ background: st.color }}
            />
          )}
          <span className="relative inline-flex rounded-full h-[8px] w-[8px]" style={{ background: st.color }} />
        </span>
        <span className="font-['Geist'] text-[13.5px] font-semibold text-white/95 truncate flex-1 min-w-0">
          {project.name}
        </span>
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[18px] font-semibold text-white leading-none">
          {project.progress}
          <span className="text-[10px] text-white/40">%</span>
        </span>
      </div>
      <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${project.progress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${st.color}, ${st.color === "#4ADE80" ? "#A7F3D0" : "#FFFFFF"})`,
          }}
        />
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.1px] text-white/45">
          {st.label}
        </span>
        {daysLeft !== null && (
          <span
            className="font-['Bai_Jamjuree'] tabular-nums text-[10.5px] font-semibold ml-auto"
            style={{ color: daysLeft < 3 ? "#F87171" : daysLeft < 7 ? "#F5B944" : "rgba(255,255,255,0.55)" }}
          >
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d de retraso` : daysLeft === 0 ? "Hoy vence" : `${daysLeft}d restantes`}
          </span>
        )}
      </div>
    </button>
  );
}

function GoalRing({ goal, onTap }: { goal: Goal; onTap: () => void }) {
  const pct = goal.target > 0 ? Math.min(1, goal.current / goal.target) : 0;
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = pct >= 1 ? "#4ADE80" : pct >= 0.66 ? "#FFFFFF" : pct >= 0.33 ? "#F5B944" : "#F87171";
  return (
    <button
      type="button"
      onClick={onTap}
      className="rounded-[16px] p-[14px] flex flex-col items-center gap-[10px] active:opacity-90"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ type: "spring", stiffness: 55, damping: 15 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-['Bai_Jamjuree'] tabular-nums text-[16px] font-semibold text-white leading-none">
            {Math.round(pct * 100)}
            <span className="text-[9px] text-white/40">%</span>
          </span>
        </div>
      </div>
      <div className="w-full flex flex-col items-center gap-[2px] min-w-0">
        <span className="font-['Geist'] text-[11.5px] font-medium text-white/85 truncate max-w-full">
          {goal.label}
        </span>
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[10px] text-white/45">
          {goal.unit === "S/" ? "S/ " : ""}
          {goal.current}
          {goal.unit !== "S/" ? goal.unit : ""} / {goal.unit === "S/" ? "S/ " : ""}
          {goal.target}
          {goal.unit !== "S/" ? goal.unit : ""}
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   PRODUCTIVIDAD 4.0 — Living Command
   Piezas: PulseCanvas, SociaWhisper, HorizonteStrip, FocusOrb,
   GoalConstellation, FlightCard.
   ============================================================ */

function PulseCanvas({
  goalPct,
  dayPct,
  centerValue,
  centerLabel,
  centerDelta,
  onNext,
  dotIdx,
  dotCount,
}: {
  goalPct: number;
  dayPct: number;
  centerValue: string;
  centerLabel: string;
  centerDelta?: { v: string; pos: boolean };
  onNext: () => void;
  dotIdx: number;
  dotCount: number;
}) {
  const size = 260;
  const outerStroke = 12;
  const gap = 8;
  const innerStroke = 3;
  const outerR = (size - outerStroke) / 2 - 2;
  const innerR = outerR - outerStroke / 2 - gap - innerStroke / 2;
  const cOuter = 2 * Math.PI * outerR;
  const cInner = 2 * Math.PI * innerR;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.07), rgba(255,255,255,0) 65%)",
        }}
      />
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerR}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={outerStroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={outerR}
          stroke={goalPct >= 1 ? "#4ADE80" : "#FFFFFF"}
          strokeWidth={outerStroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={cOuter}
          initial={{ strokeDashoffset: cOuter }}
          animate={{ strokeDashoffset: cOuter * (1 - Math.min(1, goalPct)) }}
          transition={{ type: "spring", stiffness: 40, damping: 18 }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={innerStroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={innerStroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={cInner}
          initial={{ strokeDashoffset: cInner }}
          animate={{ strokeDashoffset: cInner * (1 - Math.min(1, dayPct)) }}
          transition={{ type: "spring", stiffness: 40, damping: 18, delay: 0.15 }}
        />
      </svg>
      <button
        type="button"
        onClick={onNext}
        className="absolute inset-0 grid place-items-center active:opacity-80"
      >
        <div className="flex flex-col items-center gap-[6px] px-[18px]">
          <span className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.6px] text-white/40">
            {centerLabel}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={centerValue + centerLabel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32 }}
              className="font-['Bai_Jamjuree'] tabular-nums text-[34px] leading-[36px] font-semibold text-white tracking-[-0.8px] text-center"
            >
              {centerValue}
            </motion.span>
          </AnimatePresence>
          {centerDelta && (
            <span
              className="font-['Bai_Jamjuree'] tabular-nums text-[11px] font-semibold"
              style={{ color: centerDelta.pos ? "#4ADE80" : "#F87171" }}
            >
              {centerDelta.v}
            </span>
          )}
          <div className="mt-[6px] flex items-center gap-[4px]">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className="h-[3px] rounded-full transition-all"
                style={{
                  width: i === dotIdx ? 14 : 3,
                  background: i === dotIdx ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}

type Whisper = {
  id: string;
  chip: string;
  text: string;
  tone: "good" | "warn" | "urgent" | "info";
  action?: string;
  onAct?: () => void;
};

function SociaWhisper({ items }: { items: Whisper[] }) {
  if (items.length === 0) return null;
  return (
    <div
      className="relative"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {items.map((w) => {
          const c =
            w.tone === "urgent"
              ? "#F87171"
              : w.tone === "warn"
                ? "#F5B944"
                : w.tone === "good"
                  ? "#4ADE80"
                  : "#FFFFFF";
          return (
            <div
              key={w.id}
              className="snap-start shrink-0 w-full flex items-center gap-[12px] px-[20px] py-[14px]"
            >
              <div className="flex items-center gap-[6px] shrink-0">
                <Sparkles className="h-[11px] w-[11px]" style={{ color: c }} strokeWidth={2} />
                <span
                  className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.2px]"
                  style={{ color: c }}
                >
                  {w.chip}
                </span>
              </div>
              <p className="font-['Geist'] text-[12.5px] leading-[16px] text-white/85 flex-1 min-w-0">
                {w.text}
              </p>
              {w.action && w.onAct && (
                <button
                  type="button"
                  onClick={w.onAct}
                  className="shrink-0 font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1px] text-white/85 active:text-white pl-[10px]"
                  style={{ borderLeft: "1px solid rgba(255,255,255,0.10)" }}
                >
                  {w.action} →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type WeekBucket = {
  start: Date;
  label: string;
  count: number;
  done: number;
  markers: { color: string; kind: string }[];
};

function HorizonteStrip({
  weeks,
  onWeek,
}: {
  weeks: WeekBucket[];
  onWeek: (w: WeekBucket) => void;
}) {
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));
  const now = new Date();
  const currentIdx = weeks.findIndex((w) => {
    const end = new Date(w.start);
    end.setDate(end.getDate() + 7);
    return now >= w.start && now < end;
  });
  return (
    <div className="flex gap-[6px] h-[110px]">
      {weeks.map((w, i) => {
        const density = 0.025 + 0.12 * (w.count / maxCount);
        const isCurrent = i === currentIdx;
        return (
          <button
            type="button"
            key={i}
            onClick={() => onWeek(w)}
            className="relative flex-1 rounded-[10px] flex flex-col justify-end p-[6px] active:opacity-80"
            style={{
              background: `rgba(255,255,255,${density})`,
              border: `1px solid ${isCurrent ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.05)"}`,
            }}
          >
            {isCurrent && (
              <span className="absolute top-[6px] left-1/2 -translate-x-1/2 h-[4px] w-[4px] rounded-full bg-white" />
            )}
            <div className="flex flex-col gap-[3px] items-center mb-[4px] min-h-[15px]">
              {w.markers.slice(0, 3).map((m, mi) => (
                <span
                  key={mi}
                  className="h-[4px] w-[4px] rounded-full"
                  style={{ background: m.color }}
                />
              ))}
            </div>
            <span className="font-['Bai_Jamjuree'] tabular-nums text-[10px] font-semibold text-white/60 text-center leading-none">
              {w.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FocusOrb({
  title,
  context,
  tone,
  onDone,
  onLater,
  onDismiss,
}: {
  title: string;
  context: string;
  tone: "urgent" | "focus" | "calm";
  onDone?: () => void;
  onLater?: () => void;
  onDismiss?: () => void;
}) {
  const c = tone === "urgent" ? "#F87171" : tone === "calm" ? "#4ADE80" : "#FFFFFF";
  const chip = tone === "urgent" ? "Actúa ya" : tone === "calm" ? "Todo en orden" : "Foco ahora";
  return (
    <div
      className="relative w-full rounded-[24px] overflow-hidden"
      style={{
        background: `radial-gradient(circle at 25% 20%, ${c}18, rgba(255,255,255,0.01) 62%), rgba(255,255,255,0.03)`,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <motion.div
        className="absolute -top-[50px] -right-[50px] h-[170px] w-[170px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c}22, transparent 70%)` }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative p-[20px] flex flex-col gap-[14px]">
        <div className="flex items-center gap-[6px]">
          <span
            className="h-[6px] w-[6px] rounded-full animate-pulse"
            style={{ background: c }}
          />
          <span
            className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[1.4px]"
            style={{ color: c }}
          >
            {chip}
          </span>
        </div>
        <h2 className="font-['Bai_Jamjuree'] font-semibold text-[22px] leading-[26px] text-white tracking-[-0.4px]">
          {title}
        </h2>
        <p className="font-['Geist'] text-[12px] leading-[16px] text-white/55">{context}</p>
        {(onDone || onLater || onDismiss) && (
          <div className="flex items-center gap-[8px] pt-[4px]">
            {onDone && (
              <button
                type="button"
                onClick={onDone}
                className="h-[36px] flex-1 rounded-[12px] font-['Geist'] text-[12.5px] font-semibold text-black active:opacity-90"
                style={{ background: "#FFFFFF" }}
              >
                Hecho
              </button>
            )}
            {onLater && (
              <button
                type="button"
                onClick={onLater}
                className="h-[36px] px-[14px] rounded-[12px] font-['Geist'] text-[12px] font-medium text-white/70 active:text-white"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Después
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="h-[36px] w-[36px] rounded-[12px] grid place-items-center text-white/45 active:text-white/80"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <X className="h-[13px] w-[13px]" strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalConstellation({
  goals,
  onTap,
  onAdd,
}: {
  goals: Goal[];
  onTap: (g: Goal) => void;
  onAdd: () => void;
}) {
  if (goals.length === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="w-full h-[180px] rounded-[24px] grid place-items-center active:opacity-90"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05), rgba(255,255,255,0.01) 65%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col items-center gap-[8px]">
          <motion.div
            className="h-[54px] w-[54px] rounded-full grid place-items-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Compass className="h-[20px] w-[20px] text-white/70" strokeWidth={1.5} />
          </motion.div>
          <span className="font-['Bai_Jamjuree'] text-[14px] font-semibold text-white/85">
            Define tu norte
          </span>
          <span className="font-['Geist'] text-[11px] text-white/40">
            Cada meta es una estrella en tu constelación.
          </span>
        </div>
      </button>
    );
  }
  const H = 200;
  const positions = [
    { x: 0.22, y: 0.35 },
    { x: 0.55, y: 0.22 },
    { x: 0.8, y: 0.55 },
    { x: 0.3, y: 0.75 },
    { x: 0.68, y: 0.75 },
    { x: 0.1, y: 0.62 },
  ];
  const maxTarget = Math.max(1, ...goals.map((g) => g.target));
  return (
    <div
      className="relative w-full rounded-[24px] overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.04), rgba(255,255,255,0.005) 70%)",
        border: "1px solid rgba(255,255,255,0.06)",
        height: H,
      }}
    >
      {goals.slice(0, 6).map((g, i) => {
        const pos = positions[i];
        const pct = g.target > 0 ? Math.min(1, g.current / g.target) : 0;
        const size = 34 + (g.target / maxTarget) * 38;
        const opacity = 0.4 + pct * 0.55;
        const isClose = pct >= 0.8;
        return (
          <button
            type="button"
            key={g.id}
            onClick={() => onTap(g)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center active:scale-95 transition-transform"
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle, rgba(255,255,255,${opacity * 0.55}), rgba(255,255,255,0.02))`,
              border: `1px solid rgba(255,255,255,${opacity * 0.4})`,
              boxShadow: isClose ? `0 0 26px rgba(74,222,128,0.28)` : "none",
            }}
          >
            {pct > 0.05 && (
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: `1px solid rgba(255,255,255,${opacity * 0.3})` }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.15, 0.55] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span className="font-['Bai_Jamjuree'] tabular-nums text-[11px] font-semibold text-white/95 leading-none">
              {Math.round(pct * 100)}
            </span>
          </button>
        );
      })}
      {goals.length < 6 && (
        <button
          type="button"
          onClick={onAdd}
          className="absolute bottom-[10px] right-[12px] h-[26px] px-[10px] rounded-full font-['Geist'] text-[10px] font-semibold uppercase tracking-[1px] text-white/55 active:text-white"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          + meta
        </button>
      )}
    </div>
  );
}

function FlightCard({ project, onTap }: { project: Project; onTap: () => void }) {
  const pct = Math.min(100, Math.max(0, project.progress));
  const daysLeft = project.dueDate
    ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000)
    : null;
  const dueColor =
    daysLeft === null
      ? "rgba(255,255,255,0.4)"
      : daysLeft < 0
        ? "#F87171"
        : daysLeft <= 3
          ? "#F5B944"
          : "rgba(255,255,255,0.55)";
  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full rounded-[20px] p-[18px] text-left flex flex-col gap-[14px] active:opacity-90"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex-1 min-w-0">
          <h4 className="font-['Bai_Jamjuree'] font-semibold text-[15px] text-white/95 truncate">
            {project.name}
          </h4>
          {project.description && (
            <p className="font-['Geist'] text-[11.5px] text-white/50 mt-[2px] line-clamp-1">
              {project.description}
            </p>
          )}
        </div>
        <span
          className="font-['Bai_Jamjuree'] tabular-nums text-[11px] font-semibold shrink-0"
          style={{ color: dueColor }}
        >
          {daysLeft === null
            ? "—"
            : daysLeft < 0
              ? `${-daysLeft}d atraso`
              : daysLeft === 0
                ? "hoy"
                : `${daysLeft}d`}
        </span>
      </div>
      <div
        className="relative h-[3px] w-full rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: pct >= 100 ? "#4ADE80" : "#FFFFFF" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 18 }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-[8px] w-[8px] rounded-full"
          style={{ background: "#FFFFFF", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }}
          initial={{ left: 0 }}
          animate={{ left: `calc(${pct}% - 4px)` }}
          transition={{ type: "spring", stiffness: 50, damping: 18 }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[1.1px] text-white/40">
          {PROJECT_STATUS[project.status].label}
        </span>
        <span className="font-['Bai_Jamjuree'] tabular-nums text-[12px] font-semibold text-white/85">
          {pct}%
        </span>
      </div>
    </button>
  );
}

export default function MeScreen({ onClose }: { onClose?: () => void }) {
  const [learnOpen, setLearnOpen] = useState(false);
  const [view, setView] = useState<View>("hub");

  const [taskSheet, setTaskSheet] = useState<{ open: boolean; initial?: Todo }>({ open: false });
  const [eventSheet, setEventSheet] = useState<{ open: boolean; date: string }>({
    open: false,
    date: todayISO(),
  });
  const [projectSheet, setProjectSheet] = useState<{ open: boolean; initial?: Project }>({ open: false });
  const [goalSheet, setGoalSheet] = useState<{ open: boolean; initial?: Goal }>({ open: false });
  const [weekSheet, setWeekSheet] = useState<{ open: boolean; week?: WeekBucket }>({ open: false });
  const [centerIdx, setCenterIdx] = useState(0);
  const [whisperIdx, setWhisperIdx] = useState(0);

  const {
    name,
    todos,
    goals,
    projects,
    events,
    todayDone,
    addTodo,
    updateTodo,
    toggleTodo,
    addEvent,
    addProject,
    updateProject,
    addGoal,
    updateGoal,
  } = useMe();

  const finance = useFinance();
  const inventory = useInventory();

  const today = todayISO();
  const todaysEvents = useMemo(() => events.filter((e) => e.date === today), [events, today]);
  const todaysTasks = useMemo(
    () => todos.filter((t) => t.due === "Hoy" || t.due === today),
    [todos, today],
  );

  const pending = todos.filter((t) => !t.done).length;

  const dateLabel = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* --- Pulse: rings + rotating center readings ---------------- */
  const priorityGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return [...goals]
      .filter((g) => g.target > 0)
      .sort((a, b) => b.current / b.target - a.current / a.target)[0] ?? goals[0];
  }, [goals]);
  const goalPct = priorityGoal && priorityGoal.target > 0
    ? Math.min(1, priorityGoal.current / priorityGoal.target)
    : 0;
  const dayPct = todaysTasks.length === 0 ? 0 : todayDone / todaysTasks.length;

  const yesterdayIncome = finance.last7Days?.[finance.last7Days.length - 2]?.income ?? 0;
  const deltaPct = yesterdayIncome > 0
    ? Math.round(((finance.todayIncome - yesterdayIncome) / yesterdayIncome) * 100)
    : 0;

  type Center = { label: string; value: string; delta?: { v: string; pos: boolean } };
  const centers: Center[] = useMemo(() => {
    const arr: Center[] = [];
    arr.push({
      label: "Ventas hoy",
      value: `S/ ${Math.round(finance.todayIncome).toLocaleString("es-PE")}`,
      delta: deltaPct !== 0
        ? { v: `${deltaPct > 0 ? "+" : ""}${deltaPct}% vs ayer`, pos: deltaPct >= 0 }
        : undefined,
    });
    if (priorityGoal) {
      arr.push({
        label: priorityGoal.label,
        value: `${Math.round(goalPct * 100)}%`,
        delta: { v: `de S/ ${priorityGoal.target.toLocaleString("es-PE")}`, pos: goalPct >= 0.5 },
      });
    }
    if ((inventory.lowStock?.length ?? 0) > 0) {
      arr.push({
        label: "Stock crítico",
        value: `${inventory.lowStock.length}`,
        delta: { v: "productos por reponer", pos: false },
      });
    } else {
      arr.push({
        label: "Tareas hoy",
        value: `${todayDone}/${todaysTasks.length}`,
        delta: undefined,
      });
    }
    return arr.slice(0, 3);
  }, [
    finance.todayIncome, deltaPct, priorityGoal, goalPct,
    inventory.lowStock, todayDone, todaysTasks.length,
  ]);

  useEffect(() => {
    if (centers.length <= 1) return;
    const id = setInterval(() => setCenterIdx((i) => (i + 1) % centers.length), 5000);
    return () => clearInterval(id);
  }, [centers.length]);
  const currentCenter = centers[Math.min(centerIdx, centers.length - 1)] ?? centers[0];

  /* --- socIA Whispers ---------------------------------------- */
  const whispers: Whisper[] = useMemo(() => {
    const out: Whisper[] = [];
    const closeGoal = goals.find(
      (g) => g.target > 0 && g.current / g.target >= 0.75 && g.current < g.target,
    );
    if (closeGoal) {
      out.push({
        id: "w-goal",
        chip: "meta cerca",
        tone: "good",
        text: `Vas ${Math.round((closeGoal.current / closeGoal.target) * 100)}% en "${closeGoal.label}". Un empujón y la cierras.`,
        action: "ver",
        onAct: () => setGoalSheet({ open: true, initial: closeGoal }),
      });
    }
    if (inventory.lowStock?.length) {
      const p = inventory.lowStock[0];
      out.push({
        id: "w-stock",
        chip: "stock bajo",
        tone: "warn",
        text: `${p.name} quedó en ${p.stock} unidades. Repón antes de perder ventas.`,
        action: "reponer",
        onAct: () =>
          addTodo({
            title: `Reponer ${p.name}`,
            priority: "high",
            due: today,
          }),
      });
    }
    if (finance.fiadosOverdue > 0) {
      out.push({
        id: "w-debt",
        chip: "por cobrar",
        tone: "urgent",
        text: `Tienes ${finance.fiadosOverdue} fiado${finance.fiadosOverdue > 1 ? "s" : ""} vencido${finance.fiadosOverdue > 1 ? "s" : ""}. Cobra hoy y ordena la caja.`,
      });
    }
    const overdue = todos.find(
      (t) => !t.done && t.due && isISODate(t.due) && t.due < today,
    );
    if (overdue) {
      out.push({
        id: "w-task",
        chip: "vencida",
        tone: "urgent",
        text: `"${overdue.title}" quedó atrás. Ciérrala o repriorízala.`,
        action: "abrir",
        onAct: () => setTaskSheet({ open: true, initial: overdue }),
      });
    }
    if (
      finance.todayIncome > 0 &&
      yesterdayIncome > 0 &&
      finance.todayIncome > yesterdayIncome * 1.2
    ) {
      out.push({
        id: "w-sales",
        chip: "buen día",
        tone: "good",
        text: `Ventas hoy superan en ${Math.round((finance.todayIncome / yesterdayIncome - 1) * 100)}% las de ayer. Sostén el ritmo.`,
      });
    }
    if (out.length === 0) {
      out.push({
        id: "w-idle",
        chip: "socIA",
        tone: "info",
        text: "Todo bajo control. Aprovecha para pensar en la siguiente meta o cerrar algo del pipeline.",
      });
    }
    return out;
  }, [goals, inventory.lowStock, finance.fiadosOverdue, finance.todayIncome, yesterdayIncome, todos, today, addTodo]);

  useEffect(() => {
    if (whispers.length <= 1) return;
    const id = setInterval(() => setWhisperIdx((i) => (i + 1) % whispers.length), 6000);
    return () => clearInterval(id);
  }, [whispers.length]);
  // NOTE: whisperIdx is used by the ambient header line only.
  const ambientLine = whispers[whisperIdx % whispers.length]?.text ?? "";

  /* --- Horizonte: 8 semanas ---------------------------------- */
  const weeks: WeekBucket[] = useMemo(() => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 8 }, (_, i) => {
      const start = new Date(monday);
      start.setDate(start.getDate() + i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const startIso = start.toISOString().slice(0, 10);
      const endIso = end.toISOString().slice(0, 10);
      const inRange = (iso?: string) =>
        !!iso && isISODate(iso) && iso >= startIso && iso < endIso;
      const wt = todos.filter((t) => inRange(t.due));
      const we = events.filter((e) => inRange(e.date));
      const wp = projects.filter((p) => inRange(p.dueDate));
      const markers: { color: string; kind: string }[] = [];
      if (wt.some((t) => t.priority === "urgent")) markers.push({ color: "#F87171", kind: "u" });
      if (wp.length) markers.push({ color: "#F5B944", kind: "p" });
      if (we.length) markers.push({ color: "#FFFFFF", kind: "e" });
      const label = start
        .toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
        .replace(".", "");
      return {
        start,
        label,
        count: wt.length + we.length + wp.length,
        done: wt.filter((t) => t.done).length,
        markers,
      };
    });
  }, [todos, events, projects]);

  /* --- Focus Orb --------------------------------------------- */
  type FocusPick = {
    title: string;
    context: string;
    tone: "urgent" | "focus" | "calm";
    task?: Todo;
    event?: CalendarEvent;
  };
  const focus: FocusPick = useMemo(() => {
    const overdueP0 = todos.find(
      (t) => !t.done && t.priority === "urgent" && t.due && isISODate(t.due) && t.due < today,
    );
    if (overdueP0)
      return {
        title: overdueP0.title,
        context: "Tarea urgente vencida. Ciérrala antes de que cargue el día.",
        tone: "urgent",
        task: overdueP0,
      };
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const soonEvent = todaysEvents
      .filter((e) => e.start)
      .map((e) => {
        const [h, m] = e.start!.split(":").map(Number);
        return { e, diff: h * 60 + m - nowMin };
      })
      .filter((x) => x.diff >= -30 && x.diff <= 120)
      .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0];
    if (soonEvent)
      return {
        title: soonEvent.e.title,
        context: `Evento hoy a las ${soonEvent.e.start}${soonEvent.e.place ? ` · ${soonEvent.e.place}` : ""}. Prepara lo necesario con tiempo.`,
        tone: "focus",
        event: soonEvent.e,
      };
    const p0 = todos.find(
      (t) => !t.done && t.priority === "urgent" && (t.due === "Hoy" || t.due === today),
    );
    if (p0)
      return {
        title: p0.title,
        context: "Prioridad máxima del día. Bloquea 25 min y ciérrala primero.",
        tone: "urgent",
        task: p0,
      };
    const p1 = todos.find(
      (t) => !t.done && t.priority === "high" && (t.due === "Hoy" || t.due === today || !t.due),
    );
    if (p1)
      return {
        title: p1.title,
        context: "Es lo que más mueve tu día. Ataca antes del mediodía.",
        tone: "focus",
        task: p1,
      };
    if (inventory.lowStock?.length) {
      const p = inventory.lowStock[0];
      return {
        title: `Repón ${p.name}`,
        context: "Está a punto de agotarse. Sin stock, no hay ventas.",
        tone: "focus",
      };
    }
    if (finance.fiadosOverdue > 0)
      return {
        title: "Cobra los fiados vencidos",
        context: "La caja se ordena cuando cobras a tiempo. Empieza por el más antiguo.",
        tone: "focus",
      };
    return {
      title: "Vas bien. Todo despejado.",
      context: "No hay urgencias. Descansa o adelanta algo para mañana.",
      tone: "calm",
    };
  }, [todos, todaysEvents, today, inventory.lowStock, finance.fiadosOverdue]);

  if (view === "priorities") return <PrioritiesView onBack={() => setView("hub")} />;
  if (view === "calendar") return <CalendarView onBack={() => setView("hub")} />;
  if (view === "projects") return <ProjectsView onBack={() => setView("hub")} />;
  if (view === "goals") return <GoalsView onBack={() => setView("hub")} />;
  if (view === "recos") return <RecosView onBack={() => setView("hub")} goTo={setView} />;
  if (view === "learn" || learnOpen) {
    return <LearnView onBack={() => { setView("hub"); setLearnOpen(false); }} />;
  }

  const salesToday = Math.round(finance.todayIncome ?? 0);
  const lowStockCount = inventory.lowStock?.length ?? 0;
  const fiadosOverdueCount = finance.fiadosOverdue ?? 0;
  const alertsCount = lowStockCount + fiadosOverdueCount;
  const nextEventLabel = todaysEvents.length > 0
    ? `${todaysEvents.length} evento${todaysEvents.length > 1 ? "s" : ""} hoy`
    : "Sin eventos hoy";
  const projectsMeta = projects.length
    ? `${projects.length} activo${projects.length > 1 ? "s" : ""}`
    : "Sin proyectos";
  const goalsMeta = goals.length
    ? `${goals.length} activa${goals.length > 1 ? "s" : ""}`
    : "Sin metas";
  const recosMeta = pending > 0 || alertsCount > 0
    ? "Insights del día"
    : "Sin novedades";

  const prioritiesMeta = pending > 0
    ? `${pending} pendiente${pending > 1 ? "s" : ""}`
    : todaysTasks.length > 0
    ? "Todo cerrado hoy"
    : "Aún sin tareas";
  const prioritiesSpan: 1 | 2 = pending > 0 ? 2 : 1;

  return (
    <div className="relative w-full min-h-[100dvh] bg-black overflow-hidden">
      {/* Aurora sutil solo en bordes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[240px] z-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 40%, rgba(0,0,0,0) 78%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] z-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 100%, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0.04) 45%, rgba(0,0,0,0) 82%)",
        }}
      />

      {onClose && (
        <div className="absolute top-[22px] right-[20px] z-20">
          <button
            type="button"
            onClick={onClose}
            className="h-[36px] w-[36px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
          >
            <X className="h-[16px] w-[16px] text-white/55" strokeWidth={1.6} />
          </button>
        </div>
      )}

      <div className="relative z-10 pb-[180px]">
        {/* Header simple */}
        <div className="px-[20px] pt-[64px] pb-[6px]">
          <span className="font-['Geist'] text-[10.5px] font-semibold uppercase tracking-[1.6px] text-white/35">
            {dateLabel}
          </span>
          <h1 className="mt-[6px] font-['Bai_Jamjuree'] font-semibold text-[26px] leading-[30px] text-white tracking-[-0.5px]">
            Hola, {name}
          </h1>
        </div>

        {/* Estado del negocio hoy */}
        <div className="px-[20px] mt-[22px]">
          <TodayStatus
            name={name}
            tasksDone={todayDone}
            tasksTotal={todaysTasks.length}
            salesToday={salesToday}
            alerts={alertsCount}
            lowStock={lowStockCount}
            fiadosOverdue={fiadosOverdueCount}

          />
        </div>

        {/* Bento grid — acceso directo */}
        <div className="px-[20px] mt-[22px]">
          <div
            className="grid grid-cols-2 gap-[12px]"
            style={{ gridAutoFlow: "dense" }}
          >
            <BentoTile
              Icon={ListChecks}
              label="Prioridades"
              meta={prioritiesMeta}
              accent="#F87171"
              span={prioritiesSpan}
              onClick={() => setView("priorities")}
            />
            <BentoTile
              Icon={CalendarIcon}
              label="Calendario"
              meta={nextEventLabel}
              accent="#60A5FA"
              onClick={() => setView("calendar")}
            />
            <BentoTile
              Icon={FolderKanban}
              label="Proyectos"
              meta={projectsMeta}
              accent="#A78BFA"
              onClick={() => setView("projects")}
            />
            <BentoTile
              Icon={Target}
              label="Metas"
              meta={goalsMeta}
              accent="#34D399"
              onClick={() => setView("goals")}
            />
            <BentoTile
              Icon={GraduationCap}
              label="Aprender"
              meta="Rutas cortas de IA"
              accent="#F59E0B"
              onClick={() => setView("learn")}
            />
            <BentoTile
              Icon={BrainCircuit}
              label="Recomendaciones IA"
              meta={recosMeta}
              accent="#3B82F6"
              onClick={() => setView("recos")}
            />
          </div>
        </div>

        <div className="mt-[28px] px-[20px]">
          <FooterMark>Tu negocio crece contigo</FooterMark>
        </div>
      </div>





      {/* Sheets */}
      <TaskSheet
        open={taskSheet.open}
        initial={taskSheet.initial}
        projects={projects}
        goals={goals}
        onClose={() => setTaskSheet({ open: false })}
        onSave={(patch) => {
          if (taskSheet.initial) {
            updateTodo(taskSheet.initial.id, patch);
          } else {
            addTodo({
              title: patch.title ?? "Nueva tarea",
              description: patch.description,
              priority: patch.priority ?? "normal",
              due: patch.due,
              time: patch.time,
              tag: patch.tag,
              projectId: patch.projectId,
              goalId: patch.goalId,
            });
          }
          setTaskSheet({ open: false });
        }}
      />

      <EventSheet
        open={eventSheet.open}
        defaultDate={eventSheet.date}
        onClose={() => setEventSheet({ open: false, date: today })}
        onSave={(e) => {
          addEvent(e);
          setEventSheet({ open: false, date: today });
        }}
      />

      <ProjectSheet
        open={projectSheet.open}
        initial={projectSheet.initial}
        goals={goals}
        onClose={() => setProjectSheet({ open: false })}
        onSave={(patch) => {
          if (projectSheet.initial) {
            updateProject(projectSheet.initial.id, patch);
          } else {
            addProject({
              name: patch.name ?? "Nuevo entregable",
              description: patch.description,
              owner: patch.owner,
              startDate: patch.startDate,
              dueDate: patch.dueDate,
              priority: patch.priority ?? "normal",
              status: patch.status,
              progress: patch.progress,
              goalId: patch.goalId,
              notes: patch.notes,
            });
          }
          setProjectSheet({ open: false });
        }}
      />

      <GoalSheet
        open={goalSheet.open}
        initial={goalSheet.initial}
        onClose={() => setGoalSheet({ open: false })}
        onSave={(patch) => {
          if (goalSheet.initial) {
            updateGoal(goalSheet.initial.id, patch);
          } else {
            addGoal({
              label: patch.label ?? "Nueva meta",
              description: patch.description,
              target: patch.target ?? 0,
              unit: patch.unit ?? "S/",
              category: patch.category,
              due: patch.due,
            });
          }
          setGoalSheet({ open: false });
        }}
      />
    </div>
  );
}
