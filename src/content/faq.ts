export interface FaqQuestion {
  id: string;
  label: string;
  /** Les deux questions mises en avant (premières, style accentué). */
  priority?: boolean;
  /** Réponse de l'agent : une bulle `AgentMessage` par paragraphe, dans l'ordre. */
  paragraphs: string[];
}

export const faqUi = {
  trigger: "Comment ce site a été créé ?",
  title: "Comment ce site a été créé ?",
  intro: "Ce site est son propre cas réel. Posez la question — les réponses viennent du journal de développement, pas d'un texte marketing.",
  header: "FAQ · réponses scriptées",
  skip: "Tout afficher",
  reset: "Autre question",
};

// Contenu dérivé de `JOURNAL_DEV.md` et des réponses de Xav (16/09) — rien
// n'est inventé (T6/T7). Textes recopiés tels quels, espaces insécables
// comprises (`?`, `:`, `»`, `%` précédés d'un U+00A0 — spec 10 §2).
export const faqQuestions: FaqQuestion[] = [
  {
    id: "workflow",
    label: "Qu'est-ce qu'un workflow ?",
    priority: true,
    paragraphs: [
      "Une boucle, pas une ligne. Chaque maillon fait ce qu'il fait le mieux, l'humain garde les points de contrôle. Celle qui a produit ce site :",
      "1 · Humain — l'idée arrive hors écran, avant de dormir ou en balade. Elle est posée en vrac, au téléphone.",
      "2 · ChatGPT — trie, sort les points intéressants, pose des questions. On creuse, d'idée en idée.",
      "3 · Humain — dès que ça prend forme, on arrête pour ne pas noyer le contexte : export, correction, reformulation, mise en ordre.",
      "4 · Claude — reçoit le tout et sert de cerveau, pas de secrétaire : contradictions, décisions à trancher, ce qui manque.",
      "5 · Humain — tranche.",
      "6 · Claude — rédige la spec numérotée.",
      "7 · Humain — relit et valide la spec. Rien ne part sans ça.",
      "8 · Claude Code — exécute, vérifie à l'écran, tient le journal, note la dette.",
      "9 · Humain — vérifie le résultat. Sur PC, et sur un Galaxy A04.",
      "10 · Claude — repart du journal et de la dette pour préparer la suite.",
      "11 · Humain — nouvelle idée. Retour en 1.",
      "Cinq points de contrôle humain sur onze étapes. Aucun ne se délègue.",
    ],
  },
  {
    id: "creation",
    label: "Comment ce site a été créé ?",
    priority: true,
    paragraphs: [
      "Avec la méthode qu'il décrit — le site est son propre cas réel.",
      "Le problème. Pas de CV à jour, pas de réseaux, rien qui montre ce que je voulais faire. Un problème d'exposition, pas un problème de code.",
      "Le contexte d'abord. Un prompt « fais-moi un site perso » sur une session vide donne un site générique. Ici, les LLM avaient deux mois de projets, de décisions et de vocabulaire en mémoire. D'après mon ressenti d'utilisateur, ce contexte pèse autant qu'il est invisible.",
      "Le cadrage (nuit du 13 au 14/09, kit finalisé le 15/09). Idée dégrossie avec ChatGPT, dont le prompt d'ouverture — « tu agis en tant qu'expert… » — repris une dizaine de fois, à la virgule près. Puis dictée à Claude : une roadmap, 7 specs numérotées, 12 décisions tranchées à l'avance (dont « aucune métrique client inventée »), un fichier de dette. 7 questions de fond posées et tranchées avant la première ligne de code.",
      "L'exécution (15–16/09). Claude Code, une phase par spec, dans un ordre qui n'est pas celui des numéros : d'abord le cœur du CV (projets, compétences), les modules inédits après. Chaque phase : cause racine avant patch, vérification visuelle réelle à 375 et 1280 px, journal, dette. Le site est en ligne dès la Phase 0.",
      "Les arrêts. L'agent s'arrête et attend à chaque point qu'il ne peut pas vérifier seul : relecture des fiches, niveaux de compétences, réception d'un mail, ressenti sur un vrai téléphone.",
      "Ce qui a cassé. Une dizaine de bugs trouvés à l'écran et pas dans les tests : menu mobile transparent, modale non scrollable, texte qui tape deux fois trop lentement. Un bug corrigé puis réintroduit deux phases plus tard, avoué dans le journal. Un journal de phase oublié, reconstitué après coup et signalé comme tel.",
      "Le test terrain. Défilement saccadé sur un Galaxy A04. Réponse : un mode allégé, avec un critère strict — le rendu PC doit rester identique au pixel près (vérifié : 0 pixel de différence). Verdict sur le téléphone : « nette amélioration ».",
      "Le bilan. Trois jours, onze phases dont ce pop-up, 81 tests, 36 lignes de dette suivies, un build qui refuse de passer si le CV dépasse une page. Claude Pro + Claude Code + humain : 90 % du travail. Le reste : ChatGPT pour dégrossir, Gemini pour ce qui touche à Google.",
    ],
  },
  {
    id: "spec",
    label: "C'est quoi une spec ?",
    paragraphs: [
      "Un fichier texte numéroté qui décrit une phase avant qu'elle soit codée : rôle, entrées et sorties, comportement attendu, cas limites, critères de passage, hors scope. L'agent ne code jamais sans.",
      "Ce site en compte onze, celle de cette FAQ comprise. Elles viennent d'une bibliothèque de six templates — le Playground, plus haut, en montre trois à l'œuvre.",
    ],
  },
  {
    id: "phases",
    label: "Pourquoi des phases ?",
    paragraphs: [
      "Une phase = une spec = une session. Assez petit pour être vérifié entièrement à l'écran avant de passer à la suite, assez grand pour livrer quelque chose de visible.",
      "Ici : socle, hero et agent, simulateur, playground, projets, compétences, contact et jouer, mode allégé, polish et mentions légales, CV PDF, cette FAQ. L'ordre d'exécution n'est pas celui des numéros : le cœur du CV d'abord, les modules inédits quand le contenu était stabilisé.",
    ],
  },
  {
    id: "dette",
    label: "C'est quoi la dette suivie ?",
    paragraphs: [
      "Un fichier où tout ce qui manque ou reste à confirmer est écrit noir sur blanc, avec un numéro, plutôt que masqué par une valeur inventée. L'agent y ajoute des lignes, n'en supprime jamais ; l'humain coche.",
      "Ce site : 36 lignes numérotées à ce jour — un niveau de compétence provisoire, une photo de poste de travail floutée avant publication, une numérotation en collision entre deux phases, signalée plutôt que corrigée en silence.",
    ],
  },
  {
    id: "arret",
    label: "[ARRÊT HUMAIN], c'est quoi ?",
    paragraphs: [
      "Le marqueur que l'agent pose quand un critère de passage ne peut pas être vérifié par lui : relire un texte, confirmer qu'un mail est arrivé, juger la fluidité sur un vrai téléphone, relire un PDF imprimé. Il s'arrête, rend compte, et rien n'est poussé en ligne.",
      "Ce site en a connu sept. Aucun n'a été levé par l'agent lui-même.",
    ],
  },
];
