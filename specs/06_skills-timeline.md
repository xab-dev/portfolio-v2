# Portfolio v2 — SPEC : Skills Matrix & Timeline (Phase 5)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md`, `Positionnement...md` §2-3 (échelle IA1→IA9, positionnement "trajectoire IA7"), `Fiche_Professionnelle_Xav.md` §Compétences, `topics/tech-skills` (VPS/Docker : notions, jamais déployé). Primitives Phase 0.

## 1. Rôle du module
Rendre les compétences lisibles *et honnêtes* : un radar par famille, des badges qui affichent un niveau précis **avec son statut** sur une échelle de 7 (notions → architecture & supervision) ; le radar, lui, reste sur 5 (maîtrise pratique). Un bandeau "Positionnement" IA1→IA7 situe le profil global, distinct des compétences. Et une frise du parcours — sans dates inventées.

## 2. Entrées / Sorties

### Compétences (`src/content/skills.ts`)
```ts
export type Level = 1|2|3|4|5|6|7;
// 1 notions · 2 en apprentissage · 3 en consolidation · 4 maîtrisé · 5 pratique quotidienne
// 6 mis en production · 7 architecture & supervision
// Radar : min(level, 5). Les niveaux 6-7 sont des paliers de preuve (≈ IA6 / IA7), pas des ressentis.
export type Skill = { name: string; level: Level; note?: string; family: SkillFamily };
export type SkillFamily = 'Méthode IA' | 'LLMs & agents' | 'No-code / automatisation' | 'Développement' | 'Données' | 'Humain';

export const LEVEL_SCALE: Record<Level, { label: string; meaning: string; tier: string }> = {
  1: { label: 'Notions',                     meaning: 'Je sais ce que c\'est et à quoi ça sert ; je n\'ai rien produit avec.',                                          tier: '≈ IA1–2' },
  2: { label: 'En apprentissage',            meaning: 'Premiers essais, encore guidé ou sur exemples.',                                                                  tier: '≈ IA2–3' },
  3: { label: 'En consolidation',            meaning: 'Utilisé sur au moins un projet réel ; je m\'appuie encore sur la doc ou l\'IA pour les cas non triviaux.',        tier: '≈ IA3–4' },
  4: { label: 'Maîtrisé',                    meaning: 'Autonome : je livre sans supervision et je sais expliquer mes choix.',                                            tier: '≈ IA4–5' },
  5: { label: 'Pratique quotidienne',        meaning: 'Outil de travail courant ; méthode documentée et réutilisable.',                                                  tier: '≈ IA5' },
  6: { label: 'Mis en production',           meaning: 'J\'ai conçu et fait tourner avec ça une chaîne ou une automatisation qui fonctionne sans moi, et je la maintiens.', tier: '≈ IA6' },
  7: { label: 'Architecture & supervision',  meaning: 'Je conçois le système complet (IA, outils, données, contrôle), je le supervise et je transmets la méthode.',      tier: '≈ IA7' },
};

// Bandeau Positionnement — indépendant des badges. À éditer à la main quand un palier change.
export type TierStatus = 'acquis' | 'en cours' | 'cible';
export const POSITIONING: { tier: string; role: string; status: TierStatus; note?: string }[] = [
  { tier: 'IA1', role: 'Utilisateur',              status: 'acquis' },
  { tier: 'IA2', role: 'Power User',               status: 'acquis' },
  { tier: 'IA3', role: 'Prompt Engineer',          status: 'acquis' },
  { tier: 'IA4', role: 'AI Practitioner',          status: 'acquis' },
  { tier: 'IA5', role: 'AI Builder / Vibe Coder',  status: 'acquis',   note: 'Je construis des outils et applications avec l\'IA au quotidien.' },
  { tier: 'IA6', role: 'Automation Builder',       status: 'en cours', note: 'Automatisations et agents compris et prototypés, pas encore en production.' },
  { tier: 'IA7', role: 'AI Workflow Architect',    status: 'en cours', note: 'Je conçois déjà des systèmes multi-outils ; la mise en production supervisée est l\'étape suivante.' },
];
export const POSITIONING_DISCLAIMER = 'Grille de compétence personnelle, pas une certification.';
```

