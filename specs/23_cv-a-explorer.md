---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, le CV à explorer : la carte mentale du CV rendue jouable sur le site (spec 23)
type: spec
version: 0.1.0
statut: écrite le 2026-11-02, en attente du go de Xav — troisième des trois specs du plan (21 → 22 → 23), la plus grosse
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: —
---

# Portfolio v2 — SPEC : le CV à explorer (Phase 11, spec 23)

## 1. La demande

Proposition 7 de l'agent, acceptée par Xav le 2026-11-02 : « La carte de la spec 13 existe en PDF. Sa version web : des nœuds à déplier, le parcours "Avant 2026" en pièces à traverser au clavier ou au doigt. C'est le vrai "CV interactif" de la refonte. »

Réponse de Xav sur le périmètre : **« Toute la carte, sous un bouton à côté de "Télécharger le CV" »**. Donc : le même contenu que la page 1 du PDF, compétences comprises (elles reviennent sur le site par cette porte, et par elle seule), derrière un bouton du Hero, pas une section.

Rappel des décisions qui tiennent : **le CV PDF reste hors refonte** (Xav, 2026-11-01) — cette spec n'y touche pas, elle en donne une vue ; l'ordre de lecture de la carte suit l'ordre du temps (Xav, 2026-10-04) ; pas de fait nouveau dans la carte, chaque feuille pointe sa source (`cvMap.ts`).

## 2. L'entrée

Dans le Hero, à côté de « Télécharger le CV (PDF) » (`cv.ctaLabel`), un second lien de même style : **« Explorer le CV »**. Il pose le hash `#cv` (lien direct possible, comme `#faq` ; Échap et la fermeture rendent `#hero`). Le gardien (spec 22) pourra y mener.

## 3. L'explorateur

**Un même modèle que le PDF.** `scripts/cv/buildCvMapModel.ts` construit aujourd'hui la carte pour le PDF (branches, feuilles résolues, jetons `{{metric:…}}` et `{{period}}`). Il est pur (aucune dépendance Node) : il passe dans `src/lib/cv/buildCvMapModel.ts`, le script du PDF l'importe de là. Le site et le PDF lisent donc **le même modèle à partir des mêmes entrées** ; un test construit les deux et les compare ; les deux PDF reconstruits restent identiques au texte. Seule différence : le PDF filtre `onCv: false` dans « Avant 2026 » ; l'explorateur garde l'entrée « 2026 — Formation Claude Max » (site seulement, décision du 2026-11-01).

**La vue.** Un dialogue plein écran (pas la `Modal` de 32 rem : un conteneur dédié avec `role="dialog"`, piège à focus, Échap, bouton Fermer), fond du site, titre « Le CV, à explorer ». Au centre, la carte de visite : nom, titre, les trois lignes grises de l'en-tête (`cv.map.headerLines`). Autour, les six branches à leur place du PDF (`slot`) : Avant 2026 en haut à gauche, Reconversion 2026 en haut à droite, Méthode, IA & agents, Développement, La suite en bas à droite ; des traits SVG du centre vers chaque branche, couleur de la branche. Les couleurs `ochre`, `cyan`, `slate` du PDF n'existent pas dans les jetons du site : elles n'habillent que traits, pastilles et bordures ; **tout texte reste sur les couleurs de texte existantes** (AA tenu sans nouveau calcul). Mouvement réduit : rien ne bouge. Mode allégé : pas de flou.

**Jouer.** Une branche fermée montre son nom et le nombre de feuilles. On l'ouvre au clic, au doigt ou à Entrée : ses feuilles se déplient en liste. Une feuille :
- `project` → ouvre la fiche (`#projets/<id>`, donc sa serrure s'il y en a une ; l'explorateur se ferme pour la laisser passer, et le hash le rouvre au retour si l'on y revient par le bouton) ;
- `skill` → un volet à droite (ou dessous à 500 px) avec la famille, le niveau sur 7 et la phrase de `skills.ts` — c'est ainsi que les compétences reviennent, une par une, jamais en grille ;
- `timeline` → le volet avec la période et le détail du jalon ;
- les feuilles d'« Avant 2026 » et de « La suite » (lues dans `story.ts`) → le volet avec le titre, l'année, le détail.

Au clavier : les six branches sont une barre d'outils à focus tournant (flèches pour passer de l'une à l'autre, Entrée pour ouvrir, Échap pour refermer la branche, puis l'explorateur). Au doigt : tout est bouton. À moins de 768 px : plus de disposition en étoile, une liste des branches **dans l'ordre du temps** (le même ordre que le PDF, gauche → droite puis haut → bas), chaque branche en accordéon.

**La progression.** « 2 branches sur 6 explorées » en pied, dans une zone `role="status"`. Quand les six sont ouvertes : une dernière ligne de Xav, **à dicter par lui** (placeholder refusé par un test tant qu'elle n'est pas là : l'explorateur ne se livre pas sans elle). Rien n'est stocké.

**La page 2 du PDF** (fiches projet et chiffres) n'est pas reprise : les fiches du site font mieux, et la carte y mène.

## 4. Fichiers

- `src/lib/cv/buildCvMapModel.ts` (déplacé, ré-exporté par `scripts/cv/buildCvMapModel.ts` pour ne rien casser côté PDF) ; `sanitizeForPdf` reste au PDF.
- `src/content/cvExplorer.ts` : textes (titre, bouton, « explorées », la dernière ligne de Xav).
- `src/components/cv/CvExplorer.tsx` (le dialogue, le focus, le hash), `CvMapStar.tsx` (la disposition en étoile et les traits), `CvBranch.tsx`, `CvLeafPanel.tsx`.
- `src/lib/router/hashRoute.ts` : la route `#cv`.
- `src/sections/Hero.tsx` : le second lien.
- Tests : modèle identique entre le site et le PDF ; chaque feuille résolue (projet existant, compétence existante, jalon existant) ; ordre mobile = ordre du temps ; focus tournant (logique pure testée) ; la dernière ligne présente et sans « [À » ; les deux PDF inchangés.

## 5. Vérification prévue

`tsc`, `oxlint`, tests, build (taille du bundle : l'explorateur en chunk séparé, chargé au clic) ; Chrome sur `vite preview` à 1 440 px et 500 px, sombre et clair : ouvrir par le bouton et par `#cv`, les six branches, une feuille de chaque sorte, une feuille vers une fiche verrouillée, retour ; un parcours entier au clavier seul ; mouvement réduit émulé ; `npm run cv` et `npm run cv:condense`, texte comparé page à page au publié. Une passe `axe` sur l'explorateur s'ajoute à DETTE-72.

## 6. Hors scope

Le PDF (hors refonte) ; la page 2 ; un rendu en « pièces à traverser » façon jeu de rôle (l'étoile et l'accordéon d'abord ; si Xav veut une vraie carte à parcourir, ce sera une spec de plus) ; l'anglais ; l'édition.

## 7. ARRÊT XAV

Avant le code : le go, le libellé du bouton (« Explorer le CV » ?), et la dernière ligne à dicter. Après : explorer les six branches en ligne, dire si les compétences ont leur place ainsi, et si l'étoile tient sur son écran.

Version à l'exécution : 1.14.0.
