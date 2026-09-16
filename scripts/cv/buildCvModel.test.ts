import { describe, expect, it } from "vitest";
import type { Project } from "../../src/content/projects.ts";
import type { Skill } from "../../src/content/skills.ts";
import type { Milestone } from "../../src/content/timeline.ts";
import { type CvBuildInput, buildCvModel, sanitizeForPdf, truncateTagline } from "./buildCvModel.ts";

const LEVEL_LABELS = {
  1: "notions",
  2: "en apprentissage",
  3: "en consolidation",
  4: "maîtrisé",
  5: "pratique quotidienne",
} as const;

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test",
    title: "Projet test",
    tagline: "Une tagline courte.",
    tags: ["Outils"],
    status: "v1 fonctionnelle",
    year: 2026,
    problem: "problème",
    architecture: ["étape"],
    metrics: [],
    limits: ["limite"],
    accent: "blue",
    ...overrides,
  };
}

function makeInput(overrides: Partial<CvBuildInput> = {}): CvBuildInput {
  return {
    site: {
      name: "Xavier Joseph Bou",
      title: "Consultant outils et solutions IA",
      location: "Tarascon, Provence",
      contact: { emailPrimary: "xa.bou@laposte.net", phone: "07 69 54 74 94" },
      links: { github: "https://github.com/xab-dev/portfolio-v2", youtube: "https://youtube.com/@1_Autre_Monde", linkedin: "" },
      legal: { status: "Entrepreneur individuel (EI)", siret: "944 670 066 00017" },
      seo: { siteUrl: "https://xab-dev.github.io/portfolio-v2/" },
      languages: [{ name: "Français", level: "natif" }],
    },
    hero: { title: "Titre du hero", subtitle: "Sous-titre du hero." },
    projects: [makeProject()],
    skills: [],
    timeline: [],
    cv: {
      footerNote: "CV généré automatiquement depuis le portfolio",
      levelLabels: LEVEL_LABELS,
      meta: { subject: "CV — sujet", keywords: ["IA"] },
    },
    ...overrides,
  };
}

describe("sanitizeForPdf", () => {
  it("remplace la flèche → (hors sous-ensemble latin de la police) par un équivalent ASCII", () => {
    expect(sanitizeForPdf("clé USB → spec → diagnostic")).toBe("clé USB -> spec -> diagnostic");
  });

  it("laisse le reste du texte inchangé (accents, ponctuation typographique)", () => {
    expect(sanitizeForPdf("Développement piloté, tarif à 35 €/h — validé")).toBe(
      "Développement piloté, tarif à 35 €/h — validé",
    );
  });
});

