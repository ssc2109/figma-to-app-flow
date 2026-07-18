import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type Prefs = {
  reduce_motion?: boolean;
};

/**
 * Applies user preferences to the document root.
 * Theme (dark) and text size (normal) are fixed by product decision and no
 * longer user-configurable. Only "Reducir movimiento" is respected here.
 */
export default function PreferencesEffects() {
  const { profile } = useAuth();
  const prefs = (profile?.preferences as Prefs | null) ?? {};

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.setProperty("--text-scale", "1");
    root.classList.toggle("reduce-motion", !!prefs.reduce_motion);
  }, [prefs.reduce_motion]);

  return null;
}
