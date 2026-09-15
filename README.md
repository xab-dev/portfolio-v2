# Portfolio v2 — kit de cadrage pour Claude Code

Généré le 2026-09-14 depuis la dictée de Xav (Template 5 — Roadmap + Specs numérotées). Révisé le 2026-09-14 23:46 (v0.2.0) et le 2026-09-15 (v0.3.0 : identité, contact, repo, captures, timeline).

```
portfolio-v2/
├── README.md              ← ce fichier
├── dette_suivi.md         ← à copier dans le repo, l'agent l'enrichit, Xav coche
└── specs/
    ├── 00_ROADMAP.md      ← à donner tel quel à Claude Code pour démarrer (Phase 0)
    ├── 01_socle-design-system.md
    ├── 02_hero-agent-poche.md
    ├── 03_stack-simulator-roi.md
    ├── 04_prompt-playground.md
    ├── 05_portfolio-dynamique.md
    ├── 06_skills-timeline.md
    └── 07_contact-jouer.md
```

**Comment lancer** : dans le repo `xab-dev/portfolio-v2` (qui contient déjà `specs/` et `dette_suivi.md`), ouvrir Claude Code et coller :

> Lis `specs/00_ROADMAP.md` en entier, puis exécute la Phase 0 telle que détaillée dans `specs/01_socle-design-system.md`. Respecte les contraintes de méthode. Arrête-toi au critère de passage et fais-moi un compte-rendu.

Ordre conseillé après la Phase 0 : 05 → 06 → 02 → 07 → 03 → 04 (voir ROADMAP).

## Flux de travail

**Une seule branche de travail : `main`.** Chaque push sur `main` déclenche `.github/workflows/deploy.yml` (build + publication de `dist/` sur GitHub Pages). Aucune autre branche longue durée : `master` et `test-mobile-patch` ont été supprimées le 2026-09-15 (voir `JOURNAL_DEV.md`).

### Tester sur le Galaxy A04 sans toucher au site en ligne

Deux options, la première suffit dans la plupart des cas :

1. **Réseau local** — `npm run build && npx vite preview --host`, puis ouvrir `http://<ip-du-pc>:4173/portfolio-v2/` sur le téléphone (même Wi-Fi). Rien à pousser, le site en ligne n'est pas touché.
2. **Déploiement temporaire** — créer `test/<sujet>` depuis `main`, pousser, puis onglet *Actions* → "Deploy to GitHub Pages" → *Run workflow* en choisissant la branche `test/<sujet>` (`workflow_dispatch` est déjà présent). Le site en ligne montre la branche de test **jusqu'au prochain push sur `main`** (ou un *Run workflow* sur `main` pour revenir). Après validation : `git checkout main && git merge --ff-only test/<sujet>`, puis supprimer la branche (`git branch -d test/<sujet> && git push origin --delete test/<sujet>`). **Jamais** de merge dans l'autre sens ni de branche longue durée.
