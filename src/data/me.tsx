import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

// Estos datos viven solo en cliente (todos, rutina). Sin seeds falsos.
// Cuando se conecte una tabla real, esto se reemplaza por la lectura de Supabase.

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
  const { profile } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routine] = useState<RoutineItem[]>([]);
  const lessons: Lesson[] = [];
  const goals: Goal[] = [];

  const toggleTodo = useCallback(
    (id: string) => setTodos((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    [],
  );

  const addTodo: Ctx["addTodo"] = useCallback(
    (t) => setTodos((arr) => [{ ...t, id: `td${Date.now()}`, done: false }, ...arr]),
    [],
  );

  const toggleRoutine = useCallback((_id: string) => {
    // sin rutina real aún
  }, []);

  const completeLesson = useCallback((_id: string) => {
    // sin lecciones reales aún
  }, []);

  const value = useMemo<Ctx>(() => {
    const todayDone = todos.filter((t) => t.due === "Hoy" && t.done).length;
    const todayTotal = todos.filter((t) => t.due === "Hoy").length;
    const firstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
    return {
      name: firstName,
      level: 1,
      xp: 0,
      xpToNext: 100,
      streak: 0,
      longestStreak: 0,
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
  }, [todos, routine, profile?.owner_name, toggleTodo, addTodo, toggleRoutine, completeLesson]);

  return <MeCtx.Provider value={value}>{children}</MeCtx.Provider>;
}

export function useMe() {
  const ctx = useContext(MeCtx);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
