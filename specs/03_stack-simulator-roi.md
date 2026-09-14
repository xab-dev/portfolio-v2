# Portfolio v2 — SPEC : IA Stack Simulator & ROI (Phase 2)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (**T6 est la règle cardinale de cette phase**), `AnimatedCounter`, `GlassCard`, `Tag`, `SectionShell`.

## 1. Rôle du module
Montrer la *méthode* de Xav en action : le client coche ses problématiques, la page propose une stack **et explique pourquoi** — y compris quand la réponse est "pas d'IA ici". Les compteurs sont un support de conversation, pas une promesse. Sans cet étiquetage, ce module devient une tromperie et contredit le positionnement.

## 2. Entrées / Sorties

### Contenu (`src/content/simulator.ts`)
```ts
export type Problem = {
  id: string; label: string; icon: LucideIcon; description: string;
  timeSavedPct: [number, number];       // fourchette indicative
  weeklyHoursBaseline: number;          // heures/semaine typiques passées sur la tâche (hypothèse affichée)
  stack: StackItem[];                   // briques recommandées
  humanControl: string;                 // ce qui reste sous validation humaine (obligatoire)
  aiNotNeededIf?: string;               // condition où l'IA n'est pas le bon outil
};
export type StackItem = { name: string; role: 'orchestration'|'llm'|'memoire'|'interface'|'controle'; why: string };
```

Problématiques V1 (6) — valeurs à ajuster par Xav **[DETTE-07]** :

| id | Label | timeSaved | baseline h/sem | Stack | Contrôle humain |
|---|---|---|---|---|---|
| `support` | Support client saturé | 30-50 % | 15 | Make (orchestration) + Claude (LLM) + base de connaissances FAQ (mémoire) + boîte mail existante (interface) | Toute réponse engageante (remboursement, litige) validée par un humain |
| `contenu` | Création de contenu manuelle | 40-60 % | 8 | Claude + templates de prompts (méthode Xav) + Notion/Docs | Relecture systématique, aucune publication automatique |
| `saisie` | Saisie de données lourde | 50-70 % | 10 | Make/n8n + OCR + Claude (extraction structurée) + tableur/CRM | Contrôle par échantillonnage + règles de validation |
| `reporting` | Reporting hebdo chronophage | 30-50 % | 4 | Script Python + Claude (synthèse) + envoi automatique | Lecture avant diffusion |
| `tri` | Tri/priorisation de demandes | 20-40 % | 6 | Claude (classification) + tableau de suivi | Seuil de confiance : sous le seuil → humain |
| `formation` | Équipe qui utilise mal l'IA | n/a (compteur masqué) | — | Formation 4D + templates + charte d'usage | — |

`aiNotNeededIf` exemples : support → "Moins de 20 tickets/semaine : une FAQ bien faite suffit." ; saisie → "Données déjà structurées à la source : corriger le formulaire d'entrée d'abord."

### Sorties calculées
```
heuresGagneesSemaine = Σ baseline_i × moyenne(timeSaved_i)
heuresGagneesAn      = heuresGagneesSemaine × 46
tempsGagnePct        = Σ(baseline_i × moy_i) / Σ baseline_i          (moyenne pondérée)
valeurIndicativeAn   = heuresGagneesAn × tauxHoraire (curseur, défaut 35 €/h [DETTE-08])
```
La stack recommandée = union dédupliquée des `stack[]`, groupée par `role`, ordre : orchestration → llm → mémoire → interface → contrôle. Le rôle `contrôle` apparaît **toujours** ("Validation humaine") même si un seul problème est coché.

## 3. Comportement attendu
- Layout dashboard : à gauche (ou en haut mobile) la grille de problématiques (`Tag` cochables avec icône) ; à droite le panneau résultat en `GlassCard glow="emerald"`.
- Rien de coché → panneau affiche "Cochez une problématique" + une phrase de méthode ("On commence toujours par le problème").
- À chaque changement : la stack se recompose avec `AnimatePresence` (items entrants/sortants animés, `layout`), les 3 compteurs (`AnimatedCounter`) rejouent depuis leur valeur précédente (pas depuis 0).
- Curseur "taux horaire" (20-120 €) sous les compteurs, avec la formule affichée en clair sous forme de ligne : "10 h/sem × 46 sem × 35 €/h".
- Bandeau permanent sous le panneau, non masquable : **"Estimation indicative, calculée à partir d'hypothèses affichées. Un chiffrage réel se fait après diagnostic sur site."**
- Chaque brique de stack a un tooltip/expansion `why` ; chaque problématique cochée expose son `aiNotNeededIf` dans un encart "Quand ce n'est pas la bonne réponse".
- Bouton "Discuter de cette stack" → scroll vers Contact **et** pré-remplit le type de projet (Phase 6 lit `sessionStorage['simulator']`).

## 4. Edge cases à gérer
- `formation` seule cochée : compteurs masqués, panneau explique que le gain est qualitatif.
- 6 problématiques cochées : `tempsGagnePct` reste une moyenne pondérée (jamais > max des fourchettes), la stack ne dépasse pas ~8 briques (dédup).
- Curseur à une extrémité : valeur affichée cohérente, pas de NaN.
- Reduced-motion : compteurs instantanés, pas de layout animation.

## 5. Structure des fichiers
```
src/sections/StackSimulator.tsx
src/components/simulator/ProblemGrid.tsx
src/components/simulator/StackPanel.tsx
src/components/simulator/RoiCounters.tsx
src/lib/simulator/compute.ts      (fonctions pures, testées)
src/content/simulator.ts
```

## 6. Consignes d'autonomie pour Claude Code
- `compute.ts` = fonctions pures sans React, avec tests Vitest (3 cas : vide, un seul, tous).
- Ne pas "arrondir vers le haut" pour faire joli. Ne pas ajouter de problématique non listée.
- Nommer les modèles génériquement ("Claude", pas un numéro de version qui sera périmé dans 6 mois).

## 7. Critères de validation
1. Tests `compute.ts` verts.
2. Cocher `support` + `saisie` → stack contient Make, Claude, OCR, mémoire, "Validation humaine" ; compteurs cohérents avec la formule affichée (vérifier à la main un cas).
3. Le bandeau "Estimation indicative" est visible à 375 px sans scroll interne.
4. Décocher tout → retour à l'état vide sans erreur console.

## 8. Hors scope
Export PDF du résultat, sauvegarde, envoi par email (à envisager après un premier client réel).
