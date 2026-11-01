---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, étape 1 : retraits (spec 17)
type: spec
version: 1.0.0
statut: exécutée le 2026-11-01 — ARRÊT XAV : relire le site en ligne après publication
catégorie: Spec
date: 2026-11-01
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : refonte, étape 1 — retraits réversibles (Phase 11)

## 1. Pourquoi

Xav, le 2026-11-01 : « J'aimerais qu'on fasse une refonte de mon portfolio. L'objectif est qu'il me ressemble un peu plus, plutôt que d'être seulement une vitrine professionnelle. Un mélange entre un jeu et un "CV interactif". On va commencer par les simplifications / suppressions étape par étape. Il serait intéressant de garder les modules quelque part, sans vraiment les supprimer, juste de les enlever du site pour qu'on puisse les réintégrer si jamais je change d'avis. »

Cette spec est écrite après coup, le jour même, pour cadrer la mécanique commune à toutes les étapes de retrait de la refonte. Les étapes suivantes (ajouts, jeu, CV interactif) auront leur propre spec.

## 2. Mécanique de retrait (vaut pour toute la refonte)

1. **Tag de départ** : `v1.1.1-avant-refonte` sur les deux dépôts, posé avant la première modification. Le site vitrine complet se retrouve d'un coup.
2. **Dossier `retire/`** à la racine du dépôt privé. Un module retiré y est déplacé par `git mv`, **en gardant son chemin d'origine** sous `src/` : `retire/<module>/src/...`. Le rebrancher, c'est le déplacement inverse plus les quelques lignes d'appel, listées dans `retire/README.md`.
3. `retire/` est hors du build (`tsconfig.app.json` n'inclut que `src/`), hors des tests (`test.exclude` dans `vite.config.ts`) et hors du lint (`--ignore-pattern=retire`). Les imports relatifs n'y résolvent pas : rien n'est réécrit, le code reste celui du jour du retrait.
4. Le **contenu partagé avec les CV** (`src/content/*.ts` lu par `scripts/build-cv.tsx`) ne part pas dans `retire/` : les CV ne changent pas sans demande explicite.
5. Chaque retrait : journal, dette, version (incrément de Y : comportement visible modifié), spec annotée. Pas de déploiement par l'agent : Xav publie avec la tuile « Publier ».

## 3. Étape 1 — ce qui est retiré (demande de Xav, 2026-11-01)

| Module | Origine | Dans `retire/` | Reste en place |
|---|---|---|---|
| Agent de poche | spec 02, Phase 1 | `agent-de-poche/` : `AgentPanel`, `lib/agent/*`, `content/agent.ts` | `AgentMessage` et `TypingText` (la FAQ les utilise) |
| Simulateur | spec 03, Phase 2 ; spec 07 §3 (pré-remplissage) | `simulateur/` : section, 5 composants, `AnimatedCounter`, `lib/simulator`, `content/simulator.ts`, `references.ts`, `lib/contact/readSimulator.ts` | — |
| Playground | spec 04, Phase 3 | `playground/` : section, 5 composants, `content/playground.ts` | — |
| « La suite » | spec 13, D6 | `la-suite/` : `NextBlock` et `frenchSpacing` extraits de `StoryBlocks.tsx` | `story.after` dans `story.ts` : le CV carte mentale l'affiche toujours |

## 4. Conséquences sur ce qui reste

- **Hero** : une seule colonne (l'agent occupait les 45 % de droite). Le bloc texte garde sa largeur de lecture (`max-w-2xl`). Le CTA « Qualifier votre besoin » mène à `#contact` au lieu de `#simulateur`.
- **Navigation** : Accueil, Compétences, Projets, Jouer, Contact, FAQ.
- **Contact** : plus de pré-remplissage depuis le simulateur (effet, bannière « Depuis le simulateur », champs `source` et `simulatorSelection` du payload Formspree). Le formulaire est inchangé pour le visiteur.
- **Fiche « Portfolio v2 — ce site »** (`projects.ts`) : la ligne d'architecture sur les trois modules dit qu'ils sont retirés et gardés ; la limite « Agent scripté… » est reformulée. **FAQ** : « le Playground, plus haut, en montre trois à l'œuvre » retiré.
- **Scripts d'audit** (`audit-harness`, `audit-rgaa`, `audit-reduced-motion`, `rgaa-scenarios`) : points de contrôle et scénarios des trois sections retirés ; les numéros des points restants ne bougent pas (les captures de référence locales gardent leurs noms).
- Bundle principal : 464 Ko → 418 Ko.

## 5. Vérification

- `tsc -b`, `oxlint`, `vitest` (136 tests : 174 moins les 38 partis avec les modules), `npm run build` : verts.
- Rendu vérifié dans Chrome sur `vite preview` : Hero sur une colonne, bandeau à cinq entrées plus FAQ, texte de la page sans aucune trace des quatre modules, Contact atteint depuis « Qualifier votre besoin ».
- Non vérifié : le rendu mobile (375 px) et le thème clair après le retrait ; les audits contraste et RGAA n'ont pas été relancés (les scénarios touchés ont été retirés, pas réécrits). À relancer depuis la tuile « Vérifications » avant ou après publication.

## 6. Hors scope

Tout ajout. Les specs 02, 03, 04 et 13 ne sont pas réécrites : elles décrivent des modules qui existent toujours, dans `retire/`.

## 7. ARRÊT XAV

Publier (tuile « Publier »), puis relire le site en ligne, surtout le Hero sur téléphone. Dire si « Qualifier votre besoin » doit rester, pointer ailleurs, ou disparaître.
