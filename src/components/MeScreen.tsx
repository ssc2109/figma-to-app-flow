import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
} from "lucide-react";
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

type View =
  | "hub"
  | "priorities"
  | "calendar"
  | "routine"
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
function StreakHero({ streak }: { streak: number }) {
  return (
    <div className="flex flex-col items-center text-center py-[10px]">
      <span className="font-['Geist'] text-[11.5px] font-medium uppercase tracking-[1.8px] text-white/35">
        Racha
      </span>
      <div className="mt-[12px] flex items-baseline gap-[10px]">
        <span className="font-['Bai_Jamjuree'] text-[80px] font-bold text-white tracking-[-3px] tabular-nums leading-none">
          {streak}
        </span>
        <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/45 tracking-[-0.5px]">
          días
        </span>
      </div>
      <p className="mt-[14px] font-['Geist'] text-[13.5px] text-white/45 leading-[1.5] max-w-[280px]">
        Sigue abriendo todos los días.
      </p>
    </div>
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[16px]" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[22px]"
        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between px-[18px] pt-[16px] pb-[10px]">
          <span className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white">{title}</span>
          <button type="button" onClick={onClose} className="h-[30px] w-[30px] rounded-full flex items-center justify-center active:bg-white/[0.06]">
            <X className="h-[15px] w-[15px] text-white/60" strokeWidth={1.6} />
          </button>
        </div>
        <div className="px-[18px] pb-[14px] flex flex-col gap-[12px]">{children}</div>
        {footer && (
          <div className="px-[18px] pb-[18px] pt-[8px] flex items-center justify-end gap-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
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
      className="w-full min-h-[68px] px-[12px] py-[10px] rounded-[10px] bg-white/[0.04] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    />
  );
}

function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="h-[36px] px-[16px] rounded-full bg-white text-black font-['Geist'] text-[13px] font-semibold active:scale-95 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="h-[36px] px-[14px] rounded-full font-['Geist'] text-[13px] text-white/75 active:bg-white/[0.05]"
      style={{ border: "1px solid rgba(255,255,255,0.10)" }}
    >
      {children}
    </button>
  );
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
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

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

      <div className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
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
                        {[t.due, t.time, t.tag].filter(Boolean).join(" · ")}
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

        <div className="mt-[8px] rounded-[16px] p-[14px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/40">Resumen del día</div>
          <div className="mt-[8px] flex items-baseline justify-between">
            <span className="font-['Bai_Jamjuree'] text-[28px] font-semibold text-white tabular-nums">{pct}%</span>
            <span className="font-['Geist'] text-[12.5px] text-white/45 tabular-nums">
              {done} de {total} completadas
            </span>
          </div>
          <div className="mt-[10px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

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
  const [due, setDue] = useState(initial?.due ?? "Hoy");
  const [time, setTime] = useState(initial?.time ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");

  // reset when initial changes
  useEffect(() => {
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(initial?.priority ?? "normal");
    setDue(initial?.due ?? "Hoy");
    setTime(initial?.time ?? "");
    setTag(initial?.tag ?? "");
    setProjectId(initial?.projectId ?? "");
    setGoalId(initial?.goalId ?? "");
  }, [initial]);

  const submit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, priority, due, time, tag, projectId: projectId || undefined, goalId: goalId || undefined });
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
            Guardar
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
      <div className="grid grid-cols-2 gap-[10px]">
        <Field label="Fecha">
          <TextInput value={due} onChange={(e) => setDue(e.target.value)} placeholder="Hoy" />
        </Field>
        <Field label="Hora">
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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

      <div className="px-[20px] pt-[6px] flex flex-col gap-[18px]">
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
      </div>

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
    setDate(defaultDate);
  }, [defaultDate]);

  const submit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), date, start: start || undefined, end: end || undefined, place: place || undefined, description });
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
            Guardar
          </PrimaryButton>
        </>
      }
    >
      <Field label="Título">
        <TextInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reunión con proveedor" />
      </Field>
      <Field label="Fecha">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-[10px]">
        <Field label="Inicio">
          <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="Fin">
          <TextInput type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
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

      <div className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
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
            <div className="flex items-center gap-[8px]">
              <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <PrimaryButton onClick={submit}>Guardar</PrimaryButton>
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
      </div>
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

      <div className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
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
                <div className="mt-[12px]">
                  <div className="flex items-center justify-between font-['Geist'] text-[11.5px] text-white/45 tabular-nums mb-[6px]">
                    <span>Progreso</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: isLate ? "#F87171" : "white" }} />
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
      </div>

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
  const [progress, setProgress] = useState<number>(initial?.progress ?? 0);
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setOwner(initial?.owner ?? "");
    setDueDate(initial?.dueDate ?? "");
    setStatus(initial?.status ?? "planning");
    setPriority(initial?.priority ?? "normal");
    setProgress(initial?.progress ?? 0);
    setGoalId(initial?.goalId ?? "");
  }, [initial]);

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description,
      owner,
      dueDate: dueDate || undefined,
      status,
      priority,
      progress: Math.max(0, Math.min(100, progress)),
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
            Guardar
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
      <div className="grid grid-cols-2 gap-[10px]">
        <Field label="Responsable">
          <TextInput value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Field>
        <Field label="Fecha límite">
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
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
      <Field label={`Progreso: ${progress}%`}>
        <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-white" />
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

      <div className="px-[20px] pt-[10px] flex flex-col gap-[22px]">
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
      </div>

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
    setLabel(initial?.label ?? "");
    setDescription(initial?.description ?? "");
    setTarget(initial?.target ?? 100);
    setUnit(initial?.unit ?? "u");
    setCategory(initial?.category);
    setDue(initial?.due ?? "");
  }, [initial]);

  const cats: Goal["category"][] = ["Ventas", "Marketing", "Finanzas", "Clientes", "Operaciones", "Personal"];

  const submit = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), description, target, unit, category, due: due || undefined });
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
            Guardar
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
        <TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} />
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

