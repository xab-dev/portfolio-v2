# Portfolio v2 — SPEC : Portfolio dynamique — Mes Projets (Phase 4)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T6, T7, T11), `GlassCard tilt`, `Modal`, `Tag`, `SectionShell`. Sources de vérité : `Fiche_Professionnelle_Xav.md`, `Positionnement...md` §7-8, `Sequence_Intervention_Terrain.md`, `TEMPLATES_SPEC.md`, `README_md___USB_IT_KIT.md`, `portfolio_regie_maison.docx`, GDD haTD/RPG-monde.

## 1. Rôle du module
C'est le cœur du CV. Chaque projet est présenté selon la chaîne recommandée par le Positionnement §6 : **Problème → Architecture/rôle de l'IA → Résultat & métriques réelles → Limites**. Les limites font partie de la preuve, pas d'une faiblesse.

## 2. Entrées / Sorties

### Contenu (`src/content/projects.ts`)
```ts
export type ProjectTag = 'Automations' | 'Formations' | 'Jeu' | 'Outils' | 'Méthode';
export type Project = {
  id: string; title: string; tagline: string; tags: ProjectTag[];
  status: 'en production' | 'v1 fonctionnelle' | 'en développement' | 'cadrage';
  year: number;
  problem: string;
  architecture: string[];          // briques + rôle de l'IA vs contrôle humain
  metrics: { label: string; value: string; verified: boolean }[];   // verified=false → affiché avec "(auto-déclaré)"
  limits: string[];
  links?: { label: string; href: string }[];
  images?: { src: string; alt: string }[];   // chemins sous /images/projects/<id>/ (voir §6, DETTE-14)
  accent: 'blue'|'violet'|'emerald';
};
```

Le tag "RAG/LLM" de la dictée est **retiré** (T11, réponse S2 de Xav : aucun projet RAG, notions seulement). Les tags restants sont ceux de la dictée complétés par Jeu/Outils/Méthode. Ne jamais afficher un filtre qui ne renvoie rien.

### Projets V1 (6) — contenu réel, à enrichir **[DETTE-10]**

1. **haTD / RPG-monde** — Jeu · en développement · 2026 · accent violet
   - Problème : construire seul un jeu complet (tower defense clicker + surcouche RPG) en gardant une qualité pro sans équipe.
   - Architecture : prototype HTML/JS canvas single-file ; Claude Code piloté par specs ; `CLAUDE.md` + tests Node comme seule mémoire inter-session (pas de git, choix assumé de Diligence) ; cible Godot 4.
   - Métriques : "Version jouable en ligne" (verified, lien haTD) ; "GDD versionné v0.1.0" (verified) ; "Playtest externe (neveu) réalisé" [À CONFIRMER date].
   - Limites : équilibrage en cours, pas jouable au tactile, pas encore de build mobile.
   - Lien : `site.hatdUrl` (= `https://xab-dev.github.io/cv-portfolio/haTD_V1/`) + ancre `#jouer`.

2. **Bibliothèque de templates de spec (spec-driven development)** — Méthode · en production · 2026 · bleu
   - Problème : transformer une dictée vocale brute (pendant une session de test) en instruction exploitable par un agent de code, sans perdre d'information ni mélanger les sujets.
   - Architecture : 6 templates (Micro-Ticket, Module Standard, Session Diagnostic, Cahier des charges, Roadmap+Specs, Triage) ; Claude comme rédacteur de spec, Claude Code comme exécutant, Xav comme vérificateur.
   - Métriques : "6 templates formalisés" (verified) ; "Utilisés sur N sessions" [DETTE-11].
   - Limites : pas encore éprouvé chez un client tiers.

3. **miniCiel / Kit USB d'intervention IT** — Outils, Automations · v1 fonctionnelle (clé achevée, testée, prête à l'emploi — DETTE-13) · 2026 · émeraude
   - Problème : diagnostiquer et entretenir un PC client en 30 min, sans installation, sans réseau, avec compte-rendu — et réorganiser des dossiers volumineux sans jamais rien perdre.
   - Architecture : dashboard modulaire (découverte auto des modules via `module.json`), scripts PowerShell/Python, aucune collecte de données ; IA utilisée pour concevoir/coder, absente à l'exécution. Module **SafeFolder** inclus : CLI Python, 3 primitives seulement, plan figé par SHA-256, journal avant exécution, annulation par plan inverse, test AST anti-écriture.
   - Métriques : "Clé USB v1 achevée et testée" (verified) ; "Système de modules auto-découverts" (verified) ; "SafeFolder : 0 suppression possible par construction" (verified par le design) ; "Temps de diagnostic cible : 0-30 min" (hypothèse).
   - Limites : pas encore testé chez un client réel ; clé bootable (secours si Windows ne démarre pas) non réalisée.

