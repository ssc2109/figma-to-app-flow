import { useState } from "react";
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
} from "lucide-react";
import { useMe, type Todo, type Lesson } from "@/data/me";
import {
  PageHeader,
  SectionLabel,
  ListGroup,
  PlainRow,
  RowDivider,
  SubHeader,
  SubScreen,
  FooterMark,
  Eyebrow,
} from "./business/shared";

type View = "hub" | "learn" | "routine" | "goals" | "todos";

const PRIO: Record<Todo["priority"], { color: string; label: string }> = {
  urgent: { color: "#F87171", label: "Urgente" },
  high: { color: "#FACC15", label: "Alta" },
  normal: { color: "rgba(255,255,255,0.55)", label: "Normal" },
  low: { color: "rgba(255,255,255,0.30)", label: "Baja" },
};

/* ---------- the one hero: streak ---------- */
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

/* ---------- todo row ---------- */
function TodoRow({ t, onToggle, last }: { t: Todo; onToggle: () => void; last?: boolean }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-[14px] px-[16px] py-[13px] text-left active:bg-white/[0.025] transition-colors"
      >
        <span className="shrink-0">
          {t.done ? (
            <CheckCircle2 className="h-[18px] w-[18px] text-white/55" strokeWidth={1.8} />
          ) : (
            <Circle
              className="h-[18px] w-[18px]"
              strokeWidth={1.6}
              style={{ color: PRIO[t.priority].color }}
            />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className={`font-['Geist'] text-[14.5px] leading-[1.3] truncate ${
              t.done ? "text-white/35 line-through" : "text-white"
            }`}
          >
            {t.title}
          </div>
          {t.tag && !t.done && (
            <div className="mt-[2px] font-['Geist'] text-[11.5px] text-white/40">{t.tag}</div>
          )}
        </div>
      </button>
      {!last && <div className="h-px bg-white/[0.05] ml-[48px]" />}
    </>
  );
}

/* ---------- sub views ---------- */
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
          <div className={`font-['Geist'] text-[14.5px] truncate ${done ? "text-white/45" : "text-white"}`}>
            {l.title}
          </div>
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
        {units.map((u) => {
          const arr = lessons.filter((l) => l.unit === u);
          return (
            <div key={u}>
              <SectionLabel>{u}</SectionLabel>
              <ListGroup>
                {arr.map((l, i) => (
                  <LessonNode
                    key={l.id}
                    l={l}
                    onComplete={() => completeLesson(l.id)}
                    last={i === arr.length - 1}
                  />
                ))}
              </ListGroup>
            </div>
          );
        })}
      </div>
    </SubScreen>
  );
}

