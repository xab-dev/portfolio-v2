# Patches à reporter dans le repo — 2026-09-17 — Échelle de compétences 1→7 + bandeau Positionnement

**Décision Xav (2026-09-17)** : l'échelle des badges passe de 5 à 7 niveaux. Le radar reste sur 5 (maîtrise pratique) ; les niveaux 6 et 7 sont des paliers de *preuve* (mise en production / architecture) qui correspondent approximativement aux paliers IA6 / IA7 de l'échelle du doc Positionnement. Auto-positionnement retenu : **IA1→IA5 acquis, IA6 et IA7 en cours**. Une seule compétence passe à 6 (Spec-driven development). Rien à 7.

Les deux textes (spec 06 et doc Positionnement §3) racontent désormais la même chose. Aucune décision ouverte.

Contenu conçu pour être édité à la main par Xav sans toucher aux composants : tout ce qui est texte (légende, bandeau, notes) vit dans `src/content/skills.ts`.

---

## `specs/06_skills-timeline.md` → révision 2026-09-17

**§1 Rôle du module**
- Remplacer : `des badges qui affichent un niveau précis **avec son statut** (pratique quotidienne / maîtrisé / en consolidation / notions).`
- Par : `des badges qui affichent un niveau précis **avec son statut** sur une échelle de 7 (notions → architecture & supervision) ; le radar, lui, reste sur 5 (maîtrise pratique). Un bandeau "Positionnement" IA1→IA7 situe le profil global, distinct des compétences.`

**§2, bloc TypeScript `Level`**
- Remplacer :
```ts
export type Level = 1|2|3|4|5;   // 1 notions · 2 en apprentissage · 3 en consolidation · 4 maîtrisé · 5 pratique quotidienne
```
- Par :
```ts
export type Level = 1|2|3|4|5|6|7;
// 1 notions · 2 en apprentissage · 3 en consolidation · 4 maîtrisé · 5 pratique quotidienne
// 6 mis en production · 7 architecture & supervision
// Radar : min(level, 5). Les niveaux 6-7 sont des paliers de preuve (≈ IA6 / IA7), pas des ressentis.

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

**§2, phrase d'introduction du tableau**
- Remplacer : `Valeurs V1 — auto-évaluation à valider par Xav **[DETTE-15]** :`
- Par : `Valeurs de référence = \`src/content/skills.ts\` (Xav édite à la main, DETTE-15 close le 2026-09-15). Rappel des valeurs au 2026-09-17, après passage à 7 niveaux :`

**§2, tableau des compétences** — remplacer le tableau entier par :

| Famille | Compétence | Niveau | Note |
|---|---|---|---|
| Méthode IA | Cadre 4D (Délégation/Description/Discernment/Diligence) | 5 | pratique documentée |
| Méthode IA | Spec-driven development (6 templates) | **6** | méthode formalisée et réutilisée sur plusieurs projets — passage à 7 quand elle aura été transmise et appliquée chez un client |
| Méthode IA | Diagnostic structuré / cause racine | 4 | |
| LLMs & agents | Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code | 5 | usage quotidien, choix du modèle selon la tâche |
| LLMs & agents | Prompt engineering | 4 | |
| LLMs & agents | Architecture d'agents (function calling, MCP, orchestration) | 3 | compris, peu mis en prod |
| LLMs & agents | RAG | 1 | notions — à creuser quand un projet le demandera (S2) |
| No-code / automatisation | Make / n8n | 1 | notions (S3) — axe de consolidation IA6 |
| Développement | HTML/JS/CSS (canvas, single-file) | 4 | |
| Développement | Python (scripts, tkinter, pygame) | 4 | |
| Développement | PowerShell | 4 | (ajusté par Xav, DETTE-15) |
| Développement | Godot / GDScript | 2 | cible haTD |
| Développement | Déploiement / Docker / VPS | 1 | notions, jamais déployé |
| Données | Biostatistique / analyse de données | 1 | hobby passion (DETTE-16) |
| Humain | Vulgarisation / formation | 3 | (ajusté par Xav, DETTE-15) |
| Humain | Langues : français natif, anglais très bon | — (badge sans niveau) | DETTE-21 |

*Seule modification de valeur dans ce patch : Spec-driven 5→6. Les autres lignes sont recopiées de `skills.ts` tel que validé le 2026-09-15 (le tableau de la spec était périmé sur PowerShell, Vulgarisation et Biostatistique).*

**§2, ligne Radar**
- Remplacer : `Radar : un axe par famille, valeur = moyenne des niveaux de la famille (arrondi 0,5).`
- Par : `Radar : un axe par famille, valeur = moyenne des \`min(level, 5)\` de la famille (arrondi 0,5). Le radar mesure la maîtrise pratique et **reste sur 5** : un 6 ou un 7 y vaut 5. Le graphique ne change donc pas avec ce patch.`

**§3 Comportement attendu**
- Remplacer : `affiche "Niveau X/5 — libellé" + \`note\``
- Par : `affiche "Niveau X/7 — libellé" + \`note\` (libellé depuis \`LEVEL_SCALE\`)`
- Remplacer : `- Légende des 5 niveaux toujours visible (petite, sous le radar).`
- Par :
```
- Légende des 7 niveaux toujours visible (petite, sous le radar), générée depuis `LEVEL_SCALE` ; les niveaux 6 et 7 sont visuellement distingués (séparateur ou teinte) pour signaler qu'il s'agit de paliers de preuve. Micro-ligne sous le radar : « Radar sur 5 (maîtrise pratique). Niveaux 6–7 = mise en production et architecture — voir Positionnement. »
- Bandeau "Positionnement" sous la légende, hors radar : 7 pastilles IA1→IA7 générées depuis `POSITIONING`. `acquis` = pastille pleine ; `en cours` = demi-pleine ; `cible` = contour. Survol/tap d'une pastille → rôle + `note`. Une seule `note` affichée pour le bloc IA1–IA5 (celle d'IA5), afin d'éviter cinq tooltips redondants. Micro-ligne : `POSITIONING_DISCLAIMER`. Pas de chiffre, pas de pourcentage, pas de barre de progression : ce n'est pas un score.
```

