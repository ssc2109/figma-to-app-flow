import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PRODUCTS, PRODUCTS_BY_ID, type Product } from "./products";

export const LOW_STOCK_THRESHOLD = 5; // kept for backward compat

const SEED_STOCK: Record<string, number> = {
  "inca-kola": 24,
  "pan-frances": 120,
  "papas-lays": 3,
  "agua-cielo": 18,
  "cafe-altomayo": 8,
  "arroz-costeno": 45,
};
const SEED_CATEGORY: Record<string, string> = {
  "inca-kola": "Bebidas",
  "pan-frances": "Panadería",
  "papas-lays": "Snacks",
  "agua-cielo": "Bebidas",
  "cafe-altomayo": "Abarrotes",
  "arroz-costeno": "Abarrotes",
};
const SEED_COST: Record<string, number> = {
  "inca-kola": 2.4,
  "pan-frances": 0.18,
  "papas-lays": 3.1,
  "agua-cielo": 1.2,
  "cafe-altomayo": 1.0,
  "arroz-costeno": 9.8,
};

export type InventoryItem = Product & {
  stock: number;
  category: string;
  cost: number;
  dbId: string; // uuid in supabase
};

type DbProduct = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  sku: string | null;
  image_url: string | null;
  low_stock_threshold: number;
};

type Ctx = {
  items: InventoryItem[];
  loading: boolean;
  lowStock: InventoryItem[];
  setStock: (slug: string, n: number) => Promise<void>;
  adjustStock: (slug: string, delta: number) => Promise<void>;
  addProduct: (p: { name: string; price: number; cost: number; stock: number; category: string }) => Promise<void>;
  refresh: () => Promise<void>;
  totalValue: number;
  totalUnits: number;
  productCount: number;
};

const InventoryCtx = createContext<Ctx | null>(null);

function rowToItem(row: DbProduct): InventoryItem {
  const slug = row.sku || row.id;
  const seed = PRODUCTS_BY_ID[slug];
  return {
    id: slug,
    dbId: row.id,
    name: row.name,
    price: Number(row.price),
    image: seed?.image ?? row.image_url ?? "",
    stock: row.stock,
    category: row.category || "General",
    cost: Number(row.cost),
  };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const seededRef = useRef(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, cost, stock, category, sku, image_url, low_stock_threshold")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("inventory load", error);
      setLoading(false);
      return;
    }
    if ((!data || data.length === 0) && !seededRef.current) {
      seededRef.current = true;
      const seed = PRODUCTS.map((p) => ({
        user_id: user.id,
        name: p.name,
        price: p.price,
        cost: SEED_COST[p.id] ?? p.price * 0.7,
        stock: SEED_STOCK[p.id] ?? 0,
        category: SEED_CATEGORY[p.id] ?? "General",
        sku: p.id,
        low_stock_threshold: profile?.low_stock_threshold ?? 5,
      }));
      const { data: inserted, error: insErr } = await supabase
        .from("products")
        .insert(seed)
        .select("id, name, price, cost, stock, category, sku, image_url, low_stock_threshold");
      if (insErr) console.error("inventory seed", insErr);
      setItems((inserted ?? []).map(rowToItem));
      setLoading(false);
      return;
    }
    setItems((data ?? []).map(rowToItem));
    setLoading(false);
  }, [user, profile?.low_stock_threshold]);

  useEffect(() => {
    load();
  }, [load]);

  const setStock = useCallback(
    async (slug: string, n: number) => {
      const item = items.find((i) => i.id === slug);
      if (!item) return;
      const next = Math.max(0, Math.round(n));
      setItems((arr) => arr.map((i) => (i.id === slug ? { ...i, stock: next } : i)));
      const { error } = await supabase.from("products").update({ stock: next }).eq("id", item.dbId);
      if (error) {
        console.error("setStock", error);
        await load();
      }
    },
    [items, load],
  );

  const adjustStock = useCallback(
    async (slug: string, delta: number) => {
      const item = items.find((i) => i.id === slug);
      if (!item) return;
      await setStock(slug, item.stock + delta);
    },
    [items, setStock],
  );

  const addProduct: Ctx["addProduct"] = useCallback(
    async (p) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: p.name,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          category: p.category,
          low_stock_threshold: profile?.low_stock_threshold ?? 5,
        })
        .select("id, name, price, cost, stock, category, sku, image_url, low_stock_threshold")
        .single();
      if (error) {
        console.error("addProduct", error);
        return;
      }
      if (data) setItems((arr) => [...arr, rowToItem(data)]);
    },
    [user, profile?.low_stock_threshold],
  );

  const value = useMemo<Ctx>(() => {
    const threshold = profile?.low_stock_threshold ?? LOW_STOCK_THRESHOLD;
    const lowStock = items
      .filter((i) => i.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);
    const totalValue = items.reduce((s, i) => s + i.stock * i.cost, 0);
    const totalUnits = items.reduce((s, i) => s + i.stock, 0);
    return {
      items,
      loading,
      lowStock,
      setStock,
      adjustStock,
      addProduct,
      refresh: load,
      totalValue,
      totalUnits,
      productCount: items.length,
    };
  }, [items, loading, profile?.low_stock_threshold, setStock, adjustStock, addProduct, load]);

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryCtx);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
