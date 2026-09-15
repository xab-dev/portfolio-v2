/**
 * Textes validés par Xav le 2026-09-15 (DETTE-09). Voix = celle de `agent.ts` :
 * direct, sans jargon, jamais de promesse chiffrée. Aucun pourcentage, aucun
 * chiffre client. Les templates cités sont ceux de `docs/TEMPLATES_SPEC.md`
 * (6 templates), sous leurs vrais noms.
 */

export type PlaygroundCaseId = "court" | "moyen" | "long" | "bizarre";

export type TemplateRef = "T1" | "T2" | "T3" | "T4" | "T5" | "T6";

export interface PlaygroundAnnotation {
  /** Segment exact du prompt expert à surligner — doit tenir sur une seule ligne. */
  anchor: string;
  note: string;
}

export interface PlaygroundVerdict {
  kind: "template" | "conseil";
  /** Présent ssi `kind === "template"`. */
  templateRef?: TemplateRef;
  headline: string;
  why: string;
}

export interface PlaygroundCase {
  id: PlaygroundCaseId;
  label: string;
  rawPrompt: string;
  verdict: PlaygroundVerdict;
  /** ≤ 25 lignes ; pour `kind === "conseil"`, un conseil structuré, pas un prompt. */
  expertPrompt: string;
  rawOutput: string;
  expertOutput: string;
  annotations: PlaygroundAnnotation[];
}

/** Noms réels de la bibliothèque (`docs/TEMPLATES_SPEC.md`), affichés via le badge du verdict. */
export const templateNames: Record<TemplateRef, string> = {
  T1: "Micro-Ticket",
  T2: "Module Standard",
  T3: "Session Diagnostic",
  T4: "Cahier des Charges Technique",
  T5: "Roadmap + Specs numérotées",
  T6: "Notes de Session Brute (Triage)",
};

export const DEFAULT_CASE_ID: PlaygroundCaseId = "long";

export const EXPERT_PROMPT_MAX_LINES = 25;

export const NO_LLM_OUTPUT = "Aucune sortie LLM : la bonne réponse ici est une méthode, pas un texte généré.";

