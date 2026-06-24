import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";

export type Todo = {
  id: string;
  title: string;
  priority: "urgent" | "high" | "normal" | "low";
  done: boolean;
  due?: string;
  tag?: string;
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  unit: string;
  status: "completada" | "actual" | "bloqueada";
  xp: number;
};

export type RoutineItem = {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
};

export type Goal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: "S/" | "u" | "%";
};

type Ctx = {
  name: string;
  level: number;
  levelLabel: string;
  xp: number;
  xpToNext: number;
  streak: number;
  longestStreak: number;
  todos: Todo[];
  lessons: Lesson[];
  routine: RoutineItem[];
  goals: Goal[];
  toggleTodo: (id: string) => void;
  addTodo: (t: Omit<Todo, "id" | "done">) => void;
  toggleRoutine: (id: string) => void;
  completeLesson: (id: string) => void;
  todayDone: number;
  todayTotal: number;
};

const MeCtx = createContext<Ctx | null>(null);

const STREAK_KEY = "trax_streak_count";
const STREAK_DATE_KEY = "trax_streak_last_date";
const COMPLETED_LESSONS_KEY = "trax_completed_lessons";
const ROUTINE_DONE_KEY = "trax_routine_done";

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(): { streak: number; isNew: boolean } {
  try {
    const today = isoToday();
    const lastDate = localStorage.getItem(STREAK_DATE_KEY);
    const saved = Number(localStorage.getItem(STREAK_KEY) || "0");
    if (!lastDate) return { streak: 1, isNew: true };
    if (lastDate === today) return { streak: Math.max(1, saved), isNew: false };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate === yesterday.toISOString().slice(0, 10))
      return { streak: saved + 1, isNew: true };
    return { streak: 1, isNew: true };
  } catch {
    return { streak: 1, isNew: false };
  }
}

function saveStreak(count: number) {
  try {
    localStorage.setItem(STREAK_KEY, String(count));
    localStorage.setItem(STREAK_DATE_KEY, isoToday());
  } catch {}
}

function loadCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_LESSONS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompletedLessons(ids: Set<string>) {
  try {
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify([...ids]));
  } catch {}
}

