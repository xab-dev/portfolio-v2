import { describe, expect, it } from "vitest";
import { problems } from "../../content/simulator";
import { buildStorageValue, composeStack, computeOutputs, resolveBaseline, selectProblems } from "./compute";

const support = problems.find((p) => p.id === "support")!;
const contenu = problems.find((p) => p.id === "contenu")!;
const saisie = problems.find((p) => p.id === "saisie")!;
const tri = problems.find((p) => p.id === "tri")!;
const formation = problems.find((p) => p.id === "formation")!;

describe("computeOutputs", () => {
  it("vide : rien coché → tous les compteurs à zéro, pas de NaN", () => {
    const outputs = computeOutputs([], {}, 35);
    expect(outputs).toEqual({
      heuresGagneesSemaine: 0,
      heuresGagneesAn: 0,
      tempsGagnePct: 0,
      valeurIndicativeAn: 0,
      hasQuantified: false,
    });
  });

  it("un seul : support coché à sa baseline par défaut (15 h/sem) → vérification manuelle du calcul", () => {
    // 15 × moyenne(12, 25) % = 15 × 0.185 = 2.775 ≈ 2,8 (arrondi affiché à 0,1, §7.6 du patch).
    const outputs = computeOutputs([support], {}, 35);
    expect(outputs.heuresGagneesSemaine).toBeCloseTo(2.775, 6);
    expect(outputs.heuresGagneesAn).toBeCloseTo(2.775 * 46, 6);
    expect(outputs.valeurIndicativeAn).toBeCloseTo(2.775 * 46 * 35, 6);
    expect(outputs.tempsGagnePct).toBeCloseTo(18.5, 6);
    expect(outputs.hasQuantified).toBe(true);
  });

  it("baseline personnalisée (curseur visiteur) remplace la valeur par défaut du contenu", () => {
    const withDefault = computeOutputs([support], {}, 35);
    const withOverride = computeOutputs([support], { support: 2 }, 35);
    expect(withOverride.heuresGagneesSemaine).toBeCloseTo(2 * 0.185, 6);
    expect(withOverride.heuresGagneesSemaine).toBeLessThan(withDefault.heuresGagneesSemaine);
  });

  it("problématique non chiffrée (tri, formation, saisie) exclue du numérateur et du dénominateur", () => {
    const withTriAlone = computeOutputs([tri], {}, 35);
    expect(withTriAlone.hasQuantified).toBe(false);
    expect(withTriAlone.heuresGagneesSemaine).toBe(0);
    expect(withTriAlone.tempsGagnePct).toBe(0);

    const withSupportAndTri = computeOutputs([support, tri], {}, 35);
    const withSupportAlone = computeOutputs([support], {}, 35);
    // tri ne doit rien changer au calcul puisqu'il n'a pas de timeSavedPct.
    expect(withSupportAndTri).toEqual(withSupportAlone);
  });

  it("saisie (spec 09 : gain non chiffré, DETTE-31) exclue au même titre que tri/formation", () => {
    expect(saisie.timeSavedPct).toBeUndefined();
    expect(saisie.baseline).toBeUndefined();
    expect(saisie.evidence.level).toBe("aucune");

    const withSaisieAlone = computeOutputs([saisie], {}, 35);
    expect(withSaisieAlone.hasQuantified).toBe(false);
    expect(withSaisieAlone.heuresGagneesSemaine).toBe(0);

    const withSupportAndSaisie = computeOutputs([support, saisie], {}, 35);
    const withSupportAlone = computeOutputs([support], {}, 35);
    expect(withSupportAndSaisie).toEqual(withSupportAlone);
  });

  it("tous : les 6 problématiques cochées → moyenne pondérée définie, jamais > max des fourchettes cochées", () => {
    const outputs = computeOutputs(problems, {}, 35);
    expect(outputs.hasQuantified).toBe(true);
    expect(Number.isNaN(outputs.tempsGagnePct)).toBe(false);
    // Fourchette haute globale parmi les problématiques chiffrées (saisie exclue depuis la spec 09) : contenu (40 %).
    expect(outputs.tempsGagnePct).toBeLessThanOrEqual(40);
    expect(outputs.tempsGagnePct).toBeGreaterThan(0);
  });

  it("curseur à min avec plusieurs problématiques cochées : dénominateur toujours > 0", () => {
    const overrides = { support: support.baseline!.min, contenu: contenu.baseline!.min };
    const outputs = computeOutputs([support, contenu, saisie], overrides, 35);
    expect(outputs.heuresGagneesSemaine).toBeGreaterThan(0);
    expect(Number.isFinite(outputs.tempsGagnePct)).toBe(true);
  });
});

describe("resolveBaseline", () => {
  it("retombe sur la valeur par défaut du contenu si aucun override", () => {
    expect(resolveBaseline(support, {})).toBe(15);
  });

  it("formation n'a pas de baseline de contenu → 0 sans override", () => {
    expect(resolveBaseline(formation, {})).toBe(0);
  });
});

describe("selectProblems", () => {
  it("filtre dans l'ordre du contenu, pas dans l'ordre de la sélection", () => {
    const selected = selectProblems(problems, ["saisie", "support"]);
    expect(selected.map((p) => p.id)).toEqual(["support", "saisie"]);
  });
});

describe("composeStack", () => {
  it("aucune problématique cochée → aucun groupe, pas de 'Validation humaine' fantôme", () => {
    expect(composeStack([])).toEqual([]);
  });

  it("une seule problématique → 'Validation humaine' toujours présente dans le rôle contrôle", () => {
    const groups = composeStack([support]);
    const controle = groups.find((g) => g.role === "controle");
    expect(controle?.items.map((i) => i.name)).toContain("Validation humaine");
  });

  it("plusieurs problématiques partageant un outil (Claude) → dédoublonné une seule fois", () => {
    const groups = composeStack([support, contenu, saisie]);
    const llm = groups.find((g) => g.role === "llm");
    expect(llm?.items.filter((i) => i.name === "Claude")).toHaveLength(1);
  });

  it("toutes cochées → dédoublonnage effectif, ordre des rôles respecté, aucun crash", () => {
    const groups = composeStack(problems);
    expect(groups.map((g) => g.role)).toEqual(["orchestration", "llm", "memoire", "interface", "controle"]);
    const allNames = groups.flatMap((g) => g.items.map((i) => i.name));
    expect(new Set(allNames).size).toBe(allNames.length);
  });
});

describe("buildStorageValue", () => {
  it("ne conserve que les baselines des problématiques encore cochées (pas de valeur fantôme)", () => {
    const value = buildStorageValue(["support"], { support: 20, saisie: 5 });
    expect(value).toEqual({ selection: ["support"], baselines: { support: 20 } });
  });

  it("sélection vide → objet sérialisable sans erreur", () => {
    expect(buildStorageValue([], {})).toEqual({ selection: [], baselines: {} });
    expect(() => JSON.stringify(buildStorageValue([], {}))).not.toThrow();
  });
});
