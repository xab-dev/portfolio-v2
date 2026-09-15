# Portfolio v2 "Premium Tech" — Roadmap + prompt d'exécution autonome

**Version : 0.8.0** — document vivant. Créé le 2026-09-15 à partir de la dictée de Xav (12:00) ; révisé le 2026-09-15 12:30 (S1-S7) (dettes de contenu — voir `dette_suivi.md` §B), le 2026-09-15 12:45 (D4 tranché, DETTE-25 tranché, scope Phase 6 étendu), le 2026-09-15 (soir) (Phase 6 close et poussée, Phase 6b ajoutée — spec 08, DETTE-30), le 2026-09-15 (nuit) (Phase 6b close — mesure terrain Galaxy A04 validée par Xav), le 2026-09-15 19:30 (Phase 2 close, remise sur `main`, DETTE-09 tranchée — `PATCHES_2026-09-15_1930.md`), puis le 2026-09-15 23:00 (patch de relecture + phases post-V1 tranchées par Xav — `PATCHES_2026-09-15_2300.md`).

**Statut** : V1 fonctionnelle complète et validée par Xav (toutes phases 0-6b, 2, 3). Patch 23:00 appliqué. Phase courante : **7** (spec à écrire).

---

## Bloc à lire en premier par l'agent (contexte minimal indispensable)

**Qui tu es dans ce projet** : Creative Technologist senior + expert UI/UX. Tu construis le portfolio/CV interactif de Xavier B. ("Xav"), consultant indépendant (Tarascon, 13) dont le titre public est **Consultant outils et solutions IA** — spécialité : conception de workflows, outils et usages IA adaptés aux besoins réels. Sa valeur : *comprendre le problème avant de choisir l'outil*. Sa méthode : le cadre 4D (Délégation, Description, Discernment, Diligence) et une pratique de spec-driven development (6 templates de spec pour piloter des agents de code).

