---
projet: portfolio-v2
episode/session: Phase 9c — thème clair/sombre (spec 12)
type: spec
version: 1.1.0
statut: relu
catégorie: Spec
date: 2026-09-22
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : Thème clair / sombre (Phase 9c)

**Version : 1.1.0** — réédition du 2026-09-22 après le rapport de Phase 0 de Claude Code (lecture seule, 22/09) et les réponses de Xav. Remplace la 1.0.0. Format : Module Standard. Ouvre une **exception explicite et bornée** à la règle « Design et animations : figés » (`specs/00_ROADMAP.md`) : le rendu **sombre** actuel reste la référence au pixel près ; on lui ajoute un rendu clair et un bouton de bascule. Toutes les décisions ci-dessous sont **tranchées par Xav** : ne pas les rouvrir, ne pas proposer d'alternative.

**Changements 1.0.0 → 1.1.0** : Phase 0 exécutée et ses constats intégrés (§3) ; D4 reformulée (référence prise fin de Phase 1) ; chemins réels du dépôt (`Navbar.tsx`, `src/lib/theme/`, `src/styles/tokens.css`) ; noms de tokens existants **conservés** ; valeurs claires figées (§4) ; `--border-glass` → DETTE-40 post-spec ; outillage d'audit à écrire (§5) ; version ROADMAP 0.10.0 ; prérequis d'arbre propre.

**Contexte déjà disponible pour Claude Code** : le rapport de Phase 0 (dans la conversation), `specs/00_ROADMAP.md`, `index.html` (script inline `data-perf`), `tailwind.config.ts` (variante `lite` = `addVariant("lite", 'html[data-perf="lite"] &')`), `src/styles/tokens.css` + `globals.css`, `src/lib/perf/liteMode.ts` + `useLiteMode.ts` (patron de dossier), `src/components/layout/Navbar.tsx`, `src/content/site.ts` + `legal.ts`, `scripts/audit-reduced-motion.js` (pilotage Chrome en CDP brut), `sharp` (déjà en dépendance), `dette_suivi.md` (dernière ligne DETTE-39).

## 1. Rôle du module

Rendre le site **lisible par n'importe qui**, y compris les personnes ayant des difficultés visuelles avec le texte clair sur fond sombre. Motivation réelle : une lectrice a dû abandonner la lecture à cause du blanc sur noir. Un portfolio qui prétend montrer ce que permettent les outils IA doit pouvoir être lu par tous.

Ce n'est **pas un deuxième site** : même structure, mêmes cartes, mêmes accents, mêmes animations. Un thème clair (fond blanc, texte noir) et un bouton de bascule dans le bandeau.

Comportement standard :
1. **Par défaut** : le thème suit `prefers-color-scheme`. Rien n'est stocké. Il réagit en direct si le réglage système change.
2. **Au clic** : le choix explicite est enregistré et **prime** sur le navigateur, y compris aux visites suivantes.
3. Le thème est appliqué **avant** le premier rendu React : aucun flash dans aucun sens. Point d'attention prioritaire de Xav.

## 2. Décisions tranchées

