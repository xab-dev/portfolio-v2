/**
 * Résolution du mode de rendu (Phase 6b, spec 08) : `lite` coupe les effets de
 * rendu coûteux (verre dépoli, glows, halos) sous `pointer: coarse` ; `full`
 * ne change strictement rien (critère maître §7.1). Logique volontairement
 * pure et testée ici ; le script inline de `index.html` en réimplémente une
 * version minimale sans dépendance (§5, doit s'exécuter avant le premier
 * rendu, donc avant que ce module ne soit chargé).
 */
export type PerfMode = "lite" | "full";

const PERF_PARAM = "perf";
export const PERF_STORAGE_KEY = "perf";

function isPerfMode(value: string | null): value is PerfMode {
  return value === "lite" || value === "full";
}

/** Lit `?perf=lite|full` dans une chaîne de recherche ; `null` si absent ou invalide (edge case §4). */
export function parsePerfOverride(search: string): PerfMode | null {
  const value = new URLSearchParams(search).get(PERF_PARAM);
  return isPerfMode(value) ? value : null;
}

export interface ResolvePerfModeInput {
  /** `location.search`, ex. `"?perf=lite"`. */
  search: string;
  /** Valeur déjà mémorisée dans `sessionStorage['perf']` (ou `null`). */
  storedOverride: string | null;
  /**
   * Résultat de `matchMedia('(pointer: coarse)').matches`, ou `null` si
   * `matchMedia` est indisponible (edge case §4 : repli sur `full`).
   */
  prefersCoarsePointer: boolean | null;
}

/** Fonction pure : override URL → override mémorisé → détection → défaut `full`. */
export function resolvePerfMode({
  search,
  storedOverride,
  prefersCoarsePointer,
}: ResolvePerfModeInput): PerfMode {
  const urlOverride = parsePerfOverride(search);
  if (urlOverride) return urlOverride;
  if (isPerfMode(storedOverride)) return storedOverride;
  return prefersCoarsePointer === true ? "lite" : "full";
}