4. **Séquence d'intervention terrain en 3 paliers** — Méthode, Formations · cadrage · 2026 · bleu
   - Problème : ne mobiliser que le niveau d'effort nécessaire (USB → spec → diagnostic humain-IA).
   - Métriques : aucune métrique affichée (statut cadrage) — la carte le dit.

5. **Régie Maison** — Automations, Outils · v1 fonctionnelle · 2026 (premier projet, 01/09/2026 — DETTE-12) · émeraude
   - Problème : piloter TV Sony Bravia + Google Home depuis une interface unique dans une autre pièce.
   - Architecture : Python, tkinter, chargement dynamique de modules, threading, `config.json` séparé, API Bravia (PSK), pychromecast/gTTS.
   - Limites : usage personnel, pas packagé.

6. **Un Autre Monde (1AM)** — Formations · cadrage · 2026 · violet
   - Problème : prévenir les mésusages de l'IA générative par des contenus par paliers.
   - Métriques : aucune (projet de contenu en cadrage).
   - Lien : `site.links.youtube`.

*(SafeFolder n'est plus une carte séparée : Xav l'a intégré à la suite miniCiel — DETTE-13.)*

## 3. Comportement attendu
- Barre de filtres `Tag` (multi-sélection, "Tous" par défaut) ; compteur "N projets".
- Grille : 1 col mobile, 2 tablette, 3 desktop ; réordonnancement animé (`layout` + `AnimatePresence`, `mode="popLayout"`).
- Carte = `GlassCard tilt glow={accent}` : titre, tagline, pastille `status`, tags, année. Survol : tilt 3D + lueur + flèche "Voir le cas".
- Clic/Entrée → `Modal` : en-tête (titre, statut, tags), 4 blocs à onglets ou empilés : **Problème / Architecture & rôle de l'IA / Métriques / Limites**, liens en pied. Métriques `verified:false` affichent le suffixe "(auto-déclaré)". Bloc Limites toujours visible (non repliable).
- URL hash `#projets/haTD` à l'ouverture (deep link partageable), retour arrière ferme la modale.

## 4. Edge cases à gérer
- Filtre sans résultat : impossible par construction (chaque tag a ≥ 1 projet) — ajouter un test qui le garantit.
- Projet sans `metrics` : le bloc affiche "Pas de métrique publiée à ce stade — statut : cadrage".
- Modale sur mobile : plein écran, scroll interne, bouton fermer accessible au pouce.
- Hash invalide au chargement : ignoré silencieusement.

## 5. Structure des fichiers
```
src/sections/Portfolio.tsx
src/components/portfolio/FilterBar.tsx
src/components/portfolio/ProjectCard.tsx
src/components/portfolio/ProjectModal.tsx
src/content/projects.ts
src/content/projects.test.ts     (chaque tag ↔ ≥1 projet ; ids uniques)
```

## 6. Consignes d'autonomie pour Claude Code
- Rédiger `problem/architecture/limits` à partir des sources listées ; ne **jamais** produire une métrique chiffrée qui n'y figure pas — utiliser le marqueur `[DETTE-xx]` dans `process/dette_suivi.md`.
- Ne pas utiliser `CV_fake_archi_fake.md` (fictif, T7).
- Réutiliser `Modal` et `GlassCard` sans les modifier ; si une prop manque, l'ajouter dans Phase 0 (fichier ui) et le noter.
- **Captures d'écran (DETTE-14)** : Xav les dépose dans `public/images/projects/<id>/` (ids : `hatd`, `templates`, `miniciel`, `terrain`, `regie-maison`, `1am`). L'agent les convertit en WebP (largeur max 1600 px, ≤ 200 Ko chacune, script `npm run images` avec `sharp`), garde les originaux hors du repo (`.gitignore` sur `raw/`), et renseigne `images[]` avec un `alt` descriptif en français. Dans la modale : galerie horizontale scrollable, `loading="lazy"`, clic → agrandissement dans la même `Modal`. Une carte sans image reste valide (pas de vignette cassée).

## 7. Critères de validation
1. Tests de `projects.test.ts` verts.
2. Filtre "Automations" → miniCiel + Régie Maison ; "Jeu" → haTD.
3. Ouvrir/fermer une modale au clavier, deep link `#projets/miniciel` fonctionne au rechargement.
4. Tilt inactif sur écran tactile (émulation DevTools) et en reduced-motion.
5. **[ARRÊT XAV]** : relecture des 6 fiches avant de clore la phase.

## 8. Hors scope
Études de cas longues, témoignages clients.
