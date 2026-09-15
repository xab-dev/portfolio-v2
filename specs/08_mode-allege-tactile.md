# Portfolio v2 — SPEC : Mode allégé tactile (Phase 6b)

**Créé le 2026-09-15** à partir du retour terrain de Xav (Galaxy A04, Firefox Android : défilement saccadé de façon uniforme sur tout le site, fonctionnalités intactes ; PC irréprochable). Format : Module Standard. Ouvre **DETTE-30**.

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T3, T4), `src/styles/tokens.css`, `tailwind.config.ts`, `globals.css`, `GlassCard`, `SectionShell`, header sticky (`backdrop-blur-xl`), frise (`useScroll` → `scaleY`, Phase 5), hook `useCoarsePointer` (Phase 6), hook `useReducedMotionSafe` (Phase 0).

## 1. Rôle du module

Rendre le défilement fluide sur les appareils tactiles d'entrée de gamme **sans modifier le rendu PC d'un seul pixel**. Le mobile reçoit une variante "allégée" du design Premium Tech : mêmes couleurs, même composition, mêmes contenus, mais sans les effets dont le coût par image dépasse le budget GPU d'un téléphone modeste.

Contrainte fondatrice, non négociable : **tout ce qui change est gardé par `(pointer: coarse)`**. Un pointeur fin (souris, pavé tactile) ne voit jamais ces règles. Le PC est protégé par construction, pas par vigilance.

## 2. Entrées / Sorties

### Détection (`src/lib/perf/liteMode.ts`)
- Source de vérité : `matchMedia('(pointer: coarse)')` — **pointeur principal** uniquement (pas `any-pointer`), pour qu'un portable tactile avec souris reste en mode complet.
- Un attribut `data-perf="lite" | "full"` est posé sur `<html>` **avant le premier rendu** (script inline minimal dans `index.html`, quelques lignes, pas de dépendance), pour éviter un flash "complet → allégé" au chargement.
- **Surcharge de test** : `?perf=lite` ou `?perf=full` dans l'URL force l'attribut et le mémorise dans `sessionStorage['perf']` le temps de la session. Sert à vérifier le mode allégé depuis un PC et le mode complet depuis un téléphone. Aucun réglage exposé à l'utilisateur en V1.
- `data-perf` est indépendant de `prefers-reduced-motion` : les deux peuvent se cumuler. Reduced-motion continue de couper les animations ; le mode allégé coupe les *effets de rendu* (flou, glows), qui ne sont pas des animations.

### Variante Tailwind (`tailwind.config.ts`)
- Nouvelle variante `lite:` = `html[data-perf="lite"] &`. Utilisée uniquement pour les surcharges d'allègement. Aucune classe `lite:` ne doit avoir d'effet quand `data-perf="full"`.

### Tokens (`src/styles/tokens.css`)
Sous `html[data-perf="lite"]`, redéfinir des tokens déjà consommés par les composants, sans ajouter de logique dans ces composants quand c'est possible :
```css
html[data-perf="lite"] {
  --glass-blur: 0px;            /* était 16–24px selon la primitive */
  --glass-alpha: 0.92;          /* fond de carte plus dense pour compenser l'absence de flou */
  --glow-shadow: none;          /* box-shadow flou des cartes/boutons */
  --ambient-opacity: 0;         /* halos / dégradés radiaux d'ambiance */
}
```
Si certaines valeurs sont aujourd'hui en dur dans les classes Tailwind (`backdrop-blur-xl`, `shadow-[...]`), les migrer vers un token **ou** doubler la classe d'une surcharge `lite:` — au choix de l'agent, mais **un seul mécanisme par effet**, documenté dans le journal.

## 3. Comportement attendu