function loadRoutineDone(): Set<string> {
  try {
    const raw = localStorage.getItem(ROUTINE_DONE_KEY);
    if (!raw) return new Set();
    const parsed: { date: string; ids: string[] } = JSON.parse(raw);
    if (parsed.date !== isoToday()) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveRoutineDone(ids: Set<string>) {
  try {
    localStorage.setItem(
      ROUTINE_DONE_KEY,
      JSON.stringify({ date: isoToday(), ids: [...ids] }),
    );
  } catch {}
}

const CEO_LEVELS = [
  { level: 1, label: "CEO Aprendiz", xpToNext: 100 },
  { level: 2, label: "CEO Activo", xpToNext: 250 },
  { level: 3, label: "CEO Establecido", xpToNext: 500 },
  { level: 4, label: "CEO Creciente", xpToNext: 1000 },
  { level: 5, label: "CEO Experto", xpToNext: 2000 },
  { level: 6, label: "CEO Maestro", xpToNext: 999999 },
];

function computeLevel(xp: number) {
  let accumulated = 0;
  for (const l of CEO_LEVELS) {
    if (xp < accumulated + l.xpToNext) {
      return { level: l.level, label: l.label, xpToNext: l.xpToNext, xpInLevel: xp - accumulated };
    }
    accumulated += l.xpToNext;
  }
  const last = CEO_LEVELS[CEO_LEVELS.length - 1];
  return { level: last.level, label: last.label, xpToNext: last.xpToNext, xpInLevel: xp - accumulated };
}

const BASE_LESSONS: Omit<Lesson, "status">[] = [
  { id: "l1", title: "¿Cuánto ganas realmente? El margen neto", minutes: 5, unit: "Conoce tu negocio", xp: 20 },
  { id: "l2", title: "Separa el dinero del negocio del tuyo", minutes: 8, unit: "Conoce tu negocio", xp: 20 },
  { id: "l3", title: "Cómo fijar un precio justo sin perder", minutes: 6, unit: "Conoce tu negocio", xp: 25 },
  { id: "l4", title: "Tus primeros clientes fieles — cómo lograrlo", minutes: 7, unit: "Vende más", xp: 25 },
  { id: "l5", title: "WhatsApp Business para vender más", minutes: 6, unit: "Vende más", xp: 20 },
  { id: "l6", title: "Maneja tu stock sin quedarte sin mercadería", minutes: 5, unit: "Vende más", xp: 20 },
  { id: "l7", title: "Formalización: cuándo y cómo hacerlo sin miedo", minutes: 10, unit: "Crecer", xp: 30 },
  { id: "l8", title: "Cómo acceder a tu primer crédito formal", minutes: 8, unit: "Crecer", xp: 30 },
];

const BASE_ROUTINE: Omit<RoutineItem, "done">[] = [
  { id: "r1", label: "Abre Trax y revisa tu ganancia del día", hint: "30 segundos" },
  { id: "r2", label: "Registra todas tus ventas del día", hint: "Hazlo en el momento, no al final" },
  { id: "r3", label: "Revisa qué productos están por acabarse", hint: "Así no te quedas sin stock" },
  { id: "r4", label: "Anota un gasto si tuviste alguno", hint: "Todo cuenta para tu margen real" },
];

export function MeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const fin = useFinance();

  const [streak, setStreak] = useState(1);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [routineDoneIds, setRoutineDoneIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const { streak: s, isNew } = computeStreak();
    setStreak(s);
    if (isNew) saveStreak(s);
    setCompletedLessons(loadCompletedLessons());
    // Auto-mark "abrir Trax" as done
    const done = loadRoutineDone();
    done.add("r1");
    saveRoutineDone(done);
    setRoutineDoneIds(done);
  }, []);

  const toggleTodo = useCallback(
    (id: string) => setTodos((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    [],
  );

  const addTodo: Ctx["addTodo"] = useCallback(
    (t) => setTodos((arr) => [{ ...t, id: `td${Date.now()}`, done: false }, ...arr]),
    [],
  );

  const toggleRoutine = useCallback((id: string) => {
    setRoutineDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveRoutineDone(next);
      return next;
    });
  }, []);

  const completeLesson = useCallback((id: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveCompletedLessons(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const firstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
    const txCount = fin.tx.length;
    const dailyGoal = profile?.daily_goal ?? 200;

    // XP: transactions + streak + lessons
    const totalXp = txCount * 10 + streak * 5 + completedLessons.size * 20;
    const { level, label: levelLabel, xpToNext, xpInLevel } = computeLevel(totalXp);

    // Lessons: unlock sequentially
    let foundActual = false;
    const lessons: Lesson[] = BASE_LESSONS.map((l, i) => {
      if (completedLessons.has(l.id)) return { ...l, status: "completada" };
      const prevCompleted = i === 0 || completedLessons.has(BASE_LESSONS[i - 1].id);
      if (prevCompleted && !foundActual) {
        foundActual = true;
        return { ...l, status: "actual" };
      }
      return { ...l, status: "bloqueada" };
    });

    // Routine
    const routine: RoutineItem[] = BASE_ROUTINE.map((r) => ({
      ...r,
      done: routineDoneIds.has(r.id),
    }));
    if (fin.fiados.some((f) => !f.settled)) {
      routine.push({
        id: "r_fiado",
        label: "Cobra un fiado pendiente",
        hint: `Te deben S/ ${fin.fiadosPending.toFixed(0)}`,
        done: routineDoneIds.has("r_fiado"),
      });
    }

    // Goals connected to real data
    const monthGoal = dailyGoal * 22;
    const goals: Goal[] = [
      { id: "g_day", label: `Meta del día: S/ ${dailyGoal}`, current: fin.todayIncome, target: dailyGoal, unit: "S/" },
      { id: "g_month", label: `Meta del mes: S/ ${monthGoal.toLocaleString()}`, current: fin.monthIncome, target: monthGoal, unit: "S/" },
      { id: "g_streak", label: "Racha de 30 días", current: streak, target: 30, unit: "u" },
    ];

    const todayTodos = todos.filter((t) => t.due === "Hoy");

    return {
      name: firstName,
      level,
      levelLabel: levelLabel ?? "CEO Aprendiz",
      xp: xpInLevel ?? 0,
      xpToNext,
      streak,
      longestStreak: streak,
      todos,
      lessons,
      routine,
      goals,
      toggleTodo,
      addTodo,
      toggleRoutine,
      completeLesson,
      todayDone: todayTodos.filter((t) => t.done).length,
      todayTotal: todayTodos.length,
    };
  }, [
    profile,
    fin.tx,
    fin.todayIncome,
    fin.monthIncome,
    fin.fiados,
    fin.fiadosPending,
    streak,
    todos,
    completedLessons,
    routineDoneIds,
    toggleTodo,
    addTodo,
    toggleRoutine,
    completeLesson,
  ]);

  return <MeCtx.Provider value={value}>{children}</MeCtx.Provider>;
}

export function useMe() {
  const ctx = useContext(MeCtx);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
