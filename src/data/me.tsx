import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

/* Datos client-side. Cuando se conecte una tabla real, se reemplaza por Supabase. */

export type Priority = "urgent" | "high" | "normal" | "low";
export type TaskStatus = "pending" | "in_progress" | "done" | "postponed";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  done: boolean;
  due?: string;        // "Hoy" | "Mañana" | fecha ISO
  time?: string;       // HH:mm
  tag?: string;
  projectId?: string;
  goalId?: string;
  notes?: string;
  reminder?: boolean;
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
  time?: string;
  frequency?: "diaria" | "laborales" | "semanal";
};

export type Goal = {
  id: string;
  label: string;
  description?: string;
  current: number;
  target: number;
  unit: "S/" | "u" | "%";
  category?: "Ventas" | "Marketing" | "Finanzas" | "Clientes" | "Operaciones" | "Personal";
  due?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;   // YYYY-MM-DD
  start?: string; // HH:mm
  end?: string;   // HH:mm
  place?: string;
  projectId?: string;
  priority?: Priority;
};

export type ProjectStatus = "planning" | "active" | "paused" | "done" | "late";

export type Project = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  startDate?: string;
  dueDate?: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number; // 0-100
  goalId?: string;
  notes?: string;
};

export type RecoLevel = "info" | "warn" | "urgent" | "success";

export type Recommendation = {
  id: string;
  level: RecoLevel;
  title: string;
  body?: string;
  taskId?: string;
  projectId?: string;
  goalId?: string;
  dismissed?: boolean;
};

