import { createFileRoute } from "@tanstack/react-router";
import TraxNavigation from "@/components/TraxNavigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trax" },
      { name: "description", content: "Transforms Figma designs into functional web applications, integrating AI capabilities and dynamic user interfaces." },
      { property: "og:title", content: "Trax" },
      { property: "og:description", content: "Transforms Figma designs into functional web applications, integrating AI capabilities and dynamic user interfaces." },
    ],
  }),
  component: () => <TraxNavigation />,
});
