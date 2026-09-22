/**
 * Source de vérité unique du thème courant, partagée par tous les composants
 * (Phase 9c/4).
 *
 * Cause racine de son existence : `useTheme` gardait le thème dans un
 * `useState` **par instance**. Tant qu'un seul composant le consommait (le
 * bouton de la Navbar), l'illusion tenait — il appliquait le thème au document
 * et se re-rendait lui-même. Dès qu'un second composant l'a consommé (l'avatar
 * du Hero), le clic ne réveillait plus que le bouton : le document basculait,
 * l'avatar restait sur l'image de l'ancien thème jusqu'au rechargement. Mesuré
 * en CDP aux deux largeurs, dans les deux sens.
 *
 * Le store ne fait que **diffuser** la valeur : l'application au document reste
 * dans `applyTheme` (theme.ts) et la persistance dans `storeTheme`. Il est
 * volontairement sans React pour rester testable sans DOM ni moteur de rendu ;
 * `useTheme` s'y branche par `useSyncExternalStore`.
 */
import { applyTheme, readStoredTheme, resolveTheme, safeLocalStorage, type Theme } from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

let current: Theme | null = null;
const listeners = new Set<() => void>();
let media: MediaQueryList | null = null;

/**
 * Thème posé sur `<html>` par le script inline d'`index.html`, exécuté avant
 * le premier rendu. On le relit plutôt que de le recalculer (aucun flash, §1.3).
 */
function readDocumentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Valeur courante. Stable entre deux `setTheme` : exigé par `useSyncExternalStore`. */
export function getTheme(): Theme {
  if (current === null) current = readDocumentTheme();
  return current;
}

/** Valeur de repli hors navigateur (rendu serveur, tests sans DOM). */
export function getServerTheme(): Theme {
  return "dark";
}

/** Diffuse une nouvelle valeur. Sans effet — et sans notification — si inchangée. */
export function setTheme(next: Theme): void {
  if (getTheme() === next) return;
  current = next;
  // Copie : un abonné qui se désabonne pendant la diffusion ne doit pas
  // décaler l'itération sur les suivants.
  for (const listener of Array.from(listeners)) listener();
}

/**
 * Suit la préférence du navigateur **à chaud**, tant qu'aucun choix explicite
 * n'est stocké (D3). Branché sur le premier abonné et débranché avec le
 * dernier : une seule écoute pour toute l'application, quel que soit le nombre
 * de composants qui lisent le thème.
 */
function attachMediaListener(): void {
  if (media || typeof window === "undefined" || !window.matchMedia) return;
  media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onMediaChange);
}

function detachMediaListener(): void {
  media?.removeEventListener("change", onMediaChange);
  media = null;
}

function onMediaChange(event: MediaQueryListEvent): void {
  if (readStoredTheme(safeLocalStorage())) return; // un choix explicite prime
  const next = resolveTheme(null, event.matches);
  applyTheme(next);
  setTheme(next);
}

export function subscribeTheme(listener: () => void): () => void {
  if (listeners.size === 0) attachMediaListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detachMediaListener();
  };
}

/** Remise à zéro — réservée aux tests. */
export function resetThemeStore(): void {
  current = null;
  listeners.clear();
  detachMediaListener();
}
