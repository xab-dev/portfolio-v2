# Correctif — Bulles coupées dans Compétences + déplacement RAG + rééquilibrage — 2026-09-17 (2)

Correctif `Z` → v0.6.3. Suite du patch mobile (validé sur Galaxy A04 en `lite` et `full`).

---

## 1. Bulles (tooltips) coupées par la carte de famille — régression du patch précédent

**Symptôme** : au survol/tap d'un badge situé en bas d'une carte (ex. Cadre 4D dans « Méthode IA »), la bulle « Niveau X/7 — libellé + note » est tronquée par le bord de la carte.

**Cause** : l'`overflow-hidden` ajouté sur la carte de famille (patch mobile, Bug 2 point 2) crée un contexte de découpe ; la bulle, positionnée en absolu dans la carte, est coupée.

**Correctif** :
1. Retirer `overflow-hidden` de la carte de famille. Garder `min-w-0` sur le conteneur de badge et `break-words` sur le texte — ils suffisent à faire plier un libellé long.
2. Vérifier que la carte ne crée pas de contexte d'empilement qui piégerait la bulle sous la carte voisine : pas de `overflow` (ni `auto`, ni `clip`), pas de `contain`, pas de `transform`/`filter` posé en permanence sur la carte (un `transform` ne doit exister que pendant l'animation de reveal ; `once: true` + `motion` retire le `transform` en fin d'animation — à vérifier avec `getComputedStyle` une fois l'animation terminée). Si un contexte d'empilement est inévitable, rendre la bulle via un portail (`createPortal` sur `document.body`) positionné depuis le `getBoundingClientRect()` du badge — c'est la solution robuste, et la seule si le problème réapparaît.
3. La bulle reçoit `z-50` et, sur mobile, se retourne vers le haut quand le badge est dans le tiers bas de l'écran (sinon elle sort de l'écran sur les dernières cartes).

**Validation** : survol/tap sur le **dernier** badge de chaque famille à 1280 px et 375 × 600 px → bulle entière, au premier plan, jamais sous la carte suivante.

---

## 2. RAG → famille « No-code / automatisation »

`src/content/skills.ts` : `family: 'No-code / automatisation'` pour la ligne RAG, niveau 1 et note inchangés.

**Effet de bord à connaître (radar)** : la famille « LLMs & agents » passe de moyenne 3,25 (5·4·3·1 → affiché 3,5) à 4,0 ; la famille automatisation reste à 1,0 (1 et 1). L'axe LLMs monte donc d'un demi-point sans qu'aucune compétence n'ait changé. Xav l'a décidé en connaissance de cause ; on le note ici pour ne pas s'en étonner plus tard.

Nom de famille : le RAG n'est ni du no-code ni de l'automatisation stricto sensu, c'est un pipeline de données. Si le libellé gêne un jour, renommer la famille « Automatisation & pipelines » (un seul endroit : `SkillFamily` + les données). Pas fait dans ce patch : Xav a demandé « tel quel ».

---

## 3. Passe d'équilibrage (proposition Claude, à valider par Xav — deux changements seulement)

| Compétence | Actuel | Proposé | Pourquoi |
|---|---|---|---|
| Godot / GDScript | 2 | **3** | Le niveau 2 = « premiers essais, encore guidé ». Or haTD est un prototype jouable, playtesté par un tiers, et le RPG est en développement : c'est la définition exacte du 3 (« utilisé sur au moins un projet réel ; doc/IA pour les cas non triviaux »). |
| Vulgarisation / formation | 3 | **4** | Le site vend une offre « Formation équipe (4D) ». Afficher 3/7 (« en consolidation ») sous une prestation qu'on propose est incohérent pour un visiteur. Le 4 (« autonome, je livre sans supervision et je sais expliquer mes choix ») est couvert par le contenu pédagogique 1AM produit et les 6 templates documentés. Si Xav préfère rester à 3, alors retirer « Formation » des types de projet du formulaire — l'un ou l'autre, pas les deux. |

Tout le reste reste tel quel : Docker/VPS 1, Biostat 1, RAG 1, Make 1 sont honnêtes ; Spec-driven 6 est le seul palier de preuve ; rien à 7.

Effet radar si les deux sont acceptés : Développement 3,0 → 3,25 (affiché 3,5) ; Humain 3,0 → 4,0.

---

## Report
- `specs/06_skills-timeline.md` §2 : ligne RAG (famille), lignes Godot et Vulgarisation si validées ; §4 : remplacer « la carte de famille `overflow-hidden` » par « la carte ne coupe jamais ses bulles (pas d'`overflow`) ; les libellés longs plient via `min-w-0` + `break-words` ».
- `00_ROADMAP.md` → v0.6.3.
- `JOURNAL_DEV.md` : `2026-09-17 — Fix : overflow-hidden retiré des cartes de famille (coupait les bulles) ; bulle z-50 + retournement bas d'écran ; RAG → automatisation ; [Godot 2→3, Vulgarisation 3→4 si validés]. Cause racine : découpe introduite par le patch mobile précédent.`

## Prompt pour Claude Code
> Lis `specs/00_ROADMAP.md` puis `PATCHES_2026-09-17_skills-tooltip-rag.md`. Applique §1 et §2 ; pour §3 applique uniquement ce que Xav a coché. Critère de validation §1 obligatoire sur le dernier badge de chaque famille, aux deux tailles. v0.6.3, test/lint/build verts, commit + push, ARRÊT XAV pour la vérification sur le Galaxy A04.
