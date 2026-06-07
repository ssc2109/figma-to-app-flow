import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Banknote,
  HandCoins,
  ScanLine,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  PackagePlus,
  Megaphone,
  Truck,
  Plus,
  type LucideIcon,
} from "lucide-react";

export type ActionId =
  | "venta"
  | "cobrar"
  | "fiar"
  | "escanear"
  | "registrar_gasto"
  | "cobrar_fiado"
  | "reponer_stock"
  | "promocion"
  | "pedir_proveedor"
  | "nuevo_producto";

export type QuickAction = {
  id: ActionId;
  label: string;
  short?: string;
  Icon: LucideIcon;
  hint: string;
  accent?: string; // border / glow color
};

export const ALL_ACTIONS: QuickAction[] = [
  { id: "venta", label: "Venta", Icon: ShoppingBag, hint: "Abrir catálogo y armar pedido", accent: "rgba(255,255,255,0.22)" },
  { id: "cobrar", label: "Cobrar", Icon: Banknote, hint: "Registrar ingreso rápido" },
  { id: "fiar", label: "Fiar", Icon: HandCoins, hint: "Anotar deuda de un cliente" },
  { id: "escanear", label: "Escanear", Icon: ScanLine, hint: "Lector de código de barras" },
  { id: "registrar_gasto", label: "Gasto", short: "Gasto", Icon: Receipt, hint: "Apuntar un egreso" },
  { id: "cobrar_fiado", label: "Cobrar fiado", short: "Cobrar fiado", Icon: CheckCircle2, hint: "Marcar deuda como pagada" },
  { id: "reponer_stock", label: "Reponer stock", short: "Reponer", Icon: PackagePlus, hint: "Subir stock de un producto" },
  { id: "promocion", label: "Promo", short: "Promo", Icon: Megaphone, hint: "Crear oferta para WhatsApp" },
  { id: "pedir_proveedor", label: "Proveedor", short: "Proveedor", Icon: Truck, hint: "Pedir mercadería" },
  { id: "nuevo_producto", label: "Producto", short: "Producto", Icon: Plus, hint: "Añadir un nuevo producto" },
];

export const ACTIONS_BY_ID: Record<ActionId, QuickAction> = Object.fromEntries(
  ALL_ACTIONS.map((a) => [a.id, a]),
) as Record<ActionId, QuickAction>;

const DEFAULT_HOME: ActionId[] = ["cobrar", "fiar", "escanear"]; // 3 + ver todo (pinned)
const STORAGE_KEY = "trax.quickactions.home.v1";

type Ctx = {
  homeOrder: ActionId[]; // exactly 3
  allIds: ActionId[];
  moveToHome: (id: ActionId) => void; // swaps with last home item
  swap: (from: number, to: number) => void; // reorder inside home
  pinFirst: (id: ActionId) => void;
  trigger: (id: ActionId) => void;
  setHandler: (fn: (id: ActionId) => void) => void;
};

const QuickActionsContext = createContext<Ctx | null>(null);

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [homeOrder, setHomeOrder] = useState<ActionId[]>(() => {
    if (typeof window === "undefined") return DEFAULT_HOME;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ActionId[];
        const valid = parsed.filter((id) => ACTIONS_BY_ID[id]);
        if (valid.length >= 3) return valid.slice(0, 3);
      }
    } catch {}
    return DEFAULT_HOME;
  });

  const [handler, setHandlerState] = useState<((id: ActionId) => void) | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(homeOrder));
    } catch {}
  }, [homeOrder]);

  const moveToHome = useCallback((id: ActionId) => {
    setHomeOrder((cur) => {
      if (cur.includes(id)) return cur;
      // replace the last slot
      const next = [...cur];
      next[2] = id;
      return next;
    });
  }, []);

  const swap = useCallback((from: number, to: number) => {
    setHomeOrder((cur) => {
      if (from < 0 || to < 0 || from >= cur.length || to >= cur.length) return cur;
      const next = [...cur];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const pinFirst = useCallback((id: ActionId) => {
    setHomeOrder((cur) => {
      const without = cur.filter((x) => x !== id);
      const next = [id, ...without].slice(0, 3);
      // ensure we keep 3
      while (next.length < 3) {
        const fill = DEFAULT_HOME.find((d) => !next.includes(d));
        if (!fill) break;
        next.push(fill);
      }
      return next;
    });
  }, []);

  const trigger = useCallback((id: ActionId) => handler?.(id), [handler]);
  const setHandler = useCallback((fn: (id: ActionId) => void) => setHandlerState(() => fn), []);

  const value = useMemo<Ctx>(
    () => ({
      homeOrder,
      allIds: ALL_ACTIONS.map((a) => a.id),
      moveToHome,
      swap,
      pinFirst,
      trigger,
      setHandler,
    }),
    [homeOrder, moveToHome, swap, pinFirst, trigger, setHandler],
  );

  return <QuickActionsContext.Provider value={value}>{children}</QuickActionsContext.Provider>;
}

export function useQuickActions() {
  const ctx = useContext(QuickActionsContext);
  if (!ctx) throw new Error("useQuickActions must be used inside QuickActionsProvider");
  return ctx;
}
