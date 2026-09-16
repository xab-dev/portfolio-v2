# Journal de développement — Portfolio v2

Journal tenu par l'agent (Claude Code). Une entrée par session, la plus récente en haut.

---

## 2026-09-16 — Phase 9 : FAQ « Comment ce site a été créé ? » (`10_faq-comment-ce-site.md`) — ARRÊT XAV posé

Session ouverte sur `specs/00_ROADMAP.md` puis `specs/10_faq-comment-ce-site.md` (contenu déjà validé par Xav le 16/09, 12:12→13:30). Phase 8 déjà committée (`ca5fdd2`) au moment d'ouvrir cette session. Rien n'a été committé dans cette session.

### Décisions prises et pourquoi

- **Contenu d'abord, tests verts avant tout composant** (§6) : `src/content/faq.ts` + `faq.test.ts` écrits et vérifiés en premier (7 tests), avant `FaqTrigger`/`FaqModal`.
- **Espaces insécables (U+00A0) recopiées par transformation programmatique, pas à la main.** Le fichier `10_faq-comment-ce-site.md` lui-même ne contient aucun caractère U+00A0 (vérifié par balayage — la consigne « espaces insécables comprises » décrit une règle typographique à appliquer, pas un caractère déjà présent dans le Markdown source). Généré un script Node qui insère un U+00A0 avant chaque occurrence de `?`, `:`, `»`, `%` dans les 6 réponses et les libellés `faqUi`, puis vérifié par relecture du fichier produit (comptage de U+00A0, longueurs de bulles, absence de `%` hors `creation`) avant de l'écrire dans `src/content/faq.ts` — cohérent avec la convention déjà utilisée dans `agent.ts`/`contact.ts` (NBSP avant `%`, `€`, `?`).
- **`AgentMessage` étendu d'une prop optionnelle `speedMs`** (rétrocompatible, transmise à `TypingText` qui a déjà son propre défaut) plutôt que dupliqué, pour que la FAQ tape à 6 ms/caractère (spec) sans changer la vitesse de l'agent de poche existant (18 ms, `AgentPanel` ne passe pas la prop).
- **`SectionShell.headerAction` en positionnement `relative`/`absolute`, pas en item flex à côté du titre.** Premier essai (item flex avec `min-w-0 flex-1` sur le titre) : le bouton forçait le titre de Jouer à se réenrouler sur une ligne de moins de large, donc à passer de 1 à 2 lignes, donc à décaler tout le contenu sous l'en-tête (sous-titre, lien, iframe) — repéré par le diff pixel §7.1 (20 % de pixels différents dans Jouer au lieu de la seule zone du bouton attendue). Corrigé en gardant le `<h2>` strictement identique (même classes, même boîte, même retour à la ligne qu'avant la phase) et en positionnant l'action en `absolute right-0 top-0` d'un conteneur `relative` : le titre de Jouer ne remplit pas toute la largeur du conteneur sur sa première ligne (810 px de texte pour 1024 px de conteneur), l'action flotte dans l'espace déjà vide sans toucher au flux du texte. Revérifié : diff pixel confiné à la zone du bouton (~4 260 px sur les lignes 208-247) après correction, 0 px sur le sous-titre/lien.
- **Deep link `#faq` par `history.replaceState`, pas `window.location.hash =`.** Le pattern existant (`Portfolio.tsx`, deep link `#projets/<id>`) utilise `window.location.hash =`, qui pousse une entrée d'historique — exactement ce que l'edge case §4 de la spec 10 interdit pour la FAQ ("n'ajoute pas d'entrée d'historique"). Implémenté séparément dans `Play.tsx` avec `window.history.replaceState(null, "", "#faq" | "#jouer")` + état React synchronisé à la main (une `replaceState` ne déclenche pas `hashchange`).
- **`isFaqRoute` exige `param === null`** (pas seulement `section === "faq"`) : traduit directement l'edge case §4 ("`#faq/x` … ignoré") sans branche supplémentaire, `readHashRoute` renvoyant déjà `param` à `null` en l'absence de `/`.
- **Skip (« Tout afficher ») implémenté comme un saut d'état (`revealCount` → longueur totale), pas comme une prop sur `TypingText`.** `TypingText` gère déjà l'instantané via `useReducedMotionSafe` en interne ; ajouter un second mécanisme de saut aurait dupliqué cette logique. `FaqModal` bascule simplement l'étape à `"done"` : les bulles déjà en cours de frappe et celles pas encore commencées se rendent alors toutes en texte complet (`typing={false}`) au rendu suivant.
- **Priorité visuelle des 2 questions `priority` = accent permanent (`active` toujours vrai), indépendant de la sélection en cours.** Relecture littérale du §3 ("les 2 questions priority en premier, style actif/accentué") : l'accent marque l'importance des deux questions, pas la question en cours de réponse (que la conversation affichée rend déjà évidente).

### Bug trouvé et corrigé en cours de session (cause racine, pas de contournement)

