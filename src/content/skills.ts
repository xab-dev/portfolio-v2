export type Level = 1 | 2 | 3 | 4 | 5;

export type SkillFamily =
  | "Méthode IA"
  | "LLMs & agents"
  | "No-code / automatisation"
  | "Développement"
  | "Données"
  | "Humain";

export const LEVEL_LABELS: Record<Level, string> = {
  1: "Notions",
  2: "En apprentissage",
  3: "En consolidation",
  4: "Maîtrisé",
  5: "Pratique quotidienne",
};

export interface Skill {
  name: string;
  level: Level;
  note?: string;
  family: SkillFamily;
}

/** Badge sans niveau chiffré (ex. langues) : affiché, jamais moyenné dans le radar. */
export interface UnleveledSkill {
  name: string;
  note?: string;
  family: SkillFamily;
}

export const FAMILIES: SkillFamily[] = [
  "Méthode IA",
  "LLMs & agents",
  "No-code / automatisation",
  "Développement",
  "Données",
  "Humain",
];

// Contenu réel (Fiche_Professionnelle_Xav.md §Compétences, Positionnement...md §2-3).
// Auto-évaluation à valider par Xav [DETTE-15]. Ne jamais gonfler un niveau :
// un "1 notions" affiché honnêtement vaut mieux qu'un 3 flatté.
export const skills: Skill[] = [
  { family: "Méthode IA", name: "Cadre 4D (Délégation/Description/Discernment/Diligence)", level: 5, note: "pratique documentée" },
  { family: "Méthode IA", name: "Spec-driven development (6 templates)", level: 5 },
  { family: "Méthode IA", name: "Diagnostic structuré / cause racine", level: 4 },

  { family: "LLMs & agents", name: "Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code", level: 5, note: "usage quotidien, choix du modèle selon la tâche" },
  // Niveau 3 posé par l'architecte (DETTE-32, patch 2026-09-15 23:00) : Xav
  // l'ajuste directement ici s'il le souhaite, comme pour DETTE-15.
  { family: "LLMs & agents", name: "Autres LLM (ChatGPT, Gemini, Perplexity, Mammouth)", level: 3, note: "usage ciblé : chacun pour ce qu'il fait le mieux" },
  { family: "LLMs & agents", name: "Prompt engineering", level: 4 },
  { family: "LLMs & agents", name: "Architecture d'agents (function calling, MCP, orchestration)", level: 3, note: "compris, peu mis en prod" },
  { family: "LLMs & agents", name: "RAG", level: 1, note: "notions — à creuser quand un projet le demandera" },

  { family: "No-code / automatisation", name: "Make / n8n", level: 1, note: "notions — axe de consolidation" },

  { family: "Développement", name: "HTML/JS/CSS (canvas, single-file)", level: 4 },
  { family: "Développement", name: "Python (scripts, tkinter, pygame)", level: 4 },
  { family: "Développement", name: "PowerShell", level: 4 },
  { family: "Développement", name: "Godot / GDScript", level: 2, note: "cible haTD" },
  { family: "Développement", name: "Déploiement / Docker / VPS", level: 1, note: "notions, jamais déployé" },

  // [DETTE-16] Niveau en réflexion côté Xav : valeur neutre non gonflée (1 = notions)
  // en attente de confirmation — voir ARRÊT XAV de la Phase 5.
  { family: "Données", name: "Biostatistique / analyse de données", level: 1, note: "hobby passion" },

  { family: "Humain", name: "Vulgarisation / formation", level: 3 },
];

// Langues : badge sans niveau chiffré (réponse DETTE-21), jamais inclus dans la
// moyenne du radar de la famille "Humain".
export const unleveledSkills: UnleveledSkill[] = [
  { family: "Humain", name: "Langues : français natif, anglais très bon" },
];

export interface RadarPoint {
  family: SkillFamily;
  average: number;
}

/** Moyenne des niveaux par famille, arrondie au 0,5 le plus proche. */
export function computeRadarData(source: Skill[] = skills): RadarPoint[] {
  return FAMILIES.map((family) => {
    const levels = source.filter((skill) => skill.family === family).map((skill) => skill.level);
    const average = levels.length === 0 ? 0 : levels.reduce((sum, level) => sum + level, 0) / levels.length;
    return { family, average: Math.round(average * 2) / 2 };
  });
}
