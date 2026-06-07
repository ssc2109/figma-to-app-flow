import bebidas from "@/assets/generated/cat-bebidas.png";
import snacks from "@/assets/generated/cat-snacks.png";
import abarrotes from "@/assets/generated/cat-abarrotes.png";
import limpieza from "@/assets/generated/cat-limpieza.png";
import otros from "@/assets/generated/cat-otros.png";

const MAP: Record<string, string> = {
  bebidas,
  bebida: bebidas,
  gaseosas: bebidas,
  snacks,
  snack: snacks,
  golosinas: snacks,
  abarrotes,
  abarrote: abarrotes,
  granos: abarrotes,
  limpieza,
  hogar: limpieza,
  otros,
  general: otros,
};

export function getCategoryIcon(category?: string | null): string {
  if (!category) return otros;
  const k = category.toLowerCase().trim();
  return MAP[k] ?? otros;
}