**L'existant sur lequel tu t'appuies** :
- **Repo GitHub neuf** `xab-dev/portfolio-v2` (https://github.com/xab-dev/portfolio-v2), publié via GitHub Pages à `https://xab-dev.github.io/portfolio-v2/`. Il contient déjà `specs/` et `dette_suivi.md`, rien d'autre. Ce site est le **portfolio officiel** de Xav.
- L'ancien repo `xab-dev/cv-portfolio` reste en ligne mais **n'est pas touché** : sa racine ("Carnet de terrain") est un document personnel, et son sous-dossier `haTD_V1/` héberge le jeu tower defense de Xav à `https://xab-dev.github.io/cv-portfolio/haTD_V1/`. Le jeu est consommé **par URL absolue en iframe** — même origine `xab-dev.github.io`, donc aucun problème de X-Frame-Options.
- Les données de contenu (projets, compétences, parcours, réponses de l'agent) sont fournies dans les specs 02 à 07. Tout ce qui est marqué `[À CONFIRMER]` ou `[DETTE-xx]` est référencé dans `dette_suivi.md` : ne l'invente pas, mets une valeur neutre et laisse le marqueur.

**Ce qui n'existe pas encore** : tout. Le repo est vide. Le projet Vite/React est créé en Phase 0 à la racine du repo, à côté de `specs/`.

**Conventions à réutiliser** : français pour les textes UI, les commentaires, les commits et les docs ; identifiants de code en anglais (convention Xav : "français pour communiquer, anglais pour la tech"). Versionnage `X.Y.Z` — Y = itération validée par Xav, Z = correctif de l'agent.

---

## Décisions déjà tranchées (ne pas rouvrir)

| # | Décision | Pourquoi |
|---|---|---|
| T1 | **Vite + React + TypeScript**, composants découpés (pas un seul fichier `.jsx` monolithique). Le build produit un bundle "single page" déployable statiquement. | La dictée dit "Single File" *et* "modulaire" : on garde la modularité côté source, le côté "single" est assuré par le build. Un fichier de 3 000 lignes est inmaintenable par un agent en sessions courtes. |
| T2 | **Tailwind CSS** (config projet), **Lucide React** (icônes), **`motion`** (successeur du paquet `framer-motion` — import depuis `motion/react`). | Stack imposée par la dictée. Si `motion` pose problème à l'install, replier sur `framer-motion@11` et le noter dans le journal. |
| T3 | **Design "Premium Tech Fantasy"** : fond `#0B0F19`, accents néon bleu électrique / violet / vert émeraude, verre dépoli (`backdrop-blur`), lueurs diffuses. Tokens définis une fois en Phase 0, jamais de couleur en dur ailleurs. | Cohérence visuelle et modifiabilité. |
| T4 | **Mobile-first, 100 % responsive**, `prefers-reduced-motion` respecté (les animations deviennent des fondus simples). | Exigence dictée + accessibilité. |
| T5 | **Aucune clé d'API dans le front, aucun backend en V1.** L'agent IA est *simulé* (réponses scriptées) derrière une interface `AgentProvider` prête à être branchée sur une API plus tard. Le formulaire de contact passe par un service tiers ou `mailto:` (D3). | Site statique GitHub Pages : une clé exposée serait une faute de Diligence. |
| T5b | **Modèles nommés** : dans les textes qui décrivent la pratique de Xav (agent, skills), citer les modèles réellement utilisés — *Claude Fable 5.1, Opus 5, Sonnet 5*. Dans les *recommandations client* (simulateur), rester générique ("Claude") pour ne pas périmer le site. | Réponse S3 de Xav. Deux usages, deux règles. |
| T6 | **Aucune métrique client inventée.** Les chiffres affichés (ROI, temps gagné) sont des *estimations indicatives* calculées par des formules transparentes et étiquetées comme telles. Les fiches projet affichent des métriques *réelles et vérifiables* ou rien. | **Confirmé par Xav (S1)** : aucune donnée client à ce jour. Un "ROI client" fictif contredirait frontalement son positionnement (portfolio de cas réels, Diligence non déléguée). |
| T7 | **Contenu réel de Xav uniquement.** Le fichier `CV_fake_archi_fake.md` du projet est un CV *prospectif fictif* (expériences 2027-2032) : **ne jamais l'utiliser comme source de données**. Sources valides : `Fiche_Professionnelle_Xav.md`, `Positionnement___Consultant...md`, `TEMPLATES_SPEC.md`, `Sequence_Intervention_Terrain.md`, `declaration_diligence_ai_fluency.md`. | Éviter qu'un agent prenne un exercice de projection pour un fait. Fichier renommé par Xav (S7). |
| T8 | **Le contenu est séparé du rendu** : tout texte/donnée vit dans `src/content/*.ts` (typé). Les composants ne contiennent aucune chaîne de contenu en dur. | Xav doit pouvoir mettre à jour son parcours sans toucher aux composants — et la dette de contenu se résorbe fichier par fichier. |
| T9 | **Déploiement à la racine d'un repo neuf** (`xab-dev/portfolio-v2`, `vite base: '/portfolio-v2/'`), via GitHub Actions → GitHub Pages. Le site v2 est le portfolio officiel dès sa première mise en ligne. Le Carnet de terrain (`cv-portfolio`) n'est ni lié en navigation principale ni migré : il reste un souvenir personnel. | Réponse S4 de Xav. Supprime l'ancienne décision D1 ("déployer dans `/v2/`"). |
| T10 | **Titre public : "Consultant outils et solutions IA"** — dans le `<title>`, le Hero, les meta OG, le footer. | Réponse S5 de Xav. Supprime l'ancienne décision D2. |
| T11 | **Tags projet sans "RAG/LLM"**. Tags V1 : Automations, Formations, Jeu, Outils, Méthode. RAG apparaît uniquement dans les *skills* au niveau "notions". | Réponse S2 de Xav : aucun projet RAG, sujet à creuser quand un projet le demandera. Un filtre vide serait pire qu'un filtre absent. |
| T12 | **Section Jouer** : sur PC, le jeu est jouable dans l'iframe. Sur mobile (pointeur tactile), l'iframe se charge quand même pour laisser jouer le *cold-open* de haTD comme teaser visuel, puis se referme (bouton "Fermer" toujours visible + fermeture automatique après une durée configurable). Aucune tentative de rendre le jeu jouable au tactile. | Réponse S6 de Xav : haTD n'est pas jouable au tactile, le cold-open suffit comme effet. |

## Décisions à confirmer par Xav (non bloquantes pour la Phase 0)

| # | Question | Option recommandée (par défaut si pas de réponse) |
|---|---|---|
| ~~D1~~ | ~~Où déployer la v2 ?~~ | **Tranché → T9** (repo neuf, racine). |
| ~~D2~~ | ~~Titre public ?~~ | **Tranché → T10** ("Consultant outils et solutions IA"). |
| ~~D3~~ | ~~Envoi du formulaire ?~~ | **Tranché** : Formspree, endpoint `https://formspree.io/f/xgaegryp` (DETTE-19) ; repli `mailto:`. |
| ~~D4~~ | ~~Fourchettes de budget affichées dans le formulaire ?~~ | **Tranché** (2026-09-15) : \< 500 €`, `500 – 2 000 €`, `2 000 – 5 000 €`, `> 5 000 €`, `À définir` (DETTE-18). |
| ~~D5~~ | ~~Durée du teaser mobile ?~~ | **Tranché** : `teaserMs = 18_000` (DETTE-24) ; le bouton Fermer reste visible. |

---

## Contraintes de méthode non négociables (toutes phases)

1. **Cause racine avant patch.** Un bug visuel ou fonctionnel se diagnostique avant d'être contourné.
2. **Vérification visuelle réelle avant livraison.** `npm run build` vert ne suffit pas : ouvrir le `preview` et vérifier chaque critère de passage à l'écran, en mobile (375 px) *et* desktop (1280 px). Documenter ce qui a été vu.
3. **Scope discipline.** Une phase = un fichier de spec. Un problème découvert hors phase est **documenté dans `JOURNAL_DEV.md`**, pas corrigé en silence — sauf s'il bloque la phase courante.
4. **Pas de placeholders vides** (`// TODO ici`) dans le code livré. Si une donnée manque, elle est représentée par une valeur neutre explicite + marqueur `[DETTE-xx]` référencé dans `dette_suivi.md`.
5. **Langue** : UI, commentaires, commits, docs en français. Code en anglais.
6. **Fichiers protégés** : `dette_suivi.md` (l'agent y *ajoute* des lignes, ne supprime jamais). Le repo `cv-portfolio` (Carnet de terrain + haTD) n'est jamais modifié depuis ce projet — le jeu y est seulement *lu* par URL.
7. **Fin de session** : (1) décisions prises et pourquoi, (2) livré et validé, (3) hors scope et pour quelle phase — dans `JOURNAL_DEV.md`.

---

## Phase 0 — Socle Vite + design system + squelette navigable
**Livrée le 2026-09-15.** Détail complet : `01_socle-design-system.md`. **Phase à exécuter maintenant : Phase 3** (`04_prompt-playground.md`, amendée par `PATCHES_2026-09-15_1930.md` §C).

### Objectif
Un site vide mais *beau* : les tokens du design, la coquille de page (nav, sections ancrées, footer), les primitives animées réutilisables, le déploiement GitHub Pages à la racine du repo neuf.

### Livrable concret
- Projet Vite/React/TS **à la racine du repo neuf**, Tailwind + Lucide + motion installés.
- `src/styles/tokens.css` + `tailwind.config` avec la palette Premium Tech.
- Primitives : `GlassCard`, `NeonButton`, `SectionShell` (entrée au scroll), `Modal` (ouverture/fermeture animées, focus trap, Échap), `AnimatedCounter`, `TypingText`.
- `App.tsx` avec les 7 sections comme coquilles vides titrées + nav sticky avec ancre active.
- Workflow GitHub Actions standard qui builde et publie `dist/` sur GitHub Pages.
- `JOURNAL_DEV.md` et `dette_suivi.md` copiés dans le repo.

### Critère de passage
Le site est visible à `https://xab-dev.github.io/portfolio-v2/`, la nav scrolle entre 7 sections vides, les primitives sont démontrées sur une page `/kitchen-sink` (ou une section temporaire), Lighthouse mobile ≥ 90 en Performance et Accessibilité.

### Hors scope pour cette phase
Tout contenu réel. Aucune des 7 sections n'est remplie.

---

## Phases suivantes (esquisse — chacune a déjà son fichier de spec, à relire au moment de l'exécuter)

- **Phase 1 — Hero + Agent de poche** (`02_hero-agent-poche.md`) : accroche, puces de questions, agent scripté avec typing, interface prête pour une API.
- **Phase 2 — Stack Simulator & ROI** (`03_stack-simulator-roi.md`) : sélection de problématiques → stack recommandée + compteurs *indicatifs* avec formules visibles. **Prérequis** : DETTE-07 tranchée (fourchettes sourcées, baselines curseur, références) ; format `sessionStorage['simulator']` figé : `{ selection, baselines }` (la Phase 6 lit `{ selection: string[] }` via `parseSimulatorValue`, qui tolère la clé `baselines` supplémentaire). **Livrée le 2026-09-15** (commit `27d671e`, en ligne après remise sur `main` — patch A du 19:30).
- **Phase 3 — Prompt Playground** (`04_prompt-playground.md`, amendée par `PATCHES_2026-09-15_1930.md` §C) : quatre tailles d'entrée brute (court, moyen, long, bizarre) → scanner → verdict de l'agent scripté (routage vers un template de la bibliothèque, ou conseil) → prompt expert + avant/après. Contenu dérivé des vrais templates de Xav (DETTE-09 : direction tranchée, relecture des textes différée, non bloquante).
- **Phase 4 — Portfolio dynamique** (`05_portfolio-dynamique.md`) : grille filtrable, survol 3D, modale problème/architecture/métriques avec les projets réels.
- **Phase 5 — Skills Matrix & Timeline** (`06_skills-timeline.md`) : radar interactif + badges + frise.
- **Phase 6 — Contact smart + section Jouer** (`07_contact-jouer.md`) : qualification en 3 clics + iframe haTD (jouable PC, teaser cold-open mobile). Lit `sessionStorage['simulator']` sans dépendre de la Phase 2 (clé absente = parcours direct). Inclut le retrait de `#kitchen-sink` et le câblage des images DETTE-14. **Livrée le 2026-09-15**, envoi Formspree confirmé en boîte de réception depuis le domaine réel (DETTE-28 close), lien haTD corrigé (DETTE-29 close).
- **Phase 6b — Mode allégé tactile** (`08_mode-allege-tactile.md`) : `backdrop-filter`, glows et animations asservies au scroll coupés sous `pointer: coarse` via `data-perf` sur `<html>` (surcharge de test `?perf=lite|full`) ; critère maître = rendu PC pixel-identique avant/après. Ouverte suite au test terrain de Xav (Galaxy A04, Firefox Android : défilement saccadé uniforme, DETTE-30). **Livrée et close le 2026-09-15** : rendu PC pixel-identique vérifié (diff 0 px hors zones d'animation exclues), mesure terrain confirmée par Xav sur le Galaxy A04 ("nette amélioration de la fluidité").
- **Phase 7 — Polish, perf, SEO, mentions légales** (spec à écrire — Module Standard) : page Mentions légales complète (identité, SIRET, hébergeur GitHub, RGPD du formulaire — obligation légale pour un site professionnel, à ne pas repousser), SEO/OG/sitemap/JSON-LD Person sur l'URL actuelle `xab-dev.github.io/portfolio-v2/` (domaine personnalisé : **statu quo**, décision de Xav, à réévaluer avec les finances), vérification et liens des 4 références (DETTE-31), largeur des panneaux du Playground (longues lignes), audit `prefers-reduced-motion` avec un vrai outil d'émulation, Lighthouse à reconfirmer. **L'image OG définitive attend le « skin » perso** (voir post-V1) : en Phase 7, OG = avatar + titre, sobre.
- **Phase 8 — Export CV classique (PDF une page)** : généré depuis `src/content/*.ts` (projets, skills, timeline, contact) pour ne jamais diverger du site ; bouton « Télécharger le CV » dans le Hero et le Contact ; génération à la build (fichier statique dans `dist/`) plutôt qu'à la volée côté client, pour le poids et le mode allégé. Spec à écrire.
- **Phase 9 — FAQ « Comment ce site a été créé ? »** : bouton en haut à droite de la section Jouer, **absent de la nav et du flux principal** ; ouvre un pop-up (primitive `Modal`) contenant une **discussion factice** au format de l'agent de poche (`AgentMessage`/`TypingText`) qui répond à la question principale — le site lui-même comme cas réel : specs numérotées, Claude Code, phases, dette suivie, vérification visuelle, mode allégé après test terrain. Contenu dans `src/content/faq.ts`, dérivé de `JOURNAL_DEV.md` (rien d'inventé). Spec à écrire.
- **Phase 10 — Version anglaise** : à lancer seulement une fois les phases 7-9 livrées et **actées par Xav** (« plus envie de changer quoi que ce soit »). Toute l'architecture T8 (`src/content/`) est faite pour ça ; la spec fixera le mécanisme (fichiers `*.en.ts` + sélecteur, ou sous-chemin `/en/`). haTD reste en français.
- **Post-V1, non planifié** (décisions de Xav) : Playwright e2e (après la version anglaise), domaine personnalisé (statu quo, budget), mesure d'audience (pas prioritaire — « la mesure réelle se fait sur les contrats signés »), image OG / « skin » perso (quand tout sera stable et intégré), agent de poche V2 branché sur une API (passe son tour).

Ordre conseillé (V1) : 0 → 4 → 5 → 1 → 6 → **6b** → 2 → 3 → 7. Le Portfolio et les Skills sont le cœur du CV et n'ont *aucune* dépendance de décision ; les modules "inédits" (Simulateur, Playground) viennent après, quand la dette de contenu aura été partiellement résorbée.

Ordre post-V1 (imposé par Xav, patch 23:00) : patch 23:00 → 7 → 8 → 9 → 10 — chaque phase qui ajoute du contenu (CV, FAQ) précède la traduction. **Design et animations : figés**, on n'y touche plus (validés par Xav).

## Rappel pour l'agent en fin de session
Avant de conclure : documenter explicitement (1) les décisions prises et pourquoi, (2) ce qui est livré et validé *à l'écran*, (3) ce qui reste hors scope et pour quelle phase c'est prévu, (4) toute nouvelle ligne ajoutée à `dette_suivi.md`.
