import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Todo = {
  id: string;
  title: string;
  priority: "urgent" | "high" | "normal" | "low";
  done: boolean;
  due?: string; // "Hoy" | "Mañana" | etc
  tag?: string; // "Caja" | "Stock" | "Cliente"
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

const SEED_TODOS: Todo[] = [
  { id: "td1", title: "Reponer papitas Lay's (3 u)", priority: "urgent", done: false, due: "Hoy", tag: "Stock" },
  { id: "td2", title: "Cobrar fiado a Sra. Rosa (S/ 35)", priority: "high", done: false, due: "Hoy", tag: "Cliente" },
  { id: "td3", title: "Cuadrar caja del día", priority: "high", done: false, due: "Hoy", tag: "Caja" },
  { id: "td4", title: "Llamar al proveedor de gaseosas", priority: "normal", done: true, due: "Hoy", tag: "Proveedor" },
  { id: "td5", title: "Sacar foto al cartel de promo", priority: "low", done: false, due: "Mañana", tag: "Marketing" },
];

const SEED_LESSONS: Lesson[] = [
  { id: "l1", title: "Saber cuánto ganas de verdad", minutes: 4, unit: "Finanzas básicas", status: "completada", xp: 20 },
  { id: "l2", title: "Diferencia entre caja y ganancia", minutes: 5, unit: "Finanzas básicas", status: "completada", xp: 20 },
  { id: "l3", title: "Cómo poner precio sin perder", minutes: 6, unit: "Finanzas básicas", status: "actual", xp: 30 },
  { id: "l4", title: "El fiado: cuándo sí, cuándo no", minutes: 5, unit: "Finanzas básicas", status: "bloqueada", xp: 20 },
  { id: "l5", title: "Tu primera promoción que vende", minutes: 7, unit: "Marketing simple", status: "bloqueada", xp: 30 },
  { id: "l6", title: "WhatsApp como cajero silencioso", minutes: 6, unit: "Marketing simple", status: "bloqueada", xp: 30 },
];

const SEED_ROUTINE: RoutineItem[] = [
  { id: "r1", label: "Abrir caja con monto inicial", done: true },
  { id: "r2", label: "Revisar stock crítico", done: true, hint: "1 producto" },
  { id: "r3", label: "Saludar al primer cliente del día", done: true },
  { id: "r4", label: "Cuadrar caja al cerrar", done: false, hint: "9:00 PM" },
  { id: "r5", label: "Anotar gastos del día", done: false },
];

const SEED_GOALS: Goal[] = [
  { id: "g1", label: "Ventas del mes", current: 7560, target: 12000, unit: "S/" },
  { id: "g2", label: "Días sin romper racha", current: 12, target: 30, unit: "u" },
  { id: "g3", label: "Margen promedio", current: 22, target: 30, unit: "%" },
];

type Ctx = {
  name: string;
  level: number;
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

export function MeProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS);
  const [lessons, setLessons] = useState<Lesson[]>(SEED_LESSONS);
  const [routine, setRoutine] = useState<RoutineItem[]>(SEED_ROUTINE);
  const [goals] = useState<Goal[]>(SEED_GOALS);
  const [xpBoost, setXpBoost] = useState(0);

  const toggleTodo = (id: string) =>
    setTodos((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTodo: Ctx["addTodo"] = (t) =>
    setTodos((arr) => [{ ...t, id: `td${Date.now()}`, done: false }, ...arr]);

  const toggleRoutine = (id: string) =>
    setRoutine((arr) => arr.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));

  const completeLesson = (id: string) =>
    setLessons((arr) => {
      const idx = arr.findIndex((l) => l.id === id);
      if (idx < 0) return arr;
      const next = [...arr];
      const xp = next[idx].xp;
      if (next[idx].status !== "completada") {
        next[idx] = { ...next[idx], status: "completada" };
        setXpBoost((b) => b + xp);
        if (next[idx + 1] && next[idx + 1].status === "bloqueada") {
          next[idx + 1] = { ...next[idx + 1], status: "actual" };
        }
      }
      return next;
    });

  const value = useMemo<Ctx>(() => {
    const baseXp = lessons.filter((l) => l.status === "completada").reduce((s, l) => s + l.xp, 0);
    const xp = baseXp + xpBoost;
    const level = 1 + Math.floor(xp / 100);
    const xpToNext = level * 100 - xp;
    const todayDone =
      routine.filter((r) => r.done).length + todos.filter((t) => t.due === "Hoy" && t.done).length;
    const todayTotal =
      routine.length + todos.filter((t) => t.due === "Hoy").length;
    return {
      name: "Alberto",
      level,
      xp,
      xpToNext,
      streak: 12,
      longestStreak: 27,
      todos,
      lessons,
      routine,
      goals,
      toggleTodo,
      addTodo,
      toggleRoutine,
      completeLesson,
      todayDone,
      todayTotal,
    };
  }, [todos, lessons, routine, goals, xpBoost]);

  return <MeCtx.Provider value={value}>{children}</MeCtx.Provider>;
}

export function useMe() {
  const ctx = useContext(MeCtx);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
