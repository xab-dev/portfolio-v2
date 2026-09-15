# Portfolio v2 — SPEC : Skills Matrix & Timeline (Phase 5)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md`, `Positionnement...md` §2-3 (échelle IA1→IA9, positionnement "trajectoire IA7"), `Fiche_Professionnelle_Xav.md` §Compétences, `topics/tech-skills` (VPS/Docker : notions, jamais déployé). Primitives Phase 0.

## 1. Rôle du module
Rendre les compétences lisibles *et honnêtes* : un radar par famille, des badges qui affichent un niveau précis **avec son statut** (pratique quotidienne / maîtrisé / en consolidation / notions). Et une frise du parcours — sans dates inventées.

## 2. Entrées / Sorties

### Compétences (`src/content/skills.ts`)
```ts
export type Level = 1|2|3|4|5;   // 1 notions · 2 en apprentissage · 3 en consolidation · 4 maîtrisé · 5 pratique quotidienne
export type Skill = { name: string; level: Level; note?: string; family: SkillFamily };
export type SkillFamily = 'Méthode IA' | 'LLMs & agents' | 'No-code / automatisation' | 'Développement' | 'Données' | 'Humain';
```
Valeurs V1 — auto-évaluation à valider par Xav **[DETTE-15]** :

| Famille | Compétence | Niveau | Note |
|---|---|---|---|
| Méthode IA | Cadre 4D (Délégation/Description/Discernment/Diligence) | 5 | pratique documentée |
| Méthode IA | Spec-driven development (6 templates) | 5 | |
| Méthode IA | Diagnostic structuré / cause racine | 4 | |
| LLMs & agents | Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code | 5 | usage quotidien, choix du modèle selon la tâche |
| LLMs & agents | Prompt engineering | 4 | |
| LLMs & agents | Architecture d'agents (function calling, MCP, orchestration) | 3 | compris, peu mis en prod |
| LLMs & agents | RAG | 1 | notions — à creuser quand un projet le demandera (S2) |
| No-code / automatisation | Make / n8n | 1 | notions (S3) — axe de consolidation IA6 |
| Développement | HTML/JS/CSS (canvas, single-file) | 4 | |
| Développement | Python (scripts, tkinter, pygame) | 4 | |
| Développement | PowerShell | 3 | |
| Développement | Godot / GDScript | 2 | cible haTD |
| Développement | Déploiement / Docker / VPS | 1 | notions, jamais déployé |
| Données | Biostatistique / analyse de données | [DETTE-16, en réflexion] | |
| Humain | Vulgarisation / formation | 4 | |
| Humain | Langues : français natif, anglais très bon | — (badge sans niveau) | DETTE-21 |

*(Éthologie retirée : hors sujet sur ce site, réponse DETTE-16.)*

Radar : un axe par famille, valeur = moyenne des niveaux de la famille (arrondi 0,5).

### Parcours (`src/content/timeline.ts`)
```ts
export type Milestone = { id: string; period: string; title: string; summary: string; kind: 'formation'|'experience'|'projet'|'pivot'; dateKnown: boolean };
```
Entrées V1 (DETTE-17 : le parcours antérieur — études, coaching, Camargue, deux-roues, poker — reste à la discrétion de Xav et **n'est pas affiché** ; la frise V1 ne couvre que la trajectoire IA/dev, dates connues) :
- Régie Maison — premier projet — `projet` (01/09/2026, `dateKnown:true`)
- Développement de jeu : haTD prototype → RPG-monde — `projet` (2026)
- Bibliothèque de templates de spec — `projet` (2026)
- miniCiel / kit USB (avec SafeFolder) — clé achevée et testée — `projet` (2026)
- Bilan de compétences France Travail — `formation` (2026)
- Pivot : consultant indépendant, "Consultant outils et solutions IA" — `pivot` (09/2026)
- Portfolio v2 — `projet` (09/2026)

Une frise courte et datée vaut mieux qu'une frise longue et floue. Le composant doit rester prêt à accueillir des jalons antérieurs si Xav en ajoute plus tard.

## 3. Comportement attendu
- Deux colonnes desktop : radar (Recharts `RadarChart`, stylé tokens, tooltip verre) à gauche ; à droite les badges groupés par famille. Mobile : radar puis badges.
- Survol/tap d'une **famille** sur le radar → les badges de la famille s'illuminent (`glow`) ; survol d'un badge → il s'agrandit légèrement, affiche "Niveau X/5 — libellé" + `note`, et son axe se met en surbrillance sur le radar (état partagé `activeFamily`).
- Légende des 5 niveaux toujours visible (petite, sous le radar).
- Timeline verticale (mobile) / horizontale alternée (desktop) : ligne dégradée bleu→violet qui se "dessine" au scroll (`pathLength` lié à `useScroll`), jalons qui apparaissent en stagger. `dateKnown:false` → période affichée "—" avec un point discret, jamais une date inventée.

## 4. Edge cases à gérer
- Famille avec un seul skill : le radar reste valide (min 3 axes garantis par les données).
- Famille "No-code / automatisation" n'a qu'un skill à 1 : le radar l'affiche tel quel, sans lissage — c'est voulu (honnêteté du positionnement).
- Recharts sur mobile étroit : radar min 260 px, labels abrégés si < 400 px.
- Reduced-motion : ligne dessinée d'emblée, pas de stagger.
- Tooltip de badge chevauchant la carte suivante : la carte survolée/focalisée passe au-dessus de ses sœurs (fix `f856c54`). Règle de primitive : un élément qui déborde de sa carte (tooltip, menu) doit soit remonter le `z-index` de la carte au survol/focus, soit être rendu en portail.

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

## 7. Critères de validation
1. Radar lisible à 375 px, 6 axes étiquetés.
2. Survol badge ↔ axe synchronisés ; tap fonctionne sur mobile.
3. Timeline : la ligne se dessine au scroll, 7 jalons, aucun jalon personnel (Camargue, coaching, poker…) n'apparaît.
4. **[ARRÊT XAV]** : validation des niveaux et des jalons.

## 8. Hors scope
Export du radar en image, comparaison "avant/après formation".
