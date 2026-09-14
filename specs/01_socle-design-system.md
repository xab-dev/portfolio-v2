# Portfolio v2 — SPEC : Socle Vite + design system + squelette (Phase 0)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (lire en entier, surtout T1-T12). Repo neuf et vide ; nom du repo **[DETTE-23]**.

## 1. Rôle du module
Poser la fondation technique et visuelle sur laquelle les 6 sections suivantes viendront se brancher sans jamais redéfinir une couleur, une animation d'entrée ou une modale. Tout ce qui est "transversal" est fait ici, une fois.

## 2. Entrées / Sorties
**Entrées** : aucune donnée métier. Uniquement les tokens ci-dessous.

**Sorties (fichiers)** :
```
<racine du repo>/
├── index.html                  (Vite, lang="fr", meta viewport, titre "Xavier B. — Consultant outils et solutions IA")
├── vite.config.ts              (base: '/<repo>/' — cf. T9 ; lire le nom depuis package.json ou une constante unique)
├── tailwind.config.ts          (palette étendue depuis tokens)
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                 (nav + 7 SectionShell vides + footer)
│   ├── styles/
│   │   ├── globals.css         (@tailwind + import tokens + reset + fond #0B0F19 + grain/lueurs de fond)
│   │   └── tokens.css          (variables CSS : couleurs, rayons, ombres néon, durées)
│   ├── lib/
│   │   ├── motion.ts           (variants partagés : fadeUp, stagger, scaleIn, glowPulse ; hook useReducedMotionSafe)
│   │   └── cn.ts               (helper clsx + tailwind-merge)
│   ├── components/ui/
│   │   ├── GlassCard.tsx
│   │   ├── NeonButton.tsx
│   │   ├── SectionShell.tsx
│   │   ├── Modal.tsx
│   │   ├── AnimatedCounter.tsx
│   │   ├── TypingText.tsx
│   │   └── Tag.tsx             (puce filtrable, état actif/inactif)
│   ├── components/layout/
│   │   ├── Navbar.tsx          (sticky, verre, ancre active via IntersectionObserver, menu burger mobile)
│   │   └── Footer.tsx
│   ├── content/
│   │   └── site.ts             (nom, titre T10, tagline, liens, meta, URL absolue de haTD — tout marqué [DETTE-01..04] si manquant)
│   └── sections/               (7 coquilles : Hero, StackSimulator, PromptPlayground, Portfolio, Skills, Contact, Play)
├── .github/workflows/deploy.yml
├── JOURNAL_DEV.md
└── dette_suivi.md              (copie du fichier fourni)
```

## 3. Comportement attendu

### Tokens (valeurs initiales — modifiables dans `tokens.css` uniquement)
| Token | Valeur | Usage |
|---|---|---|
| `--bg-deep` | `#0B0F19` | fond de page |
| `--bg-panel` | `rgba(255,255,255,0.04)` | fond des GlassCard |
| `--border-glass` | `rgba(255,255,255,0.10)` | bordures |
| `--neon-blue` | `#3B82F6` | accent principal (CTA, liens) |
| `--neon-violet` | `#8B5CF6` | accent secondaire (IA, agent) |
| `--neon-emerald` | `#10B981` | succès, métriques positives |
| `--text-primary` | `#E5E7EB` | texte |
| `--text-muted` | `#9CA3AF` | texte secondaire |
| `--glow-blue` | `0 0 40px rgba(59,130,246,0.35)` | box-shadow survol |
| `--radius-card` | `1.25rem` | |
| `--dur-fast / --dur-base / --dur-slow` | `150ms / 300ms / 600ms` | |

Contraste : tout texte courant sur `--bg-deep` doit atteindre AA (≥ 4.5:1). `--text-muted` sur `--bg-deep` ≈ 7:1, ok.

