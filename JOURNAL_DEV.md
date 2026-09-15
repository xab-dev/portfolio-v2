# Journal de développement — Portfolio v2

Journal tenu par l'agent (Claude Code). Une entrée par session, la plus récente en haut.

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
