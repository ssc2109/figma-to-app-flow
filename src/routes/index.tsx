import { createFileRoute } from "@tanstack/react-router";
import TraxNavigation from "@/components/TraxNavigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trax — Punto de venta" },
      { name: "description", content: "POS móvil para pequeños negocios: inicio, ventas y carrito." },
      { property: "og:title", content: "Trax — Punto de venta" },
      { property: "og:description", content: "POS móvil para pequeños negocios." },
    ],
  }),
  component: () => <TraxNavigation />,
});
