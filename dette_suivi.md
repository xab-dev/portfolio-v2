# Portfolio v2 — Dette & suivi

**Version : 0.3.0** — créé 2026-09-14 23:00, révisé 23:46 puis 2026-09-15. Document vivant. L'agent (Claude Code) **ajoute** des lignes, ne supprime jamais ; Xav coche.

Convention : `[DETTE-xx]` dans le code/contenu ↔ ligne ici. Statut : ☐ ouvert · ☑ résolu · ⏸ reporté.

---

## A. Points de substance — **tranchés par Xav le 2026-09-14 (23:46)**, reportés dans le ROADMAP v0.2.0

| Statut | Point | Réponse de Xav | Conséquence dans les specs |
|---|---|---|---|
| ☑ S1 | ROI / métriques client | Aucune donnée client à fournir. | T6 confirmé : estimations indicatives + formules visibles, jamais de chiffre client. Agent : réponse honnête (clin d'œil "ROI IA > ROI poker" proposé, à valider en DETTE-05). |
| ☑ S2 | Tag "RAG/LLM" | RAG = notions, à creuser quand un projet le nécessitera. | T11 : tag retiré des projets ; RAG affiché en skill niveau 1 "notions". |
| ☑ S3 | Modèles / stack cités | Modèles réellement utilisés : Claude Fable 5.1, Opus 5, Sonnet 5. Make et autres : notions. | T5b : modèles nommés dans agent/skills, génériques dans le simulateur. Skills Make/n8n → 1. |
| ☑ S4 | Deux portfolios | La v2 devient le portfolio officiel ; le Carnet de terrain reste personnel, un souvenir. **Repo neuf, vide.** | T9 : déploiement à la racine d'un repo dédié ; `cv-portfolio` jamais touché, haTD lu par URL absolue. Ancienne D1 supprimée. |
| ☑ S5 | Titre public | "Consultant outils et solutions IA". | T10 : `<title>`, Hero, OG, footer. Ancienne D2 supprimée. |
| ☑ S6 | Jouer sur mobile | haTD non jouable au tactile ; le cold-open suffit comme effet ; fermeture auto ou bouton Fermer ; jouable sur PC. | T12 + D5 : overlay mobile avec teaser, Fermer + fermeture auto (`teaserMs`, DETTE-24) ; iframe jouable sur PC. |
| ☑ S7 | CV fictif | Renommé `CV_fake_archi_fake.md`. | T7 mis à jour avec le nouveau nom. |

## B. Informations personnelles — mise à jour 2026-09-15 (réponses de Xav)

Légende : ☑ résolu (valeur reportée dans la spec indiquée) · ☐ en réflexion / reporté par Xav · ⏸ en cours (côté Xav).

| Statut | Ref | Information | Réponse / valeur | Utilisée par |
|---|---|---|---|---|
| ☑ | DETTE-01 | Nom public | **Xavier Joseph Bou** | site.ts (spec 01), Hero, meta, footer |
| ⏸ | DETTE-02 | Photo / avatar | Dessin personnel en cours : silhouette d'homme encapuchonné (dark / faucheuse). Repli initiales tant que `avatar.src` est vide (spec 02). Déposer le fichier final dans `public/images/avatar.webp`. | Hero |
| ☑ | DETTE-03 | Tagline | Validée telle que proposée | Hero |
| ☑ | DETTE-04 | Liens | GitHub `github.com/xab-dev/portfolio-v2` · YouTube `youtube.com/@1_Autre_Monde` · LinkedIn en cours (⏸, masqué tant que vide) · Contact direct privilégié : mail `xa.bou@laposte.net` (principal), `phenomenxx@gmail.com`, WhatsApp/SMS | site.ts, footer, contact |
| ☐ | DETTE-05 | Relecture des 6 réponses scriptées de l'agent (dont le clin d'œil "ROI IA > ROI poker") | — | Phase 1 |
| ☑ | DETTE-06 | Disponibilité | 100 % disponible ; réponse sous 1 jour max ; distanciel préféré ; déplacement possible dans un grand rayon et sur longue durée si devis signé (ex. audit en immersion) | Agent `dispo` (spec 02), Contact (spec 07) |
| ☐ | DETTE-07 | Fourchettes "temps gagné" et baselines du simulateur | — | Phase 2 |
| ☑ | DETTE-08 | Taux horaire par défaut du **curseur client** | **35 €/h** confirmé (le tarif de Xav est en DETTE-25) | Phase 2 |
| ☐ | DETTE-09 | Relecture des 4 cas du Playground | — | Phase 3 |
| ☐ | DETTE-10 | Enrichissement des fiches projet | — | Phase 4 |
| ☐ | DETTE-11 | Nombre de sessions où les templates ont servi | — | Fiche "Templates" |
| ☑ | DETTE-12 | Date de Régie Maison | Premier projet, **01/09/2026** | Fiche + timeline |
| ☑ | DETTE-13 | SafeFolder | Intégré à la suite **miniCiel** ; clé USB achevée, testée, prête à l'emploi. Carte SafeFolder fusionnée dans la carte miniCiel (spec 05, 6 projets). | Phase 4 |
| ⏸ | DETTE-14 | Captures d'écran | Xav les a. Procédure (spec 05 §6) : déposer les originaux dans `public/images/projects/<id>/raw/` (ids : `hatd`, `templates`, `miniciel`, `terrain`, `regie-maison`, `1am`) ; l'agent convertit en WebP ≤ 200 Ko, largeur ≤ 1600 px, renseigne `images[]` + `alt`. Les `raw/` sont ignorés par git. | Modale projet |
| ☐ | DETTE-15 | Validation des niveaux de compétences | — | Phase 5 |
| ☐ | DETTE-16 | Biostatistique : niveau à afficher | Éthologie **retirée** (hobby, hors sujet ici) ; biostatistique en réflexion | Phase 5 |
| ☑ | DETTE-17 | Parcours antérieur (études, coaching, Camargue, deux-roues, poker) | Reste à la discrétion de Xav → **non affiché**. Frise V1 = trajectoire IA/dev 2026 uniquement (spec 06). | Timeline |
| ☐ | DETTE-18 | Fourchettes de budget (D4) | — | Contact |
| ☑ | DETTE-19 | Email + endpoint Formspree | `xa.bou@laposte.net` · `https://formspree.io/f/xgaegryp` | Contact |
| ☑ | DETTE-20 | Téléphone | **07 69 54 74 94** (tel: + WhatsApp) | site.ts, Contact |
| ☑ | DETTE-21 | Langues | Français natif · Anglais très bon | site.ts, skills |
| ☑ | DETTE-22 | Statut / mentions légales | **Auto-entrepreneur — SIRET 944 670 066 00017**. Ligne footer dès la Phase 0 ; page Mentions légales complète (hébergeur GitHub, RGPD du formulaire) en Phase 7. | Footer |
| ☑ | DETTE-23 | Repo | `https://github.com/xab-dev/portfolio-v2` — contient déjà `specs/` et `dette_suivi.md` | Phase 0 |
| ☑ | DETTE-24 | Teaser mobile haTD | **18 s** avec possibilité de quitter | Phase 6 |
| ☐ | DETTE-25 | **Tarif de Xav** : 25 à 50 €/h selon l'intervention (écart lié aux outils IA mobilisés, à amortir). Formulation publique exacte à valider ; affiché en Contact (spec 07). | Contact |

