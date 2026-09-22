import { ROLE_LABELS, WEEKS_PER_YEAR, type Problem, type StackItem, type StackRole } from "../../content/simulator";

/**
 * Fonctions pures du Simulateur (spec 03 §2 + §5, amendées par DETTE-07 —
 * `specs/archives/PATCHES_2026-09-15_1800.md`). Aucun React ici : testé isolément.
 */

/** Baseline h/sem choisie par le visiteur pour chaque problématique cochée. */
export type BaselineOverrides = Record<string, number>;

export interface SimulatorOutputs {
  heuresGagneesSemaine: number;
  heuresGagneesAn: number;
  /** Moyenne pondérée par les baselines, en pourcentage (0-100). */
  tempsGagnePct: number;
  valeurIndicativeAn: number;
  /** Au moins une problématique cochée a une fourchette `timeSavedPct`. */
  hasQuantified: boolean;
}

export function selectProblems(problems: Problem[], selection: string[]): Problem[] {
  const selected = new Set(selection);
  return problems.filter((problem) => selected.has(problem.id));
}

/** Baseline courante d'une problématique : override du curseur, sinon valeur par défaut du contenu. */
export function resolveBaseline(problem: Problem, overrides: BaselineOverrides): number {
  const override = overrides[problem.id];
  if (typeof override === "number") return override;
  return problem.baseline?.default ?? 0;
}

export function computeOutputs(
  selectedProblems: Problem[],
  baselineOverrides: BaselineOverrides,
  hourlyRate: number,
): SimulatorOutputs {
  const quantified = selectedProblems.filter(
    (problem): problem is Problem & { timeSavedPct: [number, number] } => problem.timeSavedPct !== undefined,
  );

  let heuresGagneesSemaine = 0;
  let baselineSum = 0;

  for (const problem of quantified) {
    const baseline = resolveBaseline(problem, baselineOverrides);
    const [min, max] = problem.timeSavedPct;
    const pct = (min + max) / 2 / 100;
    heuresGagneesSemaine += baseline * pct;
    baselineSum += baseline;
  }

  // moyenne pondérée = Σ(baseline_i × moy_i) / Σ baseline_i ; heuresGagneesSemaine EST déjà Σ(baseline_i × moy_i).
  const tempsGagnePct = baselineSum > 0 ? (heuresGagneesSemaine / baselineSum) * 100 : 0;
  const heuresGagneesAn = heuresGagneesSemaine * WEEKS_PER_YEAR;
  const valeurIndicativeAn = heuresGagneesAn * hourlyRate;

  return {
    heuresGagneesSemaine,
    heuresGagneesAn,
    tempsGagnePct,
    valeurIndicativeAn,
    hasQuantified: quantified.length > 0,
  };
}

export interface StackGroup {
  role: StackRole;
  label: string;
  items: StackItem[];
}

export const ROLE_ORDER: StackRole[] = ["orchestration", "llm", "memoire", "interface", "controle"];

/**
 * "Validation humaine" apparaît toujours dès qu'une problématique est cochée
 * (spec 03 §2), même si aucun `stack[]` de contenu ne porte le rôle `controle`.
 */
const AUTO_CONTROL_ITEM: StackItem = {
  name: "Validation humaine",
  role: "controle",
  why: "Rappel systématique : une stack IA reste sous supervision humaine, quelle que soit la problématique.",
};

/**
 * Union dédupliquée (par nom) des stacks des problématiques cochées, groupée
 * par rôle dans l'ordre orchestration → llm → mémoire → interface → contrôle.
 * En cas de doublon de nom entre deux problématiques, le `why` de la première
 * problématique cochée (ordre du contenu, pas de la sélection) est conservé.
 */
export function composeStack(selectedProblems: Problem[]): StackGroup[] {
  const byRole = new Map<StackRole, Map<string, StackItem>>();
  for (const role of ROLE_ORDER) byRole.set(role, new Map());

  for (const problem of selectedProblems) {
    for (const item of problem.stack) {
      const bucket = byRole.get(item.role);
      if (bucket && !bucket.has(item.name)) bucket.set(item.name, item);
    }
  }

  if (selectedProblems.length > 0) {
    const controlBucket = byRole.get("controle")!;
    if (!controlBucket.has(AUTO_CONTROL_ITEM.name)) controlBucket.set(AUTO_CONTROL_ITEM.name, AUTO_CONTROL_ITEM);
  }

  return ROLE_ORDER.map((role) => ({ role, label: ROLE_LABELS[role], items: Array.from(byRole.get(role)!.values()) })).filter(
    (group) => group.items.length > 0,
  );
}

export interface SimulatorStorageValue {
  selection: string[];
  baselines: Record<string, number>;
}

/**
 * Sérialisation `sessionStorage['simulator']` (format figé, patch §2) : ne
 * porte que les baselines des problématiques encore cochées, pour ne jamais
 * laisser de valeur fantôme d'une problématique décochée (spec 03 §4).
 */
export function buildStorageValue(selection: string[], baselineOverrides: BaselineOverrides): SimulatorStorageValue {
  const baselines: Record<string, number> = {};
  for (const id of selection) {
    if (typeof baselineOverrides[id] === "number") baselines[id] = baselineOverrides[id];
  }
  return { selection, baselines };
}
