import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  ChevronRight,
  BookOpen,
  Lock,
  Sun,
  Target,
  X,
  Sparkles,
} from "lucide-react";
import { useMe, type Todo, type Lesson } from "@/data/me";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./business/shared";

type View = "hub" | "learn" | "routine" | "goals" | "todos";

const PRIO: Record<Todo["priority"], { color: string; label: string }> = {
  urgent: { color: "#F87171", label: "Urgente" },
  high: { color: "#FACC15", label: "Alta" },
  normal: { color: "rgba(255,255,255,0.55)", label: "Normal" },
  low: { color: "rgba(255,255,255,0.30)", label: "Baja" },
};

/* ---------- hub bits ---------- */

function Header() {
  const { name, level, xp, xpToNext } = useMe();
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const currentLevelXp = (level - 1) * 100;
  const progress = ((xp - currentLevelXp) / 100) * 100;
  return (
    <div className="px-[20px] pt-[18px] pb-[8px]">
      <div className="flex items-center gap-[14px]">
        <div
          className="h-[56px] w-[56px] rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span className="font-['Bai_Jamjuree'] text-[18px] font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-['Geist'] text-[11px] uppercase tracking-[1.2px] text-white/45">
            Nivel {level} · Bodeguero
          </span>
          <h1 className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.5px]">
            Hola, {name}
          </h1>
          <div className="mt-[8px] flex items-center gap-[8px]">
            <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <span className="font-['Bai_Jamjuree'] text-[11px] text-white/55 tabular-nums">
              {xpToNext} XP al nivel {level + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreakCard() {
  const { streak, longestStreak } = useMe();
  const days = Array.from({ length: 7 }).map((_, i) => i < (streak % 7 || 7));
  return (
    <GlassCard className="trax-shine">
      <div className="p-[18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div
              className="h-[40px] w-[40px] rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,158,77,0.12)", border: "1px solid rgba(255,158,77,0.25)" }}
            >
              <Flame className="h-[18px] w-[18px] text-[#FF9E4D]" strokeWidth={2} fill="#FF9E4D" />
            </div>
            <div>
              <div className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/45">
                Racha actual
              </div>
              <div className="font-['Bai_Jamjuree'] text-[24px] font-bold text-white leading-none tabular-nums tracking-[-0.6px]">
                {streak} <span className="text-[14px] font-medium text-white/55">días</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-['Geist'] text-[10px] uppercase tracking-[1px] text-white/45">Récord</div>
            <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white/85 tabular-nums">
              {longestStreak}
            </div>
          </div>
        </div>
        <div className="mt-[14px] flex gap-[6px]">
          {days.map((on, i) => (
            <div
              key={i}
              className="flex-1 h-[6px] rounded-full"
              style={{
                background: on
                  ? "linear-gradient(90deg, #FF9E4D, #FACC15)"
                  : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
        <p className="mt-[10px] font-['Geist'] text-[11.5px] text-white/55 leading-[1.5]">
          Sigue abriendo y registrando todos los días. La constancia es lo que mueve el negocio.
        </p>
      </div>
    </GlassCard>
  );
}

function TodayCard({ onOpen }: { onOpen: () => void }) {
  const { todos, toggleTodo, todayDone, todayTotal } = useMe();
  const today = todos.filter((t) => t.due === "Hoy").slice(0, 3);
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between px-[4px]">
        <Eyebrow>Hoy · {todayDone}/{todayTotal} hecho</Eyebrow>
        <button
          type="button"
          onClick={onOpen}
          className="font-['Geist'] text-[12px] text-white/55 active:text-white"
        >
          Ver todo
        </button>
      </div>
      <GlassCard>
        <div className="flex flex-col px-[14px]">
          {today.map((t, i) => (
            <div key={t.id}>
              <TodoRow t={t} onToggle={() => toggleTodo(t.id)} />
              {i < today.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function TodoRow({ t, onToggle }: { t: Todo; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-[12px] py-[12px] text-left active:bg-white/[0.02]"
    >
      <span className="shrink-0">
        {t.done ? (
          <CheckCircle2 className="h-[18px] w-[18px] text-[#4ADE80]" strokeWidth={2} />
        ) : (
          <Circle className="h-[18px] w-[18px]" strokeWidth={1.8} style={{ color: PRIO[t.priority].color }} />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={`font-['Geist'] text-[13.5px] font-medium leading-[1.35] truncate ${
            t.done ? "text-white/40 line-through" : "text-white"
          }`}
        >
          {t.title}
        </div>
        <div className="mt-[2px] flex items-center gap-[6px]">
          <span
            className="font-['Geist'] text-[10px] font-semibold uppercase tracking-[0.6px]"
            style={{ color: PRIO[t.priority].color }}
          >
            {PRIO[t.priority].label}
          </span>
          {t.tag && (
            <>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="font-['Geist'] text-[10.5px] text-white/45">{t.tag}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function LearnTeaser({ onOpen }: { onOpen: () => void }) {
  const { lessons } = useMe();
  const current = lessons.find((l) => l.status === "actual") ?? lessons[0];
  const completed = lessons.filter((l) => l.status === "completada").length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-[20px] overflow-hidden trax-lift"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="p-[16px] flex items-center gap-[12px]">
        <div
          className="h-[44px] w-[44px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <BookOpen className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/45">
            Aprender · {completed}/{lessons.length}
          </div>
          <div className="font-['Geist'] text-[13.5px] font-semibold text-white truncate">
            {current.title}
          </div>
          <div className="font-['Geist'] text-[11px] text-white/50 mt-[1px]">
            {current.unit} · {current.minutes} min
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/40" />
      </div>
    </button>
  );
}

function RoutineTeaser({ onOpen }: { onOpen: () => void }) {
  const { routine } = useMe();
  const done = routine.filter((r) => r.done).length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-[20px] trax-lift"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="p-[16px] flex items-center gap-[12px]">
        <div
          className="h-[44px] w-[44px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Sun className="h-[18px] w-[18px] text-white/85" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/45">
            Rutina diaria · {done}/{routine.length}
          </div>
          <div className="font-['Geist'] text-[13.5px] font-semibold text-white">
            Los hábitos que te sostienen
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/40" />
      </div>
    </button>
  );
}

function GoalsTeaser({ onOpen }: { onOpen: () => void }) {
  const { goals } = useMe();
  const top = goals[0];
  const pct = Math.min(100, (top.current / top.target) * 100);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-[20px] trax-lift"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="p-[16px]">
        <div className="flex items-center gap-[10px] mb-[10px]">
          <div
            className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Target className="h-[15px] w-[15px] text-white/85" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/45">
              Tus metas
            </div>
            <div className="font-['Geist'] text-[13.5px] font-semibold text-white">{top.label}</div>
          </div>
          <ChevronRight className="h-[16px] w-[16px] text-white/40" />
        </div>
        <div className="h-[6px] w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <div className="mt-[6px] flex items-baseline justify-between font-['Geist'] text-[11px] text-white/55 tabular-nums">
          <span>
            {top.unit === "S/" ? "S/" : ""}
            {top.current.toLocaleString()}
            {top.unit === "%" ? "%" : top.unit === "u" ? " días" : ""}
          </span>
          <span>
            Meta {top.unit === "S/" ? "S/" : ""}
            {top.target.toLocaleString()}
            {top.unit === "%" ? "%" : top.unit === "u" ? " días" : ""}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- sub-views ---------- */

function LessonNode({ l, onComplete }: { l: Lesson; onComplete: () => void }) {
  const locked = l.status === "bloqueada";
  const done = l.status === "completada";
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onComplete}
      className="w-full text-left flex items-center gap-[14px] py-[12px] disabled:opacity-50"
    >
      <div
        className="h-[44px] w-[44px] rounded-full flex items-center justify-center shrink-0"
        style={{
          background: done
            ? "rgba(74,222,128,0.15)"
            : l.status === "actual"
              ? "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))"
              : "rgba(255,255,255,0.04)",
          border: `1px solid ${done ? "rgba(74,222,128,0.30)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        {done ? (
          <CheckCircle2 className="h-[18px] w-[18px] text-[#4ADE80]" strokeWidth={2.2} />
        ) : locked ? (
          <Lock className="h-[14px] w-[14px] text-white/35" strokeWidth={1.8} />
        ) : (
          <BookOpen className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-['Geist'] text-[13.5px] font-medium ${done ? "text-white/55" : "text-white"} truncate`}>
          {l.title}
        </div>
        <div className="font-['Geist'] text-[11px] text-white/45 mt-[2px]">
          {l.minutes} min · +{l.xp} XP
        </div>
      </div>
      {l.status === "actual" && (
        <span className="font-['Geist'] text-[11px] font-semibold text-white px-[10px] py-[4px] rounded-full bg-white/[0.08] border border-white/[0.10]">
          Empezar
        </span>
      )}
    </button>
  );
}

function LearnView({ onBack }: { onBack: () => void }) {
  const { lessons, completeLesson } = useMe();
  const units = Array.from(new Set(lessons.map((l) => l.unit)));
  return (
    <SubScreen>
      <SubHeader eyebrow="5 min al día" title="Aprender" onBack={onBack} />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[18px]">
        {units.map((u) => (
          <div key={u} className="flex flex-col gap-[8px]">
            <Eyebrow>{u}</Eyebrow>
            <GlassCard>
              <div className="px-[14px]">
                {lessons
                  .filter((l) => l.unit === u)
                  .map((l, i, arr) => (
                    <div key={l.id}>
                      <LessonNode l={l} onComplete={() => completeLesson(l.id)} />
                      {i < arr.length - 1 && <div className="h-px w-full bg-white/[0.05] ml-[58px]" />}
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </SubScreen>
  );
}

function RoutineView({ onBack }: { onBack: () => void }) {
  const { routine, toggleRoutine } = useMe();
  return (
    <SubScreen>
      <SubHeader eyebrow="Hábitos del bodeguero" title="Rutina diaria" onBack={onBack} />
      <div className="px-[20px] pt-[6px]">
        <GlassCard>
          <div className="flex flex-col px-[14px]">
            {routine.map((r, i) => (
              <div key={r.id}>
                <button
                  type="button"
                  onClick={() => toggleRoutine(r.id)}
                  className="w-full flex items-center gap-[12px] py-[14px] text-left"
                >
                  {r.done ? (
                    <CheckCircle2 className="h-[20px] w-[20px] text-[#4ADE80] shrink-0" strokeWidth={2} />
                  ) : (
                    <Circle className="h-[20px] w-[20px] text-white/35 shrink-0" strokeWidth={1.8} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-['Geist'] text-[13.5px] font-medium ${r.done ? "text-white/45 line-through" : "text-white"}`}
                    >
                      {r.label}
                    </div>
                    {r.hint && (
                      <div className="font-['Geist'] text-[11px] text-white/45 mt-[1px]">{r.hint}</div>
                    )}
                  </div>
                </button>
                {i < routine.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SubScreen>
  );
}

function GoalsView({ onBack }: { onBack: () => void }) {
  const { goals } = useMe();
  return (
    <SubScreen>
      <SubHeader eyebrow="Hacia dónde vas" title="Metas" onBack={onBack} />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[12px]">
        {goals.map((g) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          return (
            <GlassCard key={g.id}>
              <div className="p-[16px]">
                <div className="flex items-baseline justify-between mb-[10px]">
                  <span className="font-['Geist'] text-[13.5px] font-medium text-white">{g.label}</span>
                  <span className="font-['Bai_Jamjuree'] text-[13px] font-bold text-white tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-[8px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
                <div className="mt-[8px] flex items-baseline justify-between font-['Geist'] text-[11.5px] text-white/55 tabular-nums">
                  <span>
                    {g.unit === "S/" ? "S/ " : ""}
                    {g.current.toLocaleString()}
                    {g.unit === "%" ? "%" : g.unit === "u" ? " días" : ""}
                  </span>
                  <span>
                    Meta: {g.unit === "S/" ? "S/ " : ""}
                    {g.target.toLocaleString()}
                    {g.unit === "%" ? "%" : g.unit === "u" ? " días" : ""}
                  </span>
                </div>
              </div>
            </GlassCard>
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
            className="flex h-[40px] items-center gap-[6px] rounded-full bg-white text-black px-[14px] active:scale-95"
          >
            <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
            <span className="font-['Geist'] text-[13px] font-semibold">Añadir</span>
          </button>
        }
      />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
        {adding && (
          <GlassCard>
            <div className="p-[14px] flex flex-col gap-[10px]">
              <input
                autoFocus
                placeholder="Una tarea concreta…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full h-[40px] bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/35"
              />
              <div className="flex items-center gap-[6px]">
                {(["urgent", "high", "normal", "low"] as Todo["priority"][]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrio(p)}
                    className="h-[26px] px-[10px] rounded-full font-['Geist'] text-[11px] font-medium flex items-center gap-[5px]"
                    style={{
                      background: prio === p ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${prio === p ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
                      color: PRIO[p].color,
                    }}
                  >
                    <span
                      className="h-[6px] w-[6px] rounded-full"
                      style={{ background: PRIO[p].color }}
                    />
                    {PRIO[p].label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={submit}
                  className="ml-auto h-[30px] px-[12px] rounded-full bg-white text-black font-['Geist'] text-[12px] font-semibold active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </div>
          </GlassCard>
        )}
        {groups.map((g) => {
          const items = todos.filter((t) => t.due === g.key);
          if (items.length === 0) return null;
          return (
            <div key={g.key} className="flex flex-col gap-[8px]">
              <Eyebrow>{g.label}</Eyebrow>
              <GlassCard>
                <div className="flex flex-col px-[14px]">
                  {items.map((t, i) => (
                    <div key={t.id}>
                      <TodoRow t={t} onToggle={() => toggleTodo(t.id)} />
                      {i < items.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
                    </div>
                  ))}
                </div>
              </GlassCard>
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
  const back = () => setView("hub");

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {onClose && (
              <div className="absolute top-[18px] right-[20px] z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[36px] w-[36px] rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-95"
                >
                  <X className="h-[15px] w-[15px] text-white/75" strokeWidth={1.8} />
                </button>
              </div>
            )}
            <Header />
            <div className="flex flex-col gap-[14px] px-[20px] pt-[8px]">
              <StreakCard />
              <TodayCard onOpen={() => setView("todos")} />
              <LearnTeaser onOpen={() => setView("learn")} />
              <div className="grid grid-cols-1 gap-[12px]">
                <GoalsTeaser onOpen={() => setView("goals")} />
                <RoutineTeaser onOpen={() => setView("routine")} />
              </div>
              <p className="font-['Geist'] text-[11.5px] text-white/35 text-center pt-[6px]">
                Trax · Tu negocio crece contigo
              </p>
            </div>
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
