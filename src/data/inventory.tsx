import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";

const INITIAL_STOCK: Record<string, number> = {
  "inca-kola": 24,
  "pan-frances": 120,
  "papas-lays": 3,
  "agua-cielo": 18,
  "cafe-altomayo": 8,
  "arroz-costeno": 45,
};

export const LOW_STOCK_THRESHOLD = 5;

export type InventoryItem = Product & {
  stock: number;
  category: string;
  cost: number;
};

const CATEGORY: Record<string, string> = {
  "inca-kola": "Bebidas",
  "pan-frances": "Panadería",
  "papas-lays": "Snacks",
  "agua-cielo": "Bebidas",
  "cafe-altomayo": "Abarrotes",
  "arroz-costeno": "Abarrotes",
};

const COST: Record<string, number> = {
  "inca-kola": 2.4,
  "pan-frances": 0.18,
  "papas-lays": 3.1,
  "agua-cielo": 1.2,
  "cafe-altomayo": 1.0,
  "arroz-costeno": 9.8,
};

type Ctx = {
  items: InventoryItem[];
  stock: Record<string, number>;
  lowStock: InventoryItem[];
  setStock: (id: string, n: number) => void;
  adjustStock: (id: string, delta: number) => void;
  totalValue: number;
  totalUnits: number;
  productCount: number;
};

const InventoryCtx = createContext<Ctx | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [stock, setStockState] = useState<Record<string, number>>(INITIAL_STOCK);

  const setStock = (id: string, n: number) =>
    setStockState((s) => ({ ...s, [id]: Math.max(0, Math.round(n)) }));
  const adjustStock = (id: string, delta: number) =>
    setStockState((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) + delta) }));

  const value = useMemo<Ctx>(() => {
    const items: InventoryItem[] = PRODUCTS.map((p) => ({
      ...p,
      stock: stock[p.id] ?? 0,
      category: CATEGORY[p.id] ?? "General",
      cost: COST[p.id] ?? p.price * 0.7,
    }));
    const lowStock = items
      .filter((i) => i.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock);
    const totalValue = items.reduce((s, i) => s + i.stock * i.cost, 0);
    const totalUnits = items.reduce((s, i) => s + i.stock, 0);
    return {
      items,
      stock,
      lowStock,
      setStock,
      adjustStock,
      totalValue,
      totalUnits,
      productCount: items.length,
    };
  }, [stock]);

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryCtx);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
