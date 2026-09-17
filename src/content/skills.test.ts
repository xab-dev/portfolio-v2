import { describe, expect, it } from "vitest";
import { FAMILIES, POSITIONING, computeRadarData, skills } from "./skills";

describe("skills", () => {
  it.each(FAMILIES)("la famille %s a au moins une compétence (radar toujours valide)", (family) => {
    const matching = skills.filter((skill) => skill.family === family);
    expect(matching.length).toBeGreaterThanOrEqual(1);
  });

  it("n'a jamais de niveau hors de l'échelle 1-7", () => {
    for (const skill of skills) {
      expect(skill.level).toBeGreaterThanOrEqual(1);
      expect(skill.level).toBeLessThanOrEqual(7);
    }
  });

  it("calcule une moyenne par famille pour les 6 axes du radar, jamais au-delà de 5", () => {
    const radarData = computeRadarData();
    expect(radarData).toHaveLength(FAMILIES.length);
    for (const point of radarData) {
      expect(point.average).toBeGreaterThan(0);
      expect(point.average).toBeLessThanOrEqual(5);
    }
  });

  it("arrondit la moyenne au 0,5 le plus proche", () => {
    const radarData = computeRadarData();
    for (const point of radarData) {
      expect((point.average * 2) % 1).toBe(0);
    }
  });

  it("clampe un niveau 6/7 à 5 dans la moyenne du radar (pas de dépassement)", () => {
    const radarData = computeRadarData([
      { family: "Méthode IA", name: "test-7", level: 7 },
    ]);
    const methodeIa = radarData.find((point) => point.family === "Méthode IA");
    expect(methodeIa?.average).toBe(5);
  });
});

describe("POSITIONING", () => {
  it("a exactement 7 entrées IA1→IA7 dans l'ordre", () => {
    expect(POSITIONING).toHaveLength(7);
    expect(POSITIONING.map((entry) => entry.tier)).toEqual([
      "IA1",
      "IA2",
      "IA3",
      "IA4",
      "IA5",
      "IA6",
      "IA7",
    ]);
  });
});
