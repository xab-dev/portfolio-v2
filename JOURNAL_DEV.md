# Journal de développement — Portfolio v2

Journal tenu par l'agent (Claude Code). Une entrée par session, la plus récente en haut.

---

## 2026-09-15 (suite) — Phase 5 : Skills Matrix & Timeline

### Décisions prises et pourquoi

- **Recharts chargé dans un chunk séparé (`React.lazy` + `Suspense`)**, pas dans le bundle initial : l'installer directement aurait fait passer le JS principal de 328 Ko à 692 Ko (106 Ko → 213 Ko gzip), menaçant le budget Lighthouse Performance ≥90 acquis en Phase 0 (DETTE-26). Après découpage, le bundle initial reste à 360 Ko (116 Ko gzip) et Recharts (332 Ko / 96 Ko gzip) ne se charge que quand la section Compétences est atteinte. Même logique que le chunk `motionFeatures` de la Phase 0.
- **DETTE-16 (niveau biostatistique)** : représenté avec la valeur neutre la plus basse de l'échelle (1 = notions) plutôt qu'omis ou inventé à un niveau plus flatteur — cohérent avec la consigne "ne jamais gonfler un niveau". Marqueur `[DETTE-16]` dans la note du skill, à confirmer par Xav (voir ARRÊT XAV ci-dessous). Cette valeur provisoire compte dans la moyenne de la famille "Données" ; sans elle, cette famille n'aurait aucun axe radar.
- **Radar hover/tap synchronisé** (`activeFamily` levé dans `Skills.tsx`) : survoler un badge illumine sa famille sur les deux composants (axe du radar en gras + carte de famille en glow), et inversement depuis un axe du radar — un seul état partagé, pas de duplication de logique.

### Bug trouvé et corrigé en cours de session (cause racine, pas de contournement)

**Ligne de la frise invisible malgré un calcul de progression correct.** Première implémentation : un `<path>` SVG avec `pathLength` (motion value liée au scroll) passé via `style={{ pathLength }}`. Diagnostic : Framer Motion attend `pathLength` comme **prop directe** du composant (il l'utilise alors pour poser l'attribut SVG `pathLength="1"` et convertir `stroke-dasharray`/`stroke-dashoffset` en fractions 0-1) ; passé dans `style`, cet attribut n'est jamais posé, donc les valeurs de dasharray calculées ("0.56px, 1px") restaient interprétées en unités utilisateur du path (~100 unités de long), produisant un pointillé microscopique invisible. Corrigé une première fois en passant `pathLength` en prop directe — le calcul de progression était alors correct (vérifié via `getComputedStyle`) mais le trait restait invisible à l'écran : cause racine n°2, la combinaison `vector-effect="non-scaling-stroke"` + `preserveAspectRatio="none"` sur un `viewBox` étiré de façon non uniforme (facteur ×4 en largeur, ×10,5 en hauteur) — un cas connu de rendu défaillant sous Chromium. Solution finale : abandon de la technique SVG `pathLength`, remplacée par un simple `<div>` avec dégradé CSS (`bg-gradient-to-b`) et un `scaleY` (motion value, `transform-origin: top`) — plus robuste, aucune dépendance à un comportement SVG non uniforme. Vérifié visuellement après correction : le trait se dessine bien du premier jalon vers le bas au fil du scroll.

### Vérification visuelle réelle (Claude in Chrome, `vite preview`)

