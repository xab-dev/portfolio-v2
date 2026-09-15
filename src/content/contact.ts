import { site } from "./site";

export const projectTypes = [
  "Diagnostic / cadrage IA",
  "Automatisation d'un process",
  "Outil sur mesure",
  "Formation équipe (4D)",
  "Intervention IT / maintenance",
  "Autre",
] as const;

// Fourchettes validées par Xav (D4 / DETTE-18, 2026-09-15).
export const budgets = ["< 500 €", "500 – 2 000 €", "2 000 – 5 000 €", "> 5 000 €", "À définir"] as const;

export const timings = ["Cette semaine", "Ce mois", "Ce trimestre", "Pas de date"] as const;

export type ProjectType = (typeof projectTypes)[number];
export type Budget = (typeof budgets)[number];
export type Timing = (typeof timings)[number];

/** Valeur pré-sélectionnée à l'étape 1 quand `sessionStorage['simulator']` est présent (§3). */
export const simulatorProjectType: ProjectType = "Automatisation d'un process";

// D3 validé : endpoint public par conception, pas un secret (§6 de la spec).
export const formspreeEndpoint = "https://formspree.io/f/xgaegryp";

export const availabilityNote =
  "Disponible — réponse sous 24 h. À distance de préférence ; déplacement possible, même longue durée (audit en immersion), sur devis signé.";

// DETTE-25 tranché (formulation volontairement souple).
export const indicativeRateNote =
  "Tarif indicatif : à partir de 25 €/h, ajusté selon l'intervention et les outils IA mobilisés. Devis après un premier échange.";

export const gdprConsentLabel = "J'accepte que ces informations servent uniquement à me répondre.";

// Patch 2026-09-15 23:00 §C : sortie du composant Contact.tsx (T8).
export const directContactHeading = "Contact direct préféré ?";

// DETTE-06 validé.
export const confirmationDelayNote = "Réponse sous 24 h.";

export const directContact = {
  emailPrimary: site.contact.emailPrimary,
  emailSecondary: site.contact.emailSecondary,
  phoneDisplay: site.contact.phone,
  // DETTE-20 validé : affichage FR, liens au format international.
  telHref: "tel:+33769547494",
  whatsappHref: "https://wa.me/33769547494",
};
