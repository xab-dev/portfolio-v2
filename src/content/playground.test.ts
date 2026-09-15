import { describe, expect, it } from "vitest";
import {
  DEFAULT_CASE_ID,
  EXPERT_PROMPT_MAX_LINES,
  NO_LLM_OUTPUT,
  playgroundCases,
  templateNames,
} from "./playground";

const EXPECTED_IDS = ["court", "moyen", "long", "bizarre"];

describe("playground (spec 04 amendée §7.5)", () => {
  it("expose exactement les 4 cas, avec des ids uniques", () => {
    expect(playgroundCases).toHaveLength(4);
    const ids = playgroundCases.map((playgroundCase) => playgroundCase.id);
    expect(new Set(ids).size).toBe(4);
    expect([...ids].sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("garde chaque prompt expert sous la limite de lignes (lisible sur mobile)", () => {
    for (const playgroundCase of playgroundCases) {
      const lineCount = playgroundCase.expertPrompt.split("\n").length;
      expect(lineCount, playgroundCase.id).toBeLessThanOrEqual(EXPERT_PROMPT_MAX_LINES);
    }
  });

  it("porte un templateRef si et seulement si le verdict est de type template", () => {
    for (const playgroundCase of playgroundCases) {
      const { kind, templateRef } = playgroundCase.verdict;
      expect(templateRef !== undefined, playgroundCase.id).toBe(kind === "template");
    }
  });

  it("ne cite que des templates de la bibliothèque réelle", () => {
    for (const playgroundCase of playgroundCases) {
      const { templateRef } = playgroundCase.verdict;
      if (templateRef) expect(Object.keys(templateNames)).toContain(templateRef);
    }
  });

  it("le cas long route via T6 vers T1 + T2, sous leurs vrais noms (§7.4)", () => {
    const longCase = playgroundCases.find((playgroundCase) => playgroundCase.id === "long");
    expect(longCase?.verdict.templateRef).toBe("T6");
    expect(longCase?.expertPrompt).toContain(templateNames.T1);
    expect(longCase?.expertPrompt).toContain(templateNames.T2);
    expect(longCase?.expertPrompt).toContain("Extrait de ma bibliothèque de templates de spec");
    expect(DEFAULT_CASE_ID).toBe("long");
  });

  it("le cas bizarre est un conseil sans sortie générée (§7.4)", () => {
    const weirdCase = playgroundCases.find((playgroundCase) => playgroundCase.id === "bizarre");
    expect(weirdCase?.verdict.kind).toBe("conseil");
    expect(weirdCase?.expertOutput).toBe(NO_LLM_OUTPUT);
  });

  it("chaque annotation ancre un segment présent sur une seule ligne du prompt expert", () => {
    for (const playgroundCase of playgroundCases) {
      const lines = playgroundCase.expertPrompt.split("\n");
      for (const annotation of playgroundCase.annotations) {
        expect(annotation.anchor.includes("\n"), `${playgroundCase.id}: ${annotation.anchor}`).toBe(false);
        const matches = lines.filter((line) => line.includes(annotation.anchor)).length;
        expect(matches, `${playgroundCase.id}: ${annotation.anchor}`).toBe(1);
      }
    }
  });

  it("n'affiche aucun pourcentage (T6 : pas de promesse chiffrée)", () => {
    for (const playgroundCase of playgroundCases) {
      const texts = [
        playgroundCase.rawPrompt,
        playgroundCase.verdict.headline,
        playgroundCase.verdict.why,
        playgroundCase.expertPrompt,
        playgroundCase.rawOutput,
        playgroundCase.expertOutput,
        ...playgroundCase.annotations.map((annotation) => annotation.note),
      ];
      for (const text of texts) expect(text, playgroundCase.id).not.toMatch(/%/);
    }
  });
});