- Desktop (~1264 px) : radar à 6 axes lisibles, survol d'un badge ("Cadre 4D...") illumine bien l'axe "Méthode IA" (texte bleu gras) et la carte de la famille (glow) simultanément — synchronisation bidirectionnelle confirmée.
- Mobile (~504 px, plancher de redimensionnement de l'outil de navigation — 375 px non atteignable avec les outils disponibles cette session) : radar empilé au-dessus des badges, badges qui passent à la ligne proprement, frise en colonne unique avec la ligne à gauche.
- Frise : la ligne dégradée bleu→violet se dessine progressivement au scroll (vérifié par `getComputedStyle` — `scaleY` passe de 0 à ~0,9 en descendant la page) et s'arrête juste avant le dernier jalon, cohérent avec le réglage `offset: ["start 0.75", "end 0.35"]`.
- Aucune erreur console sur l'ensemble de la session de vérification.
- `npm run build`, `npm run lint` (oxlint) et `npm run test` (Vitest, 20 tests dont 8 nouveaux pour `skills.ts`/`timeline.ts`) verts.
- Non vérifié dans cette session : `prefers-reduced-motion` sur cette nouvelle section (pas d'outil d'émulation de media feature disponible dans la session ; le hook `useReducedMotionSafe` réutilisé est le même que celui déjà vérifié en Phase 0/4).

### Hors scope pour cette itération (et où c'est prévu)

- Retrait de la section `#kitchen-sink` → prévu au plus tard fin de Phase 6 (inchangé depuis la Phase 0).
- `prefers-reduced-motion` sur la frise, à revérifier explicitement en Phase 7 (polish) avec un outil d'émulation.

### [ARRÊT XAV] — critère §7.4 de la spec 06

Avant de clore officiellement la Phase 5, deux points nécessitent ta validation :
1. **Niveaux de compétences** (DETTE-15) : `src/content/skills.ts` reflète l'auto-évaluation de la dictée initiale, à valider ou ajuster.
2. **Niveau biostatistique** (DETTE-16) : actuellement fixé à 1 ("notions", valeur neutre non gonflée) à titre provisoire — confirme ce niveau ou indique la valeur réelle.

Rien n'a été committé à ce stade ; en attente de ton retour avant de marquer la Phase 5 close.

---

## 2026-09-15 (suite) — Phase 4 : Portfolio dynamique (Mes Projets)

### Décisions prises et pourquoi

- **Pipeline d'images restructuré** : les originaux (`raw/`) ont été déplacés hors de `public/` vers `images-src/` (nouveau, gitignoré). Cause racine d'un problème trouvé en vérifiant `dist/` : Vite copie **tout** `public/` tel quel dans le build, donc des `raw/*.png` sous `public/images/...` auraient été déployés en clair sur le site, à l'opposé de l'objectif "≤ 200 Ko par image" de la DETTE-14. `npm run images` (script `scripts/process-images.js`, `sharp`) lit maintenant `images-src/projects/<id>/raw/*` et écrit `public/images/projects/<id>/<id>-NN.webp` (1600px max, qualité dégressive jusqu'à ≤ 200 Ko). Dossier `régie-maison` renommé `regie-maison` (id sans accent, cohérent avec les chemins `/images/projects/<id>/`).
- **`LazyMotion` : `domAnimation` → `domMax`** : la grille de projets a besoin de `layout` + `AnimatePresence mode="popLayout"` pour le réordonnancement animé au filtrage — non supporté par `domAnimation` (le bundle le plus léger, retenu en Phase 0). Chunk asynchrone `motionFeatures` passé de 10 Ko à 24 Ko gzip ; toujours différé, ne bloque pas le rendu initial.
- **Filtre multi-tags en OR** (un projet apparaît dès qu'il correspond à au moins un tag actif) plutôt qu'en AND : cohérent avec des tags de catégorisation (pas des facettes orthogonales), et garantit qu'accumuler des filtres élargit plutôt que d'aboutir à un résultat vide.
- **Blocs empilés plutôt qu'à onglets** dans la modale projet (Problème/Architecture/Métriques/Limites) : la spec offrait le choix ; empilé garantit trivialement que "Limites" reste toujours visible sans dépliage, une exigence explicite de la spec.
- **Vitest ajouté** (`npm run test`) : la spec exige `projects.test.ts` comme livrable et critère de passage #1 ; c'est le premier test unitaire du projet.

### Bug trouvé et corrigé (cause racine)

**Modale illisible sur mobile pour un contenu long.** `Modal.tsx` centrait le dialogue avec `flex items-center` dans un conteneur `fixed inset-0` sans `overflow-y`. Un contenu plus haut que le viewport (le cas de chaque fiche projet) débordait *au-dessus et en dessous* de l'écran sans aucun moyen d'y accéder — bouton fermer et pied de page invisibles et inatteignables au scroll (vérifié : capture identique avant/après une tentative de scroll). Corrigé en séparant le conteneur scrollable (`overflow-y-auto`) du conteneur de centrage (`flex min-h-full`) : le dialogue reste centré quand il tient à l'écran, et devient scrollable dès qu'il dépasse. Correction faite dans la primitive `Modal` (Phase 0) — bénéficie à toutes les modales futures, pas seulement au Portfolio.

### Livré et validé à l'écran

Vérifié via Puppeteer (375 px et 1280 px) contre `vite preview` :
- Grille 1/2/3 colonnes, 6 projets, filtres multi-sélection (`Tous` par défaut, compteur "N projets" à jour), réordonnancement animé au filtrage (`layout`).
- Filtre "Jeu" → 1 projet (haTD) ; chaque tag a bien ≥ 1 projet (garanti par `projects.test.ts`, 8 tests verts).
- Carte → modale au clic *et* au clavier (Tab + Entrée), focus déplacé dans la modale puis restauré sur la carte à la fermeture (Échap).
- Deep link `#projets/miniciel` ouvre la bonne modale au chargement ; hash invalide (`#projets/nawak`) ignoré silencieusement (pas de modale, pas d'erreur) ; fermeture ramène le hash à `#projets`.
- Galerie horizontale (haTD : 2 images, miniCiel et Régie Maison : 1 chacun), clic → agrandissement dans la même modale, `loading="lazy"`. Templates/Séquence terrain/1AM sans image : carte et modale valides quand même.
- Métriques non vérifiées affichées avec le suffixe "(auto-déclaré)" ; projets sans métrique ("Séquence terrain", "Régie Maison", "1AM") affichent le message de repli.
- `npm run build`, `npm run lint`, `npm run test` verts. Aucune erreur console, aucun débordement horizontal à 375 px.

### Hors scope pour cette itération

Études de cas longues, témoignages clients (hors scope explicite de la spec). Captures d'écran pour templates/terrain/1am (pas encore fournies par Xav — cartes valides sans image en attendant).

### [ARRÊT XAV] — non levé par l'agent

Critère de passage §7.5 de la spec 05 : **relecture des 6 fiches par Xav avant de clore la phase.** Le contenu (`src/content/projects.ts`) est rédigé à partir des sources fournies (`Fiche_Professionnelle_Xav.md`, `Positionnement...md` §6-8, `Sequence_Intervention_Terrain.md`) sans invention de métrique, mais reste à valider par Xav pour exactitude avant de considérer la Phase 4 officiellement close. Tout le reste du critère de passage (tests, filtres, clavier, deep link, tilt/reduced-motion) est vérifié et vert.

### Dette ajoutée / mise à jour

- DETTE-10 (enrichir les fiches projet) : substantiellement traitée dans cette phase (6 fiches rédigées à partir des sources réelles) — reste ouverte jusqu'à la relecture Xav ci-dessus.
- DETTE-14 (captures d'écran) : pipeline construit et fonctionnel (`npm run images`). Images fournies pour haTD (2), miniCiel (1), Régie Maison (1). Toujours en attente pour templates, terrain, 1AM.

---

## 2026-09-15 — Phase 0 : Socle Vite + design system + squelette

### Décisions prises et pourquoi

- **Tailwind v3.4** (pas v4) malgré la mention "v4 si plugin Vite dispo" dans la dette technique connue : la spec liste explicitement `tailwind.config.ts` avec `theme.extend` comme livrable, ce qui correspond exactement au modèle v3 (config JS/TS classique). V4 aurait imposé une configuration CSS-first (`@theme`) qui aurait dévié de la structure demandée sans bénéfice net à ce stade. Documenté ici plutôt que redemandé, conformément à la consigne d'autonomie §6.
- **`motion` (le paquet)** s'est installé sans accroc — pas de repli sur `framer-motion@11`.
- **Tokens couleur en triplets RGB** (`--neon-blue: 59 130 246`, etc.) plutôt qu'en hexadécimal direct. Cause racine découverte en vérification visuelle : `bg-bg-deep/95` et consorts (modificateurs d'opacité Tailwind) ne fonctionnent qu'avec la syntaxe `rgb(var(--x) / <alpha-value>)`, qui exige un triplet, pas un hex. Toutes les valeurs directes (`background: var(--bg-deep)` dans `globals.css`) ont été adaptées en conséquence (`rgb(var(--bg-deep))`).
- **Icônes de marque (GitHub/YouTube/LinkedIn) en SVG local**, pas Lucide : la version actuelle de `lucide-react` (1.46.0) a retiré ses icônes de marque du cœur du paquet. Repli sur les tracés officiels Octicons (MIT) / Simple Icons (CC0) dans `components/ui/BrandIcons.tsx`, même API (`size`) que Lucide pour rester interchangeable. Menu/X/Mail restent du Lucide standard.
- **`LazyMotion` + chargement différé des features d'animation** (`src/lib/motionFeatures.ts`, chargé via `import()`) plutôt que d'utiliser `motion.div` partout : optimisation de performance (voir plus bas). Toutes les primitives utilisent désormais `m.*` au lieu de `motion.*`.
- **Soulignement de nav en transition CSS pure** plutôt qu'en `layoutId` animé (motion) : le bundle `domAnimation` (le plus léger de LazyMotion) ne supporte pas les animations de layout ; `domMax` (qui les supporte) est nettement plus lourd. Compromis assumé : léger recul visuel (le trait ne glisse plus d'un lien à l'autre, il apparaît/disparaît en `scale-x`) contre un gain de poids JS réel.
- **Sous-ensembles de police limités à `latin` + `latin-ext`** (`@fontsource/inter`, `@fontsource/space-grotesk`) : l'UI est en français, pas besoin de cyrillique/grec/vietnamien embarqués dans le build.

### Bug trouvé et corrigé en cours de session (cause racine, pas de contournement)

**Panneau de menu mobile transparent (contenu de la page visible à travers).** Diagnostic : `backdrop-filter` (classe `backdrop-blur-xl`) sur le `<header>` crée un nouveau *containing block* pour tout descendant `position: fixed` (règle CSS peu connue, équivalente à celle de `filter`/`transform`). Le panneau du menu mobile était un enfant JSX du `<header>`, dont la boîte ne fait que 65px de haut : son `fixed inset-0 top-[65px]` se calculait donc par rapport au header (65px de haut) et non au viewport, l'écrasant à une hauteur quasi nulle — le fond du panneau ne se peignait donc plus, seuls les liens (qui ont leur propre fond) restaient visibles, flottant sur le contenu de la page. Corrigé en sortant le panneau du `<header>` (frère du `<header>`, pas enfant) et en fixant la hauteur du header à `h-16` pour un calque `top-16` prévisible.

**Tag "Automations" jamais actif par défaut.** `useState("automations")` (minuscule) ne correspondait pas au libellé `"Automations"` (majuscule) utilisé dans le tableau de démonstration. Corrigé.

### Vérification Lighthouse mobile (critère de passage §7.5)

Résultat contre `vite preview` en local, configuration mobile standard (throttling simulé) :
**Performance 86 · Accessibilité 100 · Bonnes pratiques 100 · SEO 100.**

Performance sous la barre des 90 demandés en local. Diagnostic mené avant d'accepter le chiffre :
- `Total Blocking Time` = 0 ms, `Cumulative Layout Shift` = 0 (parfaits) : aucun souci de réactivité ni de stabilité visuelle.
- Le même test sans throttling réseau/CPU (`throttlingMethod: "provided"`) donne **100/100**, FCP 0.1 s, LCP 0.9 s.
- Conclusion : l'écart venait du throttling mobile simulé par défaut de Lighthouse (CPU ×4, réseau "slow 4G") combiné au serveur de dev local, pas d'un défaut de code.
- Optimisations appliquées avant de mesurer en conditions réelles : bundle JS principal réduit de 400 Ko → 328 Ko (127 Ko → 106 Ko gzip) via `LazyMotion` + chargement différé des animations dans un chunk séparé (`motionFeatures`, 10 Ko gzip, non bloquant) ; sous-ensembles de polices réduits à `latin`/`latin-ext`.

**Résultat confirmé sur le vrai déploiement** (`https://xab-dev.github.io/portfolio-v2/`, après le premier push) :
**Performance 90 · Accessibilité 100 · Bonnes pratiques 100 · SEO 100.** Les quatre catégories atteignent le seuil requis — le CDN GitHub Pages (TTFB, HTTP/2) comble l'écart observé en local. Critère de passage §7.5 validé sur le site réellement en ligne, pas seulement en local.

### Livré et validé à l'écran

Vérifié via un script Puppeteer piloté (le sous-agent navigateur Claude in Chrome n'était pas connecté dans cette session) contre `vite preview`, aux largeurs 375 px et 1280 px :
- Nav sticky, verre dépoli, ancre active soulignée (desktop) et suivie à jour au scroll (`IntersectionObserver`).
- Menu burger mobile : ouverture/fermeture, panneau plein écran opaque (bug ci-dessus corrigé), liens cliquables.
- 7 sections vides + section temporaire `#kitchen-sink` : `GlassCard` (glow bleu/violet/émeraude, tilt souris désactivé au tactile), `NeonButton` (primary/ghost, hover/tap), `Tag` (actif/inactif), `AnimatedCounter` (formatage `fr-FR`, ex. "4 200€"), `TypingText`, `Modal` (ouverture, fermeture Échap, focus restauré sur le déclencheur).
- `prefers-reduced-motion: reduce` : compteurs instantanés, `TypingText` affiché d'un coup — vérifié via émulation media feature.
- Aucun débordement horizontal à 375 px (`overflow-x` = 0 mesuré).
- Aucune erreur console sur les deux largeurs.
- `npm run build` et `npm run lint` (oxlint) verts.

### Hors scope pour cette itération (et où c'est prévu)

- Contenu réel des 7 sections → Phases 1 à 6 (voir ROADMAP, ordre conseillé 0 → 4 → 5 → 1 → 6 → 2 → 3 → 7).
- Optimisation Lighthouse Performance au-delà de ce qui a été fait ici → Phase 7 (DETTE-25).
- Retrait de la section `#kitchen-sink` → à faire une fois que chaque primitive aura été éprouvée dans une vraie section (dès que la Phase 1 ou 4 sera livrée, au plus tard fin de Phase 6).
- Mentions légales complètes, SEO/OG avancé, sitemap → Phase 7 (déjà hors scope explicite de la spec 01).

### Déploiement

Repo local initialisé (`git init`), remote `origin` pointé vers `https://github.com/xab-dev/portfolio-v2.git` (déjà existant avec 2 commits contenant une version antérieure — v0.2.0 — de `specs/` et `dette_suivi.md`). Le contenu local (v0.3.0 : specs à jour, `docs/`, `README.md` du kit de cadrage) est plus récent et fait foi ; réconcilié par fusion avec priorité au contenu local. Voir le commit de Phase 0 pour le détail des fichiers livrés. Workflow `.github/workflows/deploy.yml` ajouté (build + `upload-pages-artifact` + `deploy-pages` sur push `main`), GitHub Pages déjà configuré en source "GitHub Actions" par Xav.
