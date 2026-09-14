# Portfolio v2 — SPEC : Prompt Playground (Phase 3)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md`, `TEMPLATES_SPEC.md` (les 6 templates réels de Xav — **source du contenu "expert"**), `GlassCard`, `TypingText`, `SectionShell`.

## 1. Rôle du module
Preuve instantanée d'expertise : le visiteur voit un prompt médiocre devenir un prompt structuré selon la *vraie* méthode de Xav (templates de spec, discipline de scope, critères de validation), et compare les sorties. Le "scanner" est un effet visuel ; la valeur est dans le contenu.

## 2. Entrées / Sorties

### Contenu (`src/content/playground.ts`)
```ts
export type PlaygroundCase = {
  id: string; label: string;
  rawPrompt: string;               // médiocre, réaliste
  expertPrompt: string;            // structuré (objectif, contexte, contraintes, format, critère de validation)
  rawOutput: string;               // résultat plausible du prompt brut (court, générique)
  expertOutput: string;            // résultat du prompt expert (court, précis)
  annotations: { anchor: string; note: string }[];  // segments du prompt expert à surligner + explication
};
```
4 cas V1 (textes à finaliser par Xav **[DETTE-09]**, l'agent rédige une première version fidèle à l'esprit) :

| id | Label | Angle expert |
|---|---|---|
| `email` | Rédaction d'un email client délicat | Contexte + objectif + ton + ce qu'il ne faut PAS dire + format |
| `rapport` | Analyse d'un rapport / compte-rendu | Rôle, structure de sortie imposée, "ne rien inventer, signaler les manques" |
| `bug` | Corriger un bug logiciel | Reprend le **Template 3 — Session Diagnostic** : hypothèses A/B, méthode, cause racine avant patch, hors scope |
| `feature` | Ajouter une fonctionnalité | Reprend le **Template 2 — Module Standard** : entrées/sorties, edge cases, critères de validation |

Les deux derniers cas doivent citer explicitement "Extrait de ma bibliothèque de templates de spec" — c'est l'angle différenciant de Xav.

## 3. Comportement attendu
- Sélecteur de cas : `<select>` natif stylé (mobile-friendly) ou segmented control.
- Zone principale : deux panneaux "Prompt brut" (gauche/haut) et "Prompt expert" (droite/bas) en `GlassCard`, présentation type éditeur (fonte mono, numéros de ligne discrets).
- Bouton "Optimiser le prompt" (`NeonButton`, icône `Sparkles`) → **animation scanner** : une ligne lumineuse (dégradé bleu→violet) traverse le panneau brut de haut en bas (600 ms), le texte brut se "dissout" (opacité + blur), le prompt expert apparaît par `TypingText` accéléré (8 ms/char) dans le panneau droit avec ses `annotations` surlignées progressivement.
- Onglets sous les panneaux : "Résultat avant" / "Résultat après" (`layoutId` sur l'indicateur), contenu en `AnimatePresence`.
- Bouton "Copier le prompt expert" (Clipboard API, feedback "Copié ✓" 1,5 s).
- Survol/tap d'une annotation → tooltip avec la `note`.

## 4. Edge cases à gérer
- Changement de cas pendant l'animation : annulation propre, état réinitialisé.
- Clipboard indisponible (HTTP/permissions) : bouton masqué ou repli "sélectionner le texte".
- Prompts longs (> 40 lignes) : panneaux avec hauteur max + scroll interne, jamais de saut de layout.
- Reduced-motion : pas de scanner, bascule instantanée.

## 5. Structure des fichiers
```
src/sections/PromptPlayground.tsx
src/components/playground/PromptPane.tsx
src/components/playground/ScannerOverlay.tsx
src/components/playground/OutputTabs.tsx
src/content/playground.ts
```

## 6. Consignes d'autonomie pour Claude Code
- Rédiger les 4 cas en s'appuyant sur `TEMPLATES_SPEC.md` ; garder chaque prompt expert ≤ 25 lignes pour rester lisible sur mobile.
- Ne pas ajouter de cas supplémentaires.
- Les "résultats" sont des textes statiques (pas d'appel LLM) — le dire dans une note discrète "Sorties illustratives".

## 7. Critères de validation
1. Les 4 cas se chargent, le scanner joue une fois par clic, le copier fonctionne.
2. Sur mobile, les deux panneaux s'empilent et l'animation reste fluide (pas de jank visible à 60 fps sur un mobile milieu de gamme émulé).
3. Xav relit les 4 prompts experts : ils reflètent sa méthode (checkpoint **[ARRÊT XAV]** avant de clore la phase).

## 8. Hors scope
Génération en direct via API, saisie d'un prompt libre par le visiteur.
