---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, premier ajout : le widget Orchestriya (spec 18)
type: spec
version: 1.0.0
statut: exécutée le 2026-11-02 — ARRÊT XAV : écouter le résultat (le son n'est pas vérifiable par l'agent), relire les textes du panneau
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : le widget Orchestriya dans le Hero (Phase 11, premier ajout)

## 1. La demande

Xav, le 2026-11-02 : « Orchestriya, qui va venir au début du site. […] il faudrait en faire un widget qui prend la place de l'ancien agent scripté dans la colonne à droite du héros. Dans ce widget, mon intention est de donner la possibilité aux visiteurs du site de lancer la musique, lancer le break et changer les nuances, la progression. Il faut ajouter un bouton de gestion du volume. Tu peux travailler directement dans le dépôt local et y ajouter un dossier widget. […] si tu vois une meilleure méthode je te laisse faire preuve de diligence. »

Orchestriya (`07_Dev_en_cours/Orchestriya`, dépôt privé, version 0.2) : maquette d'orchestre drum and bass à 160 BPM, synthétisée avec la Web Audio API dans un seul `index.html` (CSS, HTML, un script ES5 en IIFE, zéro dépendance), dirigée au clavier, à la souris et à la manette. Les règles de son `CLAUDE.md` : tout reste pilotable au clavier seul dans la page ; pas de framework ni de build tant que ça tient dans un fichier ; si le découpage devient nécessaire, modules ES natifs avant tout bundler.

## 2. La méthode retenue

Trois voies étaient possibles. **Une iframe** de la page entière : simple, mais la page (grille 5 × 16, console, partition, légende) ne tient pas dans une colonne de 45 %, capture le clavier et jure avec le site. **Réécrire le moteur en TypeScript dans le portfolio** : deux moteurs qui divergent dès la première retouche de son. **Extraire le moteur en module ES sans DOM dans le dépôt d'Orchestriya, et le copier dans le portfolio** : c'est la voie prise, et c'est le moment que le `CLAUDE.md` d'Orchestriya prévoyait (« passer à des modules ES natifs »).

### Côté Orchestriya (`widget/`)

- `widget/orchestriya-engine.js` : constantes, état, motifs, graphe audio, les onze voix, séquenceur et actions repris **mot pour mot** de `index.html`. Les rendus (`say`, `render*`, `applyUI`) deviennent trois rappels : `onMessage(texte)`, `onChange(etat)`, `onStep(ev)`. Les textes qui citaient une touche (« Espace pour le drop ») sont neutralisés. Ajouts : `setVolume(0..1)` (gain `vol` entre le maître et la sortie, conservé à l'arrêt et à la relance), `dispose()`, `opts.AudioContext` pour les tests, `pump()` pour un hôte sans `requestAnimationFrame`.
- `widget/package.json` (`"type": "module"`), `widget/README.md` (ce qui change, l'API, la règle de cohérence).
- `tests/widget.test.js` : même faux `AudioContext` que le harnais de la page, session complète par l'API ; `npm test` enchaîne les deux.
- `CLAUDE.md`, `README.md`, `docs/ROADMAP.md` : le son vit à deux endroits tant que la page n'importe pas le module ; c'est la première ligne de la feuille de route.
- Rien n'est poussé : le dépôt d'Orchestriya a un workflow Pages, Xav pousse lui-même.

### Côté portfolio

- `scripts/sync-orchestriya.js` (`npm run orchestriya:sync`) copie le module dans `src/lib/orchestriya/engine.js` et écrit `SOURCE.md` (chemin, commit d'Orchestriya, date, copie de travail propre ou non). Une copie versionnée plutôt qu'une dépendance : le dépôt source est privé et local, le site se reconstruit sans lui.
- `src/lib/orchestriya/engine.d.ts` : les types du module. `engine.js` est exclu du lint (il est à Orchestriya) ; `engine.test.ts` rejoue une session sur la copie (6 tests).
- `src/content/orchestriya.ts` : tous les textes du panneau.
- `src/components/orchestriya/OrchestriyaWidget.tsx`, dans la colonne droite du Hero (grille 55 % / 45 % rétablie).

## 3. Le widget

| Demande de Xav | Dans le panneau |
|---|---|
| lancer la musique | bouton « Lancer » / « Arrêter » (`aria-pressed`) |
| lancer le break | pastille de phase (Break / Drop) et bouton d'action « Passer au drop » / « Revenir au break » / « Annuler » ; la note « … à la mesure suivante » pendant l'attente |
| changer les nuances | cinq boutons pp · p · mf · f · ff (`aria-pressed`, nom long pour les lecteurs d'écran) |
| changer la progression | ◀ nom ▶ (Sombre, Andalouse, Cinéma), les quatre accords dessous, « au prochain accord » pendant l'attente |
| bouton de volume | curseur 0 – 100 % et bouton muet ; valeur mémorisée dans le navigateur du visiteur (`localStorage`, clé `orchestriya:volume`, défaut 75 %) |

En plus : une ligne de seize traits qui suit la double-croche en cours (bleu en break, violet en drop) ; la dernière phrase du moteur dans une zone `role="status"` ; un texte d'introduction, un conseil pendant le jeu, une ligne de crédit à l'arrêt.

Règles :
- **Le moteur n'est chargé qu'au premier geste** (import dynamique, chunk séparé de 13,5 Ko) : le bundle initial ne grossit pas, et le son ne peut de toute façon démarrer qu'après un geste du visiteur (règle d'autoplay). Un contexte suspendu par le navigateur est relancé à chaque action (`resume()`).
- **Aucune touche globale n'est capturée** : la page défile normalement ; tout passe par des boutons focusables. La version complète au clavier, à la souris et à la manette reste la page d'Orchestriya.
- Le widget est démonté avec le Hero : `dispose()` arrête et ferme le contexte audio.
- Mouvement réduit : les traits de la mesure changent sans transition. Mode allégé : rien de particulier, le panneau est déjà léger.
- Pas de lien vers Orchestriya : le dépôt est privé et la page n'est pas publiée. Une fiche projet viendra dans la grille des projets quand Xav le décidera.

## 4. Vérification

- Orchestriya : `npm test` vert (harnais de la page : 2 898 oscillateurs ; module : 553 pas livrés, 2 contextes ouverts et fermés).
- Portfolio : `tsc -b`, `oxlint` (0 remarque), 142 tests (136 + 6), `npm run build` : chunk `engine` séparé, bundle principal 409 → 419 Ko.
- Rendu dans Chrome sur `vite preview` : voir le journal du 2026-11-02.
- **Non vérifiable par l'agent : le son.** Le faux `AudioContext` attrape les erreurs Web Audio, pas la musique. Première écoute par Xav.

## 5. Hors scope

Tempo, brillance, pupitres, roulement, cymbale, solo de piano : exposés par le module, pas dans le panneau (Xav n'a demandé que lancer, break, nuances, progression, volume). La migration de `index.html` vers le module (feuille de route d'Orchestriya). La fiche projet Orchestriya dans la grille.

## 6. ARRÊT XAV

Écouter le widget en ligne ou en `npm run dev` : lancement, drop, les cinq nuances, les trois progressions, le volume et le muet. Relire les textes de `src/content/orchestriya.ts`. Dire si le panneau doit en montrer plus (tempo, pupitres) ou moins.