describe("truncateTagline", () => {
  it("laisse une tagline courte intacte", () => {
    expect(truncateTagline("Une tagline courte.")).toBe("Une tagline courte.");
  });

  it("tronque à 140 caractères avec une ellipse (§4 edge case 2)", () => {
    const long = "a".repeat(200);
    const result = truncateTagline(long);
    expect(result.length).toBe(140);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("buildCvModel", () => {
  it("exclut les métriques non vérifiées (T6 — jamais d'auto-déclaré sur un CV)", () => {
    const model = buildCvModel(
      makeInput({
        projects: [
          makeProject({
            metrics: [
              { label: "Vérifiée", value: "oui", verified: true },
              { label: "Auto-déclarée", value: "1 (neveu)", verified: false },
            ],
          }),
        ],
      }),
    );
    expect(model.projects[0]!.metrics).toEqual([{ label: "Vérifiée", value: "oui" }]);
  });

  it("masque un lien vide (LinkedIn) sans laisser de libellé orphelin", () => {
    const model = buildCvModel(makeInput());
    expect(model.contact.links.find((link) => link.label === "LinkedIn")).toBeUndefined();
    expect(model.contact.links.map((l) => l.label)).toEqual(["GitHub", "YouTube"]);
  });

  it("inclut un lien renseigné (LinkedIn) quand il n'est pas vide", () => {
    const model = buildCvModel(
      makeInput({
        site: {
          ...makeInput().site,
          links: { ...makeInput().site.links, linkedin: "https://linkedin.com/in/xav" },
        },
      }),
    );
    expect(model.contact.links.map((l) => l.label)).toEqual(["GitHub", "YouTube", "LinkedIn"]);
  });

  it("n'imprime jamais emailSecondary (un seul mail sur un CV)", () => {
    const model = buildCvModel(makeInput());
    expect(model.contact).not.toHaveProperty("emailSecondary");
    expect(model.contact.email).toBe("xa.bou@laposte.net");
  });

  it("rend « — » pour un jalon dateKnown:false, la période telle quelle sinon", () => {
    const timeline: Milestone[] = [
      { id: "connu", period: "05/09/2026", title: "Connu", summary: "résumé", kind: "projet", dateKnown: true },
      { id: "inconnu", period: "période brouillon", title: "Inconnu", summary: "résumé", kind: "projet", dateKnown: false },
    ];
    const model = buildCvModel(makeInput({ timeline }));
    expect(model.timeline[0]!.period).toBe("05/09/2026");
    expect(model.timeline[1]!.period).toBe("—");
  });

  it("porte les 6 projets réels quand ils sont fournis en entrée (aucun filtrage de projet)", () => {
    const projects = Array.from({ length: 6 }, (_, i) => makeProject({ id: `p${i}`, title: `Projet ${i}` }));
    const model = buildCvModel(makeInput({ projects }));
    expect(model.projects).toHaveLength(6);
    expect(model.projects.map((p) => p.title)).toEqual(["Projet 0", "Projet 1", "Projet 2", "Projet 3", "Projet 4", "Projet 5"]);
  });

  it("rend le niveau en libellé texte, jamais en chiffre nu", () => {
    const skills: Skill[] = [
      { family: "Développement", name: "PowerShell", level: 4 },
      { family: "Données", name: "Biostatistique", level: 1, note: "hobby passion" },
    ];
    const model = buildCvModel(makeInput({ skills }));
    const flatSkills = model.skillGroups.flatMap((g) => g.skills);
    expect(flatSkills.find((s) => s.name === "PowerShell")?.levelLabel).toBe("maîtrisé");
    expect(flatSkills.find((s) => s.name === "Biostatistique")?.levelLabel).toBe("notions");
    for (const group of model.skillGroups) {
      for (const skill of group.skills) {
        expect(skill.levelLabel).not.toMatch(/^\d+$/);
      }
    }
  });

  it("groupe les compétences par famille en préservant l'ordre d'apparition du contenu", () => {
    const skills: Skill[] = [
      { family: "Méthode IA", name: "A", level: 5 },
      { family: "LLMs & agents", name: "B", level: 3 },
      { family: "Méthode IA", name: "C", level: 4 },
    ];
    const model = buildCvModel(makeInput({ skills }));
    expect(model.skillGroups.map((g) => g.family)).toEqual(["Méthode IA", "LLMs & agents"]);
    expect(model.skillGroups[0]!.skills.map((s) => s.name)).toEqual(["A", "C"]);
  });

  it("ne remplace jamais un chiffre pour un tarif : le tarif n'apparaît nulle part dans le modèle", () => {
    const model = buildCvModel(makeInput());
    const serialized = JSON.stringify(model);
    expect(serialized).not.toContain("25 €/h");
    expect(serialized).not.toContain("indicativeRateNote");
  });

  it("compose le statut légal et les métadonnées PDF depuis site.legal / site.name / site.title", () => {
    const model = buildCvModel(makeInput());
    expect(model.footer.statusLine).toBe("Entrepreneur individuel (EI) · SIRET 944 670 066 00017");
    expect(model.meta.title).toBe("Xavier Joseph Bou — Consultant outils et solutions IA");
    expect(model.meta.author).toBe("Xavier Joseph Bou");
    expect(model.meta.language).toBe("fr-FR");
  });
});