| # | Décision | Valeur |
|---|---|---|
| D1 | Bouton | **2 états** clair ↔ sombre, icône seule : `Sun` (Lucide) affiché en mode sombre, `Moon` en mode clair. Pas d'état « système ». |
| D2 | Position | Au milieu du bandeau, équidistant de « Xav » et de la nav (PC) / du burger (mobile). Implémentation retenue (§6-F du rapport) : `<div class="flex flex-1 justify-center">` inséré entre la marque et la nav dans le `justify-between` existant. Aucun code conditionnel par breakpoint. |
| D3 | Persistance | `localStorage` clé `theme`, valeurs `"light"` \| `"dark"`. Absence de clé = suivre `matchMedia("(prefers-color-scheme: dark)")` et écouter son `change`. |
| D4 | Référence pixel | **La référence est prise à la fin de la Phase 1** (bouton posé, tokens sombres = valeurs actuelles, aucun composant migré). Les Phases 2 et 3 doivent être à **0 px de différence en sombre** contre cette référence, PC et 375 px, avec et sans `?perf=lite`. Exclusions déjà documentées en Phase 6b : bruit du `HeroGlow` (~4 200 px entre deux captures identiques) et iframe haTD (cold-open autonome) — masquées ou tolérées comme en 6b, méthode notée dans le journal. La Phase 1 elle-même est vérifiée **à l'œil** (le bandeau change par construction). |
| D5 | Thème clair | Noir sur blanc réel : `--bg-deep` 255 255 255, `--text-primary` 11 15 25. WCAG AA (≥ 4,5:1 texte, ≥ 3:1 gros texte/icônes) pour tout token de **texte** ; contrôle automatisé (§5). |
| D6 | Accents | Teintes conservées. Trois nouveaux tokens « accent en rôle de texte/icône » (`--accent-*-fg`) valant exactement les `--neon-*` en sombre (D4 préservée) et une variante assombrie en clair (§4). Les halos d'ambiance (`globals.css`, `Hero.tsx`) restent **identiques** dans les deux thèmes : lisibilité vérifiée dans le rapport. |
| D7 | Effets en clair | Verre : noir 4 %, bordure noir 10 %. Glows `--glow-*` → ombre douce neutre `0 6px 20px rgba(11,15,25,.10)`. Grain `body::after` → opacité **0** en clair (blanc pur, D5). `::selection` → texte blanc sur `--accent-violet-fg`. `:focus-visible` → `--accent-blue-fg`. `<noscript>` → deux règles `@media (prefers-color-scheme)` dans son `<style>`, sombre = valeurs actuelles, clair = D5 (pas de JS = pas de choix stocké, le navigateur décide). |
| D8 | Transition | **Aucune** transition CSS de couleur au basculement. Seule l'icône peut s'animer (Framer Motion), désactivée sous `useReducedMotionSafe()` et en `lite`. |
| D9 | Mode allégé | Orthogonal au thème. **Piège d'ordre CSS** (rapport §6-E) : `:root[data-theme="dark"]` et `html[data-perf="lite"]` ont la même spécificité → le bloc `lite` doit être écrit **après** les blocs de thème dans `tokens.css`, sinon le mode allégé cesse de neutraliser les glows en sombre (régression silencieuse de la Phase 6b). Test explicite en Phase 3. |
| D10 | Non touchés | haTD (le cadre suit le thème, pas le jeu), `scripts/cv/CvDocument.tsx`, `scripts/build-og.js` (palettes propres, sans lien avec les tokens — vérifié en Phase 0), `faq.ts`, textes éditoriaux, `Hero.tsx` E2 et `motion.ts` E3 (sans impact). |
| D11 | Mentions légales | `legal.ts` §4 : le site utilise en plus `localStorage` pour un seul réglage technique persistant (`theme`), exempt de consentement (art. 82). `site.legal.lastUpdated` → date de la phase. |
| D12 | Flux git | Claude Code **ne commit pas et ne pousse pas**. Il propose en fin de phase une séquence de commits structurés (un par phase, messages prêts). Xav commit en local, vérifie sur PC, pousse sur `main`, vérifie sur Galaxy A04. |
| D13 | Noms de tokens | Les noms existants (`--bg-deep`, `--text-primary`, `--text-muted`, `--bg-panel`, `--border-glass`, `--neon-*`, `--glow-*`) sont **conservés**. Seuls les tokens du §4 sont ajoutés. Aucun renommage. |
| D14 | `--border-glass` | 1,25:1 en clair, symétrique du sombre (1,28:1) : manquement WCAG 1.4.11 **préexistant** sur les champs du formulaire (`ContactForm.tsx:53`). **Ne pas corriger dans cette phase** → ouvrir **DETTE-40**, à traiter dans la série de patchs correctifs post-spec, après relecture de Xav. |
| D15 | ROADMAP | Version `0.9.4` → **`0.10.0`** (nouvelle phase complète = Y). Ligne « prochaine phase : 10 (version anglaise, spec 11) » ajustée : Phase 9c s'intercale, Phase 10 anglais reste la suivante. |
| D16 | Outillage contraste | **`axe-core` ajouté en `devDependency`**, injecté dans la page via CDP (`Runtime.evaluate` / `Page.addScriptToEvaluateOnNewDocument`), pas de Puppeteer. Justification : les chips à fond translucide (`bg-neon-blue/15` etc.) exigent le calcul sur les couleurs **composées** réellement rendues ; un calcul maison le raterait ou le réinventerait. Aucun impact sur le bundle. |

