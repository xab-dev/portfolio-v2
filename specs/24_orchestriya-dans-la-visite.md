---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, Orchestriya dans toute la visite : un seul orchestre pour le site, des mesures qui ne cassent plus, la baguette, et un widget allégé (spec 24)
type: spec
version: 1.0.0
statut: écrite le 2026-11-04 d'après les réponses de Xav, go attendu — aucun code
catégorie: Spec
date: 2026-11-04
genere_par: claude
verifie_par: —
---

# Portfolio v2 — SPEC : Orchestriya dans toute la visite (Phase 11, spec 24)

## 1. La demande

Xav, le 2026-11-04 : « j'aimerais que l'on améliore l'intégration de Orchestriya dans le portfolio, pas le module, mais la manière dont il interagit avec la navigation du visiteur. quelques pistes : garder la lecture dans les mentions légales ; ajouter plus d'interaction (clic, molette), en gardant en mémoire ce qui a été fait pour ne pas casser les mesures, y compris pendant la lecture du CV interactif. »

Les « mesures » sont celles de la musique : depuis la spec 18, tout changement tombe à la mesure ou à l'accord suivant (« c'est un orchestre, pas un interrupteur »). **Le moteur (`src/lib/orchestriya/engine.js`, copie du dépôt Orchestriya) n'est pas touché** : tout se fait dans le portfolio, avec ce que le moteur expose déjà.

Réponses de Xav aux propositions de l'agent, le même jour :
- Mini-lecteur : **une pastille**, « le minimum pour qu'elle reste petite ».
- Baguette : **pas de tempo** ; « la molette fait évoluer la progression (c'est peut-être déjà le cas, mais pas assez ressenti) ».
- Cymbale à la double-croche suivante, pas sur le premier temps : **ok**.
- Le défilement qui ouvre le filtre : **non**.
- **Une seule spec.**
- Les neuf points à trancher : 1 oui ; 2 a + b ; 3 ok ; 4 seulement en appuyant ; 5 ok, le minimum ; 6 ok ; 7 ok ; 8 ok ; 9 ok (détail aux §4 à §6).
- En plus, à la fin : « on simplifie le widget affiché dans le Hero : enlève toutes les mentions explicatives, on ne garde que le titre, les boutons et la barre de progression. Le centre du widget doit être aligné avec le centre du Hero pour rester joli (pas collé en haut ni en bas). »

## 2. Ce qui se passe aujourd'hui (1.14.0)

1. **Mentions légales : la musique s'arrête net.** Le moteur vit dans le Hero ; la page légale remplace les sections, le Hero est démonté, `dispose()` ferme le contexte audio en pleine mesure. Au retour, tout est perdu sauf le volume : il faut relancer, et la nuance choisie par le visiteur est oubliée.
2. **Hors de l'accueil, rien ne permet d'arrêter le son** sans remonter au widget (RGAA 4.10 : un son de plus de 3 s doit pouvoir être arrêté).
3. **En navigation rapide, les mesures cassent.** Un clic sur « Contact » fait défiler à travers Parcours, Projets et Jouer ; chaque section envoie ses ordres au passage : un drop posé puis annulé, une montée (riser) commencée puis abandonnée, la progression changée deux fois, la ligne de statut qui s'emballe.
4. **Le changement de progression s'entend peu.** Le moteur l'applique au changement d'accord suivant (toutes les deux mesures, jusqu'à 3 s), sans repartir au premier accord : il garde sa place dans le cycle. Les trois progressions commencent par La mineur, Andalouse et Cinéma finissent par Fa et Mi : selon le moment, rien ne change à l'oreille pendant 6 s. C'est le « pas assez ressenti » de Xav.
5. **CV interactif** : la musique continue (le CV est par-dessus la page) et la section ne bouge pas, mais rien ne réagit à l'exploration.

## 3. Lot A — un seul orchestre pour tout le site

**Le magasin.** Le moteur sort du Hero et passe dans un magasin partagé, `src/lib/orchestriya/orchestriyaStore.ts`, sur le modèle de `lockStore`, `themeStore` et `activeSectionStore` (`useSyncExternalStore`, un état pour toute la page : la leçon de la spec 12). Il garde :
- le moteur (toujours chargé au premier geste, chunk séparé) et son dernier état (`onChange`), le dernier pas joué (`onStep` : mesure, double-croche, accord), le dernier message ;
- le volume (toujours mémorisé dans `orchestriya:volume`), le muet, « Suivre la visite », la nuance du visiteur ;
- `launched` : vrai dès le premier lancement de la visite (sert à la pastille, §3).

