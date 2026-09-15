import { describe, expect, it } from "vitest";
import { projects, type ProjectTag } from "./projects";

const ALL_TAGS: ProjectTag[] = ["Automations", "Formations", "Jeu", "Outils", "Méthode"];

describe("projects", () => {
  it("a des ids uniques", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(ALL_TAGS)("le tag %s a au moins un projet (aucun filtre vide)", (tag) => {
    const matching = projects.filter((project) => project.tags.includes(tag));
    expect(matching.length).toBeGreaterThanOrEqual(1);
  });

  it("n'affiche jamais une métrique verified sans valeur", () => {
    for (const project of projects) {
      for (const metric of project.metrics) {
        expect(metric.value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("documente toujours au moins une limite par projet", () => {
    for (const project of projects) {
      expect(project.limits.length).toBeGreaterThanOrEqual(1);
    }
  });
});
