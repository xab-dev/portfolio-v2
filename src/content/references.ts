/**
 * Sources primaires du Simulateur (DETTE-07). 3 entrées, pas une de plus
 * (§6 de la spec 03 : interdiction d'ajouter une référence non listée ici).
 *
 * Vérifiées par l'architecte le 2026-09-16 (DETTE-31, spec 09 §2) : DOI et
 * venues recopiés tels quels, ne pas re-chercher. L'entrée `idp-vendors-2025`
 * a été retirée (décision Xav : source éditeurs invérifiable) — `saisie` est
 * passée en gain non chiffré dans `simulator.ts`.
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
    venue: "The Quarterly Journal of Economics, 140(2), 889–942 (2025) — NBER Working Paper 31161 (2023)",
    year: 2025,
    url: "https://doi.org/10.1093/qje/qjae044",
    verified: true,
  },
  {
    id: "noy2023",
    authors: "Noy & Zhang",
    title: "Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence",
    venue: "Science, 381(6654), 187–192 (2023)",
    year: 2023,
    url: "https://doi.org/10.1126/science.adh2586",
    verified: true,
  },
  {
    id: "dellacqua2023",
    authors: "Dell'Acqua et al.",
    title:
      "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of Artificial Intelligence on Knowledge Worker Productivity and Quality",
    venue: "Organization Science, 37(2), 403–423 (2026) — HBS Working Paper 24-013 (2023)",
    year: 2026,
    url: "https://doi.org/10.1287/orsc.2025.21838",
    verified: true,
  },
];
