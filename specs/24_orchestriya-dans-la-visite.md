---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, Orchestriya dans toute la visite : un seul orchestre pour le site, des mesures qui ne cassent plus, le clic et la molette pendant la visite, et un widget allégé (spec 24)
type: spec
version: 1.1.0
statut: écrite le 2026-11-04 d'après les réponses de Xav, révisée le même jour (la baguette écartée), exécutée le même jour sur son go (« 5 : uniquement dans le gardien (pas dans le widget simplifié). go »), version 1.15.0, privé `e703c6b` ; écoutée par Xav (« c'est très bon, juste trop de roulement ») et retouchée en 1.16.0, privé `36cd761` : plus de roulement d'annonce entre les progressions — non déployée
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
- Les neuf points à trancher : 1 oui ; 2 a + b ; 3 ok ; 4 seulement en appuyant (sans objet depuis la révision, voir plus bas) ; 5 ok, le minimum ; 6 ok ; 7 ok ; 8 ok ; 9 ok (détail aux §4 à §6).
- En plus, à la fin : « on simplifie le widget affiché dans le Hero : enlève toutes les mentions explicatives, on ne garde que le titre, les boutons et la barre de progression. Le centre du widget doit être aligné avec le centre du Hero pour rester joli (pas collé en haut ni en bas). »
- Sur la première version de cette spec : « ok sauf pour la baguette qui remplace la barre des 16 traits. Les 16 traits restent affichés ; pendant la navigation : un clic joue la cymbale, la molette change la progression, tout se fait aussi au clavier. » **Il n'y a donc plus de baguette** : le clic et la molette agissent sur toute la page, pendant la visite (§5), et la barre des seize traits reste celle d'aujourd'hui.

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

**Le chef d'orchestre.** Toute la logique de suivi sort du widget dans un composant sans rendu, `OrchestriyaConductor`, monté une fois dans `App`. Il décide de la « vue » : `mentions-legales` si la page légale est ouverte, `cv` si le CV interactif l'est, sinon la section visible. Il envoie les ordres (§4), écoute les serrures (roulement, cymbale, comme la spec 21), les branches du CV, les clics et la molette (§5).

Piège noté : `activeSectionStore` n'observe les sections qu'entre son premier et son dernier abonné, pour réobserver à neuf au retour des Mentions légales. Un abonné permanent casserait cette règle (il observerait les sections démontées). La lecture de la section visible reste donc montée avec les sections, comme la Navbar ; un test rejoue l'aller-retour par les Mentions légales.

**La progression passe à la molette.** Puisque la molette change la progression pendant toute la visite (§5), les vues ne la décident plus : sinon la section ramènerait la sienne une demi-mesure après chaque geste, et les deux se battraient. La table `sectionMusic` (`src/content/orchestriya.ts`) perd sa colonne « progression » ; les vues gardent la phase et la nuance. L'orchestre démarre en Sombre, comme le moteur.

**Les nouvelles vues.** La table gagne deux entrées, à valider à l'écoute :

| Vue | Phase | Nuance |
|---|---|---|
| Accueil | break | celle du visiteur |
| Parcours | break | celle du visiteur |
| Projets | drop | celle du visiteur |
| Jouer | drop | un cran au-dessus |
| Contact | break | mezzo forte (fixe) |
| **Mentions légales** | break | piano (fixe) |
| **CV interactif** | break | piano (fixe) |

En quittant les deux nouvelles vues, la musique de la section revient (même règle que d'une section à l'autre). Les cinq sections gardent leur phase et leur nuance de la spec 21.

**La pastille.** `OrchestriyaPill`, en bas à gauche (le gardien est à droite), même hauteur que la bulle du gardien, plus étroite. **Le minimum** :
- un bouton lecture / arrêt (`aria-pressed`, nom « Orchestriya : arrêter » / « Orchestriya : lancer ») ;
- un bouton muet ;
- quatre petits points, un par accord de la progression, l'accord joué allumé, bleu en break, violet en drop (`aria-hidden` : la ligne de statut du widget dit déjà tout).