function LearnView({ onBack }: { onBack: () => void }) {
  const { lessons, completeLesson } = useMe();
  const units = Array.from(new Set(lessons.map((l) => l.unit)));
  return (
    <SubScreen>
      <SubHeader eyebrow="5 min al día" title="Aprender" onBack={onBack} />
      <div className="px-[20px] pt-[8px] flex flex-col gap-[28px]">
        {units.length === 0 ? (
          <div className="py-[40px] text-center font-['Geist'] text-[13px] text-white/40">
            Los cursos aparecerán aquí muy pronto.
          </div>
        ) : (
          units.map((u) => {
            const arr = lessons.filter((l) => l.unit === u);
            return (
              <div key={u}>
                <SectionLabel>{u}</SectionLabel>
                <ListGroup>
                  {arr.map((l, i) => (
                    <LessonNode key={l.id} l={l} onComplete={() => completeLesson(l.id)} last={i === arr.length - 1} />
                  ))}
                </ListGroup>
              </div>
            );
          })
        )}
      </div>
    </SubScreen>
  );
}

/* ============ RECOMENDACIONES ============ */
function RecosView({ onBack, goTo }: { onBack: () => void; goTo: (v: View) => void }) {
  const { recommendations, dismissRecommendation, todos, projects, goals, routine } = useMe();

  const totalTasks = todos.length;
  const doneTasks = todos.filter((t) => t.done).length;
  const productivity = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const routineDone = routine.filter((r) => r.done).length;
  const activeGoals = goals.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning").length;
  const lateProjects = projects.filter((p) => p.status === "late").length;

  const levelStyle: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
    info: { bg: "rgba(74,222,128,0.10)", icon: <Info className="h-[14px] w-[14px] text-[#4ADE80]" strokeWidth={1.8} />, label: "Informativo" },
    warn: { bg: "rgba(250,204,21,0.10)", icon: <Flame className="h-[14px] w-[14px] text-[#FACC15]" strokeWidth={1.8} />, label: "Atención" },
    urgent: { bg: "rgba(248,113,113,0.10)", icon: <AlertTriangle className="h-[14px] w-[14px] text-[#F87171]" strokeWidth={1.8} />, label: "Urgente" },
  };

  return (
    <SubScreen>
      <SubHeader eyebrow="Trax IA" title="Recomendaciones" onBack={onBack} />

      <div className="px-[20px] pt-[6px] flex flex-col gap-[16px]">
        <div className="rounded-[18px] p-[16px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/40">Resumen del día</div>
          <div className="mt-[10px] grid grid-cols-2 gap-[12px]">
            <Stat label="Productividad" value={`${productivity}%`} />
            <Stat label="Tareas" value={`${doneTasks}/${totalTasks}`} />
            <Stat label="Rutina" value={`${routineDone}/${routine.length || 0}`} />
            <Stat label="Metas" value={`${activeGoals}`} />
            <Stat label="Proyectos" value={`${activeProjects}`} />
            <Stat label="En riesgo" value={`${lateProjects}`} highlight={lateProjects > 0} />
          </div>
        </div>

        <SectionLabel>Recomendaciones</SectionLabel>
        {recommendations.length === 0 ? (
          <div className="py-[32px] text-center font-['Geist'] text-[13px] text-white/40">
            Cuando registres actividad, la IA te sugerirá acciones aquí.
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {recommendations.map((r) => {
              const s = levelStyle[r.level];
              return (
                <div key={r.id} className="rounded-[16px] p-[14px]" style={{ background: s.bg, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-[8px]">
                    {s.icon}
                    <span className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/50">{s.label}</span>
                  </div>
                  <div className="mt-[6px] font-['Geist'] text-[14.5px] text-white leading-[1.35]">{r.title}</div>
                  {r.body && <div className="mt-[4px] font-['Geist'] text-[12.5px] text-white/55 leading-[1.4]">{r.body}</div>}
                  <div className="mt-[10px] flex flex-wrap gap-[6px]">
                    {r.taskId && (
                      <GhostButton onClick={() => goTo("priorities")}>Ver tareas</GhostButton>
                    )}
                    {r.projectId && (
                      <GhostButton onClick={() => goTo("projects")}>Ver proyecto</GhostButton>
                    )}
                    {r.goalId && (
                      <GhostButton onClick={() => goTo("goals")}>Ver meta</GhostButton>
                    )}
                    <GhostButton onClick={() => dismissRecommendation(r.id)}>Descartar</GhostButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SubScreen>
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
export default function MeScreen({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<View>("hub");
  const {
    name,
    streak,
    todos,
    routine,
    goals,
    projects,
    recommendations,
    todayDone,
    todayTotal,
    highPriorityToday,
    nextEvent,
    activeProjects,
    lateProjects,
  } = useMe();
  const back = () => setView("hub");

  const routineDone = routine.filter((r) => r.done).length;
  const routinePct = routine.length > 0 ? Math.round((routineDone / routine.length) * 100) : 0;
  const pendingTasks = todos.filter((t) => !t.done).length;

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {onClose && (
              <div className="absolute top-[22px] right-[20px] z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[36px] w-[36px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
                >
                  <X className="h-[16px] w-[16px] text-white/55" strokeWidth={1.6} />
                </button>
              </div>
            )}

            <PageHeader eyebrow="Productividad" title={`Hola, ${name}`} />

            <div className="px-[20px] pt-[20px]">
              <StreakHero streak={streak} />
            </div>

            <div className="mt-[40px] px-[20px]">
              <SectionLabel>Hoy</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={ListChecks}
                  label="Prioridades"
                  meta={
                    todayTotal === 0
                      ? "Sin tareas todavía"
                      : `${pendingTasks} pendientes${highPriorityToday > 0 ? ` · ${highPriorityToday} de alta prioridad` : ""}`
                  }
                  onClick={() => setView("priorities")}
                />
                <RowDivider />
                <PlainRow
                  Icon={CalendarDays}
                  label="Calendario"
                  meta={
                    nextEvent
                      ? `Próximo: ${nextEvent.title}${nextEvent.start ? ` · ${nextEvent.start}` : ""}`
                      : "Sin eventos programados"
                  }
                  onClick={() => setView("calendar")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Sun}
                  label="Rutina diaria"
                  meta={routine.length === 0 ? "Sin hábitos configurados" : `${routinePct}% completada`}
                  onClick={() => setView("routine")}
                />
                <RowDivider />
                <PlainRow
                  Icon={FolderKanban}
                  label="Proyectos"
                  meta={
                    projects.length === 0
                      ? "Aún sin proyectos"
                      : `${activeProjects} activos${lateProjects > 0 ? ` · ${lateProjects} retrasado${lateProjects > 1 ? "s" : ""}` : ""}`
                  }
                  onClick={() => setView("projects")}
                />
              </ListGroup>
            </div>

            <div className="mt-[28px] px-[20px]">
              <SectionLabel>Crece</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={Target}
                  label="Metas"
                  meta={goals.length === 0 ? "Define tu primera meta" : `${goals.length} activa${goals.length > 1 ? "s" : ""}`}
                  onClick={() => setView("goals")}
                />
                <RowDivider />
                <PlainRow
                  Icon={BookOpen}
                  label="Aprender"
                  meta="Contenido para hacer crecer tu negocio"
                  onClick={() => setView("learn")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Sparkles}
                  label="Recomendaciones IA"
                  meta={
                    recommendations.length === 0
                      ? "Sin sugerencias por ahora"
                      : `${recommendations.length} sugerencia${recommendations.length > 1 ? "s" : ""} para ti`
                  }
                  onClick={() => setView("recos")}
                />
              </ListGroup>
            </div>

            <div className="mt-[24px] px-[20px] font-['Geist'] text-[11.5px] text-white/40 text-center">
              {todayDone} de {todayTotal} tareas completadas hoy
            </div>

            <FooterMark>Tu negocio crece contigo</FooterMark>
          </motion.div>
        )}

        {view === "priorities" && <PrioritiesView key="pv" onBack={back} />}
        {view === "calendar" && <CalendarView key="cv" onBack={back} />}
        {view === "routine" && <RoutineView key="rv" onBack={back} />}
        {view === "projects" && <ProjectsView key="prv" onBack={back} />}
        {view === "goals" && <GoalsView key="gv" onBack={back} />}
        {view === "learn" && <LearnView key="lv" onBack={back} />}
        {view === "recos" && <RecosView key="rec" onBack={back} goTo={setView} />}
      </AnimatePresence>
    </div>
  );
}