## 3. Constats de Phase 0 (exécutée le 22/09, lecture seule) — état de départ

- `main` synchro avec `origin/main` (4a51b1b), plus de `master`, aucun fichier CNIL, `.gitignore` correct.
- `npm run test` 91/91, `lint` 0/0, `build` OK — avant travaux.
- Tailwind **3.4.19**, aucune stratégie dark existante, aucun `color-scheme`, aucun `theme-color`.
- Design system **déjà entièrement tokenisé** (`src/styles/tokens.css`) : 0 hex, 0 classe palette, 0 `text-white` hors tokens ; SVG/Recharts en `rgb(var(--…))`. 5 exceptions seulement (E1 scrim de `Modal.tsx`, E2 halo `Hero.tsx`, E3 `motion.ts` neutre, E4 halos `globals.css`, E5 `<noscript>`).
- Conséquence : la Phase 2 n'est **pas une migration de valeurs en dur** mais un découpage des accents en deux rôles (décor / texte) sur 13 fichiers, plus le scrim et le bouton plein.
- Le diff pixel de la Phase 6b était une méthode manuelle (`git stash -u` + `sharp`), jamais committée ; ni Puppeteer ni axe-core dans le projet.

**Prérequis avant Phase 1 — arbre de travail** (à faire par Xav, fait/à confirmer au lancement) : committer l'entrée `JOURNAL_DEV.md` « ARRÊT XAV levé : mesure Galaxy A04 validée », le rangement `specs/archives/` (= anciens tickets `PATCHES_*` ; `specs/` = specs numérotées, dont `12_theme-clair-sombre.md`), et la suppression des doublons `PATCHES_*` restés à la racine de `specs/`. Claude Code vérifie `git status` propre avant de toucher au code ; sinon il s'arrête et le signale.

## 4. Table des tokens (validée par Xav le 22/09 — recopier, ne pas recalculer)

Format `tokens.css` : `:root` = **clair**, `:root[data-theme="dark"]` = **sombre** (valeurs actuelles, strictement), puis le bloc `html[data-perf="lite"]` en dernier (D9). Câblage `tailwind.config.ts` v3 : `theme.extend.colors` avec `rgb(var(--x) / <alpha-value>)`, comme l'existant.

### Existants (valeur sombre = actuelle, inchangée)

