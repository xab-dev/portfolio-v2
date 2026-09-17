import { site } from "./site";

export type ProjectTag = "Automations" | "Formations" | "Jeu" | "Outils" | "Méthode";

export type ProjectStatus =
  | "en production"
  | "v1 fonctionnelle"
  | "en développement"
  | "cadrage";

export type ProjectAccent = "blue" | "violet" | "emerald";

export interface ProjectMetric {
  label: string;
  value: string;
  verified: boolean;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  tags: ProjectTag[];
  status: ProjectStatus;
  year: number;
  problem: string;
  architecture: string[];
  metrics: ProjectMetric[];
  limits: string[];
  links?: ProjectLink[];
  images?: ProjectImage[];
  accent: ProjectAccent;
}

// Contenu réel (Fiche_Professionnelle_Xav.md, Positionnement...md §6-8,
// Sequence_Intervention_Terrain.md, TEMPLATES_SPEC.md). Jamais CV_fake_archi_fake.md (T7).
// Métriques non vérifiées marquées `verified: false` → suffixe "(auto-déclaré)" affiché en modale.
export const projects: Project[] = [
  {
    id: "portfolio-v2",
    title: "Portfolio v2 — ce site",
    tagline: "Vous l'avez sous les yeux.",
    tags: ["Outils", "Méthode"],
    status: "en production",
    year: 2026,
    problem:
      "Pas de CV à jour, pas de réseaux, rien qui montre ce que je veux faire : un problème d'exposition, pas un problème de code.",
    architecture: [
      "React + Vite + Tailwind + Motion, déployé sur GitHub Pages par GitHub Actions ; tout le contenu dans `src/content/*.ts`.",
      "11 specs numérotées, une phase par spec, exécutées par Claude Code : cause racine avant patch, vérification visuelle réelle, journal et dette à chaque phase.",
      "CV PDF généré à la build depuis la même source de contenu — le build refuse de passer s'il dépasse une page.",
      "Mode allégé pour mobile (`?perf=lite`), rendu PC identique au pixel près.",
      "Agent de poche scripté, simulateur aux hypothèses affichées et sourcées, Prompt Playground basé sur mes templates de spec.",
    ],
    metrics: [
      { label: "De la dictée à la mise en ligne", value: "3 jours", verified: true },
      { label: "Specs numérotées", value: "11", verified: true },
      { label: "Tests automatisés", value: "89", verified: true },
    ],
    limits: [
      "Agent scripté, pas de LLM branché : choix assumé, une V2 est envisagée.",
      "Aucun analytics — la mesure se fait sur les contrats signés.",
      "`noindex` jusqu'au polish final.",
    ],
    links: [{ label: "Code source", href: site.links.github }],
    accent: "violet",
  },
  {
    id: "hatd",
    title: "haTD / RPG-monde",
    tagline: "Tower defense clicker solo, avec surcouche RPG (V1 terminée) — test UX en cours.",
    tags: ["Jeu"],
    status: "v1 fonctionnelle",
    year: 2026,
    problem:
      "Construire seul un jeu complet (tower defense clicker + surcouche RPG) en gardant une qualité pro, sans équipe et sans filet.",
    architecture: [
      "Prototype HTML/JS canvas en un seul fichier, pensé pour itérer vite.",
      "Développement piloté par des specs données à Claude Code — pas de session de code à l'aveugle.",
      "`CLAUDE.md` + tests Node comme seule mémoire inter-session : pas de dépôt git à ce stade, choix assumé de Diligence (voir Limites) plutôt qu'un outil ajouté par réflexe.",
      "La suite est la refonte RPG-v2, restée en HTML5/Canvas — voir sa fiche.",
    ],
    metrics: [
      { label: "Version jouable en ligne", value: "oui", verified: true },
      { label: "GDD versionné", value: "v0.1.0", verified: true },
      { label: "Playtest externe", value: "1 (16/09/2026, 3 h)", verified: true },
    ],
    limits: [
      "Équilibrage et test UX en cours (playtest externe du 16/09/2026).",
      "Pas jouable au tactile — voir la section Jouer pour le compromis retenu (teaser cold-open sur mobile).",
      "Pas encore de build mobile ni desktop packagé.",
      "Absence de dépôt git : mémoire du projet portée par `CLAUDE.md` et les tests, un choix de Diligence à surveiller si le projet grossit.",
    ],
    links: [{ label: "Jouer à haTD", href: "https://xab-dev.github.io/cv-portfolio/haTD_V1" }],
    images: [
      {
        src: "/images/projects/hatd/hatd-01.webp",
        alt: "Deux mondes du jeu haTD affichés côte à côte, avec statistiques d'éclats, de découvertes et de progression",
      },
      {
        src: "/images/projects/hatd/hatd-02.webp",
        alt: "Écran de combat tower defense de haTD avec placement de tours et boutique de sorts en bas d'écran",
      },
    ],
    accent: "violet",
  },
  {
    id: "rpg-v2",
    title: "RPG-v2",
    tagline: "Refonte complète d'un RPG médiéval-fantastique en HTML5/Canvas, la V1 servant de prototype jetable.",
    tags: ["Jeu"],
    status: "en développement",
    year: 2026,
    problem:
      "Repartir d'une V1 jouée de bout en bout (tous les boss battus) pour construire un jeu commercialisable — et en faire une vitrine de ce que la génération de jeux assistée par IA permet à un développeur seul.",
    architecture: [
      "HTML5/JS/Canvas, résolution logique 480 × 270 : le choix du moteur natif (Godot) a été écarté faute de pouvoir tenir seul un rôle de graphiste à plein temps.",
      "Périmètre fermé à la première ère (Grotte → Maison → première zone → Château → Boss 1) ; 3 éléments ; bilingue FR/EN ; entièrement jouable hors-ligne.",
      "PC à la manette comme plateforme primaire, mobile mené en parallèle. Gratuit + dons : ni publicité ni achat intégré, non négociable.",
      "Roadmap par phases + specs numérotées + CLAUDE.md, exécutées par Claude Code — même méthode que ce site. Phase 0 (socle) et Phase 1 (Grotte, cinématique et direction artistique validées) closes ; Phase 2 (Maison) en cours.",
      "haTD devient un mini-jeu du monde, tout en restant jouable séparément. Bande son composée au piano par Xav.",
    ],
    metrics: [
      { label: "V1 terminée de bout en bout", value: "oui", verified: true },
      { label: "Phases closes (V2)", value: "2 sur la roadmap", verified: true },
    ],
    limits: [
      "Contrôles tactiles encore imparfaits — dette assumée jusqu'à l'intégration des compétences.",
      "Pas encore de lien de partage public : le test sur téléphone est différé.",
      "Aucune touche n'est montrée au joueur pour l'instant — point ouvert, volontairement pas tranché.",
    ],
    accent: "blue",
  },
  {
    id: "templates",
    title: "Bibliothèque de templates de spec",
    tagline: "6 formats pour transformer une dictée brute en instruction exploitable par un agent de code.",
    tags: ["Méthode"],
    status: "en production",
    year: 2026,
    problem:
      "Transformer une dictée vocale brute — souvent prise en flux, en situation réelle — en instruction exploitable par un agent de code, sans perdre d'information ni mélanger les sujets.",
    architecture: [
      "6 templates couvrant des natures de problème distinctes : Micro-Ticket, Module Standard, Session Diagnostic, Cahier des charges technique, Roadmap + Specs numérotées, Notes de Session Brute (Triage).",
      "Le Template 6 (Triage) absorbe le désordre d'une observation prise en direct avant de savoir quel format de sortie choisir — un cas peu documenté ailleurs dans la pratique du spec-driven development, qui part en général d'un texte déjà structuré.",
      "Répartition des rôles : Claude comme rédacteur de spec à partir de la dictée, Claude Code comme exécutant de la spec, Xav comme vérificateur (Diligence non déléguée).",
    ],
    metrics: [
      { label: "Templates formalisés", value: "6", verified: true },
      { label: "Projets pilotés avec les templates", value: "2 (portfolio v2, RPG-v2)", verified: true },
    ],
    limits: [
      "Pas encore éprouvé chez un client tiers — seulement sur des projets personnels à ce jour.",
      "Calibrés sur du développement réfléchi ; leur usage en intervention terrain sous pression de temps reste à valider (voir le projet Séquence d'intervention terrain).",
      "Le bilan chiffré sera publié avec les versions finales.",
    ],
    images: [
      {
        src: "/images/projects/templates/templates-01.webp",
        alt: "Extrait du document \"Bibliothèque de templates — Architecte Spec.md\" décrivant le principe directeur commun aux templates et comment choisir le bon format",
      },
    ],
    accent: "blue",
  },
  {
    id: "miniciel",
    title: "miniCiel — Kit USB d'intervention IT",
    tagline: "Diagnostiquer et entretenir un PC client en 30 min, sans installation, sans réseau.",
    tags: ["Outils", "Automations"],
    status: "v1 fonctionnelle",
    year: 2026,
    problem:
      "Diagnostiquer et entretenir un PC client en 30 minutes, sans installation, sans dépendance réseau, avec un compte-rendu remis en fin d'intervention — et pouvoir réorganiser des dossiers volumineux chez le client sans jamais rien perdre.",
    architecture: [
      "Dashboard modulaire : les modules sont découverts automatiquement via un fichier `module.json`, pas de liste câblée en dur.",
      "Scripts PowerShell et Python pour les modules (analyse, nettoyage, sécurité, réseau, rapport) ; aucune collecte de données envoyée à l'extérieur.",
      "IA mobilisée pour concevoir et coder les modules — absente à l'exécution chez le client, qui tourne en local sans appel réseau vers un modèle.",
      "Module SafeFolder (réorganisation de dossiers) isolé volontairement : CLI Python à 3 primitives seulement, plan de déplacement figé par empreinte SHA-256 avant toute exécution, journal écrit avant d'agir, annulation possible par plan inverse, et un test AST qui interdit statiquement toute primitive d'écriture destructrice.",
    ],
    metrics: [
      { label: "Clé USB v1", value: "achevée et testée", verified: true },
      { label: "Modules auto-découverts", value: "oui (via module.json)", verified: true },
      { label: "SafeFolder : suppression possible", value: "0, par construction", verified: true },
      { label: "Temps de diagnostic visé", value: "0-30 min", verified: false },
    ],
    limits: [
      "Pas encore testé en conditions réelles chez un client.",
      "Pas de clé bootable de secours si le Windows du client ne démarre pas — chantier identifié, non prioritaire tant qu'aucun cas réel ne l'impose.",
    ],
    images: [
      {
        src: "/images/projects/miniciel/miniciel-01.webp",
        alt: "Tableau de bord miniCiel avec ses modules (Analyse, Nettoyage, Rapport, Système, Sécurité, Réseau) et la fenêtre SafeFolder ouverte à côté",
      },
    ],
    accent: "emerald",
  },
  {
    id: "terrain",
    title: "Séquence d'intervention terrain",
    tagline: "Une escalade en 3 paliers : clé USB → spec → diagnostic humain-IA — n'engager que le niveau d'effort nécessaire.",
    tags: ["Méthode", "Formations"],
    status: "cadrage",
    year: 2026,
    problem:
      "Ne mobiliser, lors d'une intervention de dépannage informatique, que le niveau d'effort réellement nécessaire au problème rencontré — plutôt que de sauter des étapes par réflexe technique.",
    architecture: [
      "Palier 1 (0-30 min) : la clé USB miniCiel, déjà fonctionnelle, pour un diagnostic automatisé sans réseau.",
      "Palier 2 (30 min-1h) : si le palier 1 ne suffit pas, le problème est formalisé avec le template de spec le plus adapté à sa nature (bibliothèque de 6 templates, voir le projet dédié).",
      "Palier 3 (après 1h) : diagnostic actif combiné humain-IA (Claude / Claude Pro) sur les cas qui résistent aux deux premiers paliers — cause racine avant patch, vérification réelle plutôt que confiance aveugle dans un résumé.",
    ],
    metrics: [],
    limits: [
      "Statut cadrage : construit à partir d'outils déjà fonctionnels ailleurs, mais pas encore testé sur un vrai cas client.",
      "Le rythme théorique (30 min / 1h) reste à chronométrer en conditions réelles.",
      "Le palier 3 s'appuie explicitement sur le jugement combiné avec l'IA plutôt que sur une expertise technique déjà consolidée — un choix assumé, compensé par la vérification systématique, pas une faiblesse cachée.",
    ],
    images: [
      {
        src: "/images/projects/terrain/terrain-01.webp",
        alt: "Photo volontairement floutée du poste de travail de Xav (double écran, session de développement) pour ne pas exposer le contenu affiché à l'écran",
      },
    ],
    accent: "blue",
  },
  {
    id: "regie-maison",
    title: "Régie Maison",
    tagline: "Piloter la TV Sony Bravia et Google Home depuis une interface unique.",
    tags: ["Automations", "Outils"],
    status: "v1 fonctionnelle",
    year: 2026,
    problem:
      "Piloter une TV Sony Bravia et un Google Home depuis une seule interface, sans jongler entre applications ni se déplacer jusqu'à l'autre pièce où se trouvent les appareils.",
    architecture: [
      "Interface Python / tkinter, chargement dynamique des modules (chaque appareil est un module indépendant).",
      "Threading pour ne pas bloquer l'interface pendant les appels réseau.",
      "Configuration séparée dans `config.json` (pas d'identifiants en dur dans le code).",
      "API Bravia en PSK pour la TV ; `pychromecast` et `gTTS` pour Google Home.",
    ],
    metrics: [],
    limits: [
      "Usage strictement personnel, jamais packagé pour distribution.",
      "Module \"Lampes\" prévu dans l'interface mais pas encore développé (grisé à l'écran).",
    ],
    images: [
      {
        src: "/images/projects/regie-maison/regie-maison-01.webp",
        alt: "Interface Régie Maison avec les modules Google Home, TV Sony, Lampes (à venir) et Quitter",
      },
    ],
    accent: "emerald",
  },
  {
    id: "1am",
    title: "Un Autre Monde (1AM)",
    tagline: "Prévenir les mésusages de l'IA générative par des contenus pédagogiques par paliers.",
    tags: ["Formations"],
    status: "cadrage",
    year: 2026,
    problem: "Prévenir les mésusages de l'IA générative par des contenus accessibles, structurés en paliers pédagogiques plutôt qu'en avertissement unique.",
    architecture: [
      "Chaîne YouTube \"Un Autre Monde\" comme premier support de diffusion.",
      "Site et communauté envisagés dans un second temps, une fois les premiers contenus publiés.",
    ],
    metrics: [],
    limits: ["Projet de contenu en cadrage : pas encore de contenu publié à ce jour."],
    links: [{ label: "Chaîne YouTube", href: "https://www.youtube.com/@1_Autre_Monde" }],
    images: [
      {
        src: "/images/projects/1am/1am-01.webp",
        alt: "Page de la chaîne YouTube \"Un Autre Monde\" (@1_Autre_Monde), avec son avatar dessiné à la main",
      },
    ],
    accent: "violet",
  },
];