Le moteur n'est plus jamais fermé par un démontage : il vit autant que l'onglet. Le widget du Hero ne fait plus qu'afficher le magasin et lui envoyer les gestes.

**Le chef d'orchestre.** Toute la logique de suivi sort du widget dans un composant sans rendu, `OrchestriyaConductor`, monté une fois dans `App`. Il décide de la « vue » : `mentions-legales` si la page légale est ouverte, `cv` si le CV interactif l'est, sinon la section visible. Il envoie les ordres (§4), écoute les serrures (roulement, cymbale, comme la spec 21) et les branches du CV (§5).

Piège noté : `activeSectionStore` n'observe les sections qu'entre son premier et son dernier abonné, pour réobserver à neuf au retour des Mentions légales. Un abonné permanent casserait cette règle (il observerait les sections démontées). La lecture de la section visible reste donc montée avec les sections, comme la Navbar ; un test rejoue l'aller-retour par les Mentions légales.

**Les nouvelles vues.** La table `sectionMusic` (`src/content/orchestriya.ts`) gagne deux entrées, à valider à l'écoute :

| Vue | Phase | Progression | Nuance |
|---|---|---|---|
| Mentions légales | break | Sombre | piano (fixe) |
| CV interactif | break | Andalouse | piano (fixe) |

En les quittant, la musique de la section revient (même règle que d'une section à l'autre). Les cinq sections ne changent pas (Jouer reste en Cinéma, Xav n'a pas retenu le 2c).

**La pastille.** `OrchestriyaPill`, en bas à gauche (le gardien est à droite), même hauteur que la bulle du gardien, plus étroite. **Le minimum** :
- un bouton lecture / arrêt (`aria-pressed`, nom « Orchestriya : arrêter » / « Orchestriya : lancer ») ;
- un bouton muet ;
- quatre petits points, un par accord de la progression, l'accord joué allumé, bleu en break, violet en drop (`aria-hidden` : la ligne de statut du widget dit déjà tout).

Elle apparaît quand l'orchestre a été lancé au moins une fois dans la visite (pour pouvoir le relancer, sans vendre le widget à qui ne l'a pas touché) et que le widget du Hero n'est pas à l'écran (un `IntersectionObserver` sur le widget, ou la page légale, où le widget n'existe pas). Elle se cache, comme le gardien, quand une fenêtre est ouverte (`openModals`) : fiche, FAQ, gardien ; Échap la ramène. **Pendant le CV interactif**, dont la fenêtre garde le clavier, la même pastille est rendue **dans l'en-tête du CV**, à côté de « Fermer ». Impression : cachée. Mouvement réduit : les points changent sans transition.

## 4. Lot B — ne plus casser les mesures

**Une demi-mesure avant de suivre.** Une vue doit rester la même **une demi-mesure** (calculée sur le tempo du moteur : 0,75 s à 160 BPM) avant que le chef d'orchestre envoie ses ordres. Les sections traversées par un défilement ne comptent pas. Le temps d'attente est vérifié sur un trajet Accueil → Contact par la barre de navigation : une seule série d'ordres, celle de Contact.

**Seulement des actions déjà calées.** Les réactions du site n'utilisent que ce que le moteur cale lui-même : roulement (à la demi-mesure), drop (à la mesure), progression (à l'accord). La cymbale tombe à la double-croche suivante (accepté par Xav). Les notes de piano partent tout de suite, comme un soliste (§5).

**Le roulement qui annonce la progression (2a).** À chaque changement de progression, quelle qu'en soit la cause (suivi, molette, boutons ◀ ▶), un roulement de caisse claire l'annonce. Le moteur joue le roulement dans la seconde moitié de la mesure en cours (ou de la suivante, passé la moitié), et change d'accord au début des mesures paires. Le chef d'orchestre appelle donc `fill()` au moment où le roulement tombera dans la mesure qui précède le changement ; trop tard pour celle-là, il tombe dans la mesure du changement. Le moment se lit dans les pas livrés par `onStep`, avec la marge de l'avance du moteur (il programme 0,2 s à l'avance, deux doubles-croches). Fonction pure `fillTiming(mesure, pas)`, testée.

**Jamais deux roulements dans le même accord.** Les roulements du clic de navigation (§5), des serrures (spec 21) et des progressions se regroupent : un seul par fenêtre de deux mesures.