| Token | Sombre | Clair | Ratio clair |
|---|---|---|---|
| `--bg-deep` | 11 15 25 | 255 255 255 | — |
| `--text-primary` | 229 231 235 | 11 15 25 | 19,15 |
| `--text-muted` | 156 163 175 | 75 85 99 (#4b5563) | 7,56 |
| `--bg-panel` | rgba(255,255,255,.04) | rgba(0,0,0,.04) | décor |
| `--border-glass` | rgba(255,255,255,.10) | rgba(0,0,0,.10) | décor — D14 |
| `--neon-blue` / `--neon-violet` / `--neon-emerald` | 59 130 246 / 139 92 246 / 16 185 129 | **inchangés** (décor) | — |
| `--glow-blue` / `--glow-violet` / `--glow-emerald` | `0 0 40px rgba(accent,.35)` | `0 6px 20px rgba(11,15,25,.10)` | — |
| grain `body::after` | opacité .035 | opacité 0 | — |

### Nouveaux (sombre = valeur des `--neon-*` actuels, D4)

| Token | Sombre | Clair | Ratio clair / blanc | Pire cas (chip /25) |
|---|---|---|---|---|
| `--accent-blue-fg` | 59 130 246 | 29 78 216 (#1d4ed8) | 6,70 | 5,01 |
| `--accent-violet-fg` | 139 92 246 | 109 40 217 (#6d28d9) | 7,10 | 5,17 |
| `--accent-emerald-fg` | 16 185 129 | 6 95 70 (#065f46) | 7,68 | 6,08 |
| `--accent-solid` | 59 130 246 | 29 78 216 | — | bouton plein |
| `--on-accent` | 11 15 25 | 255 255 255 | 6,70 | — |
| `--scrim` | rgba(0,0,0,.60) (lite : .90) | identique | — | E1 |

Les `-600` Tailwind ont été écartés : ils cassent AA sur les chips translucides (`AgentPanel.tsx:205`, `VerdictLine.tsx:37-38`, `EvidenceBadge.tsx:9-10`). Ne pas y revenir.

## 5. Entrées / Sorties

### `index.html`
Script inline avant tout `<script type="module">`, patron `data-perf` : `localStorage.theme` si `"light"`/`"dark"` → sinon `matchMedia`. Résultat sur `document.documentElement.dataset.theme` + `style.colorScheme`. `try/catch` autour de `localStorage`. Deux `<meta name="theme-color">` avec `media="(prefers-color-scheme: …)"` **et** mise à jour dynamique à chaque bascule. `<noscript>` selon D7.

### `src/lib/theme/theme.ts` + `theme.test.ts` + `useTheme.ts`
```ts
export type Theme = "light" | "dark";
export function readStoredTheme(storage: Pick<Storage,"getItem"> | null): Theme | null;
export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme;   // pur
export function applyTheme(t: Theme): void;   // dataset + color-scheme + meta theme-color
export function useTheme(): { theme: Theme; toggle: () => void };
```
Tests Vitest **écrits en premier** : stocké valide, stocké invalide, absent + sombre, absent + clair, `getItem` qui lève, `null` storage.

### `src/components/layout/ThemeToggle.tsx` — dans `Navbar.tsx` (D2)
`<button type="button">`, icône seule, `aria-label` depuis `site.ts` (T8), pas d'`aria-pressed`. Cible ≥ 44 × 44 px. Focus visible identique aux autres contrôles du bandeau.

### `src/content/site.ts` / `src/content/legal.ts`
`site.ui.theme = { toLight: "Passer en thème clair", toDark: "Passer en thème sombre" }` (emplacement selon la structure réelle). `legal.ts` §4 selon D11.

### Scripts d'audit (nouveaux, Phase 1, `scripts/`)
- `audit-theme-diff.js` : CDP brut (patron `audit-reduced-motion.js`), captures des points de contrôle (§7), diff `sharp` contre `audit/ref-phase1/` ; masques HeroGlow / iframe haTD comme en 6b ; sortie = nombre de pixels différents par capture, échec si > seuil documenté.
- `audit-contrast.js` : injection d'`axe-core` (devDependency, D16), règle `color-contrast` seule, sur chaque point de contrôle en clair ; sortie = 0 violation attendu, liste sinon.
Les captures de référence ne sont **pas** committées (à ajouter à `.gitignore`).

## 6. Phases d'exécution

### Phase 0 — **faite** (rapport du 22/09, validé par Xav). Ne pas refaire.

### Phase 1 — Mécanique
Prérequis : `git status` propre (§3). Puis : `index.html`, `tokens.css` (deux blocs de thème, bloc `lite` déplacé en dernier si nécessaire, nouveaux tokens), `globals.css` (grain, `::selection`, `:focus-visible`), `tailwind.config.ts`, `src/lib/theme/*` + tests, `ThemeToggle` dans `Navbar.tsx`, `site.ts`, `package.json` (axe-core), les deux scripts d'audit. **Aucun composant migré.** Vérifier à l'œil : bouton en D2 à 375 et 1280 px, clavier, label, absence de flash en `light` forcé / `dark` forcé / sans clé, `theme-color` qui suit. Puis **prendre la référence D4** (`audit-theme-diff.js --ref`) dans les 4 combinaisons thème sombre × lite × largeur. Arrêt court : compte-rendu, pas d'ARRÊT XAV sauf problème.

### Phase 2 — Découpage des accents
Dans l'ordre : les 13 fichiers `text-neon-*` → `text-accent-*-fg` (AgentPanel, ContactForm, Footer, VerdictLine, ProjectCard, ProjectModal, EvidenceBadge, ProblemGrid, RoiCounters, SkillRadar, CvDownloadLink, Contact, Play), `Modal.tsx` (E1 → `--scrim`), `NeonButton.tsx` (`--accent-solid` / `--on-accent`), puis `legal.ts` (D11). Après **chaque** fichier : `audit-theme-diff.js` → 0 px en sombre. Une régression bloque avant le fichier suivant. Règle de tri : un accent est « texte » s'il porte du texte ou une icône porteuse de sens ; il reste `--neon-*` s'il est bordure lumineuse, dégradé, halo, glow.

### Phase 3 — Vérifications et clôture
1. Matrice 2 thèmes × 2 modes × 2 largeurs (375 / 1280) sur les points de contrôle (§7).
2. Sombre : `audit-theme-diff.js` 0 px, 4 combinaisons (D4).
3. Clair : `audit-contrast.js` 0 violation.
4. Test D9 explicite : en sombre + `lite`, aucun `box-shadow` de glow et `--ambient-opacity: 0` (comparer à la Phase 6b).
5. Défaut : `Emulation.setEmulatedMedia` `prefers-color-scheme: light` sans clé → clair ; `dark` → sombre ; clé stockée → prime ; changement de média à chaud → suit.
6. `reduced-motion` : icône sans animation.
7. `npm run test` / `lint` / `build` / `cv` verts ; PDF et OG inchangés (diff git vide sur `scripts/cv/`, `scripts/build-og.js`, `public/og.png`).
8. `JOURNAL_DEV.md` (section Phase 9c : cause racine, ce qui a cassé, vérifié à l'écran, méthode de masque D4), `dette_suivi.md` (DETTE-40 `--border-glass` post-spec ; suivantes numérotées à la suite), `specs/00_ROADMAP.md` (Phase 9c, exception D4, `0.10.0`, ligne « prochaine phase » ajustée — D15).
9. Séquence de commits proposée (D12). Rien de committé.

**[ARRÊT XAV]** : vérification en local sur PC (deux thèmes, bascule, rechargement, `lite`), push `main`, Galaxy A04, relecture de la version claire par sa mère. Critère de clôture : lecture possible sans gêne.

## 7. Points de contrôle des audits

Les 7 sections, `#mentions-legales`, `#faq` (modale ouverte), une modale projet ouverte, formulaire de contact avec un champ en focus, agent de poche avec une réponse affichée (chips actives). Même liste pour le diff sombre et pour le contraste clair.

## 8. Critères d'acceptation

- [ ] Sombre : 0 px contre la référence de fin de Phase 1, 4 combinaisons, hors masques documentés.
- [ ] Clair : `--bg-deep` blanc, `--text-primary` 11 15 25, 0 violation `color-contrast` axe-core sur tous les points de contrôle.
- [ ] Sans clé stockée : suit le navigateur et change à chaud.
- [ ] Après clic : survit au rechargement et à la fermeture ; `localStorage` indisponible → site fonctionnel, thème navigateur.
- [ ] Aucun flash au chargement, dans les deux sens (throttling réseau lent).
- [ ] Bouton centré entre « Xav » et nav/burger à 375 et 1280 px, ≥ 44 px, clavier, label parlant, `Sun` en sombre / `Moon` en clair.
- [ ] `theme-color` suit le thème effectif.
- [ ] `lite` en sombre strictement inchangé (D9) ; `lite` en clair fonctionnel.
- [ ] `legal.ts` §4 et `lastUpdated` à jour.
- [ ] PDF, OG, `faq.ts`, textes éditoriaux, `Hero.tsx` E2 : diff git vide.
- [ ] DETTE-40 ouverte ; journal, dette, ROADMAP 0.10.0 à jour ; rien de committé.

## 9. Hors-scope (ne pas toucher, ne pas proposer)

Correction de `--border-glass` (DETTE-40, patch post-spec). Contenu : haTD → RPG-v2, Agent de poche v2, bibliothèque automatique, aperçu Sting_1AM, compétences depuis la dernière mise à jour, produits commercialisables. Traduction anglaise (spec 11, chantier à part). Troisième état « système ». Transitions de couleur. Renommage des tokens. Refonte de palette. Puppeteer.
