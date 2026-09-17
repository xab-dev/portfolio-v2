export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 1 notions · 2 en apprentissage · 3 en consolidation · 4 maîtrisé · 5 pratique quotidienne
// 6 mis en production · 7 architecture & supervision
// Radar : min(level, 5). Les niveaux 6-7 sont des paliers de preuve (≈ IA6 / IA7), pas des ressentis.

export type SkillFamily =
  | "Méthode IA"
  | "LLMs & agents"
  | "No-code / automatisation"
  | "Développement"
  | "Données"
  | "Humain";

export const LEVEL_SCALE: Record<Level, { label: string; meaning: string; tier: string }> = {
  1: { label: "Notions", meaning: "Je sais ce que c'est et à quoi ça sert ; je n'ai rien produit avec.", tier: "≈ IA1–2" },
  2: { label: "En apprentissage", meaning: "Premiers essais, encore guidé ou sur exemples.", tier: "≈ IA2–3" },
  3: { label: "En consolidation", meaning: "Utilisé sur au moins un projet réel ; je m'appuie encore sur la doc ou l'IA pour les cas non triviaux.", tier: "≈ IA3–4" },
  4: { label: "Maîtrisé", meaning: "Autonome : je livre sans supervision et je sais expliquer mes choix.", tier: "≈ IA4–5" },
  5: { label: "Pratique quotidienne", meaning: "Outil de travail courant ; méthode documentée et réutilisable.", tier: "≈ IA5" },
  6: { label: "Mis en production", meaning: "J'ai conçu et fait tourner avec ça une chaîne ou une automatisation qui fonctionne sans moi, et je la maintiens.", tier: "≈ IA6" },
  7: { label: "Architecture & supervision", meaning: "Je conçois le système complet (IA, outils, données, contrôle), je le supervise et je transmets la méthode.", tier: "≈ IA7" },
};

// Bandeau Positionnement — indépendant des badges. À éditer à la main quand un palier change.
export type TierStatus = "acquis" | "en cours" | "cible";
export const POSITIONING: { tier: string; role: string; status: TierStatus; note?: string }[] = [
  { tier: "IA1", role: "Utilisateur", status: "acquis" },
  { tier: "IA2", role: "Power User", status: "acquis" },
  { tier: "IA3", role: "Prompt Engineer", status: "acquis" },
  { tier: "IA4", role: "AI Practitioner", status: "acquis" },
  { tier: "IA5", role: "AI Builder / Vibe Coder", status: "acquis", note: "Je construis des outils et applications avec l'IA au quotidien." },
  { tier: "IA6", role: "Automation Builder", status: "en cours", note: "Automatisations et agents compris et prototypés, pas encore en production." },
  { tier: "IA7", role: "AI Workflow Architect", status: "en cours", note: "Je conçois déjà des systèmes multi-outils ; la mise en production supervisée est l'étape suivante." },
];
export const POSITIONING_DISCLAIMER = "Grille de compétence personnelle, pas une certification.";

export interface Skill {
  name: string;
  level: Level;
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
// Auto-évaluation validée par Xav (DETTE-15, DETTE-16 closes). Ne jamais gonfler un niveau :
// un "1 notions" affiché honnêtement vaut mieux qu'un 3 flatté.
export const skills: Skill[] = [
  { family: "Méthode IA", name: "Cadre 4D", level: 5, note: "Délégation · Description · Discernement · Diligence — pratique documentée" },
  { family: "Méthode IA", name: "Spec-driven development (6 templates)", level: 6, note: "méthode formalisée et réutilisée sur plusieurs projets — passage à 7 quand elle aura été transmise et appliquée chez un client" },
  { family: "Méthode IA", name: "Diagnostic structuré / cause racine", level: 4 },

  { family: "LLMs & agents", name: "Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code", level: 5, note: "usage quotidien, choix du modèle selon la tâche" },
  { family: "LLMs & agents", name: "Autres LLM (ChatGPT, Gemini, Perplexity, Mammouth)", level: 4, note: "usage ciblé : chacun pour ce qu'il fait le mieux" },
  { family: "LLMs & agents", name: "Prompt engineering", level: 4 },
  { family: "LLMs & agents", name: "Architecture d'agents (function calling, MCP, orchestration)", level: 3, note: "compris, peu mis en prod" },

  { family: "No-code / automatisation", name: "Make / n8n", level: 1, note: "notions — axe de consolidation" },
  { family: "No-code / automatisation", name: "Conception de workflows humain ↔ LLM ↔ agent de code", level: 5, note: "la logique, pas la plateforme no-code" },
  { family: "No-code / automatisation", name: "RAG", level: 1, note: "notions — à creuser quand un projet le demandera" },

  { family: "Développement", name: "HTML/JS/CSS (canvas, single-file)", level: 4 },
  { family: "Développement", name: "Python (scripts, tkinter, pygame)", level: 4 },
  { family: "Développement", name: "PowerShell", level: 4 },
  { family: "Développement", name: "Godot / GDScript", level: 3, note: "haTD (prototype jouable, playtesté) + RPG en développement — utilisé sur un projet réel" },
  { family: "Développement", name: "Déploiement / Docker / VPS", level: 1, note: "notions, jamais déployé" },

  { family: "Données", name: "Biostatistique / analyse de données", level: 1, note: "hobby passion" },
  { family: "Données", name: "SQL", level: 2, note: "notions correctes — requêtes sur bases de hand histories poker (trackers, échantillons de 50 000 à plus d'un million de mains)" },

  { family: "Humain", name: "Vulgarisation / formation", level: 4, note: "autonome sur le contenu pédagogique 1AM et les 6 templates documentés" },
  { family: "Humain", name: "Langues : Français / English", level: 5 },
];

export interface RadarPoint {
  family: SkillFamily;
  average: number;
}

/**
 * Moyenne des niveaux par famille, arrondie au 0,5 le plus proche.
 * Le radar mesure la maîtrise pratique et reste sur 5 : un niveau 6/7 (palier de
 * preuve, cf. LEVEL_SCALE) y vaut 5, sans faire déborder l'axe.
 */
export function computeRadarData(source: Skill[] = skills): RadarPoint[] {
  return FAMILIES.map((family) => {
    const levels = source
      .filter((skill) => skill.family === family)
      .map((skill) => Math.min(skill.level, 5));
    const average = levels.length === 0 ? 0 : levels.reduce((sum, level) => sum + level, 0) / levels.length;
    return { family, average: Math.round(average * 2) / 2 };
  });
}