Elle apparaît quand l'orchestre a été lancé au moins une fois dans la visite (pour pouvoir le relancer, sans vendre le widget à qui ne l'a pas touché) et que le widget du Hero n'est pas à l'écran (un `IntersectionObserver` sur le widget, ou la page légale, où le widget n'existe pas). Elle se cache, comme le gardien, quand une fenêtre est ouverte (`openModals`) : fiche, FAQ, gardien ; Échap la ramène. **Pendant le CV interactif**, dont la fenêtre garde le clavier, la même pastille est rendue **dans l'en-tête du CV**, à côté de « Fermer ». Impression : cachée. Mouvement réduit : les points changent sans transition.

## 4. Lot B — ne plus casser les mesures

**Une demi-mesure avant de suivre.** Une vue doit rester la même **une demi-mesure** (calculée sur le tempo du moteur : 0,75 s à 160 BPM) avant que le chef d'orchestre envoie ses ordres. Les sections traversées par un défilement ne comptent pas. Le temps d'attente est vérifié sur un trajet Accueil → Contact par la barre de navigation : une seule série d'ordres, celle de Contact.

**Seulement des actions déjà calées.** Les réactions du site n'utilisent que ce que le moteur cale lui-même : roulement (à la demi-mesure), drop (à la mesure), progression (à l'accord). La cymbale tombe à la double-croche suivante (accepté par Xav). Les notes de piano partent tout de suite, comme un soliste (§5).

