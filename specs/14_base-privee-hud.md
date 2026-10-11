---
projet: portfolio-v2
episode/session: Phase 9e — Deux projets venus de la base privée (spec 14)
type: spec
version: 1.2.0
statut: validée par Xav le 2026-10-12 (textes §4 et §5 tels quels, option A au §6, P1 à P3) — exécutée le 2026-10-12 (version 0.16.0), en attente du déploiement par Xav
catégorie: Spec
date: 2026-10-11
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : deux projets venus de la base privée (Phase 9e)

**Créé le 2026-10-11** à partir de la conversation avec Xav. Format : Module Standard. C'est la « phase 2 » de sa base personnelle : le portfolio alimenté depuis les fiches de cette base, réécrites pour le public.

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T6, T7, T8), `src/content/projects.ts`, `src/content/skills.ts`, `src/content/cvMap.ts`, `scripts/cv/buildCvModel.ts` (sélection des projets du condensé), `scripts/process-images.js`, la fiche projet « Harness engineering ».

**Source des faits** : un relevé écrit à l'étape 1 (2026-10-11), où chaque fait remonte à une preuve vérifiable (code, historique git, fichiers, journal), pas à l'affirmation d'une fiche. Le contenu du dossier privé de la base n'a été lu que pour sa forme ; rien de son contenu n'entre dans cette spec ni sur le site.

**Contre-lecture** (v1.1.0) : les textes de la v1.0.0 ont été relus par un agent indépendant (Claude Fable 5.1), en lecture seule, sans accès au dossier privé. Il a relevé sept points bloquants, dont une fuite (l'état de sécurité restant du PC) et des chiffres repris d'une fiche au lieu d'être recomptés ; tous sont corrigés ici, après vérification par l'agent rédacteur.

## 1. Rôle du module

Ajouter au site deux fiches projet et relever une compétence :

- **« La base privée et son HUD »** : la mémoire long terme que Xav tient avec Claude Code depuis le 2026-10-04, et sa fenêtre de pilotage locale.
- **« Audit sécurité d'un poste Windows »** : l'audit de son propre PC du 2026-10-07, en lecture seule.
- **Harness engineering** : niveau 3 → 4, selon la décision de Xav sur le §6.

## 2. Décisions

### Tranchées par Xav (2026-10-11)

| # | Sujet | Décision |
|---|---|---|
| D1 | Les projets | Deux fiches : la base et son interface ensemble, avec les détails ; l'audit à part. |
| D2 | Le nom public | « La base privée et son HUD ». Le nom interne de l'interface ne sort pas. HUD plutôt qu'UX : un HUD est un objet, l'UX une discipline (recommandation de l'agent, retenue). |
| D3 | Le niveau de détail | L'architecture se montre (gabarit, garde-fous, rituels, principe de l'agent bridé) ; **la recette reste privée** : ni le texte des consignes, ni celui des commandes, ni les fiches. Cohérent avec la fiche Harness engineering et l'offre sur devis. |
| D4 | Captures du HUD | Oui, **prises sur une copie factice** de la base, jamais sur la vraie. |
| D5 | Vidéo de l'audit | **Pas de lien.** La vidéo publiée est à refaire (relue par un professionnel, Xav doit y passer plus de temps) ; elle fera l'objet d'une mise à jour ultérieure. La présentation de l'audit n'est pas liée non plus. |
| D6 | Le CV | Seul le niveau Harness engineering change sur le CV deux pages. Les deux projets **n'entrent pas** dans la carte mentale ni dans le détail (`cvMap.ts` inchangé). |
| D7 | Restent de côté | L'IA locale (pas de ligne de compétence) ; le financement participatif, jusqu'à ce que Xav l'ait validé. |
| D8 | La règle `public: true` de la base | Aucune fiche n'est marquée `public: true`. Xav, le 2026-10-11 : « J'ai relu la plupart des codes et des textes. […] Dans l'ensemble, ça a été vu au moins une fois », sans changer les statuts faute de temps. Rien n'est recopié d'une fiche : les textes sont réécrits pour le public depuis des preuves vérifiées, et **sa relecture de cette spec et du diff tient lieu de feu vert**. |

### Proposées par l'agent, validées par Xav (2026-10-12)

