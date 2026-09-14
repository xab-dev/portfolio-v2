# Portfolio v2 "Premium Tech" — Roadmap + prompt d'exécution autonome

**Version : 0.2.0** — document vivant. Créé le 2026-09-14 à partir de la dictée de Xav (23:00) ; révisé le 2026-09-14 23:46 après les réponses de Xav aux points de substance S1-S7 de `dette_suivi.md`.

**Statut** : vision validée sur le périmètre fonctionnel (7 sections) et sur les points de substance. Reste 2 décisions ouvertes (D3, D4) listées §"Décisions à confirmer", non bloquantes pour la Phase 0. Ce document sert de brief autonome — à donner tel quel à Claude Code pour démarrer la phase courante.

---

## Bloc à lire en premier par l'agent (contexte minimal indispensable)

**Qui tu es dans ce projet** : Creative Technologist senior + expert UI/UX. Tu construis le portfolio/CV interactif de Xavier B. ("Xav"), consultant indépendant (Tarascon, 13) dont le titre public est **Consultant outils et solutions IA** — spécialité : conception de workflows, outils et usages IA adaptés aux besoins réels. Sa valeur : *comprendre le problème avant de choisir l'outil*. Sa méthode : le cadre 4D (Délégation, Description, Discernment, Diligence) et une pratique de spec-driven development (6 templates de spec pour piloter des agents de code).

