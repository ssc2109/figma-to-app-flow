import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type Prefs = {
  theme?: "dark" | "auto";
  text_size?: "compact" | "normal" | "large";
  reduce_motion?: boolean;
};

const SCALE: Record<NonNullable<Prefs["text_size"]>, string> = {
  compact: "0.92",
  normal: "1",
  large: "1.12",
};

/**
 * Applies user preferences (theme, text size, reduce motion)
 * to the document root. Must be mounted inside AuthProvider.
 */
export default function PreferencesEffects() {
  const { profile } = useAuth();
  const prefs = (profile?.preferences as Prefs | null) ?? {};

  useEffect(() => {
    const root = document.documentElement;

    // Theme — Trax is dark-first; "auto" follows system, "dark" forces dark.
    const theme = prefs.theme ?? "dark";
    const applyTheme = () => {
      const prefersLight =
        theme === "auto" &&
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: light)").matches;
      root.classList.toggle("dark", !prefersLight);
    };
    applyTheme();
    let mql: MediaQueryList | null = null;
    if (theme === "auto" && window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: light)");
      mql.addEventListener?.("change", applyTheme);
    }

    // Text size scale
    root.style.setProperty("--text-scale", SCALE[prefs.text_size ?? "normal"]);

    // Reduce motion class (CSS in styles.css disables animations/transitions)
    root.classList.toggle("reduce-motion", !!prefs.reduce_motion);

    return () => {
      mql?.removeEventListener?.("change", applyTheme);
    };
  }, [prefs.theme, prefs.text_size, prefs.reduce_motion]);

  return null;
}
