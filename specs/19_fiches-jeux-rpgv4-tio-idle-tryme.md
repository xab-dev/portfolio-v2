---
projet: portfolio-v2
episode/session: Phase 11 — Refonte, projets : trois fiches de jeux (RPGv4, TiO-idle, TryMe) et le renvoi de la section Jouer (spec 19)
type: spec
version: 1.0.0
statut: exécutée le 2026-11-02 — ARRÊT XAV : relire les trois fiches (textes de l'agent, écrits depuis les dépôts), décider du lien TiO-idle
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : les fiches RPGv4, TiO-idle et TryMe (Phase 11)

## 1. La demande

Xav, le 2026-11-02, devant l'inventaire des projets absents du site : « Livret A3, Boîte à outils, Tonieer, V3 : on ne fait rien. Idle, TryMe, V4 : méritent leur tuile dans projet. Prends ton temps pour chacune. Tu peux extraire des screenshots pour imager chaque tuile. Un lien vers le jeu en ligne (ou le prototype html, si disponible). Un bouton de renvoi dans la section Jouer. »

Le tri par importance des projets vient après (prochaine étape).

## 2. Règles suivies

- **Chaque phrase remonte au dépôt du jeu** (README, `CLAUDE.md`, cadrage, feuille de route, suivi de dette, historique git), lus le jour même. Les métriques sont comptées, la méthode de comptage est en commentaire dans `projects.ts`. Rien ne vient des fiches de la base de Xav, toutes `public: false`.
- **TiO-idle : rien du contenu.** Xav découvre le jeu en jouant. La fiche dit la forme, la pile, la méthode, l'état ; jamais un chapitre, un lieu, un personnage. Un test le garde (`projects.test.ts`). Les captures ont le texte du livre flouté.
- **Le CV ne bouge pas.** Les trois fiches sont taguées « Jeu », tag exclu du CV condensé ; le CV deux pages a sa liste explicite. Le texte du PDF reconstruit, comparé page à page au PDF publié : identique.
- **Même garde anti-fuite** que les fiches venues de la base (spec 14) : pas de chemin local, pas d'adresse e-mail, pas de nom interne.

## 3. Les trois fiches

| Fiche | Statut | Tags | Lien | Images |
|---|---|---|---|---|
| RPGv4 — Trouble in Order en 3D | en développement (en pause depuis le 01/11, TryMe seul actif) | Jeu | https://xab-dev.github.io/RPGv4/ (Pages depuis un dépôt privé) | sortie de la Grotte (prise dans la scène d'essai locale, panneau de dev masqué) ; écran « Ton héros » (version en ligne) |
| TiO-idle — le RPG qu'on feuillette | en ligne (en pause depuis le 28/10) | Jeu, Méthode | https://xab-dev.github.io/TiO-idle/ (Pages, `noindex`) | première double page, texte flouté ; panneau des réglages |
| TryMe — élever un esprit | cadrage (prototype du 01 au 14/11, verdict le 15) | Jeu, Formations | le prototype HTML v0, copié dans le site : `/jeux/tryme/` | « Le ruisseau » et l'accueil du prototype |

Métriques, toutes comptées le 2026-11-02 :
- RPGv4 : 238 commits (22 → 26/10), 26 pull requests fusionnées, 52 fichiers de tests / 302 cas, 128 fichiers TypeScript / ≈ 19 000 lignes.
- TiO-idle : 160 commits (17 → 28/10), 26 specs, 105 fichiers de tests lancés / 581 contrats verts (le 106e écrit sur le disque, non lancé), ≈ 13 900 lignes de jeu / ≈ 13 200 de tests.
- TryMe : 71 commits (29/10 → 01/11), 93 fonctions de test GDScript, 102 lignes de décisions signées, prototype Godot du 1er au 14 novembre.

## 4. Le prototype TryMe servi par le site

TryMe n'a ni version en ligne ni export web. Son prototype HTML (un fichier, « jetable », v0) est **copié** dans `public/jeux/tryme/index.html` par `npm run tryme:sync`, avec un `SOURCE.txt` (commit d'origine, date, sans chemin local) et trois garde-fous avant copie : chemin Windows, adresse e-mail, clé ou jeton. Un test vérifie que la copie existe et passe les mêmes gardes. Le prototype charge des polices Google en ligne et propose à la fin de copier un avis à envoyer : c'est son fonctionnement d'origine, inchangé.

## 5. La section Jouer

Sous RPG-v2, un bloc « Mes autres jeux » : trois boutons (nouvel onglet), chacun suivi de son état et du lien vers sa fiche. Textes dans `play.ts`, adresses dans `site.ts` (`rpgv4Url`, `tioIdleUrl`, `trymeProtoPath`).

> **Révisé le 2026-11-02 (1.9.0), à la relecture de Xav** : plus de bloc. Les trois boutons seuls, sur la ligne du titre, entre « Jouer » et la bulle « Comment ce site a été créé ? » ; ni état ni lien de fiche (l'état reste dans chaque fiche projet). Sous une certaine largeur la rangée replie sous le titre.

## 6. Captures

Outil écrit pour l'occasion (scratchpad, pas dans le dépôt) : Chrome sans écran piloté par le client CDP du harnais d'audit, 1600 × 900. RPGv4 en 3D ne rend pas sans écran (noir) : la scène d'essai a été ouverte dans le Chrome de Xav en local, panneau de développement masqué par script, capture 1372 × 871. Les six images passent par `npm run images` (webp, 6 à 57 Ko).

## 7. Vérification

`tsc -b`, `oxlint`, 147 tests (144 + 3 : garde anti-fuite étendue, contenu de TiO-idle, prototype copié), `npm run build` ; modale RPGv4 et bloc « Mes autres jeux » vus dans Chrome sur `vite preview` ; prototype servi (HTTP 200). CV identique.

## 8. ARRÊT XAV

1. Relire les trois fiches : ce sont des textes de l'agent, à la première personne, écrits depuis les dépôts. Corriger ce qui sonne faux.
2. **TiO-idle** : son adresse « se donne, elle ne se trouve pas » (commentaire de son `index.html`). La fiche et la section Jouer la publient. Garder le lien, ou le retirer ?
3. Publier, puis le tri par importance.