**L'existant sur lequel tu t'appuies** :
- **Un repo GitHub neuf et vide**, dédié à ce portfolio (nom : **[DETTE-23]**, ex. `xab-dev/portfolio`), publié via GitHub Pages à `https://xab-dev.github.io/<repo>/`. Ce site est le **portfolio officiel** de Xav. Le repo ne contient rien d'autre : pas d'`index.html` hérité, pas de sous-dossier tiers.
- L'ancien repo `xab-dev/cv-portfolio` reste en ligne mais **n'est pas touché** : sa racine ("Carnet de terrain") est un document personnel, et son sous-dossier `haTD_V1/` héberge le jeu tower defense de Xav à `https://xab-dev.github.io/cv-portfolio/haTD_V1/`. Le jeu est consommé **par URL absolue en iframe** — même origine `xab-dev.github.io`, donc aucun problème de X-Frame-Options.
- Les données de contenu (projets, compétences, parcours, réponses de l'agent) sont fournies dans les specs 02 à 07. Tout ce qui est marqué `[À CONFIRMER]` ou `[DETTE-xx]` est référencé dans `dette_suivi.md` : ne l'invente pas, mets une valeur neutre et laisse le marqueur.

**Ce qui n'existe pas encore** : tout. Le repo est vide. Le projet Vite/React est créé en Phase 0 à la racine du repo.

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
| T9 | **Déploiement à la racine d'un repo neuf** (`vite base: '/<repo>/'`), via GitHub Actions → GitHub Pages. Le site v2 est le portfolio officiel dès sa première mise en ligne. Le Carnet de terrain (`cv-portfolio`) n'est ni lié en navigation principale ni migré : il reste un souvenir personnel. | Réponse S4 de Xav. Supprime l'ancienne décision D1 ("déployer dans `/v2/`"). |
| T10 | **Titre public : "Consultant outils et solutions IA"** — dans le `<title>`, le Hero, les meta OG, le footer. | Réponse S5 de Xav. Supprime l'ancienne décision D2. |
| T11 | **Tags projet sans "RAG/LLM"**. Tags V1 : Automations, Formations, Jeu, Outils, Méthode. RAG apparaît uniquement dans les *skills* au niveau "notions". | Réponse S2 de Xav : aucun projet RAG, sujet à creuser quand un projet le demandera. Un filtre vide serait pire qu'un filtre absent. |
| T12 | **Section Jouer** : sur PC, le jeu est jouable dans l'iframe. Sur mobile (pointeur tactile), l'iframe se charge quand même pour laisser jouer le *cold-open* de haTD comme teaser visuel, puis se referme (bouton "Fermer" toujours visible + fermeture automatique après une durée configurable). Aucune tentative de rendre le jeu jouable au tactile. | Réponse S6 de Xav : haTD n'est pas jouable au tactile, le cold-open suffit comme effet. |

## Décisions à confirmer par Xav (non bloquantes pour la Phase 0)

| # | Question | Option recommandée (par défaut si pas de réponse) |
|---|---|---|
| ~~D1~~ | ~~Où déployer la v2 ?~~ | **Tranché → T9** (repo neuf, racine). |
| ~~D2~~ | ~~Titre public ?~~ | **Tranché → T10** ("Consultant outils et solutions IA"). |
| D3 | Envoi du formulaire de contact ? | Formspree (gratuit, sans backend, RGPD ok) ; repli `mailto:` pré-rempli. Nécessite un endpoint créé par Xav. Requis pour la Phase 6 seulement. |
| D4 | Fourchettes de budget affichées dans le formulaire ? | Fourchettes neutres proposées en spec 07, à valider — c'est un choix commercial, pas technique. Requis pour la Phase 6 seulement. |
| D5 | Durée du cold-open de haTD (pour la fermeture automatique sur mobile, T12) ? | Constante `PLAY_TEASER_MS` dans `src/content/play.ts`, valeur par défaut 20 000 ms **[DETTE-24]** ; le bouton Fermer reste de toute façon visible. |

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
**C'est la phase à exécuter maintenant.** Détail complet : `01_socle-design-system.md`.

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
Le site est visible à `https://xab-dev.github.io/<repo>/`, la nav scrolle entre 7 sections vides, les primitives sont démontrées sur une page `/kitchen-sink` (ou une section temporaire), Lighthouse mobile ≥ 90 en Performance et Accessibilité.

### Hors scope pour cette phase
Tout contenu réel. Aucune des 7 sections n'est remplie.

---

## Phases suivantes (esquisse — chacune a déjà son fichier de spec, à relire au moment de l'exécuter)

- **Phase 1 — Hero + Agent de poche** (`02_hero-agent-poche.md`) : accroche, puces de questions, agent scripté avec typing, interface prête pour une API.
- **Phase 2 — Stack Simulator & ROI** (`03_stack-simulator-roi.md`) : sélection de problématiques → stack recommandée + compteurs *indicatifs* avec formules visibles.
- **Phase 3 — Prompt Playground** (`04_prompt-playground.md`) : cas d'usage → prompt brut → animation scanner → prompt expert + avant/après. Contenu dérivé des vrais templates de Xav.
- **Phase 4 — Portfolio dynamique** (`05_portfolio-dynamique.md`) : grille filtrable, survol 3D, modale problème/architecture/métriques avec les projets réels.
- **Phase 5 — Skills Matrix & Timeline** (`06_skills-timeline.md`) : radar interactif + badges + frise.
- **Phase 6 — Contact smart + section Jouer** (`07_contact-jouer.md`) : qualification en 3 clics + iframe haTD (jouable PC, teaser cold-open mobile).
- **Phase 7 — Polish, perf, SEO** : audit Lighthouse, reduced-motion, SEO/OG/sitemap, mentions légales. Spec à écrire une fois les phases 1-6 livrées.

Ordre conseillé : 0 → 4 → 5 → 1 → 6 → 2 → 3 → 7. Le Portfolio et les Skills sont le cœur du CV et n'ont *aucune* dépendance de décision ; les modules "inédits" (Simulateur, Playground) viennent après, quand la dette de contenu aura été partiellement résorbée.

## Rappel pour l'agent en fin de session
Avant de conclure : documenter explicitement (1) les décisions prises et pourquoi, (2) ce qui est livré et validé *à l'écran*, (3) ce qui reste hors scope et pour quelle phase c'est prévu, (4) toute nouvelle ligne ajoutée à `dette_suivi.md`.