### Primitives
- **GlassCard** : `backdrop-blur-xl`, bordure `--border-glass`, fond `--bg-panel`. Prop `glow?: 'blue'|'violet'|'emerald'` → ombre néon au survol (`whileHover`). Prop `tilt?: boolean` → survol 3D (rotateX/rotateY suivant la souris, max ±8°, `transformPerspective: 1000`) ; désactivé sur pointeur tactile et en reduced-motion.
- **NeonButton** : variantes `primary` (fond `--neon-blue`), `ghost` (bordure). `whileHover` scale 1.03 + glow, `whileTap` 0.97. Toujours un `aria-label` si icône seule.
- **SectionShell** : `<section id=… >` avec titre + sous-titre, entrée `whileInView` (fadeUp, `once: true`, `amount: 0.2`), stagger sur les enfants. Padding mobile 4rem / desktop 7rem.
- **Modal** : `AnimatePresence`, overlay flou, contenu scaleIn, fermeture Échap + clic overlay + bouton, focus trap, `aria-modal`, scroll du body bloqué, rendu via portal.
- **AnimatedCounter** : anime de 0 → `value` sur `--dur-slow`×1.5 avec easing out, formatage `fr-FR` (`suffix` : `%`, `h`, `€`), se déclenche `whileInView` une seule fois.
- **TypingText** : révèle un texte caractère par caractère (vitesse par défaut 18 ms/char), curseur clignotant, prop `onDone`. En reduced-motion : affiche tout d'un coup.
- **Tag** : bouton pill, état `active` (fond accent) / inactif (verre), `aria-pressed`.

### Navbar
Liens vers les 7 ancres dans cet ordre : Accueil, Simulateur, Playground, Projets, Compétences, Contact, Jouer. Ancre active soulignée par un trait `layoutId` animé. Sur mobile : burger → panneau plein écran verre.

### Déploiement (T9)
`deploy.yml` : sur push `main`, `npm ci && npm run build`, puis `actions/upload-pages-artifact` sur `dist/` et `actions/deploy-pages`. GitHub Pages doit être configuré en source "GitHub Actions" (Xav le fait dans les réglages du repo — **[ARRÊT XAV]** au premier déploiement). Ajouter un `public/404.html` qui redirige vers la racine (GitHub Pages ne gère pas les routes côté client ; les ancres `#` ne posent pas ce problème, mais un hash de deep link mal formé ne doit jamais donner une 404).

## 4. Edge cases à gérer
- `prefers-reduced-motion: reduce` → `useReducedMotionSafe()` renvoie `true` : SectionShell = simple fondu, tilt off, TypingText instantané, counters instantanés.
- JS désactivé : le HTML rend au moins le titre, le sous-titre et l'email de contact (`<noscript>`).
- Fenêtre < 360 px : rien ne déborde horizontalement (`overflow-x: hidden` sur `html` interdit — corriger la cause).
- Police : chargée via `@fontsource` (ex. `Inter` corps + `Space Grotesk` titres) pour éviter une dépendance réseau tierce au runtime. Repli `system-ui`.

## 5. Structure des fichiers
Voir §2.

## 6. Consignes d'autonomie pour Claude Code
- Ne pas demander de validation sur les noms de fichiers, les easings exacts ou la fonte, tant que les tokens du §3 sont respectés.
- Si `motion` (paquet) ne s'installe pas proprement, replier sur `framer-motion@11`, garder la même API de variants, le noter.
- Ne créer **aucune** section remplie : les 7 fichiers de `sections/` ne contiennent qu'un `SectionShell` avec titre + une phrase "Contenu en Phase N".
- Ne jamais cloner ni modifier le repo `cv-portfolio` : haTD est consommé par URL absolue uniquement (Phase 6).

## 7. Critères de validation
1. `npm run build` sans warning bloquant ; `npm run preview` ouvre le site.
2. Page temporaire `#kitchen-sink` (ou section masquée) montrant chaque primitive dans ses états (repos, survol, actif, reduced-motion).
3. Vérification visuelle documentée à 375 px et 1280 px : nav sticky, ancre active, burger mobile, modale ouverte/fermée au clavier.
4. Déploiement réel visible sur `https://xab-dev.github.io/<repo>/` après le premier push.
5. Lighthouse mobile : Performance ≥ 90, Accessibilité ≥ 90.

## 8. Hors scope pour cette itération
Contenu, agent, simulateur, playground, projets, skills, contact, iframe haTD (Phases 1-6). SEO/OG avancé et mentions légales (Phase 7).
