import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  GraduationCap,
  Headset,
  ListFilter,
  PenLine,
  ScanLine,
} from "lucide-react";

/**
 * Contenu du Simulateur (Phase 2, spec 03) — amendé par DETTE-07,
 * tranchée par Xav le 2026-09-15 : voir `specs/archives/PATCHES_2026-09-15_1800.md`
 * (le patch prime sur la spec 03 en cas de conflit).
 *
 * Fourchettes "temps gagné" limitées à ce qui est documenté publiquement.
 * Baselines h/sem = valeur par défaut d'un curseur modifiable par le
 * visiteur, pas une donnée client (T6). Ne jamais ajouter de problématique
 * ou de fourchette non listée dans le patch (§6 de la spec 03).
 */

export type EvidenceLevel = "etude" | "editeur" | "aucune";

export const EVIDENCE_BADGE_LABEL: Record<EvidenceLevel, string> = {
  etude: "Étude publiée",
  editeur: "Données éditeurs",
  aucune: "Gain non chiffré",
};

export type StackRole = "orchestration" | "llm" | "memoire" | "interface" | "controle";

export const ROLE_LABELS: Record<StackRole, string> = {
  orchestration: "Orchestration",
  llm: "LLM",
  memoire: "Mémoire",
  interface: "Interface",
  controle: "Contrôle",
};

export type StackItem = { name: string; role: StackRole; why: string };

export interface BaselineRange {
  default: number;
  min: number;
  max: number;
  step: number;
}

export type Problem = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Fourchette indicative de temps gagné ; absente = compteur masqué (tri, formation). */
  timeSavedPct?: [number, number];
  /**
   * Heures/semaine typiques, curseur visiteur. Optionnelle : `formation` n'a
   * pas de curseur (aucune heure de tâche déléguée à mesurer) — déviation
   * mineure et assumée par rapport au bloc de types du patch (§2), qui
   * déclare le champ obligatoire ; le tableau du même patch dit explicitement
   * "— (pas de curseur)" pour `formation`, ce que ce typage respecte au pied
   * de la lettre plutôt que d'inventer une fausse fourchette.
   */
  baseline?: BaselineRange;
  evidence: { level: EvidenceLevel; summary: string; refIds: string[] };
  /**
   * Message qualitatif affiché à la place du compteur quand `timeSavedPct`
   * est absent mais qu'un message spécifique existe (ex. `tri`). Sans ce
   * champ, le panneau retombe sur le message générique (`formation`).
   */
  qualitativeNote?: string;
  stack: StackItem[];
  humanControl: string;
  aiNotNeededIf?: string;
};

