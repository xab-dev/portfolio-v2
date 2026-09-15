const STORAGE_KEY = "simulator";

export interface SimulatorResult {
  source: "simulator" | "direct";
  simulatorSelection?: string[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Fonction pure : interprète la valeur brute lue en `sessionStorage['simulator']`.
 * Ne touche jamais au DOM ni au storage — testée sur les 3 cas (absent, invalide, valide).
 * Format attendu (à confirmer avec la spec 03 au moment de la Phase 2) : `{ selection: string[] }`.
 */
export function parseSimulatorValue(raw: string | null): SimulatorResult {
  if (!raw) return { source: "direct" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { source: "direct" };
  }

  if (
    parsed !== null &&
    typeof parsed === "object" &&
    "selection" in parsed &&
    isStringArray((parsed as { selection: unknown }).selection)
  ) {
    return { source: "simulator", simulatorSelection: (parsed as { selection: string[] }).selection };
  }

  return { source: "direct" };
}

/**
 * Lit `sessionStorage['simulator']` de façon défensive : clé absente, JSON invalide,
 * et navigation privée stricte (`SecurityError` à l'accès même) sont tous traités
 * comme "clé absente" (§3, §4 de la spec 07).
 */
export function readSimulator(): SimulatorResult {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  return parseSimulatorValue(raw);
}
