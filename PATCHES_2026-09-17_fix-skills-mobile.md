# Correctif — Section Compétences invisible sur Firefox Android + débordement d'un badge — 2026-09-17

Correctif `Z` (convention de version). Deux bugs terrain (Galaxy A04), diagnostiqués par Xav et Claude, aucune décision ouverte.

---

## Bug 1 — Section Compétences rendue mais invisible (opacité 0) sur Firefox Android

**Symptôme** : sur le site déployé, Galaxy A04 / Firefox Android, la section Compétences occupe sa hauteur mais rien n'est visible, même après 2 min et un rechargement, en `?perf=full` comme en `lite`. Le texte est pourtant sélectionnable (appui long → « code / automatisation » copié). Chrome sur le même téléphone affiche tout. Firefox desktop en responsive 375 px affiche tout **sauf si la hauteur du viewport est réduite à ~600 px** : la section disparaît alors aussi sur PC.

**Cause (confirmée par le test hauteur 600 px)** : l'apparition de la section est conditionnée à une animation « reveal » (`whileInView` / `IntersectionObserver`) dont le seuil de visibilité (`amount`) exige qu'une fraction de l'élément soit à l'écran. Depuis le patch échelle 1→7 (légende de 7 niveaux + bandeau Positionnement), la section est plus haute qu'un écran de téléphone : la fraction requise n'est jamais atteinte, `opacity: 0` reste posé pour toujours. Le PC en responsive a un viewport plus haut, d'où la différence. Ce n'est pas lié à la modification manuelle de `contact.ts`.

**Correctif, dans cet ordre :**

1. **Retrouver la primitive de reveal** (Phase 0, probablement `src/components/primitives/Reveal.tsx` ou équivalent, ou un `viewport={{ ... }}` posé directement dans `Skills.tsx`). Y remplacer tout seuil élevé par :
   ```ts
   viewport={{ once: true, amount: 0.1, margin: "0px 0px -10% 0px" }}
   ```
   `amount: 0.1` = 10 % de l'élément visible suffit — atteignable même pour une section de 3 écrans de haut. `once: true` = pas de re-disparition au scroll. Si la primitive est partagée par toutes les sections, la modifier **une seule fois** à la source ; ne pas dupliquer une variante « pour Skills ».

2. **Règle à ajouter dans la primitive (commentaire) et dans `00_ROADMAP.md` § Conventions** : *« Jamais de `amount` > 0,2 sur un conteneur dont la hauteur peut dépasser un écran de téléphone. Le reveal se pose sur des blocs d'un écran maximum (carte, groupe de badges), pas sur une section entière. »* Concrètement pour Compétences : reveal sur le radar, sur chaque carte de famille, sur la légende et sur le bandeau — pas sur `<section>`.

3. **Filet de sécurité** : la primitive de reveal pose `opacity: 0` uniquement si `IntersectionObserver` existe **et** si `prefers-reduced-motion` n'est pas actif ; sinon contenu visible d'emblée. (Le mode `lite` ne doit pas être détourné pour ça : `lite` coupe les effets coûteux, pas les reveals.)

4. **Vérifier les autres sections** avec le même test hauteur 600 px (Projets, FAQ, Contact ont aussi grandi au fil des phases). Corriger toute section qui disparaît, même mécanisme.

---

## Bug 2 — Badge « Cadre 4D (Délégation/Description/Discernment/Diligence) » déborde de la carte « Méthode IA »

**Symptôme** (Chrome Android, 375 px) : le libellé long dépasse du cadre de la famille.

**Correctif, deux volets (les deux, pas l'un ou l'autre) :**

1. **Contenu** (`src/content/skills.ts`, ligne Cadre 4D) — le développé des 4D passe dans la `note`, affichée au survol (PC) et au tap (mobile), comme les autres notes :
   - `name` : `Cadre 4D`
   - `note` : `Délégation · Description · Discernement · Diligence — pratique documentée`
   Aucun autre `name` ne dépasse ~40 caractères ; la spec 06 §2 est mise à jour en conséquence (même tableau, ligne Cadre 4D).

2. **CSS** (`SkillBadges.tsx`) — pour que le prochain libellé long n'ait pas le même sort : le conteneur de badge reçoit `min-w-0`, le texte du badge `break-words` (`overflow-wrap: anywhere`), et la carte de famille `overflow-hidden`. Un libellé trop long doit passer à la ligne à l'intérieur du badge, jamais sortir de la carte.

---

## Critères de validation

1. Firefox desktop, responsive **375 × 600 px**, site en `vite preview` : les 7 sections s'affichent après scroll, aucune zone vide. Répéter à 375 × 812.
2. Galaxy A04 / Firefox Android, URL déployée, `?perf=lite` puis `?perf=full` : Compétences visible, badge Cadre 4D dans sa carte, tap sur le badge → note avec les 4D. **[ARRÊT XAV]**
3. Rendu PC 1280 px pixel-identique hors ligne Cadre 4D (critère maître de la Phase 6b, toujours en vigueur).
4. `npm run test` / `lint` / `build` verts.

---

## Report dans les documents

- `specs/06_skills-timeline.md` §2 : ligne Cadre 4D → `name` court + `note` développée ; §4 Edge cases, ajouter : « Libellé de badge long : passe à la ligne dans le badge, ne sort jamais de la carte ; section plus haute qu'un écran : reveal par bloc, seuil ≤ 0,1. »
- `specs/00_ROADMAP.md` → v0.6.2 ; § Conventions, ajouter la règle de reveal du Bug 1 point 2.
- `dette_suivi.md` (Xav coche) : rien à ouvrir.
- `JOURNAL_DEV.md` : `2026-09-17 — Fix mobile : reveal `amount` 0.1 + `once`, reveal déplacé de la section aux blocs (Compétences invisible sur Firefox Android, viewport plus bas que la section) ; Cadre 4D → nom court + note ; `min-w-0`/`break-words` sur les badges. Cause racine : seuil de visibilité inatteignable sur un conteneur plus haut que l'écran — les tests responsive PC ne le voyaient pas car viewport plus haut. Test hauteur 600 px ajouté aux vérifications mobiles.`

---

## Prompt pour Claude Code

> Lis `specs/00_ROADMAP.md` puis `PATCHES_2026-09-17_fix-skills-mobile.md` et applique-le. Commence par retrouver la primitive de reveal et vérifie sa valeur `amount` actuelle : note-la dans le journal avant de la changer. Teste en responsive 375 × 600 px avant de dire que c'est corrigé — c'est ce test qui reproduit le bug, pas 375 × 812. Correctif Z : version 0.6.2, `npm run test/lint/build` verts, commit + push, puis arrête-toi à l'ARRÊT XAV (mesure sur le Galaxy A04).
