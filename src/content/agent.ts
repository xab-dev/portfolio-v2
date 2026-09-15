export interface AgentBullet {
  id: string;
  label: string;
}

/** Puces affichées dans l'agent de poche (spec 02 §2). */
export const agentBullets: AgentBullet[] = [
  { id: "roi", label: "Quel est le ROI de tes projets ?" },
  { id: "dispo", label: "Es-tu disponible ?" },
  { id: "methode", label: "Comment tu travailles avec l'IA ?" },
  { id: "outils", label: "Quels outils tu utilises ?" },
  { id: "non-ia", label: "Quand l'IA n'est PAS la bonne réponse ?" },
];

/**
 * Réponses scriptées V1. Texte `roi` validé mot pour mot par Xav (DETTE-05,
 * partiellement réglée — seule cette réponse est passée en relecture finale ;
 * dispo l'est via DETTE-06 ; methode/outils/non-ia restent à relire par Xav).
 * Ne jamais ajouter de pourcentage ni une autre référence au poker ailleurs
 * sur le site (DETTE-17) : ce clin d'œil est unique à cette réponse.
 */
export const agentReplies: Record<string, string> = {
  roi: "Je ne vous sortirai pas un chiffre client inventé. Mes projets publiés sont des cas réels documentés (problème → architecture → limites) ; pour votre contexte, le simulateur ci-dessous donne une estimation indicative aux hypothèses affichées, et un vrai chiffrage se fait après diagnostic. Une chose quand même dont je suis sûr : le ROI de l'IA a un potentiel bien plus gros que celui du poker — et je parle en connaissance de cause.",
  dispo:
    "Oui, entièrement disponible. Je réponds sous un jour maximum. Je travaille de préférence à distance, mais je me déplace — même loin et sur une longue durée, par exemple pour un audit en immersion — dès qu'un devis est signé.",
  methode:
    "Je travaille avec le cadre 4D : Délégation (je confie l'exécution à l'IA), Description (un cahier des charges clair, pas un prompt vague), Discernment (je choisis l'outil après avoir compris le problème, jamais avant), Diligence (je vérifie tout ce qui sort). En résumé : je délègue l'exécution, jamais la vérification.",
  outils:
    "Claude au quotidien — Fable 5.1, Opus 5, Sonnet 5 selon la tâche — et Claude Code piloté par des specs écrites ; Python, JS, PowerShell pour le reste. Automatisation (Make, n8n) et RAG : notions pour l'instant, à creuser quand un projet le demandera vraiment. Je choisis l'outil après le problème, jamais avant.",
  "non-ia":
    "Trois cas où je ne mets pas d'IA : un process encore instable (le prompt changerait à chaque itération, il faut d'abord le stabiliser) ; une donnée sensible sans cadre de confidentialité clair (je n'y touche pas sans garde-fou) ; une tâche déjà plus rapide à la main qu'à cadrer pour un agent (la déléguer serait juste pour la forme).",
};

/** Réponse par défaut : saisie libre sans correspondance (mots-clés ou id). */
export const agentDefaultReply =
  "Je suis une version scriptée de l'agent — les réponses libres arrivent avec la V2. En attendant, une de ces questions vous aide ?";

/**
 * Mots-clés de repli pour la saisie libre (normalisés : minuscules, sans
 * accents). Le matching direct par id de puce est prioritaire — voir
 * `src/lib/agent/ScriptedAgentProvider.ts`.
 */
export const agentKeywords: Record<string, string[]> = {
  roi: ["roi", "rentab", "retour sur investissement", "chiffre"],
  dispo: ["dispo", "delai", "reactiv", "quand peux-tu", "planning"],
  methode: ["methode", "travailles", "4d", "process", "demarche"],
  outils: ["outil", "stack", "techno", "modele", "claude"],
  "non-ia": ["pas la bonne reponse", "pas ia", "sans ia", "non-ia", "quand l'ia n'est pas", "quand ia n'est pas"],
};
