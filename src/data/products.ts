// Solo helpers de formato. Los productos reales viven en Supabase (tabla products)
// y se leen vía useInventory(). Cualquier dato hardcodeado fue eliminado.

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export const PRODUCTS: Product[] = [];
export const PRODUCTS_BY_ID: Record<string, Product> = {};

export const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;
