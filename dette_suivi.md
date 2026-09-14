# Portfolio v2 — Dette & suivi

**Version : 0.2.0** — 2026-09-14 (créé 23:00, révisé 23:46). Document vivant. L'agent (Claude Code) **ajoute** des lignes, ne supprime jamais ; Xav coche.

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

## B. Informations personnelles manquantes (à fournir par Xav)

| Statut | Ref | Information | Utilisée par |
|---|---|---|---|
| ☐ | DETTE-01 | Nom public à afficher ("Xavier B." ? nom complet ?) | Hero, meta, footer |
| ☐ | DETTE-02 | Photo / avatar (ou choix "pas de photo", une illustration générée par un vrai artiste ou un motif abstrait) | Hero |
| ☐ | DETTE-03 | Tagline validée (proposition dans spec 02) | Hero |
| ☐ | DETTE-04 | Liens : GitHub (`xab-dev` ?), LinkedIn, chaîne YouTube 1AM (si publique) | Nav, footer, contact |
| ☐ | DETTE-23 | **Nom du repo GitHub neuf** (ex. `xab-dev/portfolio`) → fixe l'URL publique `https://xab-dev.github.io/<repo>/` et `vite base`. **Bloquant pour la Phase 0.** | Phase 0 |
| ☐ | DETTE-24 | Durée réelle du cold-open de haTD (pour `teaserMs`, défaut 20 s) | Phase 6 (D5) |
| ☐ | DETTE-05 | Relecture/validation des 6 réponses scriptées de l'agent | Phase 1 |
| ☐ | DETTE-06 | Disponibilité réelle : délai de réponse, jours/semaine, périmètre géographique, à distance oui/non | Agent, contact |
| ☐ | DETTE-07 | Validation des fourchettes "temps gagné" et des baselines h/semaine du simulateur | Phase 2 |
| ☐ | DETTE-08 | Taux horaire par défaut du curseur (35 €/h proposé) | Phase 2 |
| ☐ | DETTE-09 | Relecture des 4 cas du Playground (prompts experts = ta méthode) | Phase 3 |
| ☐ | DETTE-10 | Enrichissement des 7 fiches projet (phrases problème/limites) | Phase 4 |
| ☐ | DETTE-11 | Nombre de sessions réelles où les templates ont servi | Fiche "Templates" |
| ☐ | DETTE-12 | Année de Régie Maison | Fiche + timeline |
| ☐ | DETTE-13 | Étape atteinte sur SafeFolder (N/M) | Fiche SafeFolder |
| ☐ | DETTE-14 | Captures d'écran par projet (haTD, miniCiel, Régie Maison, SafeFolder CLI) | Modale projet |
| ☐ | DETTE-15 | Validation des niveaux de compétences (auto-évaluation 1-5) | Phase 5 |
| ☐ | DETTE-16 | Niveau à afficher pour biostatistique et éthologie (et faut-il les afficher sur un site "IA" ?) | Phase 5 |
| ☐ | DETTE-17 | Dates/durées du parcours : études, coaching sportif, Camargue, deux-roues, poker — et lesquels afficher publiquement | Timeline |
| ☐ | DETTE-18 | Fourchettes de budget (choix commercial) | Contact (D4) |
| ☐ | DETTE-19 | Email de contact professionnel + création de l'endpoint Formspree | Contact (D3) |
| ☐ | DETTE-20 | Téléphone affiché ou non | Contact |
| ☐ | DETTE-21 | Langues (FR natif, anglais niveau ?) — à afficher ou non | Skills/footer |
| ☐ | DETTE-22 | Mentions légales / statut (auto-entrepreneur ? SIRET ?) — obligatoire dès qu'il y a un formulaire de contact commercial. **Plus urgent maintenant que la v2 est le site officiel.** | Footer / Phase 7 |

## C. Dette technique connue à la création (avant toute ligne de code)

| Statut | Point | Prévu en |
|---|---|---|
| ☐ | Agent = scripté ; `ApiAgentProvider` non implémenté (nécessiterait un proxy pour cacher la clé) | Post-V1 |
| ☐ | Sorties du Playground statiques (pas d'appel LLM) | Post-V1 |
| ☐ | Formulaire dépendant d'un service tiers (Formspree) ; repli mailto | Phase 6 |
| ☐ | Paquet `motion` vs `framer-motion` : vérifier à l'init, noter l'option retenue | Phase 0 |
| ☐ | Tailwind : version courante stable à l'init (v4 si plugin Vite dispo) — la config tokens doit rester compatible | Phase 0 |
| ☐ | Déploiement GitHub Pages depuis un repo neuf : source "GitHub Actions" à activer par Xav dans les réglages du repo au premier push | Phase 0 |
| ☐ | Pas de SEO/OG/sitemap en Phases 0-6 | Phase 7 |
| ☐ | Pas de tests e2e (Playwright) — uniquement Vitest sur les fonctions pures | Post-V1 |
| ☐ | Poids de l'iframe haTD non mesuré ; durée du cold-open non mesurée | Phase 6 |

## D. Journal des ajouts par l'agent
*(Claude Code ajoute ici, daté, tout point découvert en cours de phase et non traité.)*

- 2026-09-14 — création du fichier.
- 2026-09-14 23:46 — S1 à S7 tranchés par Xav ; ROADMAP v0.2.0 ; ajout DETTE-23 (nom du repo) et DETTE-24 (cold-open).
