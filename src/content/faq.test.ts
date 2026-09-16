import { describe, expect, it } from "vitest";
import { faqQuestions, faqUi } from "./faq";

const EXPECTED_IDS = ["workflow", "creation", "spec", "phases", "dette", "arret"];
const MAX_BUBBLE_LENGTH = 600;
const FORBIDDEN_STRINGS = ["Claude Max", "100 €", "phenomenxx", "LinkedIn"];

describe("faq (spec 10 §7.5)", () => {
  it("expose exactement les 6 questions, avec des ids uniques", () => {
    expect(faqQuestions).toHaveLength(6);
    const ids = faqQuestions.map((question) => question.id);
    expect(new Set(ids).size).toBe(6);
    expect([...ids].sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("met en avant exactement 2 questions (priority)", () => {
    const priorityIds = faqQuestions.filter((question) => question.priority).map((q) => q.id);
    expect(priorityIds.sort()).toEqual(["creation", "workflow"]);
  });

  it("n'a aucun tableau de paragraphes vide, ni paragraphe vide", () => {
    for (const question of faqQuestions) {
      expect(question.paragraphs.length, question.id).toBeGreaterThan(0);
      for (const paragraph of question.paragraphs) {
        expect(paragraph.length, question.id).toBeGreaterThan(0);
      }
    }
  });

  it("garde chaque bulle sous 600 caractères", () => {
    for (const question of faqQuestions) {
      for (const paragraph of question.paragraphs) {
        expect(paragraph.length, `${question.id}: ${paragraph.slice(0, 30)}…`).toBeLessThanOrEqual(
          MAX_BUBBLE_LENGTH,
        );
      }
    }
  });

  it("n'utilise `%` que dans la réponse `creation`, uniquement pour « 90 %»", () => {
    for (const question of faqQuestions) {
      const all = [question.label, ...question.paragraphs].join(" ");
      const matches = all.match(/%/g) ?? [];
      if (question.id === "creation") {
        expect(matches).toHaveLength(1);
        expect(all).toContain("90 %");
      } else {
        expect(matches, question.id).toHaveLength(0);
      }
    }
  });

  it("ne contient aucune des chaînes interdites (chiffres non validés, coordonnées)", () => {
    const allTexts = [
      faqUi.trigger,
      faqUi.title,
      faqUi.intro,
      faqUi.header,
      faqUi.skip,
      faqUi.reset,
      ...faqQuestions.flatMap((question) => [question.label, ...question.paragraphs]),
    ];
    for (const text of allTexts) {
      for (const forbidden of FORBIDDEN_STRINGS) {
        expect(text.includes(forbidden), `"${forbidden}" dans "${text}"`).toBe(false);
      }
    }
  });

  it("recopie la ponctuation avec les espaces insécables prescrites (?, :, », %)", () => {
    const allTexts = [
      faqUi.trigger,
      faqUi.title,
      ...faqQuestions.flatMap((question) => [question.label, ...question.paragraphs]),
    ];
    for (const text of allTexts) {
      // Un espace normal suivi de `?`, `:`, `»` ou `%` serait un oubli de
      // recopie (spec 10 §2/§6) : ces caractères doivent être précédés d'un
      // espace insécable (U+00A0), jamais d'un espace normal (U+0020).
      expect(text, text).not.toMatch(/ [?:»%]/);
    }
  });
});