**L'accord en cours, visible (2b).** Dans le widget, les quatre accords sous le nom de la progression ; celui qui joue est allumé (lu dans `onStep`, `ci`). La pastille montre les mêmes quatre points.

**La mémoire des choix.** Ce que le visiteur règle à la main (nuance, phase, progression, baguette) tient jusqu'à la vue suivante, comme aujourd'hui. La nuance qu'il choisit, aux boutons ou à la baguette, devient « sa » nuance, celle que les sections gardent ou décalent d'un cran (spec 21 §9).

## 5. Lot C — clic et molette

**La baguette.** La barre des seize traits devient une zone où l'on dirige, plus haute (environ 3 rem), les seize traits dedans.
- **En appuyant** et en glissant : la largeur règle la brillance (`setTone`, de sombre à gauche à clair à droite), la hauteur la nuance (`setIntensity`, ff en haut). Le survol seul ne change rien (Xav : « seulement en appuyant »).
- **Un clic** (appui relâché sans avoir glissé) : la cymbale.
- **La molette** sur la zone : une progression de plus ou de moins (`cycleProg`), **un seul changement par geste** (un pavé tactile envoie des dizaines d'événements : on attend un temps calme avant d'en accepter un autre). La molette n'est captée que sur la zone ; la page défile normalement partout ailleurs. Pas de tempo.
- Un point marque la position courante (brillance, nuance) quand l'orchestre joue.
- **Au clavier** : la zone prend le focus ; ← → la brillance, ↑ ↓ la nuance, Entrée ou Espace la cymbale, Page ↑ / Page ↓ la progression. Nom accessible « Baguette », description hors écran avec les touches.
- **Au doigt** : `touch-action: none` sur la zone seulement (glisser dirige au lieu de défiler, la zone est petite). Pas de molette : les boutons ◀ ▶ restent.
- Grisée et inerte tant que l'orchestre ne joue pas : jamais de son que le visiteur n'a pas lancé.
- Fonctions pures testées : position → (brillance, nuance) ; clic contre glissé (seuil en pixels) ; geste de molette → un seul pas.

