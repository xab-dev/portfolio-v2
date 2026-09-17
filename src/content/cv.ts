import type { Level } from "./skills.ts";

// Libellés et règles de mise en page du CV PDF (Phase 8, spec 09 §2). Pas de
// faits ici : un fait manquant s'ajoute à son fichier source (site.ts,
// timeline.ts…) pour apparaître aussi sur le site (T8 étendu au PDF).
export const cv = {
  fileName: "cv-xavier-bou.pdf",
  ctaLabel: "Télécharger le CV (PDF)",
  sectionOrder: ["profil", "projets", "competences", "parcours", "langues"] as const,
  // Libellés d'en-tête du gabarit PDF (mise en page, pas des faits — §2) :
  // "contact" n'est pas dans `sectionOrder` (colonne latérale, pas une section
  // au sens du contenu principal) mais porte aussi un titre imprimé.
  sectionLabels: {
    profil: "Profil",
    projets: "Projets",
    competences: "Compétences",
    parcours: "Parcours",
    langues: "Langues",
    contact: "Contact",
  },
  generatedLabel: "Généré le",
  levelLabels: {
    1: "notions",
    2: "en apprentissage",
    3: "en consolidation",
    4: "maîtrisé",
    5: "pratique quotidienne",
    6: "mis en production",
    7: "architecture & supervision",
  } as Record<Level, string>,
  footerNote: "CV généré automatiquement depuis le portfolio — version à jour et projets détaillés sur",
  meta: {
    subject: "CV — Consultant outils et solutions IA",
    keywords: ["IA", "consultant", "automatisation", "Tarascon"],
  },
};