**En-tête de Jouer : ajout du bouton FAQ décalait tout le contenu de la section vers le bas.** Décrit ci-dessus (décisions). Trouvé par le diff pixel du critère §7.1 lui-même (20,2 % de pixels différents dans une capture pleine page de Jouer, très au-dessus du bruit d'iframe attendu), pas par relecture de code — la cause (retour à la ligne du titre) n'était pas visible sans mesurer la hauteur réelle du bloc de titre avant/après.

### Preuves des critères §7.1 à §7.4 (Claude in Chrome, `vite preview` port 4321)

**§7.1 — diff pixel 1280 px (méthode Phase 6b : `git stash -u` → build → capture "avant" → `git stash pop` → build → capture "après", `sharp`, tolérance 3/255).** Vérification DOM préalable : les 6 sections sans `headerAction` ont un `<h2>` et un conteneur parent strictement identiques (mêmes classes, comparé avant/après par script) — aucune n'a été touchée par la branche conditionnelle de `SectionShell`. Diff pixel réel exécuté sur Hero et Jouer (les deux seules sections dont un fichier modifié cette session dépend — `AgentMessage`/`TypingText` pour Hero, `headerAction` pour Jouer) :
- **Hero** : 8 081 / 946 736 px (0,85 %), concentrés lignes 80-503 — même ordre de grandeur que le bruit documenté en Phase 6b pour la boucle infinie `HeroGlow` (~4 157-4 185 px **sans aucun changement de code**) ; `AgentMessage`/`TypingText` n'ont reçu qu'une prop optionnelle non utilisée par `AgentPanel`, donc rendu inchangé pour ce composant.
- **Jouer** : 21 969 / 946 736 px (2,32 %) sur la capture pleine page. Décomposé ligne par ligne : **0 px** entre les lignes 260 et 395 (sous-titre + lien "Voir la fiche projet", zone qui aurait bougé si le bug de décalage n'avait pas été corrigé) ; 4 260 px sur les lignes 208-247 (zone du bouton, correspond à son empreinte ~219×34 px) ; le reste (lignes ≥ 395) dans le cadre de l'iframe haTD, qui joue son cold-open de façon autonome et indépendante entre les deux captures — même explication qu'en Phase 6b pour ce même cadre.
- Bundle final : `index-0b02oJJ5.js` 450,17 Ko / gzip 145,72 Ko contre `index-DWM7KSvJ.js` 440,04 Ko / gzip 142,22 Ko avant la phase (bundle identique au bundle déployé en Phase 8, vérifié par hash) — écart gzip **+3,50 Ko**, sous le budget de 5 Ko attendu par §7.7 ; FAQ chargée avec `Play` dans le chunk initial, aucun chunk supplémentaire créé.

**§7.2 — parcours complet à l'écran.** 1280 px et ~500 px (375 px non atteignable par l'outil de cette session — même limite déjà documentée aux phases précédentes) : clic bouton → Modal → clic « Comment ce site a été créé ? » → bulles tapées une à une, tags désactivés pendant la frappe → clic « Tout afficher » sur une autre question (`workflow`) : bascule instantanée, tags réactivés → texte final du DOM comparé par empreinte (longueur + hash) à `faq.ts`, **identique caractère pour caractère espaces insécables comprises** sur les 11 bulles de la réponse `creation` (intro + question + 9 paragraphes) → clic « Autre question » : conversation réinitialisée, tags réactivés → Échap : `hash` repassé à `#jouer` par `replaceState`, focus revenu sur le bouton déclencheur (vérifié `document.activeElement`, cas où la Modal avait été ouverte par un vrai clic).

**§7.3 — deep link `#faq`.** Navigation directe vers `.../#faq` : Modal ouverte dès le chargement. `#faq/x` : `isFaqRoute` renvoie faux (param non nul), Modal fermée — vérifié par lecture du code (`readHashRoute`/`isFaqRoute`), cas identique à l'edge case déjà couvert par la même fonction pour `#projets/<id>`.

**§7.4 — modes.** `?perf=lite` : clic direct sur une puce → toutes les bulles apparaissent d'un coup, aucun indicateur « … », bouton `skip` absent du DOM, `getComputedStyle` sur le dialogue → `backdropFilter: "none"`, `backgroundColor: "rgba(11, 15, 25, 0.95)"`. `node scripts/audit-reduced-motion.js` : étape d'ouverture de la FAQ ajoutée (`STOPS`/`INTERACTIONS.faq`, clic sur le bouton dans `#jouer`) — conforme aux deux largeurs (375 et 1280 px), aucune animation `transform`/`opacity` > 150 ms ni boucle infinie détectée sur ce nouvel arrêt.

**§7.5 — tests.** `faq.test.ts` : 6 questions, ids uniques, exactement 2 `priority` (`workflow`, `creation`), aucun paragraphe vide, aucune bulle > 600 caractères, `%` uniquement dans `creation` (« 90 % »), aucune des chaînes interdites. Suite complète : **88 tests** (81 + 7), `lint`/`build`/`tsc -b` verts.

**§7.6 — absence du flux principal.** `grep` sur `dist/` : `faq` absent de `nav.ts`/du menu (jamais présent, non touché), du `sitemap.xml`, du JSON-LD (`Person`/`PostalAddress` uniquement), et du texte extrait du PDF (`pdf-parse`, `dist/cv/cv-xavier-bou.pdf`) — seule occurrence de "faq" dans `dist/` : le bundle JS applicatif lui-même.

### Livré et validé à l'écran

Claude in Chrome, `vite preview` (port 4321), 1280 px et ~500 px, `?perf=full` puis `?perf=lite` :
- Bouton « Comment ce site a été créé ? » (icône `MessageCircleQuestion`) en haut à droite du titre de Jouer sur desktop (flottant dans l'espace libre à droite du titre, sans décaler le sous-titre/lien/iframe) ; pleine largeur sous le sous-titre sur mobile.
- Modal : en-tête « FAQ · réponses scriptées », bulle d'intro statique, 2 puces accentuées (`workflow`, `creation`) + 4 puces standard.
- Parcours complet vérifié (voir preuves §7.2 ci-dessus) aux deux largeurs, `?perf=lite` (voir §7.4), Échap/focus, deep link `#faq`.
- Aucune erreur console relevée pendant les parcours testés.

### Hors scope pour cette itération (et où c'est prévu)

- Saisie libre, réponses dynamiques, `ApiAgentProvider` : hors scope explicite de la spec (§8), agent de poche V2 déjà noté post-V1 dans le ROADMAP.
- Version anglaise de `faq.ts` : Phase 10 (spec `11_...`, à écrire), architecture T8 déjà prête (fichier `*.ts` unique, séparé du rendu).
- Mesure d'audience sur l'ouverture du pop-up : écartée par Xav (§8).
- Lighthouse mobile sur le déploiement réel (le composant est dans le chunk initial, écart gzip mesuré en local sous le budget — §7.7) : nécessite un push, hors de portée avant la clôture de la phase par Xav.

### Dette ajoutée / mise à jour

Aucune nouvelle ligne DETTE-xx. Vérifié avant d'écrire `faq.ts` que les chiffres du contenu (36 lignes de dette suivies à ce jour, 81 tests avant cette phase, 7 arrêts, onze phases dont ce pop-up, 90 % du travail) correspondent à l'état réel des fichiers (`dette_suivi.md` s'arrête à DETTE-36, `dette_suivi.md` Phase 8 mentionne bien 81 tests, 7 occurrences d'`[ARRÊT XAV]`/`[ARRÊT HUMAIN]` dans ce journal pour les phases citées) — aucun écart à corriger ni à signaler.

### [ARRÊT XAV] — critère §7.8 de la spec 10

Critère de passage §7.8 : **relecture des 6 réponses à l'écran dans le pop-up (pas dans le fichier), sur PC et sur le Galaxy A04 en `lite`.** Hors de portée de l'agent (ressenti de lecture sur un vrai téléphone). Tout le reste du critère de passage (contenu testé en premier, composants, diff pixel §7.1, parcours §7.2, deep link §7.3, modes §7.4, tests §7.5, absence du flux principal §7.6) est fait et vérifié ci-dessus.

**Reporté par Xav, pas levé** : « Relecture explicitement reportée par Xav, les vérifications seront faites avant de changer de phase. » Xav a donné le go pour le push sur la base du compte-rendu et des preuves ci-dessus, sans avoir encore lu les 6 réponses à l'écran ni testé le Galaxy A04. **Phase 9 reste ouverte** (non close) : la relecture reste due avant de passer à la Phase 10, et pourra encore faire remonter une correction de texte ou une dette (§2 de la spec : « corriger le chiffre, le noter dans le journal, et signaler l'écart » si le journal a changé d'ici là).

Poussé sur `main` sur autorisation explicite de Xav (commit `e916ccf`). Déploiement GitHub Actions vérifié après coup : `https://xab-dev.github.io/portfolio-v2/` répond 200 avec le bundle `index-0b02oJJ5.js` (identique au build local testé), le CV PDF répond toujours 200/32 665 octets (inchangé, la Phase 9 ne touche pas `buildCvModel.ts`), le sitemap ne mentionne pas `faq`.

---

## 2026-09-16 — Phase 8 : Export CV classique, PDF une page (`09_export-cv-pdf.md`) — ARRÊT XAV posé

Session ouverte sur `specs/00_ROADMAP.md` (v0.9.0) puis `specs/09_export-cv-pdf.md`. Phase 7 déjà committée (`7b3821f`) au moment d'ouvrir cette session. Rien n'a été committé dans cette session.

### Décisions prises et pourquoi

- **`buildCvModel.ts` en fonction pure paramétrée** (`CvBuildInput` → `CvModel`), même patron que `compute.ts` en Phase 2 : `scripts/build-cv.tsx` assemble l'entrée réelle depuis `src/content/*.ts`, les tests construisent des fixtures isolées. Modèle et tests écrits et vérifiés verts **avant** la première ligne de `@react-pdf/renderer`, comme demandé (§6).
- **Numérotation DETTE-35/36 au lieu de DETTE-32/33.** `specs/09_export-cv-pdf.md` (rédigée le 2026-09-16 avant l'exécution de la Phase 7) anticipait `DETTE-32`/`DETTE-33` comme numéros libres pour les dettes CV. Au moment d'exécuter cette Phase 8, la Phase 7 avait déjà pris ces deux numéros pour autre chose (relecture "Autres LLM", bascule `noindex`). Vérifié l'état réel de `dette_suivi.md` avant d'écrire quoi que ce soit (au lieu de recopier aveuglément le patch de la spec) et renuméroté en 35/36 — noté explicitement dans les deux fichiers pour que la collision ne se reproduise pas silencieusement.
- **`sanitizeForPdf` dans le modèle, pas dans le contenu source** (§4) : un seul glyphe du contenu réel est hors du sous-ensemble `latin`/`latin-ext` de `@fontsource` (vérifié via `node_modules/@fontsource/inter/unicode.json`, qui liste `U+2191`/`U+2193` mais pas `U+2192`) — la flèche « → », présente dans le jalon "haTD → RPG-monde" (`timeline.ts`) et la tagline du projet "terrain" (`projects.ts`). Remplacée par `->` uniquement dans `buildCvModel.ts` ; `timeline.ts`/`projects.ts` restent inchangés.
- **Troncature de tagline (140 caractères) appliquée systématiquement**, pas seulement en cas de débordement mesuré : sans effet sur le contenu actuel (aucune tagline ne dépasse ~115 caractères après remplacement de la flèche) mais évite une classe entière de débordements futurs sans coût.
- **Marges resserrées de 14 mm à 12 mm** et interlignage resserré (page, sections, projets, jalons, compétences) : la mise en page initiale à 14 mm/interligne large débordait à 2 pages avec le contenu réel (6 projets, 7 jalons, 6 familles de compétences avec notes). Levier §4-1 de la spec ("resserrer marges/interligne dans les bornes") appliqué avant de toucher au contenu — jamais de métrique retirée, jamais de tagline tronquée en pratique (le contenu réel tient sous 140 caractères).
- **`pdf-lib` pour le comptage de pages, `tsx` pour exécuter les scripts TS/TSX hors Vite** : conforme à la liste de dépendances de la spec §5. `pdf-parse` installé **sans le committer** (`npm install --no-save`, vérifié : ni `package.json` ni `package-lock.json` modifiés) pour vérifier le texte extrait pendant la session — voir plus bas pourquoi `pdftotext` seul ne suffisait pas.

### Bugs trouvés et corrigés (cause racine avant patch)

1. **Le `fetch` natif de Node ne lit pas les chemins de fichiers locaux.** Premier réflexe (comme la doc react-pdf le suggère pour le web) : passer le chemin du fichier `.woff` tel quel à `Font.register`. Ça semblait fonctionner (aucune erreur à l'enregistrement), mais `Font.load` échouait au premier rendu avec `fetch failed`. Cause racine identifiée en lisant `@react-pdf/font/lib/index.js` : `FontSource._load()` n'appelle `fetch` que si la source est une URL `http(s)` (`is-url`) ou une data URL ; sinon elle appelle `fontkit.open(src)`, qui lit directement le système de fichiers. Le chemin local fonctionne donc **tel quel**, sans `file://` — c'est le fait de deviner (plutôt que de lire la source) qui avait fait perdre du temps. Vérifié par un rendu minimal isolé avant d'intégrer dans `fonts.ts`.
2. **En-tête du CV : nom et titre superposés.** Reproduit d'abord en isolant deux `<Text>` seuls (aucun problème), puis identifié dans le document complet : la `page` du `StyleSheet` fixe `lineHeight: 1.22` (un ratio sans unité) ; ce ratio semble se résoudre une fois contre la taille de police de la page (9,5 pt → ~11,6 pt) et cette valeur **déjà résolue** est ensuite héritée telle quelle par les `<Text>` enfants au lieu d'être recalculée pour leur propre `fontSize` — un `<Text>` à 17 pt (nom, police d'affichage) héritait donc d'une hauteur de ligne de ~11,6 pt, bien inférieure à sa propre taille, d'où le chevauchement avec la ligne suivante. Corrigé en redéclarant explicitement `lineHeight` sur chaque style dont la taille de police diffère nettement de la base de page (en-tête, pied de page). Comportement de `@react-pdf/renderer` non documenté trouvé cette session, pas un bug du code applicatif au sens strict — mais le contournement (toujours redéclarer `lineHeight` à côté d'un `fontSize` différent) est désormais appliqué dans `CvDocument.tsx`.
3. **Pied de page : les deux lignes se chevauchaient.** `flexDirection: "row"` + `justifyContent: "space-between"` sans largeur contrainte sur des `<Text>` de longueur très inégale (note + URL complète à gauche, statut + date à droite) : le texte de gauche débordait sur celui de droite au lieu de passer à la ligne. Corrigé en passant le pied de page en deux lignes empilées (`flexDirection: "column"`), plus lisible qu'une contrainte de largeur fragile.
4. **`pdftotext` (poppler/xpdf) tronque les caractères accentués en `�` à l'extraction.** Découvert en vérifiant le critère §7.1 ("texte sélectionnable") : `pdftotext` sur le PDF rendu donnait `Cl� USB` au lieu de `Clé USB`. Vérifié que ce n'est **pas un défaut du PDF** avant de chercher à le corriger : `pdf-parse` (moteur `pdf.js`) et la propre lecture de PDF de l'agent extraient les mêmes caractères correctement (`é`, `è`, `à`, `ç`, `€`, tirets, apostrophes typographiques tous corrects), et un rendu isolé confirme visuellement les bons glyphes. Diagnostic : `pdftotext` ne sait pas exploiter la table `ToUnicode` telle que générée par `@react-pdf/renderer`/`fontkit` pour des polices `.woff` embarquées de cette façon — limite de l'outil, pas du fichier. Utilisé `pdftotext` uniquement pour confirmer des chaînes ASCII (la flèche remplacée `->`, les marqueurs de test), et `pdf-parse`/lecture PDF de l'agent pour les chaînes accentuées.

### Preuves des critères §7.1 à §7.4

**§7.1 — 1 page, A4, poids, texte sélectionnable, métadonnées.** `npm run cv` : `public/cv/cv-xavier-bou.pdf — 1 page, 31.9 Ko, ~420 ms`. Vérifié via `pdf-lib` : `Pages: 1`, `Size: { width: 595.28, height: 841.89 }` (A4 à 72 dpi), `Title: "Xavier Joseph Bou — Consultant outils et solutions IA"`, `Author: "Xavier Joseph Bou"`, `Subject: "CV — Consultant outils et solutions IA"`, `Keywords: "IA, consultant, automatisation, Tarascon"`, `Language: "fr-FR"`. Poids 31,9 Ko ≪ budget 200 Ko. Texte sélectionnable confirmé par `pdf-parse` (extraction fidèle, accents compris).

**§7.2 — Test de non-divergence.** `hero.subtitle` modifié temporairement (ajout de `" TEST-NONDIVERGENCE-A7f3."`) et `timeline.ts` (jalon "Portfolio v2" → "Portfolio v2 TEST-NONDIVERGENCE-B9k1"), `npm run cv` relancé, extraits retrouvés via `pdftotext` :
```
L'IA n'a de valeur que si elle résout un vrai problème. [...] et je dis aussi quand l'IA n'est pas le bon outil. TEST-NONDIVERGENCE-A7f3.
Portfolio v2 TEST-NONDIVERGENCE-B9k1 Construction du portfolio/CV interactif, piloté par specs et livré phase par phase.
```
Les deux modifications annulées immédiatement après (`git diff --stat` vérifié vide sur les deux fichiers), CV régénéré à l'état réel (31,9 Ko, 1 page).

**§7.3 — Aucune fuite.** Extraction complète du PDF final passée au crible : aucune occurrence de "LinkedIn" (lien vide, DETTE-04), de `phenomenxx@gmail.com` (`emailSecondary`), de "25 €"/tarif, de "(neveu)" (métrique haTD non vérifiée), de "[À CONFIRMER]" ni de "[DETTE" — confirmé par `grep` sur le texte extrait (0 correspondance sur les deux recherches).

**§7.4 — Débordement forcé.** `projects.ts` dupliqué temporairement (12 "projets", ids suffixés `-dup`), `npm run cv` puis `npm run build` :
```
❌ CV PDF : 2 pages générées, 1 attendue (A4, spec 09 §3).
Le build échoue volontairement plutôt que de livrer un CV de plusieurs pages.
Réduire dans cet ordre (spec 09 §4 — ne jamais retirer un projet, une compétence ou un jalon) :
  1) resserrer marges/interligne dans CvDocument.tsx (bornes : marges 14 mm, corps 9-9,5 pt) ;
  2) vérifier la troncature des taglines projet à 140 caractères (buildCvModel.ts, truncateTagline) ;
  3) limiter les métriques vérifiées à 2 par projet (buildCvModel.ts, buildProject).
```
Code de sortie 1 dans les deux cas (`npm run cv` seul et `npm run build` via le hook `prebuild`). `git diff --stat src/content/projects.ts` vide après annulation.

Limite assumée : le message identifie qu'il faut réduire, avec les leviers exacts et les fichiers à modifier, mais ne nomme pas *laquelle* des 6 (ou 12, dans le test) sections a débordé — `pdf-lib` ne donne qu'un compte de pages, pas une attribution par section, et le déterminer précisément aurait demandé d'inspecter l'arbre de rendu interne de `@react-pdf/renderer`. Jugé hors de proportion pour un CV d'une page ; documenté ici plutôt que laissé implicite.

### Livré et validé à l'écran

Chrome piloté (Claude in Chrome connecté cette session), `vite preview` (port 4175, résiduels 4173/4174 déjà occupés par d'anciennes instances) :
- **1280 px** : lien « Télécharger le CV (PDF) » visible sous les deux CTA du Hero (icône `Download`, style discret souligné — pas un 3ᵉ bouton plein), et dans Contact après la ligne mail/téléphone/WhatsApp/réseaux.
- **~500 px** (375 px non atteignable par l'outil — limite déjà documentée dans `project_state.md` — mais aucun palier Tailwind entre 375 et 640 px, donc le comportement à 500 px fait foi pour 375 px) : lien visible sous les CTA empilés, aucun débordement horizontal.
- Attributs vérifiés en JS (`href`, `download`, `type`) sur les deux instances : `href="/portfolio-v2/cv/cv-xavier-bou.pdf"`, `download=""`, `type="application/pdf"`. `fetch(..., {method:"HEAD"})` → 200, `content-type: application/pdf`, `content-length: 32665`.
- **`?perf=lite`** : `data-perf="lite"` confirmé sur `<html>` ; `getComputedStyle` sur les deux liens : `backdropFilter: none`, `boxShadow: none`, `filter: none` (le composant n'en a jamais introduit).
- Aucune erreur console sur les trois configurations testées (`read_console_messages`, `onlyErrors: true`).
- `npm run build`/`lint`/`test` verts : **81 tests** (67 existants + 14 nouveaux dans `buildCvModel.test.ts`). `dist/cv/cv-xavier-bou.pdf` confirmé présent après `npm run build` (copié tel quel depuis `public/cv/` par Vite).

### Hors scope pour cette itération (et où c'est prévu)

- Vérification du déploiement réel (`https://xab-dev.github.io/portfolio-v2/cv/cv-xavier-bou.pdf` répond 200, Lighthouse mobile inchangé — critère §7.7) : nécessite un push, hors de portée avant la clôture de la phase par Xav.
- `robots.txt`/indexabilité du PDF (DETTE-36) : Phase 7 (polish final), avec DETTE-33.
- Version anglaise du CV, génération à la demande, photo, lettre de motivation : hors scope explicite de la spec (§8).

### Dette ajoutée / mise à jour

- **DETTE-35** (nouvelle) : CV limité à la trajectoire 2026 (DETTE-17 propagée). Décision **D6** posée dans le ROADMAP, non tranchée.
- **DETTE-36** (nouvelle) : PDF indexable sans `noindex` (GitHub Pages ne pose pas d'en-têtes HTTP personnalisés) — `robots.txt` à trancher en Phase 7.
- Correction de numérotation : `specs/09_export-cv-pdf.md` anticipait DETTE-32/33 pour ces deux points ; déjà pris par la Phase 7 au moment d'exécuter cette phase. Renumérotés 35/36, collision documentée dans `dette_suivi.md` et ici.

### [ARRÊT XAV] — levé par Xav

Critère de passage §7.8 de la spec 09 : **relecture du PDF imprimé (ou aperçu impression N&B) par Xav** — lisibilité, hiérarchie, rien de gênant à montrer à un recruteur — et **réponse à D6** (accepter le CV limité à 2026, ou enrichir `timeline.ts`). Tout le reste du critère de passage (modèle testé, rendu, contrôle 1 page, débordement forcé, non-divergence, fuites de contenu, liens Hero/Contact aux deux largeurs et en mode allégé) était déjà vérifié et vert.

**Levé** : Xav a relu le PDF et validé (« pdf relu et validé »). **D6 tranchée : tel quel** — aucune expérience dans le domaine avant 2026, donc pas de jalon antérieur ajouté à `timeline.ts`. **Phase 8 officiellement close.** Push autorisé par Xav (« go pour le push »).

---

## 2026-09-16 — Phase 7 : Polish, SEO, mentions légales (`09_polish-seo-mentions-legales.md`) — en cours, ARRÊT XAV posé

Session ouverte sur la spec 09 (décisions de Xav du 16/09, 00:50-01:30). Rien n'a été committé.

### Décisions prises et pourquoi

- Tout le contenu légal (`site.legal`, `legal.ts`) recopié **tel quel** depuis le §2 de la spec, y compris les deux placeholders `[À COMPLÉTER — Xav]` (adresse) et `[À VÉRIFIER]` (téléphone GitHub) — aucune valeur inventée, conformément à la consigne §6.
- Les 3 références (`references.ts`) recopiées telles que fournies (DOI vérifiés par l'architecte) ; `idp-vendors-2025` retirée ; `saisie` passée en gain non chiffré dans `simulator.ts` (`timeSavedPct`/`baseline` retirés, `evidence.level: "aucune"`, `qualitativeNote` ajoutée) — `compute.test.ts` mis à jour (fixtures + nouveau test nommant `saisie`).
- `src/lib/router/hashRoute.ts` créé (factorise la lecture du hash, réutilisé par `Portfolio.tsx` qui gagne au passage un garde-fou explicite : un hash `mentions-legales/…` ne peut plus jamais ouvrir la modale projet — edge case §4).
- `EvidenceBadge` transformé en déclencheur `<button aria-haspopup="dialog">` + `PortalTooltip` (référence(s) liée(s), lien externe si `url` présent).
- SEO/OG : plugin `transformIndexHtml` dans `vite.config.ts` (canonical, robots conditionnel, OG/Twitter, JSON-LD `Person`, tout dérivé de `site.ts`/`contact.ts` — pas de valeur dupliquée à la main) ; `scripts/build-og.js` (nouveau, `npm run og`) compose `public/og.png` par SVG + `sharp`, sans dépendance ajoutée ; le build échoue si `public/og.png` est absent (`buildStart`, testé dans les deux sens).
- `scripts/audit-reduced-motion.js` (nouveau) pilote Chrome headless en **CDP brut** (pas de dépendance `puppeteer` ajoutée — même choix que le script maison de la Phase 6b) : émule `prefers-reduced-motion: reduce` à 375 px/1280 px, scrolle/interagit avec chaque section livrée, lit `document.getAnimations()`, et **ne retient que les animations `transform`/`opacity`** (la règle de la spec 09 §3 ne vise que ces deux propriétés — une transition de couleur au clic n'est pas de la motion vestibulaire ; distinction ajoutée après un premier passage plein de faux positifs sur des transitions de couleur `border`/`background`).
- Version `package.json` → `0.7.0` (script `og` ajouté), suivant la valeur donnée par la spec (jamais montée depuis 0.1.0, indépendamment de la version du ROADMAP).

### Bugs trouvés et corrigés en vérification visuelle réelle (Chrome piloté, `vite preview`, 375 px et 1280 px, `?perf=full`/`?perf=lite`)

Cinq bugs réels trouvés en testant, aucun n'était visible en lecture de code seule :

1. **Budget reduced-motion dépassé partout** : `fadeUpReduced` (`lib/motion.ts`) était à 300 ms, pas ≤ 150 ms — utilisé par `SectionShell` (donc par presque toutes les sections) et par `Hero`. Corrigé à 150 ms.
2. **Modale projet jamais réduite** : `Modal.tsx` lançait toujours l'animation complète (`scaleIn`, 300 ms) même sous `prefers-reduced-motion`, aucun garde-fou n'existait. Nouvelle variante `scaleInReduced` (`lib/motion.ts`), branchement sur `useReducedMotionSafe()`.
3. **Grille Portfolio jamais réduite** : même défaut sur l'apparition/sortie des cartes projet (`Portfolio.tsx`, 250 ms non gardé) et sur la transition `layout` (FLIP) des groupes de la stack recommandée du Simulateur (`StackPanel.tsx`) et de la grille projets — toutes gardées à 0,1 s sous reduced-motion désormais.
4. **Soulignement de nav actif** (`Navbar.tsx`) : transition CSS pure (`transition-transform duration-base`, 300 ms) hors de portée de `useReducedMotionSafe` côté JS — bascule vers `duration-[0ms]` quand `reducedMotion` est vrai. Trouvé en isolant, élément par élément, la source des animations `transform` restantes après les corrections 1-3 (`a.transitionProperty` / `effect.getKeyframes()` sur chaque `Animation`).
5. **`EvidenceBadge` : tap = ouverture puis fermeture immédiate.** Réutilisation fautive du patron `AnnotationMark` (Phase 3) : `onClick` faisait basculer l'état au lieu de toujours l'ouvrir, alors que `onMouseEnter` l'avait déjà ouvert — sur un vrai clic souris, le tooltip se rouvrait puis se refermait aussitôt. **Même bug que celui déjà corrigé en Phase 3** ("tooltip jamais visible au tap"), réintroduit ici en copiant le patron sans le relire assez attentivement. Corrigé : `onClick` ouvre toujours (`setOpen(true)`), jamais de bascule.
6. **`window.scrollTo(0, 0)` bloqué en cours de route sur `#mentions-legales`.** La forme à 2 arguments hérite de `scroll-behavior: smooth` (règle globale, nav ancrée) ; en testant l'ouverture de la page depuis une position de scroll profonde (section Jouer, ~7400 px), le scroll vers le haut restait bloqué à mi-chemin. Corrigé par `behavior: "instant"` explicite, plus `overflow-anchor: none` sur `html` (le "scroll anchoring" du navigateur rattrapait sinon le retrait massif de contenu vers le bas de la page).
7. **Retour vers le site : position de scroll jamais restaurée.** Même après le fix précédent, revenir depuis Mentions légales (via le bouton, Échap, ou un retour navigateur réel) ne restaurait pas le scroll précédent — la restauration native du navigateur au `popstate` se joue contre le remontage de ~7000 px de sections React (dont un chunk chargé à part, le radar de compétences) et retombe à 0 avant que la page n'ait fini de reprendre sa hauteur réelle. Sauvegarde manuelle du `scrollY` ajoutée dans `App.tsx`, restauration par `ResizeObserver` (réapplique la cible à chaque changement de hauteur du document, jusqu'à l'atteindre ou 2 s).
8. **Retour direct sur `#mentions-legales` (lien partagé, rechargement) : `history.back()` sortait du site.** `window.history.length > 1` n'est pas un signal fiable (un nouvel onglet peut déjà avoir une entrée d'historique interne au navigateur). Remplacé par un drapeau `enteredLegalInApp` positionné uniquement par un vrai `hashchange` reçu en session — `false` au démarrage direct sur la page légale, auquel cas le bouton "Retour au site" et Échap posent `location.hash = "hero"` plutôt que d'appeler `history.back()`.

`scripts/build-og.js` : bug mineur trouvé et corrigé en vérifiant la taille réelle sur disque (136 Ko) contre la taille annoncée par le script (125 Ko) — `sharp(buffer).toFile()` ré-encodait le PNG avec la compression par défaut au lieu de réutiliser le buffer déjà encodé à `compressionLevel: 9`. Écriture directe du buffer (`fs.writeFileSync`) : taille annoncée et taille réelle concordent (125 Ko, sous le budget 150 Ko).

### Livré et validé à l'écran

Chrome piloté (Claude in Chrome + un script CDP maison pour les largeurs non atteignables par l'outil — même limite que les phases précédentes), `vite preview`, aux deux largeurs et aux deux modes perf :
- `#mentions-legales` : ouverture directe (rechargement), lien du footer, bouton "Retour au site", Échap — testés dans les deux cas de figure (arrivée directe → section d'accueil ; navigation interne depuis une position de scroll profonde → position restaurée exactement). Nav masquée, en-tête minimal, focus sur le `<h1>`, `document.title` correct, footer conservé. 6 sections affichées avec les valeurs de `site.ts`, aucun `[À` propagé au-delà des deux champs attendus.
- Badge Simulateur : ouverture au survol **et** au tap (bug 5 ci-dessus corrigé), DOI cliquable (`target="_blank" rel="noreferrer"` vérifiés), niveau "aucune" (saisie) sans lien.
- Playground, cas `long`, 375 px et 1280 px : `scrollWidth === clientWidth` mesuré sur les deux panneaux (entrée brute + prompt expert, y compris pendant la frappe), aucun débordement horizontal.
- `dist/index.html` : canonical, `noindex, nofollow` (bascule testée dans les deux sens), OG/Twitter complets (`og:image` absolue), `theme-color`, JSON-LD validé par `JSON.parse` — contenu exact vérifié à l'écran.
- Audit reduced-motion : **conforme sur toutes les sections aux deux largeurs** après les corrections 1-4 ci-dessus (rapport complet dans le terminal de session ; relancer via `node scripts/audit-reduced-motion.js`, nécessite Chrome installé localement).
- `npm run build` / `lint` verts. `npm run test` : 65/67 verts, les 2 tests rouges sont **le garde-fou attendu** (`legal.test.ts`, §4 : refuse `site.legal.address`/`host.phone` tant que les placeholders `[À` y sont — comportement voulu, pas une régression).

### Hors scope / reporté

- Bascule `site.seo.indexable` → `true` : Phase 10 (polish final), DETTE-33 ajoutée.
- Registre des traitements CNIL, aperçu de lien réel (LinkedIn/WhatsApp), PageSpeed Insights sur le vrai déploiement : à faire par Xav après déploiement (hors portée de l'agent).
- Export CV (Phase 8), FAQ (Phase 9), anglais (Phase 10) : non commencés.

### **[ARRÊT XAV]** — posé avant tout commit/push, critère §7.9

Deux valeurs à fournir avant de poursuivre (`src/content/site.ts`, `site.legal`) :
1. **`address`** — domicile complet (rue, code postal), remplace `"[À COMPLÉTER — Xav] rue, code postal, Tarascon"`.
2. **`host.phone`** — téléphone de GitHub, Inc., à relever sur leur page légale (`https://pages.github.com/` ou équivalent), remplace `"[À VÉRIFIER] — relever sur la page légale de GitHub, ne pas écrire de mémoire"` — ne pas l'écrire de mémoire.

Une fois ces deux valeurs renseignées et la page Mentions légales relue à l'écran par Xav : `npm run test` doit passer à 67/67, puis go pour push. Après déploiement, Xav vérifie l'aperçu de lien (WhatsApp/LinkedIn) et PageSpeed Insights (hors agent).

---

## 2026-09-15 23:00 — Patch de relecture + roadmap post-V1 (`PATCHES_2026-09-15_2300.md`, unités A à G)

Session ouverte après validation de Xav sur Galaxy A04 (`?perf=lite`) et PC plein écran, Playground compris (4 cas) : V1 fonctionnelle complète. Ce patch ne touche aucun composant, sauf pour sortir une chaîne en dur (§C, T8) et ajouter une classe utilitaire déjà existante (§E). Ordre A → B → C → D → E → F → G respecté.

### Décisions prises et pourquoi

- **§A Frise** : `timeline.ts` réordonné selon les 7 dates réelles fournies par Xav (ordre chronologique par date de début : haTD, Régie Maison, Bilan de compétences, miniCiel, Pivot, Templates, Portfolio v2). Summary `regie-maison` : « Premier projet » → **« Premier projet livré »** (exact dans les deux lectures, haTD commence avant mais Régie Maison est livré avant). Summary `templates` complété par « En phase de test. ». Test `timeline.test.ts` : nouveau cas « est dans l'ordre chronologique » comparant les ids à une liste explicite en dur (pas de parsing de date, commentée comme source de vérité à mettre à jour à la main). Spec 06 et DETTE-12 (dette_suivi.md §B) mis à jour pour refléter l'extension à tous les jalons.
- **§B Agent `roi`** : phrase finale remplacée mot pour mot par le texte de Xav (ROI poker chiffré, 10 %-30 %, > 100 €, espaces insécables réelles U+00A0 avant `%`/`>`/`€` — vérifiées caractère par caractère, pas de simples espaces). Commentaire du bloc mis à jour (T6 : le seul chiffre autorisé est celui du poker). Le test « ne cite jamais le poker en dehors de `roi` » (`ScriptedAgentProvider.test.ts`) n'a pas été touché et reste vert.
- **§C Contact** : nouvel export `directContactHeading` dans `src/content/contact.ts` (« Contact direct préféré ? », espace insécable avant `?`), `Contact.tsx` ne contient plus la chaîne en dur. Grep de contrôle `préféré\|Contact direct` sur `src/sections` et `src/components` : aucun résultat. Grep large `>[A-ZÉ][^<{]{12,}<` sur `src/sections/*.tsx` (demandé par le patch pour lister, sans corriger, d'autres chaînes en dur) : **aucun résultat** — rien à ajouter comme point Phase 7 sur ce point précis.
- **§D Agent `outils`** : réponse remplacée par le texte proposé par l'architecte (Claude au quotidien + ChatGPT/Gemini/Perplexity/Mammouth avec leur rôle respectif), marqué `[À RELIRE — Xav]` en commentaire au-dessus de `outils` dans `agent.ts`. Mots-clés de repli `chatgpt`, `gemini`, `perplexity`, `mammouth` ajoutés à `agentKeywords.outils`. Badge ajouté dans `skills.ts` (famille "LLMs & agents", niveau 3, commentaire renvoyant à DETTE-32 comme pour DETTE-15). Nouvelle **DETTE-32** ouverte dans `dette_suivi.md` §B.
- **§E Scrollbar agent** : classe `scrollbar-subtle` (déjà utilisée par le Playground, `globals.css`) ajoutée au conteneur scrollable d'`AgentPanel.tsx` (celui qui porte le `ResizeObserver` de suivi de bas). Aucune mention « à appliquer en Phase 7 » ne figurait dans le ROADMAP lui-même (seulement dans ce journal, Phase 3, laissé tel quel comme historique) — rien à retirer côté ROADMAP au-delà de ne pas la reporter dans la nouvelle Phase 7 (§G).
- **§F Clôture de dette** : DETTE-09 ☑ (texte exact fourni par le patch). Marqueur `[À RELIRE — Xav]` en tête de `playground.ts` remplacé par « Textes validés par Xav le 2026-09-15 ».
- **§G ROADMAP** : version 0.7.0 → **0.8.0**, statut mis à jour (V1 complète et validée, patch 23:00 appliqué, phase courante 7). Ligne « Phase 7 » de l'esquisse remplacée par la version étendue (Mentions légales, SEO/OG/JSON-LD, domaine en statu quo, DETTE-31, largeur Playground, `prefers-reduced-motion`, image OG sobre en attendant le skin perso) ; Phases 8 (Export CV PDF), 9 (FAQ « Comment ce site a été créé ? »), 10 (version anglaise) ajoutées telles que dictées par Xav, plus la liste post-V1 non planifié. Ordre imposé (patch 23:00 → 7 → 8 → 9 → 10) et mention « Design et animations : figés » ajoutés à la suite de l'ordre conseillé V1 existant (non réécrit).

### Livré et validé à l'écran

L'extension Claude in Chrome n'était pas connectée dans cette session (comme en Phase 0, cf. plus bas) : vérification faite par un petit script Node pilotant Chrome headless en local via le Chrome DevTools Protocol (clics réels sur les puces de l'agent, lecture du DOM rendu, captures d'écran), contre `vite preview` (le port 4174 était déjà occupé par un `preview` résiduel d'une session précédente — servait bien le build à jour après `npm run build`).
- **Frise (§A.3)** : les 7 jalons avec leurs nouvelles périodes (`01/08 – 07/09/2026`, `28/08 – 01/09/2026`, `Depuis le 14/09/2026`, etc.) tiennent dans leur carte sans débordement, vérifié à 1280 px, ~500 px, et sous `?perf=lite` aux deux largeurs (captures comparées).
- **Agent `roi` (§B.3)** : réponse complète (595 caractères) lue dans le DOM après un vrai clic sur la puce, comparée caractère pour caractère au texte source — identique, espaces insécables comprises. Tient dans le panneau avec le suivi de bas (`ResizeObserver`) actif, scrollbar visible et discrète, vérifié à 1280 px et ~500 px.
- **Agent `outils` (§D.1/§D.2)** : réponse complète (678 caractères) lue après clic, identique au texte source. Badge « Autres LLM (ChatGPT, Gemini, Perplexity, Mammouth) » vérifié dans la famille "LLMs & agents" à 1280 px et ~500 px, aucun débordement.
- **Scrollbar agent (§E.2)** : `className` du conteneur confirmé `scrollbar-subtle max-h-72 min-h-[8rem] overflow-y-auto pr-1` en mode complet et `?perf=lite` ; suivi de bas toujours actif pendant la frappe (captures avant/après clic).
- **Contact (§C)** : « Contact direct préféré ? » affiché au-dessus du numéro et des liens, vérifié à 1280 px et ~500 px.
- Aucune erreur ni avertissement console relevé (mode complet et `?perf=lite`).
- `npm run test` (62 tests, +1), `npm run lint` (oxlint), `npm run build` : verts.

### Limites de vérification (documentées, pas masquées)

- Vérification faite par un script Chrome DevTools Protocol maison (pas de dépendance ajoutée au projet, uniquement un outil local jetable dans le répertoire de travail temporaire), en l'absence de l'extension Claude in Chrome — même limite que la Phase 0. La largeur mobile testée (500 px de fenêtre) n'émule pas un vrai appareil tactile ni `prefers-reduced-motion` (limite déjà documentée dans les phases précédentes, inchangée).

### Dette ajoutée / mise à jour

- DETTE-09 : ⏸ → ☑ (`dette_suivi.md` §B).
- DETTE-12 : mention étendue à tous les jalons ajoutée (`dette_suivi.md` §B, ligne existante conservée).
- DETTE-32 : nouvelle ligne ouverte (`dette_suivi.md` §B) — relecture de la réponse `outils` et du niveau du badge, non bloquant.
- `dette_suivi.md` §D : ligne du 2026-09-15 23:00 ajoutée (texte du patch).

### Hors scope pour cette itération (et où c'est prévu)

- Relecture de la réponse `outils` et ajustement éventuel du niveau du badge par Xav → DETTE-32, non bloquant.
- Tout le contenu de la Phase 7 (mentions légales, SEO/OG/sitemap, DETTE-31, largeur Playground, audit `prefers-reduced-motion` avec un vrai outil d'émulation) → spec à écrire.

### Déploiement

Rien commité pour l'instant : journal rédigé avant le commit comme demandé. Un seul commit à suivre, **push différé jusqu'au go de Xav**.

---

## 2026-09-15 (soir) — Phase 3 : Prompt Playground (spec 04 amendée par `PATCHES_2026-09-15_1930.md` §C)

Session ouverte après les patchs A (remise sur `main`) et B (journal Phase 2, note z-index, ROADMAP 0.7.0) ci-dessous. Ordre imposé par le prompt de lancement et respecté : `src/content/playground.ts` + ses tests (§7.5) **avant** tout composant.

### Décisions prises et pourquoi

- **`docs/TEMPLATES_SPEC.md` mis à jour vers la version à 6 templates.** La copie committée en Phase 0 (`44170cc`) était la version à **5** templates (datée du 2026-09-14 12:49) : le Template 6 (Triage) n'y existait pas, alors que le patch exige que « les templates cités correspondent à la vraie bibliothèque (`TEMPLATES_SPEC.md`), pas à une version imaginée » et que le ROADMAP, `projects.ts` et `skills.ts` parlent tous de 6 templates. La version à 6 templates existe hors repo (`03_Recherche/Prépa_Thèse/TEMPLATES_SPEC.md`, 2026-09-14 13:11, plus récente) : copiée telle quelle, sans réécriture. Sans cela, le cas `long` aurait cité un template absent de la source déclarée de la spec.
- **`templateNames` avec les noms exacts de la bibliothèque** plutôt que la casse du bloc de types du patch (`'Cahier des Charges Technique'`, `'Roadmap + Specs numérotées'`, `'Notes de Session Brute (Triage)'` au lieu de `'Cahier des charges technique'`, `'Roadmap + specs numérotées'`, `'Notes de session brutes / Triage'`) : le critère §7.4 demande « les vrais noms de la bibliothèque », et le test `long → T6 → T1 + T2` compare le prompt expert à ces noms.
- **Cas `long` : l'unité « bug » est un défaut visuel à cause connue** (texte du tutoriel trop petit → Micro-Ticket), pas un bug à cause inconnue. Le patch prescrit `T6 → T1 + T2` ; or la règle de la bibliothèque est explicite : cause inconnue → Session Diagnostic (T3), jamais un patch. Pour que le triage soit juste **et** conforme au patch, la dictée mêle un défaut dont Xav dit lui-même la cause (« c'est juste la taille de police je pense »), une fonctionnalité définissable (pause + vitesse → Module Standard) et une idée non mûre (mode histoire → `[OUVERT]`, parking). L'annotation sur « cause connue » explique ce choix au visiteur.
- **`[Jeu]` plutôt que « haTD » dans le prompt expert du cas `long`** : la dictée est écrite « dans l'esprit » du cas réel de Xav (notes de test de jeu), pas transcrite d'une vraie session — nommer haTD aurait présenté comme réels un tutoriel, un bouton pause et un mode histoire inventés (T6/T7 : rien d'inventé présenté comme un fait). Le nom de Xav apparaît uniquement là où la bibliothèque le prévoit (« ne jamais trancher à ta place »).
- **Aucun chiffre** : les seuls nombres du contenu sont des mots (« cinq questions », prescrit par le patch ; « zéro octet »). Test dédié : aucun `%` dans aucun champ des 4 cas.
- **Verdict épinglé hors de la zone scrollable** (`lead` de `PromptPane`, entre l'en-tête et le code) : le panneau expert a une hauteur max avec scroll interne et suit le bas pendant la frappe (`ResizeObserver`, même mécanisme que l'agent de poche) ; dans la zone scrollable, la ligne de verdict — qui doit « apparaître en premier » — sortait de l'écran dès que le prompt dépassait la hauteur visible (vu à l'écran sur la première version). Épinglé, il reste lisible du début à la fin.
- **Tooltips en portail (`PortalTooltip`, nouvelle primitive `components/ui/`)** plutôt que remontée de `z-index` (les deux options du patch §3) : les panneaux ont `overflow-y: auto`, un tooltip absolu enfant serait **rogné** par le conteneur quelle que soit sa pile — le `z-index` ne peut rien contre un `overflow`. Position `fixed` calculée depuis l'ancre, largeur bornée à la fenêtre, **bascule au-dessus** quand la place manque en bas (deuxième passage avec la hauteur réelle du tooltip après montage), repositionnement sur scroll/resize. Même primitive pour le badge du verdict (`why`) et les annotations (`note`). `SkillBadges` (Phase 5) n'est pas migré : hors scope, son fix `z-20` suffit tant que le tooltip n'est pas dans un conteneur à overflow.
- **Frappe puis annotations, dans la même grille** : `TypingText` (primitive imposée par la spec, 8 ms/car) n'expose pas de callback par caractère, donc les annotations ne peuvent pas se surligner *pendant* la frappe ; elles apparaissent **en cascade** (stagger 120 ms) une fois la frappe finie, via l'opacité d'une couche `bg-neon-blue/15` (pas de couleur en dur : `motion` n'interpole pas `rgb(var(--x))`). Pendant la frappe, le texte est dans une cellule unique (gouttière vide) ; une fois fini, chaque ligne devient une rangée numérotée — même grille `2rem/1fr`, même interligne, donc aucun saut de mise en page au basculement (vérifié à l'écran).
- **Mode allégé = bascule instantanée**, exactement comme reduced-motion (`instant = reducedMotion || lite`) : pas de scanner, pas de frappe, pas de flou, pas de cascade. Le flou (`filter: blur`) du texte brut n'est appliqué que pendant les 600 ms de scan en mode complet. Aucun `backdrop-filter` nouveau sans sa variante `lite:` (`PromptPane`, `PortalTooltip`).
- **Onglet « Résultat après » verrouillé tant que l'agent n'a pas rendu son verdict**, puis sélectionné automatiquement à la fin : afficher la sortie « après » avant le verdict aurait éventé la démonstration ; le visiteur peut revenir sur « avant » à tout moment (flèches clavier gérées, `role=tablist/tab/tabpanel`).
- **Copier** : uniquement le prompt expert (pas le verdict), masqué si le verdict est un conseil (règle générique = « masqué pour `bizarre` ») ou si `navigator.clipboard.writeText` est indisponible (edge case §4 : bouton masqué plutôt que repli). Retour « Copié ✓ » 1,5 s.
- **Tous les textes d'interface dans `playgroundUi`** (`playground.ts`), aucune chaîne dans les composants (T8).
- **Utilitaire `scrollbar-subtle`** (`globals.css`, `@layer utilities`) pour les deux panneaux : la barre de défilement native claire de Chrome sautait aux yeux sur fond sombre (vu à l'écran). Appliqué **seulement** au Playground — l'agent de poche (Phase 1) a le même conteneur scrollable et gagnerait à l'utiliser, noté pour la Phase 7 plutôt que modifié en silence.
- **8 tests** au lieu des 5 prescrits (§7.5) : les 5 (4 cas, ids uniques, ≤ 25 lignes, `templateRef` ssi `template`, `templateRef ∈ templateNames`) + 3 gardes qui protègent des invariants du rendu et du contenu : chaque ancre d'annotation tient sur **une seule ligne** du prompt expert et n'y apparaît qu'une fois (le surlignage est calculé ligne par ligne) ; aucun `%` (T6) ; `long` cite T6 → T1 + T2 sous leurs vrais noms et `bizarre` = phrase « Aucune sortie LLM » exacte (§7.4).

### Bugs trouvés et corrigés (cause racine, pas de contournement)

- **`TypingText` deux fois plus lent que sa vitesse nominale sur texte long.** Vu à l'écran : après 10 s, ~40 % du prompt expert `long` (≈ 1 000 caractères) était affiché, alors que 8 ms/caractère devait donner 8 s au total. Cause racine : la primitive (Phase 0) comptait **un caractère par tick de `setInterval`** ; dès que le rendu React d'un caractère coûte plus que l'intervalle (texte long dans un `pre` avec grille), les ticks s'espacent et la durée réelle dérive — invisible sur les réponses courtes de l'agent de poche (18 ms/car, quelques centaines de caractères). Corrigé dans la primitive : nombre de caractères calculé depuis le **temps écoulé** (`performance.now()`) dans une boucle `requestAnimationFrame`, plusieurs caractères par image si nécessaire — `speedMs` par caractère est tenu quelle que soit la charge. Revérifié : frappe complète en moins de 9 s (scan + verdict compris). L'agent de poche n'est pas modifié visuellement (même vitesse nominale, désormais exacte) ; ses tests (`ScriptedAgentProvider.test.ts`) ne touchent pas la primitive.
- **Tooltip jamais visible au tap.** Trouvé par un vrai clic (pas un survol) sur une annotation : `onFocus` ouvrait le tooltip, puis `onClick` le **basculait** → fermé avant d'être vu. Au tactile (pas de survol) c'est le seul chemin d'ouverture, le tooltip n'aurait donc jamais été affiché sur téléphone. Corrigé (annotations et badge du verdict) : le clic **ouvre**, la fermeture vient de `blur`/`mouseleave`/Échap. Revérifié par vrai clic : tooltip ouvert, élément focalisé.

### Livré et validé à l'écran

Vérifié via Claude in Chrome (`vite preview`, port 4174 — le 4173 était occupé par un `preview` résiduel), desktop 1264 px (mode complet) et mode allégé `?perf=lite` ; mobile ~519 px (voir limite plus bas) :
- **Sélecteur** : 4 puces `Tag` (Court · Moyen · Long · Bizarre), `long` présélectionné ; changement de cas **pendant** l'animation (relance + clic « Prompt bizarre » à 1,2 s) → retour propre à l'état initial (placeholder, bouton « Passer par l'agent », onglet « après » verrouillé, ni scanner ni curseur de frappe dans le DOM) — edge case §4 validé.
- **Scanner** : présent dans le DOM 250 ms après le clic, ligne à mi-hauteur du **panneau visible** (pas de la hauteur totale du texte — §4 amendé), retirée après 600 ms ; bouton « L'agent lit… » désactivé pendant tout le cycle ; texte brut estompé après scan.
- **Verdict puis prompt expert** : headline affiché en premier (épinglé), badge `T6 · Notes de Session Brute (Triage)` → tooltip `why` au survol et au clic ; frappe `TypingText` complète en < 9 s ; 4 annotations surlignées en cascade, chacune avec sa note en tooltip (vérifié pour `[OUVERT]` près du bord bas : tooltip **basculé au-dessus**, jamais sous les onglets — exigence du patch §3).
- **Copier** (cas `court`, vrai clic) : `navigator.clipboard.writeText` résolu (878 caractères), presse-papiers relu = début exact du prompt expert, libellé « Copié ✓ ».
- **Onglets** : « Résultat avant » seul actif avant verdict ; « Résultat après » sélectionné automatiquement à la fin, contenu = `expertOutput` ; indicateur `layoutId` animé.
- **Cas `bizarre`** : badge « Conseil » (émeraude), **aucun bouton Copier**, onglet « après » = « Aucune sortie LLM : la bonne réponse ici est une méthode, pas un texte généré. », 4 annotations — critère §7.4 validé. **Cas `court`** : badge `T4 · Cahier des Charges Technique`, 4 annotations. **Cas `long`** : voir ci-dessus, critère §7.4 (T6 → T1 + T2, « Extrait de ma bibliothèque de templates de spec ») validé à l'écran et par test.
- **Mode allégé** (`?perf=lite`, `data-perf="lite"` confirmé) : 150 ms après le clic, état final atteint (4 annotations, aucun scanner, aucune frappe), panneaux en fond dense sans `backdrop-filter` (`getComputedStyle` : `none`, `rgba(11, 15, 25, 0.95)`).
- **Mobile ~519 px** (la fenêtre s'est retrouvée à cette largeur en cours de session, sur le build incluant le verdict épinglé, la barre de défilement et le fix `TypingText`) : panneaux empilés, puces sur deux lignes, bouton pleine largeur sous les puces, panneau brut du cas `long` en scroll interne, verdict épinglé lisible, annotations surlignées, onglets sous les panneaux.
- Aucune erreur console sur l'ensemble de la session. `npm run lint` / `npm run test` (**61 tests**, +8) / `npm run build` verts.

### Limites de vérification (documentées, pas masquées)

- **Largeur mobile** : le redimensionnement à 500 px a été refusé par l'outil en fin de session (fenêtre restée à 1264 px), comme documenté en Phases 1/4/5/6 — les trois derniers changements (clic ouvre le tooltip, `lg:items-start`, re-césure du prompt brut `long`) ont été vérifiés à 1264 px seulement ; `lg:items-start` ne s'applique qu'au desktop, la re-césure ne change que le contenu, et le fix tooltip a été vérifié par vrai clic (le chemin tactile est le même : `focus` + `click`).
- **`prefers-reduced-motion`** : pas d'émulation disponible (limite inchangée). Par construction, `instant` couvre les deux cas avec le même code, et le chemin `instant` a été vérifié via `?perf=lite`.
- **§7.2 (« 60 fps sur mobile milieu de gamme émulé »)** : non mesurable ici. Sur un vrai tactile, `data-perf="lite"` supprime scanner, frappe et flou : il n'y a plus d'animation à mesurer ; le mode complet sur PC est le seul à animer. À confirmer sur le Galaxy A04 par Xav si souhaité (même protocole que la Phase 6b), non bloquant.
- **Cas `moyen`** : vérifié par lecture du DOM (mode allégé, fenêtre 500 px obtenue sur un nouvel onglet en toute fin de session) — badge `T3 · Session Diagnostic`, headline, 4 annotations, bouton Copier présent, onglet « après » = verdict hypothèse B — mais pas de capture visuelle (la section n'était pas encore entrée dans la fenêtre au moment de la capture).

### Hors scope pour cette itération (et où c'est prévu)

- **Relecture des textes des 4 cas par Xav** (ARRÊT XAV §7.3, non bloquant par décision du patch) — DETTE-09 ⏸, marqueur `[À RELIRE — Xav]` en tête de `playground.ts`.
- **Barre de défilement de l'agent de poche** (même conteneur scrollable, même barre claire) : `scrollbar-subtle` prêt à l'emploi, à appliquer en Phase 7.
- **Retours à la ligne des longues lignes du prompt expert** (60-75 caractères) sur desktop : repli souple d'éditeur, lisible mais moins net que des lignes courtes ; élargir les panneaux ou réduire la fonte est un choix de polish (Phase 7), pas de contenu.
- `ApiAgentProvider`, saisie libre d'un prompt, génération en direct : hors scope explicite (§8), inchangé.

### Dette ajoutée / mise à jour

- DETTE-09 : ☐ → ⏸ (`dette_suivi.md` §B, texte du patch).
- `dette_suivi.md` §D : ligne « Phase 3 exécutée » ajoutée. Aucune nouvelle DETTE-xx.

### Déploiement

Commit `3c04c58` poussé sur `main` après le go de Xav (journal rédigé **avant** le commit, comme demandé). Action « Deploy to GitHub Pages » verte ; bundle servi (`assets/index-DCX7BNSX.js`, 430 Ko) contenant « Passer par l'agent » et « Notes de Session Brute (Triage) » → **Phase 3 en ligne et close** (relecture des textes ouverte, DETTE-09 ⏸). Prochaine étape : Phase 7 (spec à écrire).

---

## 2026-09-15 19:45 — Remise du dépôt sur `main` (patch A)

**Constat à l'exécution, différent du constat du patch (rédigé à 19:15)** : entre-temps, Xav avait déjà fusionné `master` dans `main` sur GitHub via les PR #2 (`ea0efdf`, Phase 2) et #3 (`05f3bc0`, fix z-index). `origin/main` = `05f3bc0`, `master` en est un ancêtre, `git diff master origin/main` vide. Aucun `merge --ff-only` ni push nécessaire : seule la branche `main` **locale** manquait (créée sur `origin/main`).

**Point 2 (vérifié avant toute suppression, arrêt demandé par Xav)** : action « Deploy to GitHub Pages » verte pour `05f3bc0` sur `main` (16:42 UTC) ; le bundle servi (`assets/index-CmoQFRUf.js`, 405 Ko) contient la chaîne « Étude publiée » (`simulator.ts:25`) → **simulateur en ligne**. Xav a confirmé la suppression (« vu qu'on ne perd rien »).

**Point 3** : `master` et `test-mobile-patch` supprimées en local et sur `origin`. `git branch -a` = `main` + `origin/main` (+ `origin/HEAD → main`, déjà en place). **Point 4** : section « Flux de travail » ajoutée au `README.md` (une seule branche, deux procédures de test Galaxy A04 : réseau local `vite preview --host`, ou branche `test/<sujet>` déployée via *Run workflow*, jamais fusionnée dans l'autre sens).

---

## 2026-09-15 18:40 — Fix : bulles de compétences masquées sous les cartes suivantes (z-index) — *entrée écrite a posteriori (patch B)*

Correctif appliqué par Xav dans `f856c54` (`SkillBadges.tsx`, une ligne), hors session d'agent.

- **Symptôme** : au survol d'un badge, le tooltip de note (ex. « Cadre 4D », « Diagnostic structuré » dans la famille Méthode IA) passait **sous** les badges de la famille suivante (LLMs & agents).
- **Cause racine** (lue dans le message de commit, pas réinventée) : chaque badge est enveloppé dans un `m.div` Framer Motion qui pose toujours un `transform` inline (`animate={{ scale }}`) → **un contexte d'empilement par badge**. Sans `z-index` explicite, tous les badges se peignent dans l'ordre du DOM ; un tooltip enfant d'un badge antérieur ne peut jamais passer au-dessus d'un badge sœur rendu après.
- **Correctif** : `className={cn("relative", isHovered && "z-20")}` — le badge survolé/focalisé remonte au-dessus de ses sœurs.
- **Règle de primitive retenue** (reportée dans `specs/06_skills-timeline.md` §4) : *un élément qui déborde de sa carte (tooltip, menu) doit soit remonter le `z-index` de la carte au survol/focus, soit être rendu en portail.* Appliquée en Phase 3 (portail, parce que les panneaux ont un `overflow` que le `z-index` ne franchit pas).

---

## 2026-09-15 (suite) — Phase 2 : Stack Simulator & ROI — *journal reconstitué a posteriori (patch B), à partir du commit `27d671e`, de `dette_suivi.md` §D et du code*

Cette entrée n'a pas été écrite en fin de session Phase 2 (oubli documenté par le patch 19:30) ; elle est reconstituée le 2026-09-15 19:30 à partir des sources citées, sans rien y ajouter qui n'y figure pas.

### Décisions prises et pourquoi

- **Contenu strictement conforme à `PATCHES_2026-09-15_1800.md`** (DETTE-07 tranchée par Xav) : `references.ts` (4 sources, `verified: false`, aucune URL ajoutée), `simulator.ts` (6 problématiques, fourchettes/baselines/`evidence` du patch, badge « Étude publiée »/« Données éditeurs »/« Non chiffré »). Recommandations génériques (« Claude »), pas de modèle nommé (T5b).
- **`compute.ts` pur, testé en premier** (25 tests Vitest : sélection vide / un seul / tous, baseline personnalisée, problématique non chiffrée exclue du compteur, dédoublonnage de la stack, sérialisation `sessionStorage`), puis les composants (`ProblemGrid`, `EvidenceBadge`, `RangeSlider`, `RoiCounters`, `StackPanel`).
- **Écarts de contenu assumés par rapport au bloc de types du patch** : `baseline` rendu **optionnel** dans `Problem` (`formation` n'a pas de curseur, conformément au tableau du patch) ; champ `qualitativeNote` optionnel ajouté pour porter le texte spécifique de `tri` sans le coder en dur dans un composant (T8).
- **`AnimatedCounter` étendu d'une prop `decimals`** (rétrocompatible, défaut 0) pour le compteur « h/sem » à 1 décimale exigé par §7.6 du patch.
- **Bouton « Discuter de cette stack »** : écrit `sessionStorage['simulator']` (`{ selection, baselines }`) puis émet `simulator:updated`, écouté par `ContactForm.tsx` (petit ajout à la Phase 6) pour que Contact se pré-remplisse **dans la même session SPA, sans rechargement**. `readSimulator.ts` vérifié tolérant à la clé `baselines` supplémentaire (test ajouté, aucun correctif nécessaire).
- **Mode allégé** : aucun nouveau `backdrop-filter`/glow, seule `GlassCard` (déjà `lite:`-safe) réutilisée.

### Livré et validé à l'écran

- Vérification visuelle réelle (`vite preview`) : desktop ~1274 px et mobile ~500 px (viewport de l'outil ne descendant pas à 375 px, noté à l'époque), aucune erreur console ; revérifié sous `?perf=lite`.
- **Critère §7.6 du patch (vérification manuelle du calcul)** : `support` seul, curseur à 15 h/sem → compteur « 2,8h », formule affichée « 2,8 h/sem × 46 sem × 35 €/h » — conforme au calcul attendu (15 × 0,185 = 2,775).
- Pré-remplissage de Contact vérifié à l'écran (`aria-pressed` sur « Automatisation d'un process » après clic, sans rechargement).
- `npm run build` / `lint` / `test` verts (53 tests).
- Commit `27d671e` (Phase 2), puis fix `f856c54` (ci-dessus). Mis en ligne par la remise sur `main` du 19:45.

### Hors scope pour cette itération (et où c'est prévu)

- Vérification et liens des références (`references.ts`, `verified → true`) : **DETTE-31**, Phase 7. Titres/venues des 4 références renseignés de mémoire par l'agent (non tous fournis par le patch) — d'où cette dette.
- Chiffres `saisie` reposant sur des données éditeurs : à remplacer si une étude indépendante sort (DETTE-31).

### Dette ajoutée / mise à jour

- DETTE-07 ☑ (tranchée par Xav, patch 18:00), DETTE-08 (35 €/h) consommée par le curseur, **DETTE-31 ouverte** (§C).

---

## 2026-09-15 (suite) — Clôture Phase 6b

Xav a testé `?perf=full` puis `?perf=lite` directement sur le Galaxy A04 (Firefox Android), sur une branche de test (`test-mobile-patch`) poussée pour l'occasion. **Résultat : "Nette amélioration de la fluidité sur smartphone."** Critère §7.6 (ARRÊT XAV) levé.

`test-mobile-patch` fusionnée dans `master` (fast-forward, `bf767c9..fb179de`, aucun conflit — la branche n'avait pas divergé). DETTE-30 passée de ⏸ à ☑ dans `dette_suivi.md` §C. Statut de `specs/00_ROADMAP.md` mis à jour : Phase 6b close, phase courante → Phase 2.

**Phase 6b officiellement close.** Reste ouvert et non bloquant, prévu Phase 7 : §7.5 (Lighthouse mobile sur le déploiement — le mode allégé ne peut que l'améliorer ou le laisser inchangé, à reconfirmer une fois en ligne) et l'optimisation du mode complet (pistes notées en §6/§3 de la spec 08, hors scope explicite de cette phase).

---

## 2026-09-15 (suite) — Phase 6b : Mode allégé tactile — mise en œuvre et vérification (§7.1-§7.4)

Suite directe de l'entrée d'inventaire ci-dessous (même session). Implémentation faite, critère maître §7.1 validé, mode allégé vérifié par `getComputedStyle`. **Session arrêtée à l'ARRÊT XAV §7.6** (mesure terrain sur le Galaxy A04, hors de portée de l'agent) — Phase 6b non close, en attente du retour de Xav.

### Décisions prises et pourquoi

- **Mécanisme par effet (consigne §6 : un seul par effet)** :
  - **Verre dépoli → fond dense** : variante Tailwind `lite:` (pas de token `--glass-blur`/`--glass-alpha`) sur chaque usage de `backdrop-blur-xl`/`backdrop-blur-sm` (`lite:backdrop-blur-none` + `lite:bg-bg-deep/95` ou `lite:bg-black/90`). Un token unique aurait forcé la même valeur de flou par défaut sur des primitives qui n'ont pas le même rayon aujourd'hui (`xl` = 24px sur la plupart, `sm` = 4px sur l'overlay de `Modal`) — l'utiliser aurait changé le rendu PC. La variante, elle, ne s'applique jamais sous `data-perf="full"` (vérifié par construction : `html[data-perf="lite"] &`).
  - **Glows → bordures accentuées** : token (`--glow-blue/violet/emerald` → `none` sous `html[data-perf="lite"]`, dans `tokens.css`). Un seul point de vérité qui neutralise à la fois les classes `shadow-glow-*` et les `boxShadow: "var(--glow-*)"` inline de `motion` (`GlassCard.tsx` au survol, `NeonButton.tsx` au survol) — aucune de ces deux consommations n'a eu besoin d'être modifiée. Bordure accentuée de compensation déjà présente gratuitement pour l'avatar Hero (`border-neon-violet/40` déjà dans le JSX existant) ; ajoutée explicitement pour la carte de famille active des compétences (`lite:border-neon-blue/40` dans `SkillBadges.tsx`, seul cas où elle manquait).
  - **Ambiance** : token `--ambient-opacity` (1 → 0 en lite), consommé par `body::before` (`globals.css`). Le grain de bruit (`body::after`) n'est pas concerné — pas nommé par la spec (§3.3 : "halos radiaux"), coût négligeable (SVG statique, jamais animé).
- **Halo du Hero (`HeroGlow`) modifié malgré son absence de la liste de fichiers indicative de la spec (§5)** : le texte de la spec (§3.3) nomme explicitement "les halos radiaux du fond de page **et du Hero**". Neutraliser seulement le token d'ambiance de fond aurait laissé tourner la boucle `animate` infinie (8 s, `repeat: Infinity`) du Hero — exactement le genre de recomposite continu que la phase vise à supprimer. Ajout de `useLiteMode()` dans `Hero.tsx` : en lite, `animate={{opacity: 0}}` fixe, sans transition, la boucle n'est jamais lancée (pas seulement masquée par opacité). Décision visuelle : opacité 0 plutôt qu'un dégradé linéaire statique de repli — vérifié à l'écran (375/500 px) que le fond ne paraît pas trop nu (l'anneau `border-neon-violet/40` de l'avatar et la hiérarchie de texte suffisent).
- **Frise (`Timeline.tsx`) scindée en deux composants** (`ProgressLineFull` / `ProgressLineLite`) plutôt qu'une branche conditionnelle dans un seul composant : `useScroll` de `motion` s'abonne au scroll dès qu'il est appelé, **indépendamment** de l'usage de sa valeur de retour dans le style — une simple branche `if` autour du style aurait laissé l'écouteur de scroll actif même en lite, ne réglant rien. Deux composants, deux jeux de hooks, choix figé au montage (`data-perf` ne change jamais à chaud, §4) : `useScroll` n'est *appelé* que si `liteMode === "full"`. En lite, `IntersectionObserver` (une fois, `disconnect()` après déclenchement) + transition CSS `scale-y-0 → scale-y-100` sur un `<div>` simple (pas de `m.div`).
- **`SkillRadar.tsx` (`isAnimationActive={false}`) et le tilt 3D de `GlassCard` non modifiés** : déjà conformes à l'état actuel du code avant toute intervention (voir inventaire ci-dessous, points 5 et 9) — les retoucher aurait été soit sans effet, soit un risque de régression sur le mode complet (activer l'animation du radar seulement en `full` aurait changé le mode complet, interdit par §3 : "Strictement rien ne change").
- **`SectionShell` non modifié** : conservé explicitement par la spec (§3.5) sauf preuve contraire par la mesure terrain — pas de preuve à ce stade, donc pas de changement.
- **2 tests au-delà des 4 prescrits** (`liteMode.test.ts`, 6 cas au total) : les 4 cas de la spec (override lite, override full, coarse, fine/absent) plus 2 cas d'edge case déjà écrits dans le texte de la spec (§4 : override mémorisé en `sessionStorage`, valeur `?perf=` inconnue ignorée) — même fonction, couverture cohérente avec le texte de la spec plutôt qu'un ajout hors sujet.

### Méthodologie de vérification du critère maître §7.1 (pixel-identique PC)

Captures `vite preview` à la taille de fenêtre stable obtenue dans cette session pour une demande 1280×900 (**1264×749 réels** — écart constant dû au chrome du navigateur, cohérent avec les phases précédentes qui documentaient déjà "Desktop ~1264 px" ; confirmé strictement stable tant que je ne rappelle pas `resize_window`, ce qui a permis la comparaison). Procédure : `git stash -u` → build → captures des 7 sections ("avant", commit de référence) → `git stash pop` → build → captures des 7 sections ("après", même fenêtre, aucun redimensionnement entre les deux) — comparaison pixel par pixel (script `compare.js`, `sharp`, seuil de tolérance 3/255 par canal pour absorber le bruit de compression JPEG des captures) plutôt qu'un ajout de dépendance (`pixelmatch`) : `sharp` est déjà une devDependency du projet.

**Résultat** : Simulateur, Playground, Projets, Compétences → **0 pixel différent / 946 736** (0,0000 %). Contact → 0 après une reprise propre (la première capture batch avait attrapé une frame de l'animation d'entrée `whileInView` de `SectionShell` pas encore stabilisée malgré l'attente de 1 s ; revérifié avec 2 s d'attente sur un rechargement frais, identique au pixel près à l'avant). Hero → 4 185/946 736 px (0,44 %), **entièrement dans la zone d'animation en cours** explicitement exclue par §7.1 : le halo `HeroGlow` tournait déjà en boucle infinie *avant* la Phase 6b (mesuré : 4 157 px de bruit naturel entre deux captures consécutives du Hero **sans aucun changement de code**, soit le même ordre de grandeur) — pas une régression introduite par cette phase. Jouer → 202 px hors zone après exclusion du cadre de l'iframe (0,02 %), dont le curseur de souris superposé par l'outil de capture lui-même (visible en cluster isolé au-dessus du cadre) ; les 5 927 px restants sont *dans* le cadre de l'iframe haTD, contenu tiers embarqué qui joue son cold-open de façon autonome (RAF propre au jeu) — hors de portée du rendu du portfolio, explicitement une "zone d'animation en cours".

### Livré et validé à l'écran

- **§7.1 (critère maître)** : voir ci-dessus — validé, aucune régression de rendu PC hors zones d'animation explicitement exclues par la spec.
- **§7.2 (mode allégé vérifiable par `getComputedStyle`)** : `?perf=lite` testé à 1264 px et à ~500 px (375 px non atteignable avec les outils de cette session — limite déjà documentée aux Phases 1/4/5, qui touche ici aussi la largeur *desktop*, cf. note plus bas). Header, `GlassCard` (agent de poche) et le panneau tooltip du radar : `backdropFilter: "none"`, `backgroundColor: "rgba(11, 15, 25, 0.95)"`, `boxShadow: "none"` aux deux largeurs — conforme.
- **§7.3 (lisibilité en lite)** : header sticky vérifié lisible (texte "Xav" + icône menu nettement contrastés) au-dessus de 3 positions de défilement (Projets, une zone de marge entre sections, Jouer) à ~500 px, malgru l'absence de flou — le fond dense (`alpha 0.95`) suffit.
- **Frise en lite** : vérifié par lecture directe du DOM (`getComputedStyle`) que `ProgressLineLite` est bien monté (pas de `m.div`), que la classe `scale-y-100` est posée après le déclenchement de l'`IntersectionObserver`, et que `transform` vaut la matrice identité — le mécanisme scroll-continu (`useScroll`) n'est jamais invoqué dans cette branche.
- **`npm run lint` / `npm run test` (37 tests, dont les 6 nouveaux de `liteMode.test.ts`) / `npm run build`** verts après le `git stash pop` (état final, pas seulement pendant le développement).
- **Edge case §4 (cumul reduced-motion + lite)** : vérifié par lecture du code plutôt qu'à l'écran (pas d'outil d'émulation `prefers-reduced-motion` dans cette session, limite déjà documentée aux phases précédentes) — dans `Hero.tsx` et `Timeline.tsx`, la branche `isLite`/`liteMode === "lite"` est évaluée en premier et ne réactive jamais un état que `reducedMotion` aurait coupé (ex. `ProgressLineLite` avec `reducedMotion=true` démarre `drawn=true` sans jamais poser d'observateur).

### Hors scope pour cette itération (et où c'est prévu)

- **§7.5 (Lighthouse mobile sur le déploiement)** : nécessite le site poussé et en ligne — non exécutable localement de façon représentative (déjà noté en Phase 0 : l'écart local/prod vient du throttling de `vite preview`). À vérifier une fois déployé ; le mode allégé ne devrait que l'améliorer ou le laisser inchangé (aucun octet de JS/CSS supplémentaire significatif — le script inline ajoute ~1 Ko à `index.html`).
- **Largeur mobile plancher toujours ~500 px avec les outils de cette session** (375 px non atteignable), comme documenté aux Phases 1/4/5. Nouveau cette session : la largeur *desktop* demandée (1280 px) n'est elle non plus jamais obtenue à l'identique (1264 px réels, écart constant du chrome navigateur) — sans conséquence sur le critère maître puisque la comparaison avant/après s'est faite à fenêtre rigoureusement stable (aucun redimensionnement entre les deux captures).
- **Optimisation du mode complet, réglage utilisateur, détection de puissance d'appareil** : hors scope explicite (§8), inchangé, prévu Phase 7 si pertinent.

### Dette ajoutée / mise à jour

- Ligne DETTE-30 ajoutée à `dette_suivi.md` §C (patch de la spec 08, reporté ci-dessous) : implémentation faite, **statut ⏸ en attente de la mesure terrain de Xav** (ARRÊT XAV ci-dessous), pas encore cochée ☑.

### [ARRÊT XAV] — critère §7.6 de la spec 08

Le critère §7.6 ("le défilement doit être **nettement** plus fluide en `lite`") ne peut être mesuré que sur l'appareil réel qui a signalé le problème (Galaxy A04, Firefox Android) — hors de portée de cet agent. Tout le reste de la Phase 6b est fait et vérifié (§7.1 à §7.4 ci-dessus) ; §7.5 (Lighthouse) attend le déploiement.

**Ce qu'il reste à faire, concrètement** : ouvrir `https://xab-dev.github.io/portfolio-v2/?perf=lite` puis `?perf=full` sur le Galaxy A04 (après déploiement de cette phase) et comparer la fluidité du défilement au ressenti. Si le gain est net → Phase 6b close, dette DETTE-30 cochée. Si le gain est faible → **ne pas empiler d'autres allègements à l'aveugle** (consigne explicite de la spec) : revenir avec un profil de performance Firefox Android (`about:debugging` en USB) pour identifier ce qui domine encore le budget d'image.

Rien n'a été poussé ni committé à ce stade (consigne implicite : le critère maître devait être validé avant tout envoi, et le critère §7.6 reste ouvert).

---

## 2026-09-15 (suite) — Phase 6b : Mode allégé tactile — inventaire §6 (avant tout changement)

Session ouverte sur `specs/08_mode-allege-tactile.md` (DETTE-30, retour terrain Xav : Galaxy A04/Firefox Android, défilement saccadé uniforme). Consigne §6 : lister l'inventaire des règles coûteuses **avant d'écrire une ligne de code**. Inventaire ci-dessous, établi par grep exhaustif sur `src/` (`backdrop-blur|backdrop-filter|shadow-\[|boxShadow|mix-blend|blur-|animate-|useScroll|scaleY|filter:`) puis lecture de chaque fichier trouvé.

### Inventaire des règles coûteuses

**1. `backdrop-filter` (`backdrop-blur-*`)** — la plus fréquente, et la plus probable cause racine du ticket (seul effet actif *en permanence pendant le défilement*, pas seulement au montage) :
- `Navbar.tsx:47` — header **sticky**, `backdrop-blur-xl` : repeint à chaque frame de scroll tant que la page défile, sur toutes les sections. Cible prioritaire.
- `Navbar.tsx:98` — panneau menu mobile plein écran, `backdrop-blur-xl` (ponctuel, ouverture menu).
- `GlassCard.tsx:61` — `backdrop-blur-xl` sur toutes les cartes verre (agent, projets, compétences, contact...).
- `Modal.tsx:64` (overlay, `backdrop-blur-sm`) et `Modal.tsx:84` (dialogue, `backdrop-blur-xl`).
- `Timeline.tsx:54` — chaque carte de jalon de la frise, `backdrop-blur-xl` (cumulé avec le point 4 ci-dessous, sur la même section).
- `SkillRadar.tsx:92` et `SkillBadges.tsx:64` — tooltips, `backdrop-blur-xl` (déclenchement ponctuel au survol/tap, secondaire).
- `TeaserOverlay.tsx:155` — bouton Fermer de l'overlay teaser mobile, `backdrop-blur-xl` : **rendu réellement sur le chemin tactile** (contrairement au point suivant), à traiter.
- `Play.tsx:63` et `Play.tsx:76` — cadre iframe desktop + bouton plein écran, `backdrop-blur-xl` : **hors périmètre réel** — ce bloc ne s'affiche que dans la branche `!isTouch` (voir `useCoarsePointer` local au fichier), donc jamais rendu sous `pointer: coarse`. Laissé tel quel (aucun gain possible, `lite:` n'y changerait rien).

**2. `box-shadow` à grand rayon de flou (glows)** — `--glow-blue/violet/emerald` = `0 0 40px rgba(...)` (`tokens.css`) :
- Statiques, actifs en permanence dès affichage (pas seulement au survol) : `Hero.tsx:34` médaillon avatar (`shadow-glow-violet`), `Timeline.tsx:50` point de jalon (`shadow-glow-blue`), `SkillBadges.tsx:32` badge de famille active (`shadow-glow-blue`). Ce sont ces trois-là qui comptent pour le budget GPU en continu.
- Déclenchés au survol via `whileHover` de `motion` (style inline JS, pas du CSS statique) : `GlassCard.tsx:58`, `NeonButton.tsx:34`. Ne se déclenchent normalement pas sur un vrai appareil tactile (pas d'évènement hover réel) — la spec le confirme (§3.2 : "les glows au survol n'ont de toute façon pas de sens au tactile"). Une règle CSS `lite:` ne peut de toute façon pas les neutraliser (ce n'est pas du CSS statique) : laissés tels quels, documenté comme non-cible.

**3. Halos d'ambiance (`radial-gradient`)** :
- `globals.css` `body::before` (3 radial-gradients) et `body::after` (bruit SVG `feTurbulence`) : tous deux en `position: fixed`, jamais animés, mais un élément `fixed` reste épinglé à un calque de composition pendant tout le scroll — coût de compositing continu même sans changement de pixels.
- `Hero.tsx` `HeroGlow` : radial-gradient animé en boucle infinie (`opacity: [0.15, 0.25, 0.15]`, 8 s, `repeat: Infinity`), actif dès que la section Hero est montée, **indépendamment de `prefers-reduced-motion`** au-delà de l'amplitude (reduced-motion fige l'opacité à 0.2 mais l'élément reste, aucune boucle `animate` n'est lancée dans ce cas — vérifié : la prop `animate` vaut `{opacity: 0.2}`, une valeur fixe, pas une boucle). Cumul avec le scroll (recomposite en même temps que le défilement) sur la première section vue.

**4. Frise (`Timeline.tsx`, Phase 5)** : `useScroll({ target: containerRef, offset: [...] })` réévalue `scrollYProgress` à *chaque évènement de scroll* tant que la section est dans la fenêtre d'observation, piloté vers un `scaleY` sur un `<div>` à dégradé — combiné aux `backdrop-blur-xl` de chaque carte de jalon (point 1) dans la même zone : c'est exactement le scénario du §3.4 de la spec.

**5. Recharts radar (`SkillRadar.tsx:132`)** : `isAnimationActive={false}` **déjà présent dans le code actuel**, inconditionnellement. L'item §3.6 de la spec est donc déjà satisfait sans changement — documenté ici pour ne pas le retraiter par erreur.

**6. `mix-blend-mode`** : aucune occurrence dans `src/` (grep négatif). Rien à traiter.

**7. `filter:` CSS générique** (hors `backdrop-filter`/`box-shadow` déjà listés) : la seule occurrence est le `feTurbulence` interne au bruit SVG du point 3, déjà couvert. Rien d'autre.

**8. `SectionShell` (entrée au scroll, `whileInView`)** : animation `transform/opacity` unique par section (pas répétée au scroll). Conservée par consigne explicite de la spec (§3.5, "sauf si la mesure §7 montre qu'elle contribue") — non modifiée dans cette passe, pas dans le périmètre de l'inventaire à corriger.

**9. Tilt 3D `GlassCard`** : déjà désactivé au tactile depuis la Phase 0 (`isTouchDevice()` dans `GlassCard.tsx`). Rien à changer (§3.7).

### Périmètre retenu pour la suite de la Phase 6b

D'après cet inventaire, les changements portent sur : header sticky, `GlassCard`, `Modal`, overlay teaser mobile (point 1) ; les trois glows statiques permanents (point 2) ; les halos de fond + `HeroGlow` (point 3, opacité seulement — la boucle d'animation infinie elle-même n'est pas un "effet de rendu" au sens de la spec mais sera réexaminée si elle contribue à la mesure terrain) ; la frise en `IntersectionObserver` au lieu de `useScroll` (point 4). Aucun changement sur les points 5, 6, 7, 8, 9 (déjà conformes ou hors périmètre).

Mécanisme retenu (consigne §6 : un seul par effet) : **tokens CSS** (`--glass-blur`, `--glow-shadow`, `--ambient-opacity`) redéfinis sous `html[data-perf="lite"]` dans `tokens.css`, consommés par les classes existantes sans dupliquer de logique dans les composants, sauf quand une valeur est en dur dans une classe Tailwind non pilotable par variable (ex. `backdrop-blur-xl` littéral) — dans ce cas, variante `lite:` Tailwind, jamais les deux pour le même effet.

Aucun changement de code effectué avant cette entrée. Implémentation à suivre dans la même session, journalisée séparément.

---

## 2026-09-15 (suite) — Session dédiée : mail + 404 haTD

Session à portée volontairement restreinte (consigne de Xav : ne toucher que le mail et les 404 de haTD, rien d'autre).

**DETTE-28 (délivrabilité Formspree) résolue.** Xav a revérifié depuis le vrai domaine déployé (`https://xab-dev.github.io/portfolio-v2/`) : le mail de test arrive désormais normalement en boîte de réception (`xa.bou@laposte.net`), plus classé en Spam. Confirme l'hypothèse posée en clôture de Phase 6 (l'origine `localhost` des premiers tests expliquait le classement en spam côté Formspree).

**Nouvelle DETTE-29 (404 sur le lien haTD) — trouvée et résolue.** Xav a signalé que `https://xab-dev.github.io/cv-portfolio/haTD_V1` fonctionne dans son navigateur. Vérification par `curl` : cette URL (sans `/` final) répond bien `200` (375 Ko, page HTML autonome, aucune référence d'asset externe — tout est inliné dans le fichier), mais **`site.hatdUrl`** (`src/content/site.ts`) et le lien direct de la fiche projet (`src/content/projects.ts`) pointaient vers la même URL **avec un `/` final**, qui répond `404` : le jeu est déployé côté `cv-portfolio` comme un fichier unique `haTD_V1.html` (servi aussi sans extension), pas comme un dossier contenant `index.html`, donc `.../haTD_V1/` ne résout rien. C'est ce `/` final qui causait la 404 documentée en Phase 6 (`JOURNAL_DEV.md`, note "Poids de l'iframe haTD non mesuré") — le jeu était en réalité déployé, seule l'URL utilisée côté portfolio était fautive. Corrigé aux deux endroits (`/` final retiré) ; l'iframe (`Play.tsx`), le lien "Ouvrir dans un nouvel onglet" et le `TeaserOverlay` consomment tous `play.url`/`site.hatdUrl`, donc un seul point de correction dans `site.ts` suffisait à couvrir l'iframe et le teaser, et le lien direct de `projects.ts` a été corrigé séparément (URL dupliquée, pas de import partagé).

`npm run lint` et `npm run test` (31 tests) verts après les deux changements. Aucune autre partie du code touchée dans cette session.

---

## 2026-09-15 (suite) — Clôture Phase 6

Deux points traités après la livraison initiale de la Phase 6, avant clôture :

**DETTE-14 (`terrain`)** : Xav a déposé la source manquante (`images-src/projects/terrain/raw/`). La photo montrait son poste de travail réel — deux écrans avec du code et un onglet mail visibles. Avant de la câbler, confirmation demandée à Xav (le contenu ne correspondait pas au sujet du projet "Séquence d'intervention terrain" et exposait des informations d'écran). Réponse : "Oui mais recadre-la". Floutage fort appliqué à la source (`sharp().blur(45)`, aucun texte lisible dans le résultat) avant le passage dans le pipeline standard (`npm run images`) ; résultat 15 Ko, câblé dans `projects.ts` (`alt` qui décrit honnêtement le floutage volontaire, pas un contenu inventé). Les 6 fiches ont désormais toutes leur image. Vérifié en modale (deep link `#projets/terrain`).

**[ARRÊT XAV] du critère §7.1** : Xav a signalé ne pas recevoir le mail de test malgré une vérification des dossiers spam. Retrouvé côté dashboard Formspree (`xgaegryp/submissions/spam`) : la soumission de test y figure — la requête arrive donc bien jusqu'à Formspree (le mécanisme d'envoi du site fonctionne), c'est le relais par mail qui n'a pas eu lieu, un point du ressort de Formspree/Laposte plutôt que du code du site. Amélioration apportée quand même : `submitContactForm` (`src/lib/contact/submit.ts`) envoie désormais deux champs spéciaux reconnus par Formspree, `_subject` (sujet de mail clair : "Contact portfolio — {type de projet}") et `_replyto` (Reply-To pointé vers l'e-mail du prospect, pour pouvoir répondre directement) — absents jusque-là, le mail seul JSON brut avec sujet générique étant plus susceptible d'être filtré. **DETTE-28** ouverte : les tests de cette session ont tous été faits depuis `localhost`, jamais depuis le domaine réel déployé (`xab-dev.github.io`) — à revérifier une fois en ligne, l'origine non reconnue pouvant expliquer un classement en spam plus agressif de la part de Formspree.

Xav a donné le feu vert ("tu peux continuer") après avoir retrouvé le mail côté dashboard. Critère §7.1 considéré rempli au sens technique — parcours, envoi réel, et repli mailto sont tous vérifiés et fonctionnels ; la délivrabilité finale en production reste à reconfirmer (DETTE-28, non bloquante). `npm run build`/`lint`/`test` verts (31 tests) après les deux changements. **Phase 6 officiellement close.**

---

## 2026-09-15 (suite) — Phase 6 : Contact smart + section Jouer

### Décisions prises et pourquoi

- **`readSimulator.ts` scindé en deux fonctions** : `parseSimulatorValue(raw: string | null)`, une fonction pure qui interprète une chaîne déjà lue (testée sur les 3 cas — absent, invalide, valide — dans `readSimulator.test.ts`, 3 tests), et `readSimulator()`, un wrapper non testé (trivial, un `try/catch` autour de `sessionStorage.getItem`) qui l'appelle. La spec demande "une fonction pure testée" pour "la lecture" ; lire `sessionStorage` est intrinsèquement un effet de bord, donc c'est la logique de décision (le parsing) qui est isolée et testée, pas l'accès storage lui-même — cohérent avec `matchReply` (Phase 1) qui suit le même principe.
- **Auto-avance du stepper à chaque sélection** (étape 1 : au clic sur un type de projet ; étape 2 : dès que budget *et* délai sont choisis, dans n'importe quel ordre) plutôt qu'un bouton "Suivant" explicite : c'est ce qui rend les "3 clics" du titre de section littéraux (1 clic étape 1, 2 clics étape 2 = 3 clics pour atteindre les coordonnées). "Précédent" reste un bouton explicite à chaque étape suivante, sélections conservées (edge case §4).
- **Bouton d'envoi désactivé (`disabled`) tant que le formulaire n'est pas valide**, plutôt que toujours cliquable avec affichage d'erreurs au clic : les erreurs par champ s'affichent au `blur` (`touched`), pas seulement à la tentative d'envoi — un utilisateur ne peut donc jamais cliquer "Envoyer" sur un formulaire invalide. Vérifié que le pattern de validation progressive au blur fonctionne bien (voir bug ci-dessous, qui portait sur autre chose).
- **Honeypot** : champ cascade masqué par `clip:rect(0,0,0,0)` (1×1 px, dans le flux normal) plutôt que `left:-9999px` : ce dernier, combiné au conteneur `transform` du Stepper (AnimatePresence anime `x`), créerait un nouveau *containing block* et un débordement scrollable géant du conteneur transformé — bug potentiel trouvé en revue avant même de tester, corrigé avant livraison.
- **Repli honeypot silencieux** : si le champ piège est rempli, l'état passe directement à `sent` sans jamais appeler Formspree — pour ne pas indiquer à un bot que sa soumission a été filtrée.
- **`buildMailtoFallback` utilise `encodeURIComponent`, pas `URLSearchParams`** : `URLSearchParams` encode les espaces en `+` (forme `application/x-www-form-urlencoded`), invalide dans un lien `mailto:` (RFC 6068) — trouvé en écrivant le code, corrigé avant test.
- **Fullscreen API sur le conteneur de l'iframe** (pas sur l'iframe elle-même), conformément au texte exact de la spec §3 ("bouton Plein écran (Fullscreen API sur le conteneur)") — vérifié fonctionnel dans le vrai navigateur (voir vérification visuelle).
- **Timer d'auto-fermeture de `TeaserOverlay` en `requestAnimationFrame`** avec accumulation d'un temps écoulé (`elapsedRef`) plutôt qu'un simple `setTimeout` fixe : permet une pause/reprise exacte sur `visibilitychange` (edge case §4) sans perdre ni dupliquer de temps, et anime la barre de progression au même rythme.
- **Fermeture de l'overlay mobile par historique** (`history.pushState` à l'ouverture, `history.back()` au lieu d'un simple `onClose()` direct pour Fermer/Échap/auto-fermeture, `popstate` écouté pour le bouton retour du navigateur) : un seul mécanisme cohérent pour les 3 déclencheurs de fermeture (bouton, clavier, retour arrière), vérifié dans le vrai navigateur (voir plus bas) — le bouton retour ferme bien l'overlay au lieu de quitter le site.
- **`useCoarsePointer` réactif** (`matchMedia('(pointer: coarse)').matches` en état initial + écouteur `change`) plutôt qu'une détection figée au montage : cohérent avec `isTouchDevice()` déjà présent dans `GlassCard.tsx` (Phase 0), mais rendu réactif ici car il pilote un choix de rendu structurel (iframe directe vs. carte teaser), pas juste une option d'animation.

### Bug trouvé et corrigé (cause racine)

**`NeonButton` n'avait aucun style visuel pour l'état `disabled`.** Découvert en vérification visuelle réelle : le bouton "Envoyer" du formulaire de contact, désactivé tant que les champs ne sont pas valides, restait visuellement identique (même bleu vif, même curseur) à son état activé — aucun moyen pour l'utilisateur de savoir qu'il ne peut pas encore l'actionner. Cause racine : `Tag.tsx` (Phase 0) a `disabled:cursor-not-allowed disabled:opacity-50` dans ses classes, mais `NeonButton.tsx` (Phase 1, étendu avec la prop `href`) ne les a jamais eues — jamais remarqué avant car aucune section réelle n'avait encore utilisé `NeonButton` dans un état conditionnellement désactivé (Hero : CTA toujours actifs). Corrigé : mêmes classes `disabled:` ajoutées, et les animations `whileHover`/`whileTap` de Framer Motion (qui ignorent l'attribut HTML `disabled`) sont maintenant coupées quand le bouton est désactivé, pour ne pas laisser un bouton visuellement mort "grossir" au survol. Revérifié à l'écran : le bouton "Envoyer" est maintenant clairement estompé tant que le formulaire est invalide.

### Livré et validé à l'écran

Vérifié via Claude in Chrome (`vite preview`), desktop 1280 px et mobile ~500 px (voir note sur la largeur ci-dessous, DETTE ouverte) :
- **Stepper de contact** : les 3 étapes s'enchaînent au clic (type de projet → budget + délai → coordonnées), barre de progression animée, "Précédent" ramène à l'étape précédente avec les sélections conservées.
- **Validation des champs** : nom vide, e-mail au format invalide (`pasunemail`) et message trop court (`court`, "20 caractères minimum (5/20)") affichent chacun leur message d'erreur au `blur`, bordure distinctive, `aria-invalid="true"` et `aria-describedby` pointant vers un élément d'erreur existant — vérifié par lecture directe du DOM (§7.3 validé).
- **Envoi réel** : `POST` vers `https://formspree.io/f/xgaegryp` avec des données de test identifiables ("Test Agent 2", message explicitement marqué comme test) → réponse 2xx → carte de confirmation affichée avec récap des choix ("Automatisation d'un process · 500 – 2 000 € · Ce mois.") et "Réponse sous 24 h." (DETTE-06). **Reste à confirmer par Xav : réception réelle du mail** — voir ARRÊT XAV ci-dessous.
- **Repli réseau coupé** : `fetch` neutralisé côté page pour simuler une coupure réseau → état `error` affiché ("L'envoi a échoué (réseau indisponible). Vos informations sont conservées."), champs bien conservés, lien `mailto:` de secours généré avec sujet/corps pré-remplis et correctement encodés — vérifié fonctionnel (§7.1, partie "repli mailto vérifié en coupant le réseau").
- **Pré-remplissage simulateur** : `sessionStorage.setItem('simulator', '{"selection":["support","saisie"]}')` injecté puis rechargement → encart "Depuis le simulateur : Support, Saisie" affiché, étape 1 pré-sélectionnée sur "Automatisation d'un process", modifiable ; valeur JSON invalide → repli propre sur l'état vierge, aucune erreur console. Voir le report explicite du critère §7.2 plus bas.
- **Section Jouer, PC** : iframe chargée en `loading="lazy"`, cadre verre au ratio 16/9, bouton "Plein écran" fonctionnel (`document.fullscreenElement` confirmé après clic réel), lien de repli "Ouvrir dans un nouvel onglet" toujours présent (edge case iframe bloquée, §4).
- **Section Jouer, mobile (vérifié avec le chemin tactile forcé temporairement — voir note DETTE ci-dessous)** : carte "Voir l'intro" affichée à la place de l'iframe directe, overlay plein écran avec barre de progression animée, bouton Fermer ≥ 44 px, ligne "Jouable sur ordinateur" avec URL copiable (bouton "Copier" → "Copié !" confirmé) ; les 3 mécanismes de fermeture testés individuellement et fonctionnels : bouton Fermer, touche Échap, bouton retour du navigateur (`navigate: back`) — dans les 3 cas l'overlay se ferme sans quitter le site ; fermeture automatique après le délai configuré confirmée (testée avec un délai raccourci temporairement, voir DETTE).
- **`#kitchen-sink`** : absent de `dist/` après build (`grep -ri kitchen dist/` sans résultat), absent de la nav, `KitchenSink.tsx` supprimé. Tous les primitives concernées (`NeonButton` avec/sans `href`, `Modal`, `Tag`, `TypingText`, `GlassCard`) restent utilisées par au moins une vraie section ; `AnimatedCounter` gardée sans usage réel, comme prévu pour la Phase 2 (§3 bis).
- **Images `templates`/`1am`** : câblées dans `projects.ts`, vérifiées à l'écran via deep link (`#projets/templates`, `#projets/1am`) — l'image affichée correspond bien au contenu réel du fichier (capture du document `Bibliothèque de templates — Architecte Spec.md` pour l'une, capture de la page YouTube "Un Autre Monde" pour l'autre ; `alt` réécrit en conséquence pour rester honnête plutôt que générique), `loading="lazy"`, agrandissement au clic fonctionnel dans les deux cas (§7.6 validé).
- Aucune erreur console nouvelle sur l'ensemble de la session (une seule exception résiduelle, `Permissions check failed`, provient d'une tentative de plein écran déclenchée par script — pas d'un vrai clic — pendant le test, sans rapport avec le code livré).
- `npm run build`, `npm run lint` (oxlint) et `npm run test` (Vitest, 31 tests dont 3 nouveaux pour `readSimulator.ts`) verts.

### Note méthode : un artefact de clic automatisé, pas un bug applicatif

En testant le stepper via clic à coordonnées fixes, un clic sur "Automatisation d'un process" (étape 1) a occasionnellement abouti à une sélection de budget (étape 2) jamais demandée. Diagnostiqué avant de conclure à un bug : un clic déclenché par l'outil d'automatisation (mousedown/mouseup CDP à coordonnées fixes) peut, si l'interface se re-rend entre les deux phases du clic, voir son `mouseup` atterrir sur un élément différent de son `mousedown`. Reproduit et confirmé comme artefact de test (pas un bug produit) : un `element.click()` JS unique (atomique) sur le même bouton, dans le même état, sélectionne toujours le bon type de projet et ne touche jamais au budget. Un vrai clic humain ne peut pas non plus déclencher ce cas : React ne re-rend qu'*après* la fin du clic, jamais pendant.

### Report explicite — critère §7.2 (pré-remplissage depuis le simulateur)

Conformément à la spec (§3, §7.2) : la Phase 2 (Stack Simulator) n'est pas livrée, `sessionStorage['simulator']` est donc absent en conditions réelles à ce jour. Ce qui est fait et vérifié cette session :
- `parseSimulatorValue` testée unitairement sur les 3 cas prescrits (absent, invalide, valide) — `readSimulator.test.ts`, 3 tests verts.
- Vérification manuelle en injectant la clé dans DevTools (`sessionStorage.setItem('simulator', '{"selection":["support","saisie"]}')` puis rechargement) : comportement conforme à l'écran (voir ci-dessus).

**Non fait et non cochable maintenant** : la vérification en conditions réelles (la Phase 2 posant elle-même la clé, avec son format définitif) est explicitement hors de portée tant que la Phase 2 n'existe pas. Le format `{ selection: string[] }` utilisé ici est une supposition raisonnable à confirmer avec la spec 03 au moment de la Phase 2 — si le format définitif diverge, seul `parseSimulatorValue` (et son test) aura besoin d'être ajusté, le reste du stepper n'en dépend pas.

### Hors scope pour cette itération (et où c'est prévu)

- Le simulateur lui-même (Phase 2) : non implémenté, non écrit dans `sessionStorage` depuis cette phase (consigne §6).
- `prefers-reduced-motion` en émulation DevTools : pas d'outil d'émulation de media feature disponible dans cette session (limite déjà documentée en Phases 0/1/4/5) — le hook `useReducedMotionSafe`, déjà vérifié dans les phases précédentes, est réutilisé à l'identique par `Stepper` et `TeaserOverlay` sans modification de sa logique.
- Mentions légales complètes, SEO/OG avancé, sitemap → Phase 7 (inchangé).
- Poids de l'iframe haTD non mesuré (dette technique §C, inchangée) : au moment de cette session, `https://xab-dev.github.io/cv-portfolio/haTD_V1/` répond `404` (vérifié par `fetch` direct) — le jeu ne semble pas encore déployé sur ce repo externe. C'est un fait externe hors du périmètre de ce projet (T12 : jeu jamais modifié depuis ce projet, lu par URL absolue seulement) ; le lien de repli "Ouvrir dans un nouvel onglet" et le fait que l'iframe affiche proprement une 404 sans casser la mise en page couvrent ce cas. À signaler à Xav, pas à corriger ici.

### Dette ajoutée / mise à jour

- DETTE-14 : mise à jour — `templates` et `1am` câblés (voir `dette_suivi.md` §B). Ne reste que `terrain` (source non fournie, hors scope).
- **Nouvelle dette (non bloquante)** : la vérification tactile réelle de la section Jouer (§7.4 : "Mobile émulé (pointeur coarse)") a été faite avec `pointer: coarse` **forcé temporairement dans le code** (`useCoarsePointer() || true`, et `teaserMs` raccourci à 4 s pour ne pas attendre 18 s réels à chaque test), car l'outil de navigateur de cette session ne fournit aucune émulation tactile réelle (`navigator.maxTouchPoints` reste à `0` et `matchMedia('(pointer: coarse)').matches` reste `false` même à 375/500 px de large — limite déjà notée en Phases 1/4/5 pour la largeur, mais c'est la première fois qu'elle bloque aussi le *type de pointeur*). Les deux modifications ont été **entièrement annulées** avant la livraison (`git diff` vérifié propre, hash de build identique avant/après hors ce changement) ; le comportement tactile réel (vrai téléphone ou détection navigateur avec vraie émulation tactile) reste donc à revérifier une fois un outil adéquat disponible, ou directement par Xav sur un appareil réel. Non bloquant : le code de détection (`matchMedia`) est standard et sans ambiguïté, et le comportement a été vérifié fonctionnel à 100 % sous la contrainte forcée.
- Largeur mobile plancher à ~500 px avec les outils de cette session (375 px non atteignable), comme en Phases 1/4/5 — aucun style à `md:` (768px) breakpoint intermédiaire dans ce projet, donc 500 px reste représentatif du rendu mobile réel.

### [ARRÊT XAV] — critère §7.1 de la spec 07

**Un e-mail de test réel a été envoyé** via le formulaire (POST vers `https://formspree.io/f/xgaegryp`, réponse 2xx confirmée côté navigateur), avec le nom "Test Agent 2" et un message explicitement identifiable comme test, pour vérifier le mécanisme d'envoi. **Je ne peux pas vérifier la réception dans la boîte `xa.bou@laposte.net`** — c'est le seul point que la spec attribue explicitement à Xav (§7.1 : "la confirmation de réception est le seul point que l'agent ne peut pas vérifier seul").

Tout le reste du critère §7.1 est vérifié et vert : parcours complet en 3 clics + saisie, envoi réel techniquement fonctionnel, repli `mailto:` vérifié en coupant le réseau (simulé).

Rien n'a été committé ni poussé à ce stade ; en attente de ta confirmation avant de considérer la Phase 6 officiellement close.

---

## 2026-09-15 (suite) — Phase 1 : Hero + Agent de poche

### Décisions prises et pourquoi

- **`hero.eyebrow` dérive de `site.title`/`site.location`** (`Consultant outils et solutions IA · Tarascon, Provence`) plutôt que la valeur générique du brouillon de spec (`"Consultant indépendant · Tarascon, Provence"`) : réponse S5 de Xav (T10, "titre public"), qui doit apparaître dans `<title>`, le footer (déjà fait en Phase 0) *et* le Hero. Dérivé de `site.ts` plutôt que dupliqué en dur (T8).
- **`NeonButton` étendu avec une prop `href` optionnelle** (union discriminée `{href: string} & Anchor...` vs `{href?: undefined} & Button...`) pour rendre `m.a` au lieu de `m.button` : les deux CTA du Hero sont des ancres de navigation (`#projets`, `#contact`), pas des actions — un vrai lien est plus correct sémantiquement/accessibilité qu'un bouton avec `scrollIntoView` manuel, et évite de dupliquer les classes visuelles de la primitive. Aucun usage existant (`KitchenSink.tsx`) n'est affecté (prop optionnelle).
- **Pas de champ `followUps` par puce dans `src/content/agent.ts`** malgré le type `AgentReply.followUps` documenté dans la spec : la rangée de puces reste affichée en permanence sous la conversation (jamais masquée après un clic), ce qui satisfait "puces followUps proposées" sans logique de sélection de sous-ensemble à maintenir. Le champ reste dans le type `AgentProvider`/`AgentReply` (`src/lib/agent/AgentProvider.ts`) pour rester fidèle à l'interface prête pour l'API V2, simplement non peuplé par `ScriptedAgentProvider`.
- **Matching par id de puce prioritaire, puis mots-clés normalisés (accents/casse retirés)** : `matchReply` (fonction pure, `src/lib/agent/ScriptedAgentProvider.ts`) teste d'abord une égalité directe avec un id de puce, sinon parcourt `agentKeywords`. Testé unitairement (`ScriptedAgentProvider.test.ts`, 4 tests) — y compris un test qui garantit qu'aucune réponse autre que `roi` ne contient le mot "poker" (DETTE-17).
- **Réinitialisation de la conversation** : le lien "Réinitialiser" apparaît dès que l'historique atteint 12 messages et le reste (l'edge case de la spec — "les plus anciens sortent" — fait que le tableau replafonne à 12 en continu une fois plein), plutôt qu'une apparition ponctuelle qui se masquerait ensuite.
- **Avatar (DETTE-02)** : source déposée par Xav dans `images-src/avatar/raw/` (dessin "silhouette encapuchonnée"). Convention retenue : `images-src/avatar/` est un **pair** de `images-src/projects/`, pas un sous-dossier — voir bug ci-dessous. `scripts/process-images.js` étendu avec `processAvatar()` : recadrage carré centré (`fit: "cover"`) 512×512, budget 100 Ko (vs 1600px/200 Ko pour les images projet), sortie unique `public/images/avatar.webp` (pas de sous-dossier `<id>/`, puisqu'il n'y a qu'un avatar). Résultat : 17 Ko, alpha conservé (le fond transparent du dessin se fond dans le fond sombre du site).

### Bug trouvé et corrigé (cause racine)

**L'avatar avait déjà été traité une première fois avec les mauvaises dimensions, à un mauvais chemin.** En inspectant l'état du repo avant de coder, `public/images/projects/avatar/avatar-01.webp` existait déjà et était **committé** (1600×2110, 123 Ko, jamais référencé par aucun composant). Cause racine : `images-src/avatar/raw/` avait été initialement déposé sous `images-src/projects/avatar/raw/` ; la boucle générique de `process-images.js` (`listProjectDirs()`) traite **tout** sous-dossier de `images-src/projects/` comme une fiche projet, sans liste blanche d'ids connus — elle a donc converti l'avatar avec les réglages "projet" (1600px large, 200 Ko, pas de recadrage carré) lors d'une exécution précédente (Phase 4). Corrigé en deux temps : (1) déplacement du dossier source vers `images-src/avatar/` (pair de `projects/`, hors de sa boucle), (2) `git rm` du fichier erroné et de son dossier. Le pipeline ne risque plus de retraiter un "faux projet" à l'avenir.

**Zone de conversation qui ne suit pas le bas pendant la frappe.** Trouvé en vérification visuelle (Claude in Chrome) : après avoir posé une question dont la réponse dépasse la hauteur visible (`max-h-72`), le nouveau message apparaissait hors champ, sous la barre de défilement interne, sans que rien ne scrolle automatiquement — utilisable seulement en scrollant manuellement dans la petite zone, ce qui n'est pas le comportement attendu d'une interface de chat. Diagnostic : aucun mécanisme de scroll-vers-le-bas n'avait été branché, ni sur l'ajout d'un message ni sur la croissance progressive du texte pendant l'effet `TypingText` (qui ne expose pas de callback par caractère). Corrigé avec un `ResizeObserver` sur le conteneur interne des messages (`contentRef`), qui pousse `scrollTop = scrollHeight` sur le conteneur scrollable (`scrollRef`) à chaque changement de hauteur — capte à la fois les nouveaux messages *et* la frappe caractère par caractère, sans dépendre des internals de `TypingText`.

### Vérification visuelle réelle (Claude in Chrome, `vite preview`)

- Desktop (1280×900) : Hero 2 colonnes (texte/agent), avatar réel affiché dans le médaillon avec halo violet, titre animé mot par mot, eyebrow affiche bien le titre public de Xav. Bullet "ROI" cliquée : message utilisateur ajouté, `TypingText` révèle la réponse **mot pour mot identique** au texte validé par Xav (guillemet compris — "…et je parle en connaissance de cause."), bullets désactivées pendant la frappe puis réactivées à la fin. Bullet "Es-tu disponible ?" testée de même, texte conforme à DETTE-06. Saisie libre "bonjour" → réponse par défaut exacte + puces toujours proposées. Après le fix ci-dessus, le scroll interne suit bien la dernière ligne en cours de frappe.
- Clavier : ordre de tabulation vérifié via l'arbre d'accessibilité — CTA primaire/secondaire, puis les 5 puces, puis le champ de saisie, puis "Envoyer" (`Tab → puces → champ → envoyer` conforme au critère §7.3).
- Mobile (375×812) : Hero empilé (avatar → eyebrow → titre → sous-titre → CTA → agent), puces en colonne, champ pleine largeur + bouton envoyer, tout est tapable. Hauteur du Hero jusqu'au début de la section Simulateur ≈ 1,5 écran (critère §7.1), pas de débordement horizontal observé.
- Non vérifié dans cette session : `prefers-reduced-motion` en émulation DevTools — aucun outil d'émulation de media feature disponible dans la session (même limite que la Phase 5) ; le hook `useReducedMotionSafe` est réutilisé à l'identique (Hero : glow statique + pas de stagger de mots via `fadeUpReduced` ; agent : pas de délai "…", `TypingText` affiche le texte entier d'un coup). Recommandé de le vérifier manuellement dans DevTools (Rendering → Emulate CSS media feature `prefers-reduced-motion`).
- `npm run build`, `npm run lint` (oxlint) et `npm run test` (Vitest, 28 tests dont 8 nouveaux pour `ScriptedAgentProvider`) verts.

### Hors scope pour cette itération (et où c'est prévu)

- `ApiAgentProvider` (V2) : interface (`AgentProvider`, `src/lib/agent/AgentProvider.ts`) prête, implémentation volontairement absente (consigne §6 de la spec) — nécessiterait un proxy/backend pour ne pas exposer de clé (T5). Post-V1, cf. dette technique §C.
- Câblage de `templates-01.webp`/`1am-01.webp` (générés cette session en relançant `npm run images`) dans `src/content/projects.ts` : appartient à la Phase 4/DETTE-14, pas à la Phase 1. Fichiers présents dans `public/images/projects/`, non référencés.
- Retrait de `#kitchen-sink`, `prefers-reduced-motion` en émulation DevTools → inchangé depuis les phases précédentes (prévu Phase 7).

### Dette ajoutée / mise à jour

- DETTE-02 résolue (avatar réel traité et branché).
- DETTE-05 partiellement réglée (texte `roi` validé mot pour mot ; `methode`/`outils`/`non-ia`/défaut restent des reformulations à relire par Xav).
- DETTE-14 mise à jour (images `templates`/`1am` traitées, pas encore câblées).

### Déploiement

Commit unique (clôture Phase 5 + Phase 1) poussé sur `main`. Déploiement GitHub Actions confirmé sur `https://xab-dev.github.io/portfolio-v2/` : Hero + agent de poche vérifiés en ligne (2 colonnes desktop, avatar réel, titre public affiché), section Compétences vérifiée en ligne (radar 6 axes avec les niveaux ajustés par Xav, badges par famille).

---

## 2026-09-15 (suite) — Clôture Phase 5

Xav a ajusté lui-même `src/content/skills.ts` (édition directe, hors agent) : PowerShell 3→4, Vulgarisation/formation 4→3, note de la biostatistique passée de "[DETTE-16] niveau provisoire, à confirmer par Xav" à "hobby passion" (niveau inchangé, 1 = notions). Avant de considérer la Phase 5 close, vérifié :
- Famille "Données" toujours à ≥1 axe valide sur le radar (un seul skill dans cette famille — biostatistique — donc le radar dépend uniquement de ce niveau ; test dédié dans `skills.test.ts`, toujours vert).
- `npm run test` (20 tests), `npm run lint`, `npm run build` verts après les changements.
- Revérification visuelle du radar et des badges (Claude in Chrome, `vite preview`) : desktop 1280×900 et mobile 375×812 — radar à 6 axes lisible, badges alignés avec leur famille, aucune régression visuelle liée aux niveaux modifiés.

DETTE-15 et DETTE-16 résolues (§ARRÊT XAV levé). Phase 5 officiellement close.

---

## 2026-09-15 (suite) — Phase 5 : Skills Matrix & Timeline

### Décisions prises et pourquoi

- **Recharts chargé dans un chunk séparé (`React.lazy` + `Suspense`)**, pas dans le bundle initial : l'installer directement aurait fait passer le JS principal de 328 Ko à 692 Ko (106 Ko → 213 Ko gzip), menaçant le budget Lighthouse Performance ≥90 acquis en Phase 0 (DETTE-26). Après découpage, le bundle initial reste à 360 Ko (116 Ko gzip) et Recharts (332 Ko / 96 Ko gzip) ne se charge que quand la section Compétences est atteinte. Même logique que le chunk `motionFeatures` de la Phase 0.
- **DETTE-16 (niveau biostatistique)** : représenté avec la valeur neutre la plus basse de l'échelle (1 = notions) plutôt qu'omis ou inventé à un niveau plus flatteur — cohérent avec la consigne "ne jamais gonfler un niveau". Marqueur `[DETTE-16]` dans la note du skill, à confirmer par Xav (voir ARRÊT XAV ci-dessous). Cette valeur provisoire compte dans la moyenne de la famille "Données" ; sans elle, cette famille n'aurait aucun axe radar.
- **Radar hover/tap synchronisé** (`activeFamily` levé dans `Skills.tsx`) : survoler un badge illumine sa famille sur les deux composants (axe du radar en gras + carte de famille en glow), et inversement depuis un axe du radar — un seul état partagé, pas de duplication de logique.

### Bug trouvé et corrigé en cours de session (cause racine, pas de contournement)

**Ligne de la frise invisible malgré un calcul de progression correct.** Première implémentation : un `<path>` SVG avec `pathLength` (motion value liée au scroll) passé via `style={{ pathLength }}`. Diagnostic : Framer Motion attend `pathLength` comme **prop directe** du composant (il l'utilise alors pour poser l'attribut SVG `pathLength="1"` et convertir `stroke-dasharray`/`stroke-dashoffset` en fractions 0-1) ; passé dans `style`, cet attribut n'est jamais posé, donc les valeurs de dasharray calculées ("0.56px, 1px") restaient interprétées en unités utilisateur du path (~100 unités de long), produisant un pointillé microscopique invisible. Corrigé une première fois en passant `pathLength` en prop directe — le calcul de progression était alors correct (vérifié via `getComputedStyle`) mais le trait restait invisible à l'écran : cause racine n°2, la combinaison `vector-effect="non-scaling-stroke"` + `preserveAspectRatio="none"` sur un `viewBox` étiré de façon non uniforme (facteur ×4 en largeur, ×10,5 en hauteur) — un cas connu de rendu défaillant sous Chromium. Solution finale : abandon de la technique SVG `pathLength`, remplacée par un simple `<div>` avec dégradé CSS (`bg-gradient-to-b`) et un `scaleY` (motion value, `transform-origin: top`) — plus robuste, aucune dépendance à un comportement SVG non uniforme. Vérifié visuellement après correction : le trait se dessine bien du premier jalon vers le bas au fil du scroll.

### Vérification visuelle réelle (Claude in Chrome, `vite preview`)

- Desktop (~1264 px) : radar à 6 axes lisibles, survol d'un badge ("Cadre 4D...") illumine bien l'axe "Méthode IA" (texte bleu gras) et la carte de la famille (glow) simultanément — synchronisation bidirectionnelle confirmée.
- Mobile (~504 px, plancher de redimensionnement de l'outil de navigation — 375 px non atteignable avec les outils disponibles cette session) : radar empilé au-dessus des badges, badges qui passent à la ligne proprement, frise en colonne unique avec la ligne à gauche.
- Frise : la ligne dégradée bleu→violet se dessine progressivement au scroll (vérifié par `getComputedStyle` — `scaleY` passe de 0 à ~0,9 en descendant la page) et s'arrête juste avant le dernier jalon, cohérent avec le réglage `offset: ["start 0.75", "end 0.35"]`.
- Aucune erreur console sur l'ensemble de la session de vérification.
- `npm run build`, `npm run lint` (oxlint) et `npm run test` (Vitest, 20 tests dont 8 nouveaux pour `skills.ts`/`timeline.ts`) verts.
- Non vérifié dans cette session : `prefers-reduced-motion` sur cette nouvelle section (pas d'outil d'émulation de media feature disponible dans la session ; le hook `useReducedMotionSafe` réutilisé est le même que celui déjà vérifié en Phase 0/4).

### Hors scope pour cette itération (et où c'est prévu)

- Retrait de la section `#kitchen-sink` → prévu au plus tard fin de Phase 6 (inchangé depuis la Phase 0).
- `prefers-reduced-motion` sur la frise, à revérifier explicitement en Phase 7 (polish) avec un outil d'émulation.

### [ARRÊT XAV] — critère §7.4 de la spec 06

Avant de clore officiellement la Phase 5, deux points nécessitent ta validation :
1. **Niveaux de compétences** (DETTE-15) : `src/content/skills.ts` reflète l'auto-évaluation de la dictée initiale, à valider ou ajuster.
2. **Niveau biostatistique** (DETTE-16) : actuellement fixé à 1 ("notions", valeur neutre non gonflée) à titre provisoire — confirme ce niveau ou indique la valeur réelle.

Rien n'a été committé à ce stade ; en attente de ton retour avant de marquer la Phase 5 close.

---

## 2026-09-15 (suite) — Phase 4 : Portfolio dynamique (Mes Projets)

### Décisions prises et pourquoi

- **Pipeline d'images restructuré** : les originaux (`raw/`) ont été déplacés hors de `public/` vers `images-src/` (nouveau, gitignoré). Cause racine d'un problème trouvé en vérifiant `dist/` : Vite copie **tout** `public/` tel quel dans le build, donc des `raw/*.png` sous `public/images/...` auraient été déployés en clair sur le site, à l'opposé de l'objectif "≤ 200 Ko par image" de la DETTE-14. `npm run images` (script `scripts/process-images.js`, `sharp`) lit maintenant `images-src/projects/<id>/raw/*` et écrit `public/images/projects/<id>/<id>-NN.webp` (1600px max, qualité dégressive jusqu'à ≤ 200 Ko). Dossier `régie-maison` renommé `regie-maison` (id sans accent, cohérent avec les chemins `/images/projects/<id>/`).
- **`LazyMotion` : `domAnimation` → `domMax`** : la grille de projets a besoin de `layout` + `AnimatePresence mode="popLayout"` pour le réordonnancement animé au filtrage — non supporté par `domAnimation` (le bundle le plus léger, retenu en Phase 0). Chunk asynchrone `motionFeatures` passé de 10 Ko à 24 Ko gzip ; toujours différé, ne bloque pas le rendu initial.
- **Filtre multi-tags en OR** (un projet apparaît dès qu'il correspond à au moins un tag actif) plutôt qu'en AND : cohérent avec des tags de catégorisation (pas des facettes orthogonales), et garantit qu'accumuler des filtres élargit plutôt que d'aboutir à un résultat vide.
- **Blocs empilés plutôt qu'à onglets** dans la modale projet (Problème/Architecture/Métriques/Limites) : la spec offrait le choix ; empilé garantit trivialement que "Limites" reste toujours visible sans dépliage, une exigence explicite de la spec.
- **Vitest ajouté** (`npm run test`) : la spec exige `projects.test.ts` comme livrable et critère de passage #1 ; c'est le premier test unitaire du projet.

### Bug trouvé et corrigé (cause racine)

**Modale illisible sur mobile pour un contenu long.** `Modal.tsx` centrait le dialogue avec `flex items-center` dans un conteneur `fixed inset-0` sans `overflow-y`. Un contenu plus haut que le viewport (le cas de chaque fiche projet) débordait *au-dessus et en dessous* de l'écran sans aucun moyen d'y accéder — bouton fermer et pied de page invisibles et inatteignables au scroll (vérifié : capture identique avant/après une tentative de scroll). Corrigé en séparant le conteneur scrollable (`overflow-y-auto`) du conteneur de centrage (`flex min-h-full`) : le dialogue reste centré quand il tient à l'écran, et devient scrollable dès qu'il dépasse. Correction faite dans la primitive `Modal` (Phase 0) — bénéficie à toutes les modales futures, pas seulement au Portfolio.

### Livré et validé à l'écran

Vérifié via Puppeteer (375 px et 1280 px) contre `vite preview` :
- Grille 1/2/3 colonnes, 6 projets, filtres multi-sélection (`Tous` par défaut, compteur "N projets" à jour), réordonnancement animé au filtrage (`layout`).
- Filtre "Jeu" → 1 projet (haTD) ; chaque tag a bien ≥ 1 projet (garanti par `projects.test.ts`, 8 tests verts).
- Carte → modale au clic *et* au clavier (Tab + Entrée), focus déplacé dans la modale puis restauré sur la carte à la fermeture (Échap).
- Deep link `#projets/miniciel` ouvre la bonne modale au chargement ; hash invalide (`#projets/nawak`) ignoré silencieusement (pas de modale, pas d'erreur) ; fermeture ramène le hash à `#projets`.
- Galerie horizontale (haTD : 2 images, miniCiel et Régie Maison : 1 chacun), clic → agrandissement dans la même modale, `loading="lazy"`. Templates/Séquence terrain/1AM sans image : carte et modale valides quand même.
- Métriques non vérifiées affichées avec le suffixe "(auto-déclaré)" ; projets sans métrique ("Séquence terrain", "Régie Maison", "1AM") affichent le message de repli.
- `npm run build`, `npm run lint`, `npm run test` verts. Aucune erreur console, aucun débordement horizontal à 375 px.

### Hors scope pour cette itération

Études de cas longues, témoignages clients (hors scope explicite de la spec). Captures d'écran pour templates/terrain/1am (pas encore fournies par Xav — cartes valides sans image en attendant).

### [ARRÊT XAV] — non levé par l'agent

Critère de passage §7.5 de la spec 05 : **relecture des 6 fiches par Xav avant de clore la phase.** Le contenu (`src/content/projects.ts`) est rédigé à partir des sources fournies (`Fiche_Professionnelle_Xav.md`, `Positionnement...md` §6-8, `Sequence_Intervention_Terrain.md`) sans invention de métrique, mais reste à valider par Xav pour exactitude avant de considérer la Phase 4 officiellement close. Tout le reste du critère de passage (tests, filtres, clavier, deep link, tilt/reduced-motion) est vérifié et vert.

### Dette ajoutée / mise à jour

- DETTE-10 (enrichir les fiches projet) : substantiellement traitée dans cette phase (6 fiches rédigées à partir des sources réelles) — reste ouverte jusqu'à la relecture Xav ci-dessus.
- DETTE-14 (captures d'écran) : pipeline construit et fonctionnel (`npm run images`). Images fournies pour haTD (2), miniCiel (1), Régie Maison (1). Toujours en attente pour templates, terrain, 1AM.

---

## 2026-09-15 — Phase 0 : Socle Vite + design system + squelette

### Décisions prises et pourquoi

- **Tailwind v3.4** (pas v4) malgré la mention "v4 si plugin Vite dispo" dans la dette technique connue : la spec liste explicitement `tailwind.config.ts` avec `theme.extend` comme livrable, ce qui correspond exactement au modèle v3 (config JS/TS classique). V4 aurait imposé une configuration CSS-first (`@theme`) qui aurait dévié de la structure demandée sans bénéfice net à ce stade. Documenté ici plutôt que redemandé, conformément à la consigne d'autonomie §6.
- **`motion` (le paquet)** s'est installé sans accroc — pas de repli sur `framer-motion@11`.
- **Tokens couleur en triplets RGB** (`--neon-blue: 59 130 246`, etc.) plutôt qu'en hexadécimal direct. Cause racine découverte en vérification visuelle : `bg-bg-deep/95` et consorts (modificateurs d'opacité Tailwind) ne fonctionnent qu'avec la syntaxe `rgb(var(--x) / <alpha-value>)`, qui exige un triplet, pas un hex. Toutes les valeurs directes (`background: var(--bg-deep)` dans `globals.css`) ont été adaptées en conséquence (`rgb(var(--bg-deep))`).
- **Icônes de marque (GitHub/YouTube/LinkedIn) en SVG local**, pas Lucide : la version actuelle de `lucide-react` (1.46.0) a retiré ses icônes de marque du cœur du paquet. Repli sur les tracés officiels Octicons (MIT) / Simple Icons (CC0) dans `components/ui/BrandIcons.tsx`, même API (`size`) que Lucide pour rester interchangeable. Menu/X/Mail restent du Lucide standard.
- **`LazyMotion` + chargement différé des features d'animation** (`src/lib/motionFeatures.ts`, chargé via `import()`) plutôt que d'utiliser `motion.div` partout : optimisation de performance (voir plus bas). Toutes les primitives utilisent désormais `m.*` au lieu de `motion.*`.
- **Soulignement de nav en transition CSS pure** plutôt qu'en `layoutId` animé (motion) : le bundle `domAnimation` (le plus léger de LazyMotion) ne supporte pas les animations de layout ; `domMax` (qui les supporte) est nettement plus lourd. Compromis assumé : léger recul visuel (le trait ne glisse plus d'un lien à l'autre, il apparaît/disparaît en `scale-x`) contre un gain de poids JS réel.
- **Sous-ensembles de police limités à `latin` + `latin-ext`** (`@fontsource/inter`, `@fontsource/space-grotesk`) : l'UI est en français, pas besoin de cyrillique/grec/vietnamien embarqués dans le build.

### Bug trouvé et corrigé en cours de session (cause racine, pas de contournement)

**Panneau de menu mobile transparent (contenu de la page visible à travers).** Diagnostic : `backdrop-filter` (classe `backdrop-blur-xl`) sur le `<header>` crée un nouveau *containing block* pour tout descendant `position: fixed` (règle CSS peu connue, équivalente à celle de `filter`/`transform`). Le panneau du menu mobile était un enfant JSX du `<header>`, dont la boîte ne fait que 65px de haut : son `fixed inset-0 top-[65px]` se calculait donc par rapport au header (65px de haut) et non au viewport, l'écrasant à une hauteur quasi nulle — le fond du panneau ne se peignait donc plus, seuls les liens (qui ont leur propre fond) restaient visibles, flottant sur le contenu de la page. Corrigé en sortant le panneau du `<header>` (frère du `<header>`, pas enfant) et en fixant la hauteur du header à `h-16` pour un calque `top-16` prévisible.

**Tag "Automations" jamais actif par défaut.** `useState("automations")` (minuscule) ne correspondait pas au libellé `"Automations"` (majuscule) utilisé dans le tableau de démonstration. Corrigé.

### Vérification Lighthouse mobile (critère de passage §7.5)

Résultat contre `vite preview` en local, configuration mobile standard (throttling simulé) :
**Performance 86 · Accessibilité 100 · Bonnes pratiques 100 · SEO 100.**

Performance sous la barre des 90 demandés en local. Diagnostic mené avant d'accepter le chiffre :
- `Total Blocking Time` = 0 ms, `Cumulative Layout Shift` = 0 (parfaits) : aucun souci de réactivité ni de stabilité visuelle.
- Le même test sans throttling réseau/CPU (`throttlingMethod: "provided"`) donne **100/100**, FCP 0.1 s, LCP 0.9 s.
- Conclusion : l'écart venait du throttling mobile simulé par défaut de Lighthouse (CPU ×4, réseau "slow 4G") combiné au serveur de dev local, pas d'un défaut de code.
- Optimisations appliquées avant de mesurer en conditions réelles : bundle JS principal réduit de 400 Ko → 328 Ko (127 Ko → 106 Ko gzip) via `LazyMotion` + chargement différé des animations dans un chunk séparé (`motionFeatures`, 10 Ko gzip, non bloquant) ; sous-ensembles de polices réduits à `latin`/`latin-ext`.

**Résultat confirmé sur le vrai déploiement** (`https://xab-dev.github.io/portfolio-v2/`, après le premier push) :
**Performance 90 · Accessibilité 100 · Bonnes pratiques 100 · SEO 100.** Les quatre catégories atteignent le seuil requis — le CDN GitHub Pages (TTFB, HTTP/2) comble l'écart observé en local. Critère de passage §7.5 validé sur le site réellement en ligne, pas seulement en local.

### Livré et validé à l'écran

Vérifié via un script Puppeteer piloté (le sous-agent navigateur Claude in Chrome n'était pas connecté dans cette session) contre `vite preview`, aux largeurs 375 px et 1280 px :
- Nav sticky, verre dépoli, ancre active soulignée (desktop) et suivie à jour au scroll (`IntersectionObserver`).
- Menu burger mobile : ouverture/fermeture, panneau plein écran opaque (bug ci-dessus corrigé), liens cliquables.
- 7 sections vides + section temporaire `#kitchen-sink` : `GlassCard` (glow bleu/violet/émeraude, tilt souris désactivé au tactile), `NeonButton` (primary/ghost, hover/tap), `Tag` (actif/inactif), `AnimatedCounter` (formatage `fr-FR`, ex. "4 200€"), `TypingText`, `Modal` (ouverture, fermeture Échap, focus restauré sur le déclencheur).
- `prefers-reduced-motion: reduce` : compteurs instantanés, `TypingText` affiché d'un coup — vérifié via émulation media feature.
- Aucun débordement horizontal à 375 px (`overflow-x` = 0 mesuré).
- Aucune erreur console sur les deux largeurs.
- `npm run build` et `npm run lint` (oxlint) verts.

### Hors scope pour cette itération (et où c'est prévu)

- Contenu réel des 7 sections → Phases 1 à 6 (voir ROADMAP, ordre conseillé 0 → 4 → 5 → 1 → 6 → 2 → 3 → 7).
- Optimisation Lighthouse Performance au-delà de ce qui a été fait ici → Phase 7 (DETTE-25).
- Retrait de la section `#kitchen-sink` → à faire une fois que chaque primitive aura été éprouvée dans une vraie section (dès que la Phase 1 ou 4 sera livrée, au plus tard fin de Phase 6).
- Mentions légales complètes, SEO/OG avancé, sitemap → Phase 7 (déjà hors scope explicite de la spec 01).

### Déploiement

Repo local initialisé (`git init`), remote `origin` pointé vers `https://github.com/xab-dev/portfolio-v2.git` (déjà existant avec 2 commits contenant une version antérieure — v0.2.0 — de `specs/` et `dette_suivi.md`). Le contenu local (v0.3.0 : specs à jour, `docs/`, `README.md` du kit de cadrage) est plus récent et fait foi ; réconcilié par fusion avec priorité au contenu local. Voir le commit de Phase 0 pour le détail des fichiers livrés. Workflow `.github/workflows/deploy.yml` ajouté (build + `upload-pages-artifact` + `deploy-pages` sur push `main`), GitHub Pages déjà configuré en source "GitHub Actions" par Xav.