**Les clics du site**, seulement si l'orchestre joue et que « Suivre la visite » est allumé (même règle que les serrures) :
- un lien de la barre de navigation (bureau et menu mobile) : un roulement ;
- une fiche projet qui s'ouvre (route `#projets/<id>`) : un La aigu (`soloNote`, La4) ;
- **CV interactif** : chaque branche joue sa note en s'ouvrant, dans l'ordre de l'étoile — Avant 2026 La3, Reconversion 2026 Do4, Méthode Ré4, IA & agents Mi4, Développement Sol4, La suite La4 ; les feuilles ne jouent rien ; les six branches explorées : un roulement et la cymbale, comme la huitième serrure. Les notes sont celles du solo d'Orchestriya (La mineur pentatonique) : rien ne sonne faux sur les trois progressions (au pire une note bleue, Sol contre l'accord de Mi).

## 6. Le widget allégé, centré dans le Hero

**Ce qui reste à l'écran** : le titre « Orchestriya » (avec le point vert quand il joue), les boutons, et la barre (devenue la baguette). Soit :
- Lancer / Arrêter ; le bouton de phase (« Passer au drop », « Revenir au break », « Annuler ») ;
- les cinq nuances ;
- ◀ progression ▶ et ses quatre accords, l'accord joué allumé (§4) ; pendant l'attente d'un changement, le nom de la progression à venir, en gris, jusqu'à ce qu'elle joue ;
- muet et curseur de volume ;
- « Suivre la visite » ;
- la baguette.

**Ce qui part de l'écran** : le sous-titre (« Orchestre drum and bass · 160 BPM »), l'introduction, le conseil pendant le jeu, la ligne de crédit, l'aide de « Suivre la visite », la note « … à la mesure suivante », la pastille de phase (la couleur de la barre et le libellé du bouton disent déjà la phase), les étiquettes « Nuance », « Progression », « Volume ».

**Ce qui reste pour les lecteurs d'écran**, hors écran (`sr-only`) : les étiquettes des trois groupes, la ligne de statut du moteur (`role="status"`), l'aide de « Suivre la visite » (description du bouton). Le message d'erreur « Votre navigateur ne sait pas jouer de son » reste visible : ce n'est pas une explication, c'est une panne. Les textes retirés restent dans `orchestriya.ts` quand ils servent ailleurs (le gardien cite `followHint`) ; les autres sont supprimés.

**Le centrage.** En grand écran, la grille du Hero passe de `lg:items-start` à `lg:items-center` et le décalage `lg:mt-[7.5rem]` part : le centre du widget s'aligne sur le centre de la colonne de gauche, ni collé en haut ni en bas. Cela remplace l'alignement sur la ligne « Consultant… » demandé par Xav le 2026-11-02 (spec 18 §4 bis). En petit écran, rien ne change (le widget sous le texte).

## 7. Fichiers

- `src/lib/orchestriya/orchestriyaStore.ts` (+ test) et `useOrchestriya.ts` : le magasin.
- `src/lib/orchestriya/conductor.ts` (+ test) : délai d'une demi-mesure, `fillTiming`, regroupement des roulements, vue → musique ; `follow.ts` inchangé.
- `src/lib/orchestriya/baguette.ts` (+ test) : position, clic contre glissé, geste de molette.
- `src/components/orchestriya/OrchestriyaWidget.tsx` (allégé, branché au magasin), `OrchestriyaConductor.tsx`, `OrchestriyaPill.tsx`, `Baguette.tsx`.
- `src/content/orchestriya.ts` : entrées `mentions-legales` et `cv` de `sectionMusic`, notes des branches du CV, textes retirés, noms de la pastille et de la baguette.
- `src/App.tsx` (chef d'orchestre, pastille), `src/sections/Hero.tsx` (centrage), `src/components/layout/Navbar.tsx` (roulement au clic), `src/components/cv/CvExplorer.tsx` (pastille dans l'en-tête, notes des branches, roulement et cymbale à six sur six).
- Pas de nouvelle clé dans le navigateur : la page Mentions légales ne change pas.
- Version 1.15.0.

## 8. Vérification prévue

- `tsc`, `oxlint`, tests, build (le moteur reste dans son chunk ; bundle principal mesuré avant et après).
- Tests : le magasin survit au démontage du widget ; le suivi n'envoie rien pour une vue vue moins d'une demi-mesure ; `fillTiming` aux bords de mesure ; un seul roulement par fenêtre de deux mesures ; toutes les vues ont leur musique ; six branches, six notes distinctes et croissantes ; baguette (position, seuil du clic, un pas par geste) ; aller-retour par les Mentions légales, puis changement de section reçu.
- Chrome sur `vite preview`, 1 440 px et 500 px, sombre et clair, état lu dans le magasin (pas à l'oreille) :
  - lancer, aller aux Mentions légales : la musique continue, Sombre et piano ; la pastille est là ; retour au site : même lecture, même nuance du visiteur ;
  - Accueil → Contact par la barre : une seule série d'ordres ;
  - un changement de progression : un roulement juste avant ;
  - la baguette à la souris (glisser, clic, molette), au clavier, au doigt (émulation tactile) ; la page défile ailleurs ;
  - le CV : la pastille dans son en-tête, une note par branche, roulement et cymbale à six sur six ; une fiche ouverte depuis une feuille : le La, puis la musique de Projets ;
  - le widget allégé et centré dans le Hero ;
  - passe `axe` sur le widget, la pastille et la baguette (DETTE-72).
- **Non vérifiable par l'agent : le son.** Le calage du roulement, la justesse des notes et les deux nouvelles musiques s'écoutent : c'est Xav.

## 9. Hors scope

Toute retouche du moteur (dont une cymbale calée sur le premier temps, ou une progression qui repart au premier accord) : à faire dans le dépôt Orchestriya, puis `npm run orchestriya:sync` (DETTE-71). Le tempo dans le portfolio. Le filtre au défilement (refusé). Les notes sur les feuilles du CV. Une mémoire de « Suivre la visite » ou de la lecture d'une visite à l'autre. Baisser l'orchestre quand le jeu RPG-v2 de la section Jouer a le focus.

## 10. ARRÊT XAV

Avant le code : **le go**, et ratifier les choix de l'agent faits en écrivant :
- la pastille sans bouton « retour au widget » (le minimum : lecture / arrêt, muet, quatre points) ;
- la pastille de phase retirée du widget (la couleur de la barre et le bouton disent la phase), et les étiquettes « Nuance », « Progression », « Volume » gardées hors écran seulement ;
- un clic sur la baguette = la cymbale, un appui glissé = sans cymbale ;
- le roulement d'annonce pour **tous** les changements de progression, y compris ceux faits aux boutons ◀ ▶ et à la molette.

Après : écouter les Mentions légales et le CV, le roulement d'annonce, les notes des branches ; dire si la baguette se prend bien en main.

Version à l'exécution : 1.15.0.
