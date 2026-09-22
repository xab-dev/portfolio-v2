import { useSyncExternalStore } from "react";
import { applyTheme, safeLocalStorage, storeTheme, type Theme } from "./theme";
import { getServerTheme, getTheme, setTheme, subscribeTheme } from "./themeStore";

/**
 * Thème courant + bascule (spec 12 §5).
 *
 * L'état vit dans `themeStore` et non dans le hook : plusieurs composants le
 * consomment (le bouton de la Navbar, l'avatar du Hero) et doivent tous se
 * re-rendre au même clic. Le suivi à chaud de `prefers-color-scheme` est lui
 * aussi porté par le store — une écoute pour l'application, pas une par appel.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(safeLocalStorage(), next);
    setTheme(next);
  };

  return { theme, toggle };
}
