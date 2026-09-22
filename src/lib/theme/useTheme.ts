import { useEffect, useState } from "react";
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  safeLocalStorage,
  storeTheme,
  type Theme,
} from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  // Le script inline de `index.html` a déjà posé `data-theme` avant le premier
  // rendu : on le relit plutôt que de recalculer (aucun flash, §1.3).
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Thème courant + bascule (spec 12 §5). Tant qu'aucun choix explicite n'est
 * stocké, le thème suit le navigateur **à chaud** (écoute de `matchMedia`) ;
 * dès le premier clic, le choix stocké prime et l'écoute devient sans effet.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      // Un choix explicite prime : on ne suit le système que sans clé stockée (D3).
      if (readStoredTheme(safeLocalStorage())) return;
      const next = resolveTheme(null, event.matches);
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(safeLocalStorage(), next);
    setTheme(next);
  };

  return { theme, toggle };
}