### En mode `lite` (pointeur coarse)
1. **Verre dépoli → fond dense.** `backdrop-filter` désactivé sur le header sticky, le panneau de menu mobile, les `GlassCard`, la `Modal` et l'overlay teaser. Fond `bg-deep` à alpha ≥ 0.9 pour conserver la lisibilité sur le contenu qui défile dessous. La bordure translucide et le reflet supérieur des cartes sont **conservés** (ils sont gratuits).
2. **Glows → bordures accentuées.** Les `box-shadow` à grand rayon de flou (cartes, `NeonButton`, médaillon avatar) passent à `none`. L'accent de couleur est reporté sur la bordure (`border-neon-*/40`) pour que la hiérarchie visuelle reste lisible. Les glows au survol n'ont de toute façon pas de sens au tactile.
3. **Ambiance → statique ou absente.** Les halos radiaux du fond de page et du Hero : opacité 0, ou remplacés par un dégradé linéaire statique unique sur `body` si le fond nu paraît trop plat (décision visuelle de l'agent, à documenter avec capture).
4. **Frise (Phase 5)** : la ligne dégradée se dessine via une transition CSS `scaleY` déclenchée une fois par `IntersectionObserver` à l'entrée de la section, au lieu d'un `useScroll` évalué à chaque événement de scroll. L'effet visuel reste "la ligne se trace", il n'est simplement plus asservi au scroll pixel par pixel.
5. **`SectionShell` (entrée au scroll)** : conservée — c'est une animation `transform/opacity` unique par section, peu coûteuse. Si la mesure (§7) montre qu'elle contribue, la basculer sur un simple fondu en `lite`.
6. **Recharts (radar)** : les animations d'entrée du radar coupées en `lite` (`isAnimationActive={false}`) — SVG animé + repaint des cartes environnantes est une combinaison coûteuse sur Mali-G52.
7. **Tilt 3D des `GlassCard`** : déjà désactivé au tactile depuis la Phase 0, ne rien changer.

### En mode `full` (pointeur fin)
Strictement rien ne change. Voir critère §7.1.

## 4. Edge cases à gérer
- `matchMedia` indisponible (navigateur exotique) → `full` par défaut (le comportement actuel).
- Tablette avec clavier/souris branchés : pointeur principal fin → `full`. Acceptable en V1.
- Changement de pointeur en cours de session (souris branchée sur Android) : `useCoarsePointer` est déjà réactif ; le script inline ne l'est pas. Décision : **ne pas suivre le changement à chaud**, `data-perf` est fixé au chargement. Documenter.
- `?perf=` avec valeur inconnue → ignorée, détection normale.
- `prefers-reduced-motion` + `lite` : les deux s'appliquent, aucune règle ne doit en contredire une autre (vérifier que `lite` ne *réactive* rien que reduced-motion coupe).
- Mode sombre uniquement (le site n'a pas de thème clair) : les alphas de compensation sont calibrés pour `#0B0F19`.

## 5. Structure des fichiers
```
index.html                              (script inline : pose data-perf avant le premier rendu)
src/lib/perf/liteMode.ts                (résolution du mode : override URL/session → matchMedia → défaut ; fonction pure testée)
src/lib/perf/liteMode.test.ts           (4 cas : override lite, override full, coarse, fine/absent)
src/lib/perf/useLiteMode.ts             (hook lecture de data-perf pour les rares composants qui en ont besoin en JS : Timeline, Skills)
src/styles/tokens.css                   (bloc html[data-perf="lite"])
tailwind.config.ts                      (variante lite:)
src/components/ui/GlassCard.tsx         (tokens au lieu de valeurs en dur si nécessaire)
src/components/ui/NeonButton.tsx        (idem)
src/components/layout/Header.tsx        (backdrop-blur via token / lite:)
src/sections/Timeline.tsx               (chemin CSS-only en lite)
src/sections/Skills.tsx                 (isAnimationActive selon le mode)
```
Aucun nouveau fichier de contenu : ce module ne touche pas `src/content/`.

## 6. Consignes d'autonomie pour Claude Code
- **Cause racine avant patch** : avant d'écrire une ligne, lister les règles CSS du build actuel qui déclenchent `backdrop-filter`, `filter`, `box-shadow` à rayon > 20 px, `mix-blend-mode`, et les animations de gradient. C'est l'inventaire à allégir ; le joindre au journal.
- Ne pas "optimiser" le mode complet au passage, même si une amélioration semble évidente : hors scope, à noter dans `JOURNAL_DEV.md` pour la Phase 7.
- Ne pas introduire de détection par `userAgent`, `deviceMemory` ou `hardwareConcurrency` : `pointer: coarse` est le seul critère V1 (Firefox n'expose pas `deviceMemory`, et un critère hybride rend le comportement imprévisible).
- Ne pas ajouter de réglage utilisateur ("activer les effets") en V1 — si Xav le veut, ce sera un micro-ticket ultérieur.
- Une seule stratégie par effet (token **ou** variante `lite:`), pas les deux pour le même effet.

## 7. Critères de validation
1. **PC pixel-identique.** Captures `vite preview` à 1280×900 des 7 sections **avant et après** la phase, comparées (diff d'image, `pixelmatch` ou équivalent) : **0 pixel de différence** hors zones d'animation en cours. C'est le critère maître ; s'il échoue, la phase échoue.
2. **Mode allégé vérifiable depuis un PC** via `?perf=lite` : à 1280 px et 375 px, aucun `backdrop-filter` ni `box-shadow` à grand rayon dans les styles calculés du header, d'une `GlassCard`, d'un `NeonButton` (vérification par `getComputedStyle`, pas seulement visuelle).
3. **Lisibilité conservée** en `lite` : le texte du header sticky reste lisible au-dessus de chaque section pendant le défilement (captures à 375 px sur 3 positions de scroll).
4. **Tests** : `liteMode.test.ts` vert (4 cas) ; suite existante toujours verte ; `lint`/`build` verts.
5. **Lighthouse mobile** sur le déploiement : Performance ≥ score de la Phase 6 (le mode allégé ne peut que l'améliorer ou le laisser inchangé).
6. **[ARRÊT XAV] — mesure terrain.** Sur le Galaxy A04 / Firefox, `?perf=lite` puis `?perf=full` sur le site déployé : le défilement doit être **nettement** plus fluide en `lite`. Si le gain est faible, le diagnostic était incomplet — ne pas empiler d'autres allègements à l'aveugle, revenir au journal avec l'inventaire §6 et une mesure (profil de performance Firefox via `about:debugging` en USB, si Xav veut aller jusque-là).

## 8. Hors scope
Optimisation du mode complet (Phase 7). Réglage utilisateur pour forcer un mode. Détection de la puissance de l'appareil. Version tactile de haTD. Tout changement de contenu.

---

## Patches à reporter

### `00_ROADMAP.md`
- Statut : `Phases 0, 4, 5, 1, 6 livrées ; phase courante : 6b (spec 08, mode allégé tactile), puis 2.`
- Esquisse des phases : insérer après la Phase 6 : `- **Phase 6b — Mode allégé tactile** (\`08_mode-allege-tactile.md\`) : effets de rendu (flou, glows) coupés sous \`pointer: coarse\`, PC pixel-identique. Ouverte suite au test terrain sur Galaxy A04 / Firefox Android.`
- Ordre conseillé : `0 → 4 → 5 → 1 → 6 → 6b → 2 → 3 → 7`.

### `dette_suivi.md` §C
- Nouvelle ligne : `☐ **[DETTE-30]** Défilement saccadé de façon uniforme sur tactile d'entrée de gamme (Galaxy A04, Firefox Android, 2026-09-15) ; fonctionnalités intactes, PC fluide. Cause probable : coût par image de \`backdrop-filter\` + glows sur GPU Mali-G52, aggravé par le chemin de rendu de Firefox Android. | Phase 6b`
- Cocher : `Poids de l'iframe haTD non mesuré` → ☑ (375 Ko, page autonome, mesuré en DETTE-29).

### Prompt de lancement (à coller dans Claude Code)
> Lis `specs/00_ROADMAP.md` en entier puis `specs/08_mode-allege-tactile.md` et exécute la Phase 6b. Commence par l'inventaire des règles coûteuses (§6) et joins-le au journal avant tout changement. Le critère maître est §7.1 : le rendu PC à 1280 px doit être pixel-identique avant/après — produis les captures et le diff. Vérifie le mode allégé via `?perf=lite` à 375 px et 1280 px (§7.2, `getComputedStyle`). Arrête-toi à l'ARRÊT XAV §7.6 (mesure sur le Galaxy A04) et fais-moi un compte-rendu selon le format de fin de session.