export const playgroundCases: PlaygroundCase[] = [
  {
    id: "court",
    label: "Prompt court",
    rawPrompt: "fais-moi un site pour mon asso",
    verdict: {
      kind: "template",
      templateRef: "T4",
      headline: "→ Trop court pour une spec : cinq questions, puis un Cahier des Charges Technique (T4)",
      why: "Six mots, aucune contrainte : je ne sais ni pour qui, ni quoi, ni qui fera vivre le site après moi. Un prompt court n'est pas une erreur, c'est une entrée de triage — je pose les questions avant d'écrire une ligne.",
    },
    expertPrompt: `Avant d'écrire quoi que ce soit, cinq questions :
- Public : qui visite ce site, et pour y faire quoi en priorité ?
- Contenu : quelles pages au lancement (agenda, adhésion, contact…) ?
- Mise à jour : qui publie ensuite, avec quel niveau d'aisance ?
- Budget et hébergement : gratuit, nom de domaine, abonnement existant ?
- Délai : une date qui compte (assemblée générale, événement) ?

Les réponses alimentent un Cahier des Charges Technique (T4) :
# [Asso] — Cahier des Charges Technique
## 1. Périmètre — dans / hors périmètre, liste exhaustive
## 2. Commandes / interface — pages, formulaires, qui modifie quoi
## 3. Règles de sécurité / confirmation — données des adhérents, accès
## 4. Stockage / format de données — où vivent les contenus
## 5. Comportements limites — site hors ligne, formulaire en erreur
## 6. Critères de validation — comment on sait que c'est livré`,
    rawOutput:
      "Voici une structure de site pour votre association : Accueil, À propos, Événements, Adhésion, Contact. Utilisez un thème moderne et des couleurs accueillantes. Souhaitez-vous que je génère le code HTML ?",
    expertOutput:
      "Un cahier des charges d'une page, relu avec l'asso, qui fixe le périmètre avant tout code : les pages du lancement, qui met à jour, où c'est hébergé. Le site se construit ensuite sans surprise — et rien n'est développé pour une question qui n'a pas été posée.",
    annotations: [
      {
        anchor: "cinq questions",
        note: "Un prompt de six mots contient plus de questions que de réponses : on les pose avant d'écrire, pas après avoir livré.",
      },
      {
        anchor: "Mise à jour : qui publie ensuite",
        note: "La question qu'on oublie toujours. Un site que personne ne sait mettre à jour meurt vite, quel que soit son design.",
      },
      {
        anchor: "dans / hors périmètre, liste exhaustive",
        note: "Le hors-périmètre compte autant que le dedans : c'est lui qui évite les extrapolations de l'agent.",
      },
      {
        anchor: "Critères de validation",
        note: "Un cahier des charges sans critère de validation est un vœu, pas un contrat.",
      },
    ],
  },
  {
    id: "moyen",
    label: "Prompt moyen",
    rawPrompt:
      "Mon script Python plante quand le fichier CSV est vide. Corrige-le, ça doit marcher dans tous les cas. C'est urgent, je dois livrer ce soir.",
    verdict: {
      kind: "template",
      templateRef: "T3",
      headline: "→ Un bug dont la cause n'est pas connue : Session Diagnostic (T3), pas un patch à l'aveugle",
      why: "Vous décrivez le symptôme, pas la cause. « Plante » peut vouloir dire plusieurs choses, et un try/except posé au hasard les cacherait toutes. Je diagnostique d'abord, je corrige ensuite — c'est plus rapide que de patcher deux fois.",
    },
    expertPrompt: `# Script CSV — Session diagnostic : plantage sur fichier vide

## Contexte
Le script s'arrête quand le CSV d'entrée est vide. Constaté à la
livraison, pas en développement. Message d'erreur exact à joindre.

## Hypothèses à trancher (ne pas deviner en silence)
- **A** — fichier à zéro octet : la lecture ne renvoie même pas d'en-tête.
- **B** — en-tête présent, aucune ligne : le code suppose au moins une ligne.
- **C** — fichier absent ou chemin faux, confondu avec « vide ».
Les hypothèses ne s'excluent pas : B et C peuvent coexister.

## Méthode de diagnostic attendue
Reproduire avec trois fichiers (zéro octet, en-tête seul, absent),
relever la trace complète pour chacun, comparer à l'état attendu.

## Contraintes non négociables
Cause racine avant patch. Pas de try/except global qui masque l'erreur.
Ne touche à aucun autre fichier que le script concerné.

## À la fin de la session
Verdict par hypothèse, correctif ciblé, test dédié par cas, hors scope.`,
    rawOutput:
      "Voici votre script corrigé : j'ai ajouté un bloc try/except autour de la lecture du fichier pour éviter le plantage. Si le fichier est vide, le script affiche un message et continue. N'hésitez pas si vous avez d'autres questions !",
    expertOutput:
      "Verdict : hypothèse B confirmée (en-tête présent, aucune ligne — le code lisait la première ligne de données sans vérifier qu'elle existait). Correctif d'une condition à l'endroit exact du problème, un test par fichier reproduit, aucune erreur masquée. Le cas « fichier absent » reste une erreur franche : c'est voulu, un chemin faux ne doit pas passer en silence.",
    annotations: [
      {
        anchor: "Hypothèses à trancher (ne pas deviner en silence)",
        note: "Le cœur du template : nommer les causes possibles avant d'ouvrir le code, pour que l'agent vérifie au lieu de deviner.",
      },
      {
        anchor: "Les hypothèses ne s'excluent pas",
        note: "Dire quand deux causes peuvent coexister évite un diagnostic qui s'arrête à la première trouvée.",
      },
      {
        anchor: "Cause racine avant patch",
        note: "Ma règle non négociable : on comprend avant de corriger. Un patch posé sur un symptôme revient toujours.",
      },
      {
        anchor: "Pas de try/except global",
        note: "Exactement ce que le prompt brut aurait obtenu : une erreur cachée, pas un bug corrigé.",
      },
    ],
  },
  {
    id: "long",
    label: "Prompt long",
    rawPrompt: `bon alors je viens de refaire une partie complète
sur le téléphone, déjà le texte du tuto au début est
beaucoup trop petit, on lit rien, c'est juste la taille
de police je pense, le reste de l'écran est ok
sinon j'aimerais bien qu'on ajoute un bouton pause
pendant la vague, là je suis obligé de laisser tourner
quand on m'appelle et je perds la partie, avec peut être
la vitesse rapide au même endroit, un petit panneau en
bas à droite, enfin quelque part où le pouce tombe
naturellement, faut que ça marche aussi au clavier sur
pc, espace pour pause par exemple
et puis ça me fait penser, à terme il faudrait un vrai
mode histoire, genre des chapitres avec un boss à la fin
et des dialogues entre les vagues, mais je sais pas
encore la forme, ni si c'est un mode à part ou juste une
campagne, faut qu'on en reparle, je note pour pas oublier
voilà, tu tries ?`,
    verdict: {
      kind: "template",
      templateRef: "T6",
      headline: "→ Trois sujets dans le même souffle : Triage (T6), puis un Micro-Ticket (T1) et un Module Standard (T2)",
      why: "Une dictée de test, prise à chaud : un défaut visuel dont la cause est connue, une vraie fonctionnalité avec des entrées et des sorties, et une idée qui n'est pas mûre. Trois natures différentes — je ne force jamais ça dans un seul format, je découpe d'abord.",
    },
    expertPrompt: `# [Jeu] — Notes de session brute : test sur téléphone (triage)
Extrait de ma bibliothèque de templates de spec — Template 6.

## Unité 1 — Texte du tutoriel illisible sur mobile
- Nature : symptôme observé, cause connue (taille de police).
- Destination : Micro-Ticket (T1) — un fichier, une valeur, un test visuel.

## Unité 2 — Pause et vitesse rapide pendant une vague
- Nature : idée de chantier, périmètre définissable.
- Destination : Module Standard (T2) — entrées (tap, touche espace),
  sorties (jeu figé, vitesse), edge cases (appel entrant, changement
  d'onglet), critères de validation sur PC et mobile.

## Unité 3 — Mode histoire (chapitres, boss, dialogues)
- Nature : [OUVERT] — forme non tranchée par Xav.
- Destination : en attente, pas de spec. À relire à la prochaine session.

## Fichiers à générer suite à ce triage
- [ ] \`tuto-police-mobile.md\` — Micro-Ticket
- [ ] \`pause-vitesse.md\` — Module Standard

## Notes laissées en attente
- Mode histoire : à ne pas perdre, à ne pas trancher à la place de Xav.`,
    rawOutput:
      "Merci pour ces retours ! Voici ce que je propose : agrandir le texte du tutoriel, ajouter un bouton pause avec une vitesse rapide, et créer un mode histoire avec des chapitres, des boss et des dialogues. Je peux commencer par le mode histoire si vous le souhaitez — voici une première structure de chapitres…",
    expertOutput:
      "Deux fichiers prêts pour l'agent de code, chacun dans son format, et une idée gardée au chaud sans être tranchée. Le défaut visuel part en premier (une session courte), la pause a ses cas limites écrits avant la première ligne de code, et personne n'a commencé un mode histoire que Xav n'a pas encore décidé.",
    annotations: [
      {
        anchor: "Extrait de ma bibliothèque de templates de spec",
        note: "Le Template 6 est un format d'entrée, pas de sortie : il absorbe le désordre d'une dictée réelle avant de choisir quoi construire.",
      },
      {
        anchor: "symptôme observé, cause connue",
        note: "Cause connue → Micro-Ticket. Si la cause était incertaine, ce serait une Session Diagnostic (T3), jamais un patch à l'aveugle.",
      },
      {
        anchor: "edge cases (appel entrant, changement",
        note: "La fonctionnalité vient d'un cas réel (un appel pendant la vague) : il devient un cas limite à tester, pas une anecdote.",
      },
      {
        anchor: "[OUVERT]",
        note: "Le tag qui protège l'idée : notée, pas tranchée. L'agent ne décide jamais à la place de Xav.",
      },
    ],
  },
  {
    id: "bizarre",
    label: "Prompt bizarre",
    rawPrompt: "Écris-moi le prompt parfait pour que l'IA ne se trompe plus jamais.",
    verdict: {
      kind: "conseil",
      headline: "→ Ce n'est pas un problème de prompt : aucun template, un conseil",
      why: "Aucune formulation ne rend un modèle infaillible — et un prompt qui le promettrait vous ferait baisser la garde. Ce que vous cherchez, c'est une méthode : choisir l'outil après le problème, et vérifier ce qui sort. Toujours.",
    },
    expertPrompt: `Le prompt parfait n'existe pas ; voici ce qui marche à la place.

Discernment — choisir l'outil après le problème
- Décrivez d'abord le problème sans nommer d'outil. Certains cas n'ont
  pas besoin d'IA : un process encore instable, une donnée sensible sans
  cadre, une tâche plus rapide à la main.
- Si l'IA reste la bonne réponse, cadrez-la : objectif, contexte,
  contraintes, format de sortie, critère de validation. C'est une spec,
  pas une formule magique.

Diligence — vérifier, toujours
- Demandez au modèle de signaler ce qu'il ne sait pas plutôt que de
  combler les trous. Relisez ce qui sort comme un brouillon, pas comme
  une réponse.
- Gardez la vérification pour vous : je délègue l'exécution, jamais la
  vérification.

Pour aller plus loin sur ce site
- Le simulateur, plus haut : quand l'IA est — ou n'est pas — la bonne
  réponse à votre problématique.
- L'agent de poche, en haut de page : « Quand l'IA n'est PAS la bonne
  réponse ? »`,
    rawOutput:
      "Bien sûr ! Voici le prompt parfait : « Tu es un expert de classe mondiale. Réponds toujours avec une précision absolue, vérifie chaque fait deux fois et ne fais jamais d'erreur. Si tu n'es pas sûr, dis-le. » Copiez-collez ce prompt au début de chaque conversation pour des réponses toujours fiables.",
    expertOutput: NO_LLM_OUTPUT,
    annotations: [
      {
        anchor: "Discernment — choisir l'outil après le problème",
        note: "Le troisième D du cadre 4D : l'outil vient après le problème, jamais avant.",
      },
      {
        anchor: "pas une formule magique",
        note: "Ce que le prompt brut cherche vraiment, c'est une structure. Elle existe — mais elle ne rend pas le modèle infaillible.",
      },
      {
        anchor: "Diligence — vérifier, toujours",
        note: "Le quatrième D : la vérification ne se délègue pas. C'est elle qui empêche l'erreur de passer, pas le prompt.",
      },
      {
        anchor: "Le simulateur, plus haut",
        note: "Le simulateur dit aussi quand le gain n'est pas chiffré, ou quand l'IA n'est pas la réponse à la problématique cochée.",
      },
    ],
  },
];

/** Textes d'interface de la section (T8 : aucune chaîne en dur dans les composants). */
export const playgroundUi = {
  title: "Playground",
  subtitle:
    "Une entrée brute, quelle que soit sa forme : l'agent la trie et la route vers le bon format de spec — ou vous dit quand la spec n'est pas la réponse.",
  selectorLabel: "Choisir une entrée brute",
  rawPaneTitle: "Entrée brute",
  expertPaneTitle: "Verdict de l'agent",
  runButton: "Passer par l'agent",
  runningButton: "L'agent lit…",
  rerunButton: "Repasser par l'agent",
  expertPlaceholder: "Le verdict de l'agent, puis le prompt structuré, apparaîtront ici.",
  verdictBadgeAria: "Voir pourquoi l'agent choisit ce template",
  annotationAria: "Voir la note de l'agent sur ce passage",
  copyButton: "Copier le prompt expert",
  copiedFeedback: "Copié ✓",
  tabBefore: "Résultat avant",
  tabAfter: "Résultat après",
  tabsAria: "Comparer les sorties",
  outputPending: "Passez d'abord par l'agent pour comparer les deux sorties.",
  illustrativeNote: "Sorties illustratives — agent scripté, pas d'appel LLM.",
} as const;
