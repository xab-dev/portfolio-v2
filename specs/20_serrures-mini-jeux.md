---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, « ajouter du chaos » : des mini-jeux comme serrures de fiches (spec 20)
type: spec
version: 1.0.0
statut: validée par Xav le 2026-11-02 (« OK pour les 6 points, SECU à la place de lecture ») et exécutée le même jour (privé 6e77409, 1.11.0) — ARRÊT XAV : jouer les huit serrures en ligne, relire les textes de locks.ts
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : les serrures (Phase 11, premier pas « jeu + CV interactif »)

## 1. La demande

Xav, dans la nuit du 2026-11-02 : « ajouter du chaos (exemple : minijeux test qi captcha-like pour ouvrir certaines fiches, cryptex pour les fiches tech harness-like). »

Puis, le matin, en réponse aux cinq questions de l'agent :

1. « tu peux reprendre des questions et test présent dans le proto-tryMe. base : cryptex (hard) ; harness : question llm (hard) ; RPGv2 : QI (easy) ; RPGv4 : QI (medium) ; idle : question llm (easy) ; TryMe : QI + cryptex (hard) ; audit sécu : cryptex (hard) ; miniCiel : cryptex (easy). Si les projets ne sont pas notés ici, on les laisse ouverts. Attention aux bulles dans Jouer, elles doivent reprendre le verrou. »
2. « la fiche verrouillée reste telle quelle sur le site, c'est le détail qui n'est accessible qu'après une réussite. »
3. « réessaie sans limite, débloqué après 3 essais avec mention : "on est sympa, voilà". »
4. Alternative pour les lecteurs d'écran : « ok pour les lecteurs d'écran. »
5. Mémoriser la réussite sur l'appareil : « oui sauf si contre-indication des valeurs du site, légalité (si cookies ou autre, on ne fait pas). »

Et, en fermant DETTE-73 le même matin : l'adresse de TiO-idle est donnée dans le portfolio « pour ceux qui cherchent bien, et qui passeront les mini-jeux à venir ». Les serrures sont donc aussi ce qui tient cette décision.

## 2. Ce qui est verrouillé

Huit fiches sur quinze. Les sept autres (Portfolio v2, Un Autre Monde, Séquence terrain, Régie Maison, haTD, Templates, Bibliothèque automatique) restent ouvertes, et la carte « Votre projet ? » aussi.

| Fiche (`id`) | Serrure | Niveau | Ce qu'il faut réussir |
|---|---|---|---|
| La base privée et son HUD (`base-hud`) | cryptex | difficile | un mot de 7 lettres |
| Harness engineering (`harness`) | question LLM | difficile | 2 questions d'affilée, parmi les situations |
| RPG-v2 (`rpg-v2`) | QI | facile | 1 énigme, parmi les faciles |
| RPGv4 (`rpgv4`) | QI | moyen | 2 énigmes d'affilée, tout le jeu de 8 |
| TiO-idle (`tio-idle`) | question LLM | facile | 1 question, parmi les directes |
| TryMe (`tryme`) | QI puis cryptex | difficile | 2 énigmes d'affilée, puis un mot de 6 lettres |
| Audit sécurité (`audit-securite`) | cryptex | difficile | un mot de 7 lettres |
| miniCiel (`miniciel`) | cryptex | facile | un mot de 3 lettres |