**§4 Edge cases — ajouter :**
```
- Un badge à 6 ou 7 dans une famille dont le radar est déjà à 5 : pas de dépassement du radar (clamp), mais le badge affiche bien 6/7 ou 7/7.
- `POSITIONING` avec 0 palier `en cours` ou `cible` : le bandeau reste valide (tout plein). Avec un palier `acquis` après un `en cours` : autorisé (l'échelle n'est pas strictement linéaire, cf. Positionnement §3), ne pas "corriger" l'ordre.
- Contenu édité à la main : `skills.test.ts` vérifie que chaque `level` ∈ 1..7, que chaque famille a ≥ 1 skill, que `POSITIONING` a exactement 7 entrées IA1→IA7 dans l'ordre, et que le radar ne dépasse jamais 5.
```

**§6 Consignes d'autonomie — ajouter :**
```
- Les niveaux 6 et 7 se justifient par un livrable (chose mise en prod, système supervisé, méthode transmise), jamais par un ressenti. En cas de doute sur un 6/7, laisser 5 et poser un [ARRÊT XAV].
- Ne pas déduire `POSITIONING` des badges ni l'inverse : ce sont deux jeux de données édités séparément par Xav.
```

**§7 Critères de validation — ajouter :**
```
5. Badge Spec-driven affiche « Niveau 6/7 — Mis en production » ; le radar Méthode IA affiche la même valeur qu'avant le patch (aucun axe du radar ne bouge).
6. Bandeau Positionnement : IA1–IA5 pleines, IA6 et IA7 demi-pleines, disclaimer visible, lisible à 375 px.
7. `npm run test` / `lint` / `build` verts.
```

**§8 Hors scope — ajouter :** `Calcul automatique du positionnement à partir des badges ; historisation des changements de niveau (le "tri automatique des sorties Claude" évoqué par Xav est un chantier séparé, à spécifier le moment venu).`

---

## `Positionnement___Consultant_-_Architecte_en_solutions_IA.md` — §3 réaligné

**§3, première phrase**
- Remplacer : `Le profil actuel se situe principalement dans une trajectoire **IA7 — AI Workflow Architect**.`
- Par :
```
Le profil actuel se situe **au niveau IA5 (AI Builder / Vibe Coder), acquis et pratiqué au quotidien**, avec un pied dans les deux paliers suivants :

- **IA6 — Automation Builder** : en cours. Le fonctionnement des automatisations, agents et orchestrateurs est compris et prototypé ; la mise en production reste à faire.
- **IA7 — AI Workflow Architect** : en cours. La conception de systèmes combinant plusieurs outils, modèles et méthodes est déjà pratiquée (spec-driven development, cadre 4D, découpage en composants) ; la supervision d'un système déployé chez un client est l'étape suivante.

La **trajectoire visée** reste IA7. Le positionnement affiché sur le site (section Compétences, bandeau "Positionnement") reprend exactement cette formulation ; toute évolution se fait dans `src/content/skills.ts` puis ici, jamais l'un sans l'autre.
```

**§3, liste "Les compétences déjà développées ou fortement comprises couvrent notamment :"**
- Remplacer l'intro : `Les compétences déjà développées ou fortement comprises couvrent notamment :`
- Par : `Ce qui est acquis (IA1→IA5) ou fortement compris (IA6–IA7) couvre notamment :`
- Dans la liste, remplacer : `- capacité à faire travailler plusieurs IA de manière complémentaire.`
- Par : `- capacité à faire travailler plusieurs IA de manière complémentaire ;\n- formalisation d'une méthode de spec réutilisable (6 templates) pilotant un agent de code — seule pratique déjà au niveau "mise en production" au sens de la grille du site.`

**§3, sous-section "IA6 : automatisation / agents"** — inchangée (elle dit déjà "prochain axe de consolidation, pas un prérequis bloquant"). Ajouter en fin de sous-section :
```
Le même raisonnement vaut pour IA7 : la partie *conception* est acquise, la partie *supervision d'un système en production* ne l'est pas encore. Se dire "IA7" aujourd'hui serait exagéré ; se dire "IA5 avec IA6 et IA7 en cours" est exact et vérifiable.
```

---

## `specs/00_ROADMAP.md` → v0.6.1
- En-tête : ajouter à la liste des révisions `, puis le 2026-09-17 (échelle de compétences 1→7 + bandeau Positionnement, spec 06 révisée — correctif de contenu, pas de nouvelle phase)`.

## `dette_suivi.md` (Xav coche — l'agent n'y touche pas)
- Rien à ouvrir. Note pour Xav : si tu veux tracer les changements de niveau au fil du temps, ouvre une DETTE-32 "historique des niveaux" le jour où ça devient utile — pas avant.

## `JOURNAL_DEV.md` — entrée à ajouter par l'agent après exécution
`2026-09-17 — Skills : échelle 1→7 (radar clampé à 5, graphique inchangé), légende régénérée depuis LEVEL_SCALE, bandeau Positionnement IA1→IA7 depuis POSITIONING, Spec-driven 5→6. Tests étendus (bornes 1..7, 7 paliers ordonnés, radar ≤ 5). Doc Positionnement §3 réaligné.`