## C. Dette technique connue à la création (avant toute ligne de code)

| Statut | Point | Prévu en |
|---|---|---|
| ☐ | Agent = scripté ; `ApiAgentProvider` non implémenté (nécessiterait un proxy pour cacher la clé) | Post-V1 |
| ☐ | Sorties du Playground statiques (pas d'appel LLM) | Post-V1 |
| ☐ | Formulaire dépendant d'un service tiers (Formspree — endpoint et adresse validés) ; repli mailto | Phase 6 |
| ☑ | Paquet `motion` vs `framer-motion` : vérifier à l'init, noter l'option retenue → **`motion` installé sans accroc**, pas de repli nécessaire. | Phase 0 |
| ☑ | Tailwind : version courante stable à l'init (v4 si plugin Vite dispo) — la config tokens doit rester compatible → **Tailwind v3.4 retenu** (la spec liste explicitement `tailwind.config.ts`, structure v3 ; v4 aurait imposé un modèle CSS-first hors périmètre de la spec). | Phase 0 |
| ☑ | Déploiement GitHub Pages : source "GitHub Actions" activée par Xav (2026-09-15) ; workflow à valider sur le premier push | Phase 0 |
| ☐ | Pas de SEO/OG/sitemap en Phases 0-6 | Phase 7 |
| ☐ | Pas de tests e2e (Playwright) — uniquement Vitest sur les fonctions pures | Post-V1 |
| ☐ | Poids de l'iframe haTD non mesuré | Phase 6 |
| ☐ | Pipeline images (`sharp`, script `npm run images`) à créer quand les premières captures arrivent | Phase 4 |
| ☐ | `lucide-react` n'expose plus ses icônes de marque (Github/Youtube/Linkedin) depuis la v1.x — repli sur des SVG locaux (`components/ui/BrandIcons.tsx`, tracés Octicons/Simple Icons). Si une future mise à jour de Lucide les réintroduit, envisager de revenir aux imports Lucide. | Phase 0 |
| ☑ | **[DETTE-26]** Lighthouse mobile Performance = 86 en local (`vite preview`) au lieu des 90 requis — diagnostiqué comme un artefact du serveur de dev local (TBT/CLS parfaits, 100/100 sans throttling). Optimisé quand même (LazyMotion + chunk d'animations différé, polices `latin`/`latin-ext` uniquement : JS principal 400 Ko → 328 Ko / 127 Ko → 106 Ko gzip). **Confirmé résolu sur le vrai déploiement** : Performance 90, Accessibilité/Bonnes pratiques/SEO 100 sur `https://xab-dev.github.io/portfolio-v2/`. À resurveiller en Phase 7 quand le contenu réel alourdira les pages. | Phase 0 (clos) |

## D. Journal des ajouts par l'agent
*(Claude Code ajoute ici, daté, tout point découvert en cours de phase et non traité.)*

- 2026-09-14 — création du fichier.
- 2026-09-14 23:46 — S1 à S7 tranchés par Xav ; ROADMAP v0.2.0 ; ajout DETTE-23 (nom du repo) et DETTE-24 (cold-open).
- 2026-09-15 (suite) — DETTE-08 (35 €/h) et DETTE-20 (téléphone) résolues ; Formspree validé ; GitHub Actions activé.
- 2026-09-15 — 13 dettes résolues par Xav (01, 03, 04, 06, 12, 13, 17, 19, 21, 22, 23, 24) ; 02 et 14 en cours ; ajout DETTE-25 (tarif). ROADMAP v0.3.0. Plus aucune dette bloquante pour la Phase 0.
- 2026-09-15 (Phase 0 exécutée) — Socle Vite/React/TS + design system livré (détail complet dans `JOURNAL_DEV.md`). Choix techniques tranchés et documentés : `motion` (paquet) sans repli, Tailwind v3.4, icônes de marque en SVG local. Deux bugs trouvés et corrigés en vérification visuelle (panneau mobile transparent — `backdrop-filter` + `position:fixed` imbriqué ; tag actif par défaut mal casé). DETTE-26 (Lighthouse Performance mobile) ouverte puis close le jour même : 86 en local, 90 confirmé sur le vrai déploiement GitHub Pages. Premier push effectué, site en ligne et vérifié à `https://xab-dev.github.io/portfolio-v2/`.