**Le roulement qui annonce la progression (2a)** — *retiré à l'écoute en 1.16.0, voir §12.* À chaque changement de progression, qu'il vienne de la molette (§5) ou des boutons ◀ ▶, un roulement de caisse claire l'annonce. Le moteur joue le roulement dans la seconde moitié de la mesure en cours (ou de la suivante, passé la moitié), et change d'accord au début des mesures paires. Le chef d'orchestre appelle donc `fill()` au moment où le roulement tombera dans la mesure qui précède le changement ; trop tard pour celle-là, il tombe dans la mesure du changement. Le moment se lit dans les pas livrés par `onStep`, avec la marge de l'avance du moteur (il programme 0,2 s à l'avance, deux doubles-croches). Fonction pure `fillTiming(mesure, pas)`, testée.

**Jamais deux roulements dans le même accord.** Les roulements du clic de navigation (§5), des serrures (spec 21) et des progressions se regroupent : un seul par fenêtre de deux mesures.

**L'accord en cours, visible (2b).** Dans le widget, les quatre accords sous le nom de la progression ; celui qui joue est allumé (lu dans `onStep`, `ci`). La pastille montre les mêmes quatre points. La barre des seize traits ne change pas.

**La mémoire des choix.** La nuance et la phase réglées à la main dans le widget tiennent jusqu'à la vue suivante, comme aujourd'hui. La nuance choisie aux boutons devient « sa » nuance, celle que les sections gardent ou décalent d'un cran (spec 21 §9). La progression, elle, ne revient plus à une valeur de section : elle reste celle que le visiteur a amenée, à la molette ou aux boutons, d'une vue à l'autre.

## 5. Lot C — clic et molette, pendant toute la navigation

Xav : « pendant la navigation : un clic joue la cymbale, la molette change la progression, tout se fait aussi au clavier. » Pas de zone dédiée : c'est la visite elle-même qui joue, sur toute la page (sections, Mentions légales, CV interactif, fiches). Pas de tempo, pas de brillance.

**Toujours la même règle** : rien ne se passe tant que l'orchestre ne joue pas, ni quand « Suivre la visite » est éteint. Jamais de son que le visiteur n'a pas lancé ; un bouton coupe tout.

**Rien n'est capturé.** Les écouteurs sont passifs : aucun `preventDefault`, la page défile, les liens et les boutons font ce qu'ils font. La musique s'ajoute au geste, elle ne le remplace jamais.

**Un clic → la cymbale.**
- L'événement `click` sur le document. Il couvre la souris, le doigt (un toucher est un clic) et **le clavier** : Entrée ou Espace sur un lien ou un bouton envoie le même `click`. Rien de plus à écouter pour le clavier.
- **Sauf** les clics sur les commandes de l'orchestre (le widget et la pastille) : « Lancer » ne doit pas jouer la cymbale, ni chaque nuance choisie.
- **Une cymbale par temps au plus** (quatre doubles-croches, 0,375 s à 160 BPM) : dix clics rapides ne font pas dix cymbales.
- **Un clic qui a déjà son son le garde** (choix de l'agent, à ratifier) : un lien de la barre de navigation joue le roulement, une fiche qui s'ouvre son La, une branche du CV sa note (voir plus bas) ; pas de cymbale en plus.

**Un geste de molette → la progression suivante ou précédente.**
- Vers le bas : la suivante ; vers le haut : la précédente (`cycleProg`, au prochain accord, annoncée par le roulement du §4).
- **Un seul changement par geste** : un pavé tactile ou une molette libre envoient des dizaines d'événements ; un geste se termine après un temps calme (environ 250 ms sans événement).
- **Au clavier** : les touches qui font défiler la page comptent comme un geste — ↓ ↑, Page ↓ / Page ↑, Espace, Début, Fin — sauf quand le focus est dans un champ ou une commande qui se sert de ces touches (champ de saisie, curseur de volume, barre de branches du CV, molettes du cryptex, toute zone marquée `data-orchestriya-ignore`). Un appui tenu compte pour un seul geste.
- **Au doigt** : un glissé vertical de plus de 30 px compte comme un geste (pas de molette sur mobile).
- Les défilements faits par le site lui-même (un lien de navigation, le retour des Mentions légales) ne comptent pas : seuls les gestes du visiteur changent la progression.
- Pendant le CV interactif, la molette dans sa fenêtre compte aussi : c'est un geste du visiteur.

**Les sons propres à certains clics** :
- un lien de la barre de navigation (bureau et menu mobile) : un roulement ;
- une fiche projet qui s'ouvre (route `#projets/<id>`) : un La aigu (`soloNote`, La4) ;
- **CV interactif** : chaque branche joue sa note en s'ouvrant, dans l'ordre de l'étoile — Avant 2026 La3, Reconversion 2026 Do4, Méthode Ré4, IA & agents Mi4, Développement Sol4, La suite La4 ; les feuilles jouent la cymbale, comme tout clic (celles qui ouvrent une fiche jouent son La) ; les six branches explorées : un roulement et la cymbale, comme la huitième serrure. Les notes sont celles du solo d'Orchestriya (La mineur pentatonique) : rien ne sonne faux sur les trois progressions (au pire une note bleue, Sol contre l'accord de Mi).

**Lecteurs d'écran.** Le moteur parle à chaque action (« Cymbale. », « Progression Andalouse au prochain changement d'accord. »). Relayé dans la ligne de statut, cela parlerait à chaque clic et à chaque Page ↓. Les messages nés des clics et des gestes de molette ne sont donc **pas** relayés ; seuls le sont ceux des commandes du widget et les changements de phase du suivi (comme la spec 21).

**Fonctions pures testées** (`src/lib/orchestriya/gestures.ts`) : clic retenu ou non (commande de l'orchestre, son propre, une cymbale par temps) ; événements de molette → un seul pas par geste, dans le bon sens ; touche de défilement retenue ou non selon le focus, appui tenu = un geste ; glissé au doigt au-delà du seuil.

## 6. Le widget allégé, centré dans le Hero

**Ce qui reste à l'écran** : le titre « Orchestriya » (avec le point vert quand il joue), les boutons, et la barre des seize traits, telle qu'aujourd'hui. Soit :
- Lancer / Arrêter ; le bouton de phase (« Passer au drop », « Revenir au break », « Annuler ») ;
- les seize traits de la mesure (inchangés : bleu en break, violet en drop) ;
- les cinq nuances ;
- ◀ progression ▶ et ses quatre accords, l'accord joué allumé (§4) ; pendant l'attente d'un changement, le nom de la progression à venir, en gris, jusqu'à ce qu'elle joue ;
- muet et curseur de volume ;
- « Suivre la visite ».

**Ce qui part de l'écran** : le sous-titre (« Orchestre drum and bass · 160 BPM »), l'introduction, le conseil pendant le jeu, la ligne de crédit, l'aide de « Suivre la visite », la note « … à la mesure suivante », la pastille de phase (la couleur de la barre et le libellé du bouton disent déjà la phase), les étiquettes « Nuance », « Progression », « Volume ».

**Ce qui reste pour les lecteurs d'écran**, hors écran (`sr-only`) : les étiquettes des trois groupes, la ligne de statut du moteur (`role="status"`, filtrée comme dit au §5), et rien d'autre : l'aide de « Suivre la visite » n'est plus dans le widget, même hors écran (Xav, au go : « uniquement dans le gardien »). Le message d'erreur « Votre navigateur ne sait pas jouer de son » reste visible : ce n'est pas une explication, c'est une panne. Les textes retirés restent dans `orchestriya.ts` quand ils servent ailleurs (le gardien cite `followHint`) ; les autres sont supprimés.

**Le centrage.** En grand écran, la grille du Hero passe de `lg:items-start` à `lg:items-center` et le décalage `lg:mt-[7.5rem]` part : le centre du widget s'aligne sur le centre de la colonne de gauche, ni collé en haut ni en bas. Cela remplace l'alignement sur la ligne « Consultant… » demandé par Xav le 2026-11-02 (spec 18 §4 bis). En petit écran, rien ne change (le widget sous le texte).

## 7. Fichiers

- `src/lib/orchestriya/orchestriyaStore.ts` (+ test) et `useOrchestriya.ts` : le magasin.
- `src/lib/orchestriya/conductor.ts` (+ test) : délai d'une demi-mesure, `fillTiming`, regroupement des roulements, vue → musique ; `follow.ts` perd la progression (phase et nuance seulement), ses tests suivent.
- `src/lib/orchestriya/gestures.ts` (+ test) : clic retenu ou non, une cymbale par temps, geste de molette, touches de défilement, glissé au doigt.
- `src/components/orchestriya/OrchestriyaWidget.tsx` (allégé, branché au magasin), `OrchestriyaConductor.tsx` (dont les écouteurs passifs du document), `OrchestriyaPill.tsx`.
- `src/content/orchestriya.ts` : `sectionMusic` sans progression, entrées `mentions-legales` et `cv`, notes des branches du CV, textes retirés, noms de la pastille, nouvelle aide de « Suivre la visite » (« La musique suit la section que vous lisez ; vos clics et la molette jouent avec. »), **dans le gardien seulement** (réplique « curieux-musique »), plus dans le widget (Xav, au go).
- `src/App.tsx` (chef d'orchestre, pastille), `src/sections/Hero.tsx` (centrage), `src/components/layout/Navbar.tsx` (roulement au clic), `src/components/cv/CvExplorer.tsx` (pastille dans l'en-tête, notes des branches, roulement et cymbale à six sur six), les molettes du cryptex (`data-orchestriya-ignore` si besoin).
- Pas de nouvelle clé dans le navigateur : la page Mentions légales ne change pas.
- Version 1.15.0.

## 8. Vérification prévue

- `tsc`, `oxlint`, tests, build (le moteur reste dans son chunk ; bundle principal mesuré avant et après).
- Tests : le magasin survit au démontage du widget ; le suivi n'envoie rien pour une vue vue moins d'une demi-mesure, et jamais de progression ; `fillTiming` aux bords de mesure ; un seul roulement par fenêtre de deux mesures ; toutes les vues ont leur musique ; six branches, six notes distinctes et croissantes ; gestes (clic sur une commande ignoré, une cymbale par temps, son propre prioritaire, un pas par geste de molette, touches de défilement ignorées dans un champ, appui tenu = un geste) ; aller-retour par les Mentions légales, puis changement de section reçu.
- Chrome sur `vite preview`, 1 440 px et 500 px, sombre et clair, état lu dans le magasin (pas à l'oreille) :
  - lancer, aller aux Mentions légales : la musique continue, Sombre et piano ; la pastille est là ; retour au site : même lecture, même nuance du visiteur ;
  - Accueil → Contact par la barre : une seule série d'ordres ;
  - un geste de molette : une progression de plus, un roulement juste avant, la page qui défile comme avant ; un défilement continu au pavé tactile : un seul pas ;
  - au clavier : Page ↓ fait un pas de progression, Entrée sur un lien joue la cymbale ; les flèches dans la barre des branches du CV et sur le curseur de volume ne changent rien ;
  - au doigt (émulation tactile) : un toucher joue la cymbale, un glissé change la progression ;
  - clics dans le widget et la pastille : pas de cymbale ; clics rapides : une par temps ;
  - « Suivre la visite » éteint, ou orchestre arrêté : clics et molette muets ;
  - le CV : la pastille dans son en-tête, une note par branche, roulement et cymbale à six sur six ; une fiche ouverte depuis une feuille : le La, puis la musique de Projets ;
  - le widget allégé, les seize traits en place, centré dans le Hero ;
  - passe `axe` sur le widget et la pastille (DETTE-72) ; la ligne de statut ne parle pas aux clics ni aux Page ↓.
- **Non vérifiable par l'agent : le son.** Le calage du roulement, la justesse des notes, la cymbale au clic et les deux nouvelles musiques s'écoutent : c'est Xav.

## 9. Hors scope

Toute retouche du moteur (dont une cymbale calée sur le premier temps, ou une progression qui repart au premier accord) : à faire dans le dépôt Orchestriya, puis `npm run orchestriya:sync` (DETTE-71). Le tempo dans le portfolio. Le filtre au défilement (refusé). La baguette (une zone où diriger brillance et nuance : écartée par Xav, les seize traits restent). Des notes sur les feuilles du CV. Une mémoire de « Suivre la visite » ou de la lecture d'une visite à l'autre. Baisser l'orchestre quand le jeu RPG-v2 de la section Jouer a le focus.

## 10. ARRÊT XAV

Ratifiés par Xav le 2026-11-04 (« ok ») : la pastille sans bouton de retour au widget ; la pastille de phase et les étiquettes retirées de l'écran ; le roulement d'annonce pour tous les changements de progression. Le choix « clic sur la baguette = cymbale » est tombé avec la baguette.

Go de Xav le 2026-11-04 : « 5 : uniquement dans le gardien (pas dans le widget simplifié). go » — les choix 1 à 4 ci-dessous ratifiés par le go, le 5 précisé. Les choix de l'agent nés de la seconde version :
- la molette décide seule de la progression : les vues ne gardent que la phase et la nuance (§3) ;
- un clic qui a déjà son son (lien de navigation, fiche, branche du CV) ne joue pas la cymbale en plus ; une cymbale par temps au plus ;
- au clavier, les touches de défilement comptent comme la molette, et au doigt un glissé vertical ;
- les messages du moteur nés des clics et de la molette ne sont pas lus aux lecteurs d'écran ;
- la nouvelle aide de « Suivre la visite » (§7) : dans le gardien seulement.

Après : écouter les Mentions légales et le CV, la cymbale au clic, le roulement d'annonce, les notes des branches ; dire si la musique bouge trop, ou pas assez, pendant la visite.

Version à l'exécution : 1.15.0.

## 11. Exécution (2026-11-04)

Faite telle quelle, version 1.15.0, privé `e703c6b`. Écarts et trouvailles (détail dans `process/JOURNAL_DEV.md`) :

- **Le moteur ne prévient pas quand son séquenceur applique un changement.** Un drop ou une progression en attente prend effet au début de la mesure, mais `onChange` ne part qu'à l'action suivante : le widget de la 1.14.0 affichait donc « Annuler » ou l'ancienne progression longtemps après le changement (défaut déjà là, jamais vu), et le roulement d'annonce serait tombé une mesure trop tard. Corrigé côté portfolio, sans toucher au moteur : le magasin relit l'état du moteur à chaque pas entendu (test). Le correctif propre est dans Orchestriya (**DETTE-77**).
- **La pastille et la barre de navigation.** À 500 px, un liseré de 16 px du widget, caché sous la barre collante, le faisait compter « à l'écran » : la pastille n'apparaissait pas. Le widget ne compte plus qu'avec un quart de sa hauteur visible sous la barre.
- **Messages muets.** Clics, molette, notes du CV et roulements d'annonce ne parlent pas à la ligne de statut ; le suivi de phase et les serrures parlent, comme dans la spec 21.
- **La progression qui attend son tour**, dans le widget : son nom en gris et ses quatre accords, éteints jusqu'à ce qu'elle joue ; ensuite, l'accord joué s'allume. Pas de zone vivante sur ce nom (la molette parlerait à chaque geste) ; les boutons ◀ ▶ passent par la ligne de statut.
- **Une fiche qui s'ouvre** se reconnaît au hash `#projets/<id>` d'une fiche connue ; un clic garde son son propre s'il se déclare dans les 60 ms (le `hashchange` d'une fiche arrive juste après le clic).
- Le faux AudioContext des tests sort de `engine.test.ts` dans `src/lib/orchestriya/testing/fakeAudio.ts`, partagé avec le test du magasin.

## 12. Retouche à l'écoute (2026-11-04, 1.16.0)

Xav, après écoute de la 1.15.0 : « c'est très bon, juste trop de roulement. On enlève ceux entre chaque progression d'accord. »

Le roulement d'annonce du §4 (2a) est retiré : un changement de progression, à la molette ou aux boutons ◀ ▶, n'en lance plus. Restent les roulements de la barre de navigation, des serrures (spec 21) et des six branches du CV explorées, toujours regroupés (jamais deux à moins de deux mesures). L'accord joué reste allumé dans le widget et la pastille (2b). La relecture de l'état du moteur à chaque pas (§11, DETTE-77) reste : elle sert l'affichage. Privé `36cd761`.