**Ce que « verrouillé » veut dire** (réponse 2) : la carte dans la grille ne change pas — même titre, même phrase, mêmes étiquettes, pas de cadenas dessiné. Le filtre par étiquette ne change pas. C'est l'ouverture de la fiche (le clic sur la carte, ou un lien direct `#projets/<id>` venu de la FAQ, de la section Jouer ou d'ailleurs) qui montre la serrure à la place du détail : le titre de la modale est celui de la fiche, le corps est le jeu. Réussite : le détail prend la place du jeu dans la même modale, le focus va à son premier titre.

**La section Jouer** (« attention aux bulles ») : les trois boutons RPGv4, TiO-idle, TryMe de la ligne du titre ne mènent plus au jeu tant que la fiche est verrouillée : ils ouvrent `#projets/<id>`, donc la serrure ; une fois la fiche ouverte, ils redeviennent le lien direct vers le jeu (nouvel onglet, comme aujourd'hui). Le lien « Voir la fiche projet » sous RPG-v2 passe par la serrure de RPG-v2 comme tout lien direct. **Le cadre RPG-v2 lui-même reste jouable sans serrure** : c'est la vitrine de la section et la fiche n'en est que le détail. À confirmer par Xav (§8).

## 3. Les trois jeux

Tous les trois : des boutons et des champs, rien au survol, rien qui dépende de la souris ; au doigt, cibles de 44 px au moins ; mouvement réduit respecté (aucune animation de réussite ni de rotation). Les textes en français, dans `src/content/locks.ts`, relisibles par Xav comme le reste.

### 3.1 QI — repris de l'échauffement du prototype TryMe

Le prototype (`public/jeux/tryme/index.html`, copie du commit `f2ebb22` de TryMe) a dix énigmes d'échauffement : trois grilles de figures (cercle, carré, triangle ; vide, moitié, plein ; un, deux ou trois motifs), trois suites de nombres, deux questions de mots (analogie, intrus), deux épreuves spatiales (rotation d'une figure, feuille pliée percée).

- **Jeu retenu : 8 énigmes**, les deux spatiales écartées. Elles n'ont pas de description textuelle honnête (« quelle figure est une rotation sans retournement du modèle ») : un lecteur d'écran n'aurait aucune chance, et l'alternative §4 ne doit pas être la seule voie pour une énigme entière.
- Les figures sont redessinées à l'identique (SVG générés depuis la forme, le remplissage et le nombre) et portent un **texte équivalent généré depuis les mêmes données** : « deux carrés pleins », « un triangle vide ». La grille se lit comme une liste de huit cases puis la question ; les quatre réponses sont des boutons nommés.
- Les réponses sont mélangées à chaque tirage (comme `shuffleOpts` du prototype).
- **Facile** (RPG-v2) : une énigme tirée parmi les quatre faciles (les suites 3-6-12-24 et 1-1-2-3-5-8, l'analogie chien/chiot, la première grille). **Moyen** (RPGv4) : deux énigmes d'affilée, tirées dans les huit. **Difficile** (TryMe) : deux énigmes d'affilée puis le cryptex §3.3. Une mauvaise réponse compte un essai raté (§4) et retire un nouveau tirage.
- Le contenu est copié dans `locks.ts` avec l'origine en commentaire ; la copie servie du prototype n'est pas touchée (règle de `SOURCE.txt`). Pas de script de synchronisation : ces énigmes ne bougent pas avec le prototype.

### 3.2 Question LLM — reprise des « Bases IA » du prototype TryMe

Huit questions sur les machines qui apprennent, chacune avec son « pourquoi » (la leçon). Reprises mot pour mot ; **le « pourquoi » s'affiche après chaque réponse, juste ou fausse**, comme dans le prototype : la leçon est la récompense, même quand la serrure ne s'ouvre pas.

- **Facile** (TiO-idle) : une question tirée parmi les trois directes — ce que fait une IA qui écrit, l'« hallucination », la cause la plus fréquente d'une mauvaise réponse.
- **Difficile** (Harness) : deux questions d'affilée, tirées parmi les quatre situations — la source donnée par l'IA, le prompt de la boulangère, l'assistant « bien noté », changer un comportement. La dernière de la liste du prototype (apprendre par répétition et conséquence) sert de réserve aux deux niveaux.
- Aucune de ces questions ne parle de TiO-idle : la garde « rien du contenu » de la spec 19 s'étend aux textes des serrures (test).

### 3.3 Cryptex

Une rangée de molettes, une lettre par molette, de A à Z sans accent ; une consigne (l'énigme) au-dessus ; un bouton « Ouvrir ». Chaque molette : deux boutons ▲ ▼ et la lettre, focusable, rôle `spinbutton` (flèches haut/bas au clavier, `aria-valuetext` = la lettre) ; taper une lettre la pose directement. Le mot est comparé en entier au clic sur « Ouvrir » : rien ne dit quelle lettre est fausse.

La règle du jeu, cohérente avec la réponse de DETTE-73 : **le mot se trouve sur le site**, dans ce que la carte montre déjà avant d'être ouverte (titre ou phrase d'accroche). « Pour ceux qui cherchent bien. » Propositions, à valider ou remplacer par Xav (§8) :

| Fiche | Mot | Énigme proposée | Où il se lit |
|---|---|---|---|
| miniCiel (facile) | `USB` | « Trois lettres sur la clé qui porte tout le kit. » | le titre de la carte |
| La base (difficile) | `MEMOIRE` | « Ce que la base me donne, et qu'une session neuve n'a jamais. » | l'accroche : « Une mémoire long terme que je possède » |
| Audit sécurité (difficile) | `SECU` (Xav ; l'agent proposait `LECTURE`) | « Le titre de la fiche, en quatre lettres et sans accent. » | le titre : « Audit sécurité… » |
| TryMe (difficile) | `ESPRIT` | « Dans TryMe, on élève quoi, sans jamais écrire dedans ? » | le titre : « élever un esprit » |

Facile = 3 molettes, énigme littérale. Difficile = 4 à 7 molettes, énigme qui oblige à relire la carte. Un seul mot par fiche, fixe.

## 4. Le comportement commun

- **Essais** (réponse 3) : sans limite. Au **troisième essai raté**, la serrure s'ouvre d'elle-même avec la phrase « On est sympa, voilà. », et la fiche est traitée comme ouverte (mémorisée comme une réussite — à confirmer, §8). Un essai = une énigme fausse, une question fausse, un mot faux. Un parcours à deux énigmes recommence à zéro après une faute, mais l'essai compte.
- **Mémoire** (réponse 5) : la liste des fiches ouvertes est gardée dans le `localStorage` du navigateur (une clé, `portfolio:locks`, un tableau d'ids), comme le thème et le volume d'Orchestriya : rien ne quitte l'appareil, aucun identifiant, aucune mesure. C'est un réglage du visiteur, strictement lié à ce qu'il a demandé lui-même (ouvrir une fiche) : même régime d'exemption que le thème (art. 82), **pas de cookie**, pas de bandeau. La page Mentions légales, section « Cookies et stockage local », est mise à jour pour le dire — et pour citer le volume d'Orchestriya, qu'elle oublie depuis la spec 18 (DETTE-75). Si Xav préfère que rien ne survive à l'onglet : `sessionStorage` à la place, une ligne à changer, la page légale aussi.
- Le compteur d'essais vit en mémoire de la page (pas stocké) : recharger la page redonne trois essais.
- **Lecteurs d'écran** (réponse 4) : en tête de chaque serrure, un lien « Ouvrir la fiche sans jouer », masqué visuellement et révélé au focus clavier, comme le lien d'évitement du site. Il ouvre la fiche (mémorisée comme ouverte). Un visiteur voyant au clavier le verra passer : c'est accepté, le troisième essai l'aurait ouverte de toute façon.
- **Lecture d'état** : une zone `role="status"` annonce « Faux. Essai 1 sur 3. », « Ouvert. », « On est sympa, voilà. ».
- Un état partagé (`useSyncExternalStore`, comme le thème — la leçon de la spec 12 : la modale et les boutons de Jouer consomment le même état, un `useState` par composant se désynchroniserait).
- Rien ne change pour le CV, les deux PDF, la carte « + », les filtres, le sitemap.

## 5. Fichiers

- `src/content/locks.ts` : la table fiche → serrure → niveau ; les 8 énigmes QI et les 8 questions LLM reprises du prototype (origine en commentaire) ; les mots et énigmes des cryptex ; tous les textes (consignes, « Faux. », « On est sympa, voilà. », le lien d'ouverture).
- `src/lib/locks/lockStore.ts` : lecture/écriture de `portfolio:locks`, abonnement, `isUnlocked(id)`, `unlock(id)`.
- `src/components/locks/LockGate.tsx` (choisit le jeu, tient les essais, le statut, le lien lecteurs d'écran), `QiLock.tsx`, `LlmLock.tsx`, `CryptexLock.tsx`, `figures.tsx` (SVG + texte équivalent).
- `src/components/portfolio/ProjectModal.tsx` : si la fiche a une serrure et n'est pas ouverte, le corps est `LockGate` ; sinon inchangé.
- `src/sections/Play.tsx` : les trois boutons lisent l'état ; verrouillé → `href="#projets/<id>"`, ouvert → le jeu.
- `src/content/legal.ts` : section stockage local.
- Tests : `locks.test.ts` (la table ne cite que des ids existants ; chaque énigme a une réponse dans ses options et un texte équivalent par figure ; chaque mot de cryptex est en A–Z et de la longueur annoncée ; aucune question ne nomme le contenu de TiO-idle), `lockStore.test.ts` (aller-retour, abonnés prévenus), `LockGate.test.tsx` (trois essais ratés ouvrent ; le lien d'ouverture ouvre ; un parcours à deux énigmes recommence après une faute).

## 6. Vérification prévue

`tsc`, `oxlint`, tests, build. Dans Chrome sur `vite preview`, à 1 440 px et à 500 px, en sombre et en clair : ouvrir chaque serrure depuis la grille et depuis un lien direct ; réussir une fois chaque jeu ; rater trois fois une fois ; recharger et constater la mémoire ; les trois boutons de Jouer avant et après ouverture ; un parcours entier **au clavier seul** pour chacun des trois jeux. Une passe `axe` sur la modale ouverte sur chaque jeu (le reste de l'audit attend la fin de la refonte, DETTE-72). Les deux CV reconstruits et comparés au texte, comme à chaque fois.

## 7. Hors scope

D'autres serrures (une par type suffit), un chronomètre, un score, un classement ; un cadenas sur les cartes (Xav : « reste telle quelle ») ; une tuile de la boîte à outils pour reverrouiller (en attendant : effacer `portfolio:locks` depuis les réglages du navigateur ou les outils de développement) ; la version anglaise ; le CV ; le cadre RPG-v2 (voir §8).

## 8. ARRÊT XAV — avant tout code

1. **Les quatre mots des cryptex** et leurs énigmes (§3.3) : garder, changer, ou dicter les tiens.
2. **Les niveaux** : facile = 1 épreuve parmi les simples, moyen = 2 d'affilée, difficile = 2 d'affilée parmi les situations (ou 2 + cryptex pour TryMe). D'accord, ou autre dosage ?
3. **Le cadre RPG-v2** dans Jouer reste jouable sans serrure ; seule la fiche est verrouillée. D'accord ?
4. **La mémoire** : `localStorage` (survit aux visites, mention légale ajoutée) ou `sessionStorage` (rien ne survit à l'onglet) ?
5. Le déblocage « on est sympa » compte-t-il comme une réussite mémorisée, ou faut-il rejouer à la visite suivante ?
6. Les deux énigmes spatiales écartées du QI : d'accord, ou les garder pour les voyants avec le lien d'ouverture comme seule alternative ?

Version à l'exécution : 1.11.0 (contenu visible demandé par Xav).

## 9. Réponses de Xav et exécution (2026-11-02)

« OK pour les 6 points, "SECU" à la place de "lecture". tu peux coder la spec 20. » Donc : mots gardés sauf l'audit (`SECU`) ; niveaux tels quels ; le cadre RPG-v2 reste jouable ; `localStorage` ; le déblocage « sympa » compte comme une réussite mémorisée ; les deux énigmes spatiales restent écartées.

Exécutée le même jour, privé `6e77409`, version 1.11.0 : fichiers du §5 tels quels, plus `src/lib/locks/useLock.ts` (le hook) et une clé par fiche sur le corps de la modale. Tests : 170. Vérification du §6 faite dans Chrome, sauf la passe `axe` (DETTE-72, « à la fin ») et 375 px (le Chrome de Xav ne descend pas sous 500 px). Détail dans `process/JOURNAL_DEV.md`.

**ARRÊT XAV** : jouer les huit serrures en ligne après publication (une réussite, trois fautes, le rechargement), relire les textes de `src/content/locks.ts` (consignes, énigmes des cryptex, « On est sympa, voilà. »), dire si un niveau est trop facile ou trop dur.
