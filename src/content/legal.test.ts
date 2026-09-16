import { describe, expect, it } from "vitest";
import { site } from "./site";
import { legalSections } from "./legal";

const EXPECTED_SECTION_IDS = [
  "editeur",
  "hebergement",
  "donnees-personnelles",
  "cookies",
  "propriete-intellectuelle",
  "derniere-mise-a-jour",
];

describe("site.legal — garde de déploiement (spec 09 §4)", () => {
  it("ne contient aucun placeholder [À ...] — build refusé tant que Xav n'a pas renseigné ces valeurs", () => {
    const flat = JSON.stringify(site.legal);
    expect(flat).not.toContain("[À");
  });
});

describe("legalSections", () => {
  it("affiche les 6 sections attendues, dans l'ordre", () => {
    expect(legalSections.map((section) => section.id)).toEqual(EXPECTED_SECTION_IDS);
  });

  it("chaque section a un titre et au moins un paragraphe non vide", () => {
    for (const section of legalSections) {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.paragraphs.length).toBeGreaterThan(0);
      for (const paragraph of section.paragraphs) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("ne propage aucun placeholder [À ...] dans le texte rendu", () => {
    const haystack = legalSections
      .flatMap((section) => [section.heading, ...section.paragraphs, ...(section.list ?? [])])
      .join(" ");
    expect(haystack).not.toContain("[À");
  });
});
