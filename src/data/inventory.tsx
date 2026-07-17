import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const LOW_STOCK_THRESHOLD = 5;

export type InventoryItem = {
  id: string; // = dbId
  dbId: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
  lowStockThreshold: number;
};

type DbProduct = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  unit: string | null;
  sku: string | null;
  image_url: string | null;
  low_stock_threshold: number;
};


type Ctx = {
  items: InventoryItem[];
  loading: boolean;
  lowStock: InventoryItem[];
  setStock: (id: string, n: number) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  addProduct: (p: {
    name: string;
    price: number;
    cost?: number;
    stock?: number;
    category?: string;
  }) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Omit<InventoryItem, "id" | "dbId">>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  totalValue: number;
  totalUnits: number;
  productCount: number;
};

const InventoryCtx = createContext<Ctx | null>(null);

function rowToItem(row: DbProduct): InventoryItem {
  return {
    id: row.id,
    dbId: row.id,
    name: row.name,
    price: Number(row.price),
    cost: Number(row.cost),
    stock: row.stock,
    category: row.category || "General",
    image: row.image_url ?? "",
    lowStockThreshold: row.low_stock_threshold ?? LOW_STOCK_THRESHOLD,
  };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      setItems([]);
      setLoading(false);
      return;
    }
    setItems((data ?? []).map(rowToItem));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setStock = useCallback(
    async (id: string, n: number) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const next = Math.max(0, Math.round(n));
      setItems((arr) => arr.map((i) => (i.id === id ? { ...i, stock: next } : i)));
      const { error } = await supabase.from("products").update({ stock: next }).eq("id", item.dbId);
      if (error) {
        console.error("setStock", error);
        await load();
      }
    },
    [items, load],
  );

  const adjustStock = useCallback(
    async (id: string, delta: number) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await setStock(id, item.stock + delta);
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
          cost: p.cost ?? 0,
          stock: p.stock ?? 0,
          category: p.category ?? "General",
          low_stock_threshold: profile?.low_stock_threshold ?? LOW_STOCK_THRESHOLD,
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

  const updateProduct: Ctx["updateProduct"] = useCallback(
    async (id, patch) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const dbPatch: {
        name?: string;
        price?: number;
        cost?: number;
        stock?: number;
        category?: string;
        low_stock_threshold?: number;
      } = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.cost !== undefined) dbPatch.cost = patch.cost;
      if (patch.stock !== undefined) dbPatch.stock = patch.stock;
      if (patch.category !== undefined) dbPatch.category = patch.category;
      if (patch.lowStockThreshold !== undefined) dbPatch.low_stock_threshold = patch.lowStockThreshold;
      setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      const { error } = await supabase.from("products").update(dbPatch).eq("id", item.dbId);
      if (error) {
        console.error("updateProduct", error);
        await load();
      }
    },
    [items, load],
  );

  const removeProduct: Ctx["removeProduct"] = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      setItems((arr) => arr.filter((i) => i.id !== id));
      const { error } = await supabase.from("products").delete().eq("id", item.dbId);
      if (error) {
        console.error("removeProduct", error);
        await load();
      }
    },
    [items, load],
  );

  const value = useMemo<Ctx>(() => {
    const lowStock = items
      .filter((i) => i.stock <= i.lowStockThreshold)
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
      updateProduct,
      removeProduct,
      refresh: load,
      totalValue,
      totalUnits,
      productCount: items.length,
    };
  }, [items, loading, setStock, adjustStock, addProduct, updateProduct, removeProduct, load]);

  return <InventoryCtx.Provider value={value}>{children}</InventoryCtx.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryCtx);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
