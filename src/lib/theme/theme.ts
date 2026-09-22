/**
 * Résolution et application du thème clair / sombre (Phase 9c, spec 12).
 *
 * Règle maître (§1) : sans choix explicite, le thème suit `prefers-color-scheme`
 * et réagit à chaud ; après un clic, le choix stocké prime, y compris aux
 * visites suivantes. La logique est pure et testée ici ; le script inline de
 * `index.html` en réimplémente une version minimale sans dépendance — il doit
 * s'exécuter avant le premier rendu, donc avant que ce module ne soit chargé
 * (même patron que `src/lib/perf/liteMode.ts`, Phase 6b).
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** Couleur de la barre d'UI du navigateur, par thème (`<meta name="theme-color">`). */
export const THEME_COLORS: Record<Theme, string> = {
  dark: "#0b0f19", // --bg-deep sombre
  light: "#ffffff", // --bg-deep clair (D5)
};

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Lit le choix explicite de l'utilisateur. Tolère l'absence de `localStorage`
 * et un `getItem` qui lève (navigation privée, stockage bloqué par la
 * politique du navigateur) : dans les deux cas le site reste fonctionnel et
 * retombe sur la préférence du navigateur (critère d'acceptation §8).
 */
export function readStoredTheme(storage: Pick<Storage, "getItem"> | null): Theme | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/** Fonction pure : choix explicite → sinon préférence du navigateur (D3). */
export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  if (stored) return stored;
  return prefersDark ? "dark" : "light";
}

/**
 * Applique le thème au document : attribut `data-theme` (consommé par les
 * blocs de `tokens.css`), `color-scheme` (formulaires, barres de défilement
 * natives) et les deux `<meta name="theme-color">`.
 *
 * Les deux métas portent un `media` (`prefers-color-scheme`) pour couvrir le
 * tout premier rendu ; dès qu'un thème est appliqué on écrit la **même**
 * couleur dans les deux, sinon un choix explicite contraire au réglage système
 * laisserait le navigateur peindre sa barre dans l'autre thème.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const color = THEME_COLORS[theme];
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

/** Écrit le choix explicite ; silencieux si le stockage est indisponible. */
export function storeTheme(storage: Pick<Storage, "setItem"> | null, theme: Theme): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Stockage bloqué : le thème reste appliqué pour la session en cours.
  }
}

/** `localStorage` s'il est accessible (son seul accès peut lever), sinon `null`. */
export function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}
