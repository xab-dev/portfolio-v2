# Journal de développement — Portfolio v2

Journal tenu par l'agent (Claude Code). Une entrée par session, la plus récente en haut.

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

Performance sous la barre des 90 demandés. Diagnostic mené avant d'accepter le chiffre :
- `Total Blocking Time` = 0 ms, `Cumulative Layout Shift` = 0 (parfaits) : aucun souci de réactivité ni de stabilité visuelle.
- Le même test sans throttling réseau/CPU (`throttlingMethod: "provided"`) donne **100/100**, FCP 0.1 s, LCP 0.9 s.
- Conclusion : l'écart vient intégralement du throttling mobile simulé par défaut de Lighthouse (CPU ×4, réseau "slow 4G"), appliqué à une SPA 100 % rendue côté client (aucun HTML utile avant exécution du JS) — une caractéristique structurelle du choix Vite+React CSR sans SSR/SSG (T1), pas un défaut de code découvert.
- Optimisations déjà appliquées avant d'arrêter les frais : bundle JS principal réduit de 400 Ko → 328 Ko (127 Ko → 106 Ko gzip) via `LazyMotion` + chargement différé des animations dans un chunk séparé (`motionFeatures`, 10 Ko gzip, non bloquant) ; sous-ensembles de polices réduits à `latin`/`latin-ext`.
- **[DETTE-25]** ajoutée dans `dette_suivi.md` : pousser plus loin (prérendu statique du shell, découpage additionnel) est un chantier de fond mieux placé en Phase 7 ("Polish, perf, SEO"), qui est explicitement le moment prévu par le ROADMAP pour l'audit Lighthouse complet. Le déploiement réel sur GitHub Pages (CDN, compression) devrait aussi légèrement améliorer le chiffre par rapport à `vite preview` en local.

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