type Ctx = {
  name: string;
  streak: number;
  longestStreak: number;

  todos: Todo[];
  lessons: Lesson[];
  routine: RoutineItem[];
  goals: Goal[];
  events: CalendarEvent[];
  projects: Project[];
  recommendations: Recommendation[];

  // todos
  toggleTodo: (id: string) => void;
  addTodo: (t: Omit<Todo, "id" | "done" | "status"> & { status?: TaskStatus }) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  duplicateTodo: (id: string) => void;

  // routine
  toggleRoutine: (id: string) => void;
  addRoutine: (r: Omit<RoutineItem, "id" | "done">) => void;
  removeRoutine: (id: string) => void;

  // lessons
  completeLesson: (id: string) => void;

  // goals
  addGoal: (g: Omit<Goal, "id" | "current">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  // events
  addEvent: (e: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;

  // projects
  addProject: (p: Omit<Project, "id" | "progress" | "status"> & { status?: ProjectStatus; progress?: number }) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  duplicateProject: (id: string) => void;

  // recos
  dismissRecommendation: (id: string) => void;

  // summaries
  todayDone: number;
  todayTotal: number;
  routineDone: number;
  highPriorityToday: number;
  nextEvent?: CalendarEvent;
  activeProjects: number;
  lateProjects: number;
};

const MeCtx = createContext<Ctx | null>(null);

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function MeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const lessons: Lesson[] = [];

  /* ---------- todos ---------- */
  const toggleTodo = useCallback(
    (id: string) =>
      setTodos((arr) =>
        arr.map((t) =>
          t.id === id ? { ...t, done: !t.done, status: !t.done ? "done" : "pending" } : t,
        ),
      ),
    [],
  );
  const addTodo: Ctx["addTodo"] = useCallback(
    (t) =>
      setTodos((arr) => [
        { ...t, id: uid(), done: false, status: t.status ?? "pending" },
        ...arr,
      ]),
    [],
  );
  const updateTodo = useCallback(
    (id: string, patch: Partial<Todo>) =>
      setTodos((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [],
  );
  const removeTodo = useCallback(
    (id: string) => setTodos((arr) => arr.filter((t) => t.id !== id)),
    [],
  );
  const duplicateTodo = useCallback(
    (id: string) =>
      setTodos((arr) => {
        const t = arr.find((x) => x.id === id);
        if (!t) return arr;
        return [{ ...t, id: uid(), title: `${t.title} (copia)`, done: false, status: "pending" }, ...arr];
      }),
    [],
  );

  /* ---------- routine ---------- */
  const toggleRoutine = useCallback(
    (id: string) => setRoutine((arr) => arr.map((r) => (r.id === id ? { ...r, done: !r.done } : r))),
    [],
  );
  const addRoutine: Ctx["addRoutine"] = useCallback(
    (r) => setRoutine((arr) => [...arr, { ...r, id: uid(), done: false }]),
    [],
  );
  const removeRoutine = useCallback(
    (id: string) => setRoutine((arr) => arr.filter((r) => r.id !== id)),
    [],
  );

  const completeLesson = useCallback((_id: string) => {}, []);

  /* ---------- goals ---------- */
  const addGoal: Ctx["addGoal"] = useCallback(
    (g) => setGoals((arr) => [{ ...g, id: uid(), current: 0 }, ...arr]),
    [],
  );
  const updateGoal = useCallback(
    (id: string, patch: Partial<Goal>) =>
      setGoals((arr) => arr.map((g) => (g.id === id ? { ...g, ...patch } : g))),
    [],
  );
  const removeGoal = useCallback(
    (id: string) => setGoals((arr) => arr.filter((g) => g.id !== id)),
    [],
  );

  /* ---------- events ---------- */
  const addEvent: Ctx["addEvent"] = useCallback(
    (e) => setEvents((arr) => [{ ...e, id: uid() }, ...arr]),
    [],
  );
  const updateEvent = useCallback(
    (id: string, patch: Partial<CalendarEvent>) =>
      setEvents((arr) => arr.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    [],
  );
  const removeEvent = useCallback(
    (id: string) => setEvents((arr) => arr.filter((e) => e.id !== id)),
    [],
  );

  /* ---------- projects ---------- */
  const addProject: Ctx["addProject"] = useCallback(
    (p) =>
      setProjects((arr) => [
        { ...p, id: uid(), progress: p.progress ?? 0, status: p.status ?? "planning" },
        ...arr,
      ]),
    [],
  );
  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) =>
      setProjects((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [],
  );
  const removeProject = useCallback(
    (id: string) => setProjects((arr) => arr.filter((p) => p.id !== id)),
    [],
  );
  const duplicateProject = useCallback(
    (id: string) =>
      setProjects((arr) => {
        const p = arr.find((x) => x.id === id);
        if (!p) return arr;
        return [{ ...p, id: uid(), name: `${p.name} (copia)`, progress: 0, status: "planning" }, ...arr];
      }),
    [],
  );

  /* ---------- recos (derivadas) ---------- */
  const recommendations = useMemo<Recommendation[]>(() => {
    const out: Recommendation[] = [];
    const highPending = todos.filter((t) => !t.done && t.priority === "urgent");
    if (highPending.length > 0) {
      out.push({
        id: "reco-high",
        level: "urgent",
        title: `Tienes ${highPending.length} tarea${highPending.length > 1 ? "s" : ""} urgente${highPending.length > 1 ? "s" : ""} sin cerrar`,
        body: "Termina primero lo más importante para no cargar el día siguiente.",
      });
    }
    const late = projects.filter((p) => p.status === "late");
    if (late.length > 0) {
      out.push({
        id: "reco-late-proj",
        level: "urgent",
        title: `${late[0].name} presenta retraso`,
        body: "Revisa las tareas del proyecto y ajusta la fecha límite si es necesario.",
        projectId: late[0].id,
      });
    }
    const closeGoal = goals.find((g) => g.target > 0 && g.current / g.target >= 0.85 && g.current < g.target);
    if (closeGoal) {
      out.push({
        id: "reco-goal-close",
        level: "info",
        title: `Estás muy cerca de "${closeGoal.label}"`,
        body: `Vas ${Math.round((closeGoal.current / closeGoal.target) * 100)}% — un empujón y la cierras.`,
        goalId: closeGoal.id,
      });
    }
    if (routine.length > 0) {
      const done = routine.filter((r) => r.done).length;
      const pct = done / routine.length;
      if (pct < 0.5) {
        out.push({
          id: "reco-routine",
          level: "warn",
          title: "Tu rutina de hoy va lenta",
          body: `${done} de ${routine.length} hábitos completados. Retoma la rutina para no perder la racha.`,
        });
      }
    }
    if (todos.length === 0 && projects.length === 0 && goals.length === 0) {
      out.push({
        id: "reco-empty",
        level: "info",
        title: "Empieza registrando tus prioridades del día",
        body: "Crea 3 tareas, 1 meta y verás recomendaciones personalizadas.",
      });
    }
    return out.filter((r) => !dismissed.has(r.id));
  }, [todos, projects, goals, routine, dismissed]);

  const dismissRecommendation = useCallback(
    (id: string) => setDismissed((s) => new Set(s).add(id)),
    [],
  );

  const value = useMemo<Ctx>(() => {
    const todayItems = todos.filter((t) => t.due === "Hoy" || !t.due);
    const todayDone = todayItems.filter((t) => t.done).length;
    const todayTotal = todayItems.length;
    const routineDone = routine.filter((r) => r.done).length;
    const highPriorityToday = todayItems.filter((t) => !t.done && (t.priority === "urgent" || t.priority === "high")).length;
    const nextEvent = [...events].sort((a, b) => (a.date + (a.start ?? "")).localeCompare(b.date + (b.start ?? "")))[0];
    const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning").length;
    const lateProjects = projects.filter((p) => p.status === "late").length;

    const firstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
    return {
      name: firstName,
      streak: 0,
      longestStreak: 0,
      todos,
      lessons,
      routine,
      goals,
      events,
      projects,
      recommendations,
      toggleTodo,
      addTodo,
      updateTodo,
      removeTodo,
      duplicateTodo,
      toggleRoutine,
      addRoutine,
      removeRoutine,
      completeLesson,
      addGoal,
      updateGoal,
      removeGoal,
      addEvent,
      updateEvent,
      removeEvent,
      addProject,
      updateProject,
      removeProject,
      duplicateProject,
      dismissRecommendation,
      todayDone,
      todayTotal,
      routineDone,
      highPriorityToday,
      nextEvent,
      activeProjects,
      lateProjects,
    };
  }, [
    todos, routine, goals, events, projects, recommendations,
    profile?.owner_name,
    toggleTodo, addTodo, updateTodo, removeTodo, duplicateTodo,
    toggleRoutine, addRoutine, removeRoutine,
    completeLesson,
    addGoal, updateGoal, removeGoal,
    addEvent, updateEvent, removeEvent,
    addProject, updateProject, removeProject, duplicateProject,
    dismissRecommendation,
  ]);

  return <MeCtx.Provider value={value}>{children}</MeCtx.Provider>;
}

export function useMe() {
  const ctx = useContext(MeCtx);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