Valeurs de référence = `src/content/skills.ts` (Xav édite à la main, DETTE-15 close le 2026-09-15). Rappel des valeurs au 2026-09-17, après passage à 7 niveaux :

| Famille | Compétence | Niveau | Note |
|---|---|---|---|
| Méthode IA | Cadre 4D | 5 | Délégation · Description · Discernement · Diligence — pratique documentée |
| Méthode IA | Spec-driven development (6 templates) | **6** | méthode formalisée et réutilisée sur plusieurs projets — passage à 7 quand elle aura été transmise et appliquée chez un client |
| Méthode IA | Diagnostic structuré / cause racine | 4 | |
| LLMs & agents | Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code | 5 | usage quotidien, choix du modèle selon la tâche |
| LLMs & agents | Autres LLM (ChatGPT, Gemini, Perplexity, Mammouth) | 4 | usage ciblé : chacun pour ce qu'il fait le mieux |
| LLMs & agents | Prompt engineering | 4 | |
| LLMs & agents | Architecture d'agents (function calling, MCP, orchestration) | 3 | compris, peu mis en prod |
| No-code / automatisation | Make / n8n | 1 | notions (S3) — axe de consolidation IA6 |
| No-code / automatisation | Conception de workflows humain ↔ LLM ↔ agent de code | 5 | la logique, pas la plateforme no-code |
| No-code / automatisation | RAG | 1 | notions — à creuser quand un projet le demandera (S2) — déplacé depuis « LLMs & agents » (patch tooltip-rag : ni no-code ni automatisation stricto sensu, mais un pipeline de données ; renommer la famille en « Automatisation & pipelines » si le libellé gêne un jour) |
| Développement | HTML/JS/CSS (canvas, single-file) | 4 | |
| Développement | Python (scripts, tkinter, pygame) | 4 | |
| Développement | PowerShell | 4 | (ajusté par Xav, DETTE-15) |
| Développement | Godot / GDScript | 3 | haTD (prototype jouable, playtesté) + RPG en développement — utilisé sur un projet réel (patch tooltip-rag) |
| Développement | Déploiement / Docker / VPS | 1 | notions, jamais déployé |
| Données | Biostatistique / analyse de données | 1 | hobby passion (DETTE-16) |
| Données | SQL | 2 | notions correctes — requêtes sur bases de hand histories poker (trackers, échantillons de 50 000 à plus d'un million de mains) |
| Humain | Vulgarisation / formation | 4 | autonome sur le contenu pédagogique 1AM et les 6 templates documentés — cohérent avec l'offre « Formation équipe (4D) » du site (patch tooltip-rag) |
| Humain | Langues : Français / English | 5 | badge chiffré depuis le 17/09 (patch 9b), inclus dans le radar Humain |

*Modifications de valeur : Spec-driven 5→6 (patch skills-7niveaux) ; RAG déplacée vers No-code / automatisation, Godot 2→3, Vulgarisation 3→4 (patch tooltip-rag, §2 et §3 validés par Xav). Les autres lignes sont recopiées de `skills.ts` tel qu'il est réellement au 2026-09-17.*

**Effet de bord radar (patch tooltip-rag §2)** — recalculé sur `skills.ts` tel qu'il est réellement (le patch citait un calcul basé sur une version de `skills.ts` antérieure à « Autres LLM » et « Conception de workflows », déjà signalée obsolète par le patch skills-7niveaux) : l'axe « LLMs & agents » passe de **3,5 à 4,0** (5+4+4+3+1 → 5+4+4+3, RAG retirée). L'axe « No-code / automatisation » ne « reste » pas à 1,0 comme l'affirmait le patch — cette famille avait déjà « Conception de workflows » à 5 depuis le patch précédent — il **descend de 3,0 à 2,5** (1+5 → 1+5+1, moyenne 2,33 arrondie à 2,5). Décision de Xav en connaissance de cause (§2 et §3 validés explicitement) ; les deux mouvements sont à ne pas « corriger » plus tard en les prenant pour une régression.

*(Éthologie retirée : hors sujet sur ce site, réponse DETTE-16.)*

Radar : un axe par famille, valeur = moyenne des `min(level, 5)` de la famille (arrondi 0,5). Le radar mesure la maîtrise pratique et **reste sur 5** : un 6 ou un 7 y vaut 5. Le graphique ne change donc pas avec ce patch.

### Parcours (`src/content/timeline.ts`)
```ts
export type Milestone = { id: string; period: string; title: string; summary: string; kind: 'formation'|'experience'|'projet'|'pivot'; dateKnown: boolean };
```
Entrées V1 (DETTE-17 : le parcours antérieur — études, coaching, Camargue, deux-roues, poker — reste à la discrétion de Xav et **n'est pas affiché** ; la frise V1 ne couvre que la trajectoire IA/dev, dates connues). Dates réelles tranchées par Xav le 2026-09-15 23:00 (patch, §A ; DETTE-12 étendue à tous les jalons), ordre chronologique par date de début :
- haTD → RPG-monde — `projet` (`01/08 – 07/09/2026`, `dateKnown:true`)
- Régie Maison — premier projet livré — `projet` (`28/08 – 01/09/2026`, `dateKnown:true`)
- Bilan de compétences France Travail — `formation` (`05/09/2026`, `dateKnown:true`)
- miniCiel / kit USB (avec SafeFolder) — clé achevée et testée — `projet` (`07/09/2026`, `dateKnown:true`)
- Pivot : consultant indépendant, "Consultant outils et solutions IA" — `pivot` (`10/09/2026`, `dateKnown:true`)
- Bibliothèque de templates de spec, en phase de test — `projet` (`Depuis le 14/09/2026`, `dateKnown:true`)
- Portfolio v2 — `projet` (`15/09/2026`, `dateKnown:true`)

Une frise courte et datée vaut mieux qu'une frise longue et floue. Le composant doit rester prêt à accueillir des jalons antérieurs si Xav en ajoute plus tard.

## 3. Comportement attendu
- Deux colonnes desktop : radar (Recharts `RadarChart`, stylé tokens, tooltip verre) à gauche ; à droite les badges groupés par famille. Mobile : radar puis badges.
- Survol/tap d'une **famille** sur le radar → les badges de la famille s'illuminent (`glow`) ; survol d'un badge → il s'agrandit légèrement, affiche "Niveau X/7 — libellé" + `note` (libellé depuis `LEVEL_SCALE`), et son axe se met en surbrillance sur le radar (état partagé `activeFamily`).
- Légende des 7 niveaux toujours visible (petite, sous le radar), générée depuis `LEVEL_SCALE` ; les niveaux 6 et 7 sont visuellement distingués (séparateur ou teinte) pour signaler qu'il s'agit de paliers de preuve. Micro-ligne sous le radar : « Radar sur 5 (maîtrise pratique). Niveaux 6–7 = mise en production et architecture — voir Positionnement. »
- Bandeau "Positionnement" sous la légende, hors radar : 7 pastilles IA1→IA7 générées depuis `POSITIONING`. `acquis` = pastille pleine ; `en cours` = demi-pleine ; `cible` = contour. Survol/tap d'une pastille → rôle + `note`. Une seule `note` affichée pour le bloc IA1–IA5 (celle d'IA5), afin d'éviter cinq tooltips redondants. Micro-ligne : `POSITIONING_DISCLAIMER`. Pas de chiffre, pas de pourcentage, pas de barre de progression : ce n'est pas un score.
- Timeline verticale (mobile) / horizontale alternée (desktop) : ligne dégradée bleu→violet qui se "dessine" au scroll (`pathLength` lié à `useScroll`), jalons qui apparaissent en stagger. `dateKnown:false` → période affichée "—" avec un point discret, jamais une date inventée.

## 4. Edge cases à gérer
- Famille avec un seul skill : le radar reste valide (min 3 axes garantis par les données).
- Une famille avec un skill à 1 ne fait pas l'objet d'un lissage artificiel : le radar l'affiche tel quel — c'est voulu (honnêteté du positionnement).
- Recharts sur mobile étroit : radar min 260 px, labels abrégés si < 400 px.
- Reduced-motion : ligne dessinée d'emblée, pas de stagger.
- Bulle de badge : rendue en portail (`PortalTooltip`, fix `f856c54`), jamais en `absolute` dans la carte — la carte ne coupe jamais ses bulles (pas d'`overflow` sur la carte) et le portail échappe aussi au contexte d'empilement qu'un `transform` de reveal laisserait dessus une fois l'animation terminée. Les libellés longs plient via `min-w-0` + `break-words`, sans avoir besoin d'`overflow-hidden` sur la carte.
- Un badge à 6 ou 7 dans une famille dont le radar est déjà à 5 : pas de dépassement du radar (clamp), mais le badge affiche bien 6/7 ou 7/7.
- `POSITIONING` avec 0 palier `en cours` ou `cible` : le bandeau reste valide (tout plein). Avec un palier `acquis` après un `en cours` : autorisé (l'échelle n'est pas strictement linéaire, cf. Positionnement §3), ne pas "corriger" l'ordre.
- Contenu édité à la main : `skills.test.ts` vérifie que chaque `level` ∈ 1..7, que chaque famille a ≥ 1 skill, que `POSITIONING` a exactement 7 entrées IA1→IA7 dans l'ordre, et que le radar ne dépasse jamais 5.
- Libellé de badge long : passe à la ligne dans le badge, ne sort jamais de la carte ; section plus haute qu'un écran : reveal par bloc, seuil ≤ 0,1.

## 5. Structure des fichiers
```
src/sections/Skills.tsx
src/components/skills/SkillRadar.tsx
src/components/skills/SkillBadges.tsx
src/components/skills/Timeline.tsx
src/content/skills.ts
src/content/timeline.ts
```

## 6. Consignes d'autonomie pour Claude Code
- Recharts autorisé (léger, déjà éprouvé) ; ne pas ajouter d3 en plus.
- Ne pas gonfler les niveaux : un "1 notions" affiché honnêtement vaut mieux qu'un 3 gonflé (positionnement de Xav).
- Ne pas inventer de dates : `dateKnown:false` reste supporté pour les futurs jalons ; en V1 tous les jalons sont datés.
- Les niveaux 6 et 7 se justifient par un livrable (chose mise en prod, système supervisé, méthode transmise), jamais par un ressenti. En cas de doute sur un 6/7, laisser 5 et poser un [ARRÊT XAV].
- Ne pas déduire `POSITIONING` des badges ni l'inverse : ce sont deux jeux de données édités séparément par Xav.

## 7. Critères de validation
1. Radar lisible à 375 px, 6 axes étiquetés.
2. Survol badge ↔ axe synchronisés ; tap fonctionne sur mobile.
3. Timeline : la ligne se dessine au scroll, 7 jalons, aucun jalon personnel (Camargue, coaching, poker…) n'apparaît.
4. **[ARRÊT XAV]** : validation des niveaux et des jalons.
5. Badge Spec-driven affiche « Niveau 6/7 — Mis en production » ; le radar Méthode IA affiche la même valeur qu'avant le patch (aucun axe du radar ne bouge).
6. Bandeau Positionnement : IA1–IA5 pleines, IA6 et IA7 demi-pleines, disclaimer visible, lisible à 375 px.
7. `npm run test` / `lint` / `build` verts.

## 8. Hors scope
Export du radar en image, comparaison "avant/après formation". Calcul automatique du positionnement à partir des badges ; historisation des changements de niveau (le "tri automatique des sorties Claude" évoqué par Xav est un chantier séparé, à spécifier le moment venu).