| # | Sujet | Proposition |
|---|---|---|
| P1 | Place dans la grille | « La base privée et son HUD » juste après « Harness engineering » (le même cadre, appliqué à une vie plutôt qu'à un dépôt) ; l'audit juste après « miniCiel » (même famille : l'intervention sur un poste). |
| P2 | Étiquettes et statut | Base : `["Outils", "Méthode"]`, `en production` (utilisée depuis le 2026-10-04). Audit : `["Outils", "Méthode"]`, `v1 fonctionnelle` (un cas réel, le sien). |
| P3 | Couleur | Base `violet`, audit `emerald`. |

## 3. Interdits (en plus de T6, T7, T8)

- Rien sur d'autres personnes, la santé de Xav ou un sujet sensible, même par allusion. Pas de nom ni de rôle d'interlocuteur, pas d'exemple d'exposé.
- Pas de chemin de fichier, de nom de machine ou de compte, d'empreinte, de numéro de version, de nom de logiciel installé chez Xav (les outils du projet lui-même sont nommables : Node, git, Obsidian, Claude Code).
- **Aucun état de sécurité de sa machine** : ni ce qui reste ouvert, ni ce qu'il a choisi de ne pas activer, ni où en sont ses protections.
- Dans l'audit : pas le point du logiciel au contournement de licence ; pas la liste des quatorze points. Les chiffres et la méthode suffisent.
- Le HUD et la base ne sont pas décrits comme « sécurisés » ni « chiffrés » : les garde-fous arrêtent des commandes, ils ne forment pas un mur.
- Chaque chiffre porte sa date quand il peut bouger.

## 4. Fiche « La base privée et son HUD » — texte validé

- `id` : `base-hud`
- `title` : La base privée et son HUD
- `tagline` : Une mémoire long terme que je possède, pour travailler avec Claude Code sur tous mes sujets — et une fenêtre de pilotage pour s'en servir sans terminal.
- `problem` : Un assistant IA oublie tout d'une conversation à l'autre et d'un dossier à l'autre. Pour en faire un vrai assistant personnel, il lui faut une mémoire que l'humain possède, relit et corrige, et des règles qui empêchent le privé de sortir.
- `architecture` :
  1. Des fiches en Markdown dans un dépôt git local, sans serveur distant, lues dans Obsidian : une fiche, un sujet, écrite pour une IA qui l'ouvre sans aucun souvenir des sessions précédentes.
  2. Un gabarit commun : chaque fait porte sa source et sa date ; chaque consigne donnée à l'IA porte sa raison ; mes mots sont gardés tels quels ; les limites et les inconnues sont écrites. Une fiche que je n'ai pas validée, d'un clic, ne se traite pas comme un fait.
  3. Le privé et le public séparés : un dossier privé que l'IA ne lit pas sans ma demande ; rien ne part vers un site public sans que je relise le diff.
  4. Des rituels en commandes (le point du jour, une dictée vocale rangée en fiches, l'entretien de la base sans toucher au fond) et un journal par session où les écarts sont signalés des deux côtés : je corrige l'IA, l'IA me corrige.
  5. Des garde-fous techniques en plus des consignes : les commandes usuelles de suppression, de publication et de modification du système sont refusées par la configuration ; les connecteurs sont bloqués nom par nom, sauf trois choisis.
  6. Le HUD : une fenêtre locale en Node seul, sans bibliothèque tierce, joignable depuis le PC seulement. Ses tuiles : répondre un par un aux points en attente, déposer une note, lancer Claude Code dans la base, préparer ce que je vais dire à quelqu'un.
  7. Pour ce dernier usage, une instance de Claude Code bridée : trois outils de lecture, dossier privé exclu sauf mot de passe, sans connecteurs ni historique.
- `metrics` (toutes `verified: true`, relevées le 2026-10-11) :
  - Commits du 4 au 11 octobre 2026 : `112`
  - Fiches hors privé : `39`
  - Bibliothèques tierces du HUD : `0`
- `limits` :
  - Construite pour une seule personne : jamais encore installée chez un tiers.
  - Le code et les fiches de règles sont écrits par Claude Code : je fixe le besoin et les règles, je tranche, je relis. Tout n'est pas encore validé : 6 fiches sur 39 au 11 octobre 2026.
  - Les garde-fous arrêtent les commandes telles qu'elles sont écrites, pas toutes leurs variantes, et le mot de passe du HUD ferme un accès sans rien chiffrer : la règle écrite et la relecture font le reste.
  - Un projet de trois mois commencé le 4 octobre 2026. La recette reste privée : l'architecture est montrée, pas le texte des consignes, des commandes ni des fiches.
- `images` : deux captures, §7.

## 5. Fiche « Audit sécurité d'un poste Windows » — texte validé

- `id` : `audit-securite`
- `title` : Audit sécurité d'un poste Windows
- `tagline` : Un PC de tous les jours inspecté en une journée par un agent IA en lecture seule. L'agent relève, je décide, chaque correction est vérifiée.
- `problem` : Un PC utilisé depuis des années, mis à jour quand il le propose, jamais inspecté. Y a-t-il une porte dérobée, un programme caché, un logiciel à risque ? Et comment le savoir sans rien casser ?
- `architecture` :
  1. Deux passes : la nuit, sans droits d'administrateur, ce qu'un simple utilisateur peut voir ; le matin, avec, ce que seul l'administrateur peut ouvrir (dont le journal de sécurité).
  2. Pendant l'audit, l'agent (Claude Code, modèle Fable 5.1) inspecte et classe, il ne change rien. Ensuite, chaque correction est préparée par l'agent et exécutée par moi — ou par lui, sur mon accord explicite, pour quelques déplacements de fichiers hors système — puis vérifiée.
  3. Un filet comme règle : déplacer, exporter ou sauvegarder avant de supprimer ; rien de système sans accord explicite.
  4. Un classement par gravité, du plus urgent au confort. Ce qui va bien est dit aussi : savoir ce qu'il ne faut pas toucher.
  5. La transparence jusqu'au bout : une commande de l'agent a déclenché une fausse alerte de l'antivirus (elle contenait en clair les noms d'outils d'attaque qu'elle cherchait). C'est écrit dans le compte rendu.
- `metrics` (toutes `verified: true`, recomptées dans le relevé le 2026-10-11) :
  - Points relevés, classés par gravité : `14`
  - Clos le jour même : `12 (9 corrigés, 3 expliqués)`
  - Porte dérobée ou programme caché trouvé : `aucun`
- `limits` :
  - Un seul cas, mon propre PC sous Windows : jamais encore fait chez un tiers.
  - Le relevé est celui d'un agent IA, pas d'un professionnel de la sécurité ; ce n'est pas un test d'intrusion.
  - Deux des quatorze points restaient ouverts au soir du 7 octobre 2026.
  - Deux sauvegardes prévues n'ont pas été retrouvées après coup : le filet dépend de la discipline autant que de la méthode.
- `images` : aucune.
- `links` : aucun (D5).

## 6. Compétence — option A retenue par Xav (2026-10-12)

La contre-lecture conteste le passage à 4. L'échelle du site : 3 = « Utilisé sur au moins un projet réel ; je m'appuie encore sur la doc ou l'IA pour les cas non triviaux » ; 4 = « Autonome : je livre sans supervision et je sais expliquer mes choix ». Les fichiers du cadre (consignes, commandes, permissions, la ligne qui bride Claude Code) sont écrits par l'agent ; rien n'est livré hors des projets de Xav. Pour 4 : trois projets tenus avec le même cadre, et des règles qu'il formule et explique lui-même. Les autres niveaux du site (HTML / JS à 4, par exemple) sont déjà notés avec l'IA dans la boucle.

- **Option A (recommandée par l'agent rédacteur)** : niveau **4**, note qui dit la répartition : « ce site, RPG-v2 et ma base privée : je fixe consignes, commandes et permissions, l'agent écrit les fichiers, je relis ».
- **Option B** : niveau **3**, note : « ce site, RPG-v2 et ma base privée : consignes, commandes, permissions ; les fichiers sont écrits par l'agent sur mes règles ».

Dans les deux cas, prévoir un `shortNote` si la note déborde sur le CV.

## 7. Captures du HUD (D4)

- Une copie factice construite **hors de la base** (dossier de travail de l'agent, jamais commité) : le code de l'interface copié, un titre « HUD » dans sa configuration, une liste d'interlocuteurs **réécrite** (fictive et neutre ; le fichier réel, suivi par git, n'est pas réutilisé), trois ou quatre points en attente et deux fiches d'exemple inventés. Aucune donnée réelle ; **la vraie base n'est ni lue par le serveur ni modifiée**.
- Serveur lancé sur un autre port, sans fenêtre (`FEU_RACINE`, `FEU_PORT`, `FEU_SANS_FENETRE`), captures par Chrome headless (CDP, comme les audits du site).
- Deux images : la grille de tuiles ; la page des points en attente. Aucun exposé n'est lancé (pas d'appel à Claude).
- Les textes alternatifs disent « données d'exemple ». Traitement par `npm run images` (`images-src/projects/base-hud/raw/`).
- Les captures sont montrées à Xav avant d'entrer dans le site.

## 8. Risques connus

- **CV condensé** (pour Xav seul) : il reprend tous les projets hors statut `cadrage` et doit tenir sur exactement une page. Deux projets de plus peuvent le faire déborder et faire échouer le build. Si c'est le cas : **arrêt**, et proposition à Xav (exclure ces deux projets du condensé par leur identifiant, ou autre).
- **Agent de poche, FAQ** : aucune réponse ne compte les projets ; rien à changer (vérifié par recherche le 2026-10-11).
- **Fiche Harness engineering** : la métrique « Projets en ligne tenus avec ce cadre : 2 » reste juste (la base n'est pas en ligne). Inchangée.
- **Longueur** : la fiche base a 7 points d'architecture, le maximum actuel du site (RPG-v2).

## 9. Exécution et vérification

1. Copie factice et captures (§7) → **montrées à Xav**.
2. `projects.ts` (deux entrées, P1 à P3), `skills.ts` (§6), images.
3. Tests : `npm test` ; un test vérifie que les deux identifiants existent et qu'aucun texte des deux fiches ne contient un chemin (`:\`), une adresse e-mail ou le nom interne de l'interface.
4. `npm run build` (CV régénéré, contrôles de pages compris), `npm run audit:rgaa`.
5. Vérification à l'écran : grille et deux modales, clair et sombre, 375 et 1280 px.
6. Diff présenté à Xav ; un commit par étape dans le dépôt privé ; ROADMAP **0.15.0 → 0.16.0** (contenu visible validé par Xav, incrément de Y), journal et dette avant le commit des documents.
7. Déploiement : `npm run deploy` et push **par Xav** (refusés à l'agent par le mode automatique).

**ARRÊT XAV** : ~~relecture des §4 et §5 (textes), choix A ou B au §6, propositions P1 à P3, avant l'étape 1 de l'exécution~~ (validé le 2026-10-12) ; puis des captures avant l'étape 2.
