# Journal de développement — Portfolio v2

Journal tenu par l'agent (Claude Code). Une entrée par session, la plus récente en haut.

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