function RoutineView({ onBack }: { onBack: () => void }) {
  const { routine, toggleRoutine } = useMe();
  return (
    <SubScreen>
      <SubHeader eyebrow="Hábitos del día" title="Rutina" onBack={onBack} />
      <div className="px-[20px] pt-[8px]">
        <ListGroup>
          {routine.map((r, i) => (
            <div key={r.id}>
              <button
                type="button"
                onClick={() => toggleRoutine(r.id)}
                className="w-full flex items-center gap-[14px] px-[16px] py-[14px] text-left active:bg-white/[0.025] transition-colors"
              >
                {r.done ? (
                  <CheckCircle2 className="h-[18px] w-[18px] text-white/55 shrink-0" strokeWidth={1.8} />
                ) : (
                  <Circle className="h-[18px] w-[18px] text-white/30 shrink-0" strokeWidth={1.6} />
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-['Geist'] text-[14.5px] ${
                      r.done ? "text-white/40 line-through" : "text-white"
                    }`}
                  >
                    {r.label}
                  </div>
                  {r.hint && !r.done && (
                    <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">{r.hint}</div>
                  )}
                </div>
              </button>
              {i < routine.length - 1 && <div className="h-px bg-white/[0.05] ml-[48px]" />}
            </div>
          ))}
        </ListGroup>
      </div>
    </SubScreen>
  );
}

function GoalsView({ onBack }: { onBack: () => void }) {
  const { goals } = useMe();
  return (
    <SubScreen>
      <SubHeader eyebrow="Hacia dónde vas" title="Metas" onBack={onBack} />
      <div className="px-[20px] pt-[10px] flex flex-col gap-[26px]">
        {goals.map((g) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          return (
            <div key={g.id} className="px-[6px]">
              <div className="flex items-baseline justify-between">
                <span className="font-['Geist'] text-[14.5px] text-white">{g.label}</span>
                <span className="font-['Bai_Jamjuree'] text-[13.5px] font-semibold text-white tabular-nums">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-[10px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-white"
                />
              </div>
              <div className="mt-[8px] font-['Geist'] text-[11.5px] text-white/40 tabular-nums">
                {g.unit === "S/" ? "S/ " : ""}
                {g.current.toLocaleString()}
                {g.unit === "%" ? "%" : g.unit === "u" ? " días" : ""}
                <span className="mx-[6px] text-white/20">/</span>
                {g.unit === "S/" ? "S/ " : ""}
                {g.target.toLocaleString()}
                {g.unit === "%" ? "%" : g.unit === "u" ? " días" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </SubScreen>
  );
}

function TodosView({ onBack }: { onBack: () => void }) {
  const { todos, toggleTodo, addTodo } = useMe();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [prio, setPrio] = useState<Todo["priority"]>("normal");

  const groups: { label: string; key: string }[] = [
    { label: "Hoy", key: "Hoy" },
    { label: "Mañana", key: "Mañana" },
  ];

  const submit = () => {
    if (!text.trim()) return;
    addTodo({ title: text.trim(), priority: prio, due: "Hoy" });
    setText("");
    setPrio("normal");
    setAdding(false);
  };

  return (
    <SubScreen>
      <SubHeader
        eyebrow="Lo que tienes que cuidar"
        title="Tareas"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95"
            aria-label="Añadir tarea"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </button>
        }
      />
      <div className="px-[20px] pt-[8px] flex flex-col gap-[28px]">
        {adding && (
          <div
            className="rounded-[18px] p-[14px] flex flex-col gap-[12px]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              autoFocus
              placeholder="Una tarea concreta…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full h-[36px] bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/30"
            />
            <div className="flex items-center gap-[6px] flex-wrap">
              {(["urgent", "high", "normal", "low"] as Todo["priority"][]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrio(p)}
                  className="h-[26px] px-[10px] rounded-full font-['Geist'] text-[11.5px] font-medium transition-colors"
                  style={{
                    background: prio === p ? "rgba(255,255,255,0.10)" : "transparent",
                    border: `1px solid ${prio === p ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`,
                    color: PRIO[p].color,
                  }}
                >
                  {PRIO[p].label}
                </button>
              ))}
              <button
                type="button"
                onClick={submit}
                className="ml-auto h-[30px] px-[14px] rounded-full bg-white text-black font-['Geist'] text-[12px] font-semibold active:scale-95"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
        {groups.map((g) => {
          const items = todos.filter((t) => t.due === g.key);
          if (items.length === 0) return null;
          return (
            <div key={g.key}>
              <SectionLabel>{g.label}</SectionLabel>
              <ListGroup>
                {items.map((t, i) => (
                  <TodoRow key={t.id} t={t} onToggle={() => toggleTodo(t.id)} last={i === items.length - 1} />
                ))}
              </ListGroup>
            </div>
          );
        })}
      </div>
    </SubScreen>
  );
}

/* ---------- screen ---------- */
export default function MeScreen({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<View>("hub");
  const { name, streak, todayDone, todayTotal, lessons, goals, routine } = useMe();
  const back = () => setView("hub");

  const currentLesson = lessons.find((l) => l.status === "actual") ?? lessons[0];
  const routineDone = routine.filter((r) => r.done).length;
  const topGoal = goals[0];

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

            <PageHeader eyebrow="Tú" title={`Hola, ${name}`} />

            <div className="px-[20px] pt-[20px]">
              <StreakHero streak={streak} />
            </div>

            <div className="mt-[40px] px-[20px]">
              <SectionLabel>Hoy</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={ListChecks}
                  label="Tareas"
                  meta={`${todayDone} de ${todayTotal} hecho`}
                  onClick={() => setView("todos")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Sun}
                  label="Rutina diaria"
                  meta={`${routineDone} de ${routine.length}`}
                  onClick={() => setView("routine")}
                />
              </ListGroup>
            </div>

            <div className="mt-[28px] px-[20px]">
              <SectionLabel>Crece</SectionLabel>
              <ListGroup>
                <PlainRow
                  Icon={BookOpen}
                  label="Aprender"
                  meta={currentLesson?.title ?? "—"}
                  onClick={() => setView("learn")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Target}
                  label="Metas"
                  meta={topGoal?.label ?? "—"}
                  onClick={() => setView("goals")}
                />
              </ListGroup>
            </div>

            <FooterMark>Tu negocio crece contigo</FooterMark>
          </motion.div>
        )}

        {view === "learn" && <LearnView key="lv" onBack={back} />}
        {view === "routine" && <RoutineView key="rv" onBack={back} />}
        {view === "goals" && <GoalsView key="gv" onBack={back} />}
        {view === "todos" && <TodosView key="tv" onBack={back} />}
      </AnimatePresence>
    </div>
  );
}