export const problems: Problem[] = [
  {
    id: "support",
    label: "Support client saturé",
    icon: Headset,
    description: "Des tickets qui s'accumulent, des réponses répétitives, un délai de traitement qui grossit.",
    timeSavedPct: [12, 25],
    baseline: { default: 15, min: 2, max: 40, step: 1 },
    evidence: {
      level: "etude",
      summary:
        "Mesuré sur un grand déploiement réel d'agents support ; gain plus marqué pour les équipes débutantes que pour les expertes.",
      refIds: ["brynjolfsson2023"],
    },
    stack: [
      { name: "Make / n8n", role: "orchestration", why: "Route chaque ticket vers le bon traitement sans intégration sur mesure." },
      { name: "Claude", role: "llm", why: "Rédige une réponse à partir du contexte du ticket et de la base de connaissances." },
      { name: "Base de connaissances FAQ", role: "memoire", why: "Ancre les réponses dans ce qui est déjà validé, plutôt que de les inventer." },
      { name: "Boîte mail existante", role: "interface", why: "Aucun nouvel outil à apprendre pour l'équipe support." },
    ],
    humanControl: "Toute réponse engageante (remboursement, litige) validée par un humain.",
    aiNotNeededIf: "Moins de 20 tickets/semaine : une FAQ bien faite suffit.",
  },
  {
    id: "contenu",
    label: "Création de contenu manuelle",
    icon: PenLine,
    description: "De la rédaction répétitive (posts, descriptions, emails) qui mange le temps sans valeur ajoutée réelle.",
    timeSavedPct: [25, 40],
    baseline: { default: 8, min: 1, max: 30, step: 1 },
    evidence: {
      level: "etude",
      summary:
        "Mesuré en expérience contrôlée avec des professionnels de la rédaction ; les auteurs notent un gain probablement moindre en conditions réelles.",
      refIds: ["noy2023"],
    },
    stack: [
      { name: "Claude", role: "llm", why: "Produit un premier jet à partir d'un brief, dans le ton défini." },
      { name: "Templates de prompts", role: "orchestration", why: "Méthode Xav : le prompt est écrit une fois, réutilisé, pas réinventé à chaque texte." },
      { name: "Notion / Docs", role: "memoire", why: "Centralise les briefs et les versions validées comme référence." },
    ],
    humanControl: "Relecture systématique, aucune publication automatique.",
  },
  {
    id: "saisie",
    label: "Saisie de données lourde",
    icon: ScanLine,
    description: "Extraire à la main des informations depuis des documents (factures, formulaires) vers un tableur ou un CRM.",
    evidence: {
      level: "aucune",
      summary:
        "Les éditeurs de solutions annoncent des gains importants sur le traitement documentaire, mais aucune étude indépendante ne les mesure sur une semaine de travail réelle.",
      refIds: [],
    },
    qualitativeNote:
      "Les éditeurs de solutions annoncent des gains importants sur le traitement documentaire, mais aucune étude indépendante ne les mesure sur une semaine de travail réelle. On en parle sur votre cas.",
    stack: [
      { name: "Make / n8n", role: "orchestration", why: "Déclenche l'extraction dès l'arrivée d'un document, sans intervention manuelle." },
      { name: "OCR", role: "interface", why: "Transforme un document scanné en texte exploitable." },
      { name: "Claude", role: "llm", why: "Structure le texte extrait dans le format attendu (champs, types)." },
      { name: "Tableur / CRM", role: "memoire", why: "Reste le système de référence : rien n'est stocké ailleurs." },
    ],
    humanControl: "Contrôle par échantillonnage + règles de validation.",
    aiNotNeededIf: "Données déjà structurées à la source : corriger le formulaire d'entrée d'abord.",
  },
  {
    id: "reporting",
    label: "Reporting hebdo chronophage",
    icon: BarChart3,
    description: "Compiler à la main les mêmes chiffres et la même synthèse, chaque semaine, pour le même public.",
    timeSavedPct: [20, 30],
    baseline: { default: 4, min: 1, max: 15, step: 1 },
    evidence: {
      level: "etude",
      summary:
        "Mesuré en expérience de terrain chez des consultants, avec une dégradation observée en dehors du périmètre couvert par l'IA.",
      refIds: ["dellacqua2023"],
    },
    stack: [
      { name: "Script Python", role: "orchestration", why: "Rassemble et calcule les chiffres depuis les sources existantes." },
      { name: "Claude", role: "llm", why: "Rédige la synthèse en langage clair à partir des chiffres calculés." },
      { name: "Envoi automatique", role: "interface", why: "Livre le rapport à l'heure prévue, sans étape manuelle d'envoi." },
    ],
    humanControl: "Lecture avant diffusion.",
  },
  {
    id: "tri",
    label: "Tri/priorisation de demandes",
    icon: ListFilter,
    description: "Trier et classer un flux de demandes entrantes avant même de savoir qui doit s'en occuper.",
    baseline: { default: 6, min: 1, max: 20, step: 1 },
    evidence: {
      level: "aucune",
      summary: "Précision de classification mesurée face à un humain ; aucune étude publiée ne chiffre un temps gagné généralisable.",
      refIds: [],
    },
    qualitativeNote:
      "Précision de classification mesurée en conditions réelles ; le temps gagné dépend de votre volume — à chiffrer sur site.",
    stack: [
      { name: "Claude", role: "llm", why: "Classe chaque demande selon des catégories définies avec vous." },
      { name: "Tableau de suivi", role: "memoire", why: "Garde la trace de ce qui a été classé et par qui, en cas de litige." },
    ],
    humanControl: "Seuil de confiance : sous le seuil → humain.",
  },
  {
    id: "formation",
    label: "Équipe qui utilise mal l'IA",
    icon: GraduationCap,
    description: "L'IA est déjà là, utilisée au hasard, sans méthode ni garde-fou partagé.",
    evidence: {
      level: "aucune",
      summary: "Pas de mesure publiée : ce gain dépend entièrement de l'accompagnement mis en place.",
      refIds: [],
    },
    stack: [
      { name: "Formation 4D", role: "orchestration", why: "Cadre Délégation / Description / Discernment / Diligence : la méthode avant l'outil." },
      { name: "Templates", role: "memoire", why: "Donne à l'équipe des prompts de départ éprouvés plutôt qu'une page blanche." },
      { name: "Charte d'usage", role: "controle", why: "Fixe par écrit ce que l'équipe a le droit de déléguer à l'IA." },
    ],
    humanControl: "Sans objet : ce module ne délègue rien, il forme les humains à mieux utiliser l'IA.",
  },
];

/** Taux horaire du curseur client (DETTE-08, 35 €/h confirmé par Xav). */
export const HOURLY_RATE: BaselineRange = { default: 35, min: 20, max: 120, step: 5 };

/** Semaines travaillées par an — utilisé pour heuresGagneesAn (spec 03 §2). */
export const WEEKS_PER_YEAR = 46;
