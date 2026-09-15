/**
 * Sources primaires du Simulateur (DETTE-07, tranchée par Xav le 2026-09-15 —
 * voir `specs/PATCHES_2026-09-15_1800.md` §1). 4 entrées, pas une de plus
 * (§6 de la spec 03 : interdiction d'ajouter une référence non listée ici).
 *
 * `verified: false` pour toutes : titres/venues renseignés de mémoire par
 * l'agent à partir des citations du patch, `url` volontairement absente
 * (interdiction de l'inventer). Vérification et lien en Phase 7 — DETTE-31.
 */
export type Reference = {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  url?: string;
  verified: boolean;
};

export const references: Reference[] = [
  {
    id: "brynjolfsson2023",
    authors: "Brynjolfsson, Li & Raymond",
    title: "Generative AI at Work",
    venue: "NBER Working Paper 31161 (republié Quarterly Journal of Economics, 140(2), 2025)",
    year: 2023,
    verified: false,
  },
  {
    id: "noy2023",
    authors: "Noy & Zhang",
    title: "Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence",
    venue: "Science, vol. 381",
    year: 2023,
    verified: false,
  },
  {
    id: "dellacqua2023",
    authors: "Dell'Acqua et al.",
    title:
      "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality",
    venue: "Harvard Business School Working Paper 24-013 (republié Organization Science, 2026)",
    year: 2023,
    verified: false,
  },
  {
    id: "idp-vendors-2025",
    authors: "Docsumo ; SenseTask",
    title: "Rapports éditeurs sur l'automatisation du traitement documentaire (IDP)",
    venue: "Rapports commerciaux d'éditeurs de solutions IDP — pas une étude académique indépendante",
    year: 2025,
    verified: false,
  },
];
