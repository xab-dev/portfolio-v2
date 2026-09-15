export type MilestoneKind = "formation" | "experience" | "projet" | "pivot";

export interface Milestone {
  id: string;
  period: string;
  title: string;
  summary: string;
  kind: MilestoneKind;
  dateKnown: boolean;
}

// Contenu réel (Fiche_Professionnelle_Xav.md, dette_suivi.md DETTE-12/17).
// DETTE-17 : le parcours antérieur à 2026 (études, coaching, Camargue, deux-roues,
// poker) reste à la discrétion de Xav et n'apparaît jamais ici — trajectoire
// IA/dev 2026 uniquement. `dateKnown: false` reste supporté pour de futurs jalons
// mais tous les jalons V1 sont datés : ne jamais inventer une date.
export const timeline: Milestone[] = [
  {
    id: "regie-maison",
    period: "01/09/2026",
    title: "Régie Maison",
    summary: "Premier projet : piloter TV Sony Bravia et Google Home depuis une interface unique.",
    kind: "projet",
    dateKnown: true,
  },
  {
    id: "hatd",
    period: "2026",
    title: "haTD → RPG-monde",
    summary: "Prototype de tower defense clicker, en cours d'extension vers une surcouche RPG.",
    kind: "projet",
    dateKnown: true,
  },
  {
    id: "templates",
    period: "2026",
    title: "Bibliothèque de templates de spec",
    summary: "6 formats pour transformer une dictée brute en instruction exploitable par un agent de code.",
    kind: "projet",
    dateKnown: true,
  },
  {
    id: "miniciel",
    period: "2026",
    title: "miniCiel / kit USB (avec SafeFolder)",
    summary: "Clé USB de diagnostic terrain achevée et testée, module SafeFolder inclus.",
    kind: "projet",
    dateKnown: true,
  },
  {
    id: "bilan-competences",
    period: "2026",
    title: "Bilan de compétences France Travail",
    summary: "Point d'étape formalisé sur la trajectoire professionnelle.",
    kind: "formation",
    dateKnown: true,
  },
  {
    id: "pivot-consultant",
    period: "09/2026",
    title: "Pivot : Consultant outils et solutions IA",
    summary: "Passage au statut d'indépendant, positionnement sur les workflows et usages IA.",
    kind: "pivot",
    dateKnown: true,
  },
  {
    id: "portfolio-v2",
    period: "09/2026",
    title: "Portfolio v2",
    summary: "Construction du portfolio/CV interactif, piloté par specs et livré phase par phase.",
    kind: "projet",
    dateKnown: true,
  },
];
