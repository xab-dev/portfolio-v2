import { describe, expect, it } from "vitest";
import { FAMILIES, computeRadarData, skills } from "./skills";

describe("skills", () => {
  it.each(FAMILIES)("la famille %s a au moins une compétence (radar toujours valide)", (family) => {
    const matching = skills.filter((skill) => skill.family === family);
    expect(matching.length).toBeGreaterThanOrEqual(1);
  });

  it("n'a jamais de niveau hors de l'échelle 1-5", () => {
    for (const skill of skills) {
      expect(skill.level).toBeGreaterThanOrEqual(1);
      expect(skill.level).toBeLessThanOrEqual(5);
    }
  });

  it("calcule une moyenne par famille pour les 6 axes du radar", () => {
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
});
