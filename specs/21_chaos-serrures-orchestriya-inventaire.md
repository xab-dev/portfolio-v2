---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, « un peu plus de chaos » : les serrures qui parlent, Orchestriya qui suit la visite, l'inventaire et la fiche secrète (spec 21)
type: spec
version: 1.0.0
statut: exécutée le 2026-11-02 sur le go de Xav (« go spec 21 »), version 1.12.0, privé `f7fb681` ; validée telle quelle par Xav le même jour (« tout est ok de mon coté »), écarts du §9 compris, et publiée (public `be4dfea`) — première des trois specs du plan (21 → 22 → 23)
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : un peu plus de chaos (Phase 11, spec 21)

## 1. La demande

Xav, le 2026-11-02, après avoir validé les serrures en ligne : « qu'est-ce que tu proposes pour ajouter encore un peu plus de "chaos" et de personnalisation ? » Sur les dix propositions de l'agent : « 2 et 4 : oui oui oui !! . 5 : ok pour LES boîtes à outils. 6 et 7 : ok. 8 : non. On ne fait pas tout en une seule fois si c'est trop gros, prépare un plan et les specs, puis demande-moi mon go. »

Cette spec regroupe les trois petits : les serrures qui parlent (2), Orchestriya qui suit la visite (4), l'inventaire des serrures et sa récompense (5). Le gardien est la spec 22, le CV à explorer la spec 23.

Réponses de Xav aux questions de l'agent, le même jour :
- Récompense : **une fiche secrète unique**, « Les boîtes à outils », qui raconte la famille (la boîte « Portfolio », le HUD de la base, les outils des jeux).
- Les phrases des serrures : **l'agent propose, Xav relit** mot pour mot avant publication.

## 2. Les serrures qui parlent

Aujourd'hui : « Faux. Essai 1 sur 3. », « Faux. Essai 2 sur 3. », puis « On est sympa, voilà. » pour toutes les fiches. Demain : une phrase par essai, et au troisième essai une réplique propre à la fiche, qui garde les mots de Xav « On est sympa, voilà. » en tête.

Propositions de l'agent, **toutes à relire par Xav** (sa voix, pas celle de l'agent) :

| Moment | Phrase proposée |
|---|---|
| 1er essai raté (toutes) | « Faux. Un essai de pris, deux de reste. » |
| 2e essai raté (toutes) | « Encore faux. Le prochain, on vous l'offre. » |
| 3e, La base privée | « On est sympa, voilà. La base, elle, n'oublie rien. » |
| 3e, Harness engineering | « On est sympa, voilà. Le harness sert justement à ne pas compter sur la chance. » |
| 3e, RPG-v2 | « On est sympa, voilà. Dans RPG-v2, le troisième essai n'est pas gratuit. » |
| 3e, RPGv4 | « On est sympa, voilà. La 3D attendra que vous soyez prêt. » |
| 3e, TiO-idle | « On est sympa, voilà. Le livre, lui, se lit sans examen. » |
| 3e, TryMe | « On est sympa, voilà. Dans TryMe, c'est la créature qui vous aurait testé. » |
| 3e, Audit sécurité | « On est sympa, voilà. L'audit, lui, ne laisse rien passer. » |
| 3e, miniCiel | « On est sympa, voilà. La clé USB, elle, ne pose pas de questions. » |

Mise en œuvre : `lockTexts.wrong` devient une liste par essai ; `lockVoice[id].mercy` par fiche, avec repli sur « On est sympa, voilà. » si une fiche n'a pas la sienne (test : les huit l'ont). La zone `role="status"` annonce la phrase comme aujourd'hui. Rien d'autre ne change dans la serrure.

## 3. Orchestriya suit la visite

Seulement si le visiteur a lancé la musique (règle d'autoplay, et son choix). Un bouton de plus dans le widget, « Suivre la visite » (`aria-pressed`), **allumé par défaut** — le chaos est là, on peut l'éteindre d'un clic ; pas de mémoire (l'état repart à chaque visite). Quand il est allumé, la section visible décide de la musique, à la mesure ou à l'accord suivant comme toujours (le moteur ne fait rien d'instantané : « c'est un orchestre, pas un interrupteur »).

Correspondance proposée, **à valider par Xav à l'écoute** :

| Section visible | Phase | Progression | Nuance |
|---|---|---|---|
| Accueil | break | Sombre | inchangée |
| Parcours | break | Andalouse | inchangée |
| Projets | drop | Cinéma | inchangée |
| Jouer | drop | Cinéma | un cran au-dessus (f si mf) |
| Contact | break | Sombre | mezzo forte |

Et deux événements : **une serrure s'ouvre → un roulement** (`fill()`) ; **la huitième → la cymbale** (`crashHit()`). Le moteur sait déjà tout cela (spec 18 §5, hors panneau jusqu'ici) ; le panneau ne gagne que le bouton.

Où vit la section visible : la Navbar la calcule déjà (un `IntersectionObserver` sur les sections de `navLinks`) pour souligner l'ancre active. Elle est sortie dans un petit magasin partagé, `src/lib/sections/activeSection.ts` (`useSyncExternalStore`, la leçon de la spec 12) : la Navbar le lit, le widget aussi, une seule observation pour toute la page. Le widget réagit par un effet : à chaque changement de section, s'il tourne et que « Suivre la visite » est allumé, il envoie les ordres (`toggleDrop` seulement si la phase doit changer, lue dans `getState()` ; `setProg` ; `setIntensity`). Les ordres sont ignorés quand le moteur n'est pas chargé.

Lecteurs d'écran : la ligne de statut du widget annonce déjà les changements du moteur (« passage au drop à la mesure suivante ») ; rien de plus, pour ne pas parler à chaque défilement. Mouvement réduit et mode allégé : sans objet, c'est du son.

## 4. L'inventaire et la fiche secrète

**Le compteur.** Dans l'en-tête de la grille des projets, à côté de « 15 projets » : « 3 serrures sur 8 ». Invisible tant qu'aucune serrure n'est ouverte (on ne vend pas le jeu, on le laisse trouver) ; à partir de la première, visible, et annoncé dans une zone `role="status"` quand il change. À huit : « 8 sur 8 : une fiche de plus ».

**La récompense.** Quand les huit sont ouvertes (dérivé du magasin des serrures, aucun stockage de plus), une seizième carte apparaît dans la grille, avant « Votre projet ? » : **« Les boîtes à outils »**. Elle n'a pas de serrure. Tant qu'elle n'est pas gagnée, elle n'existe pas pour le site : absente de la grille, des filtres, et un lien direct `#projets/boites-a-outils` est ignoré comme un id inconnu (la fiche n'est pas dans la liste visible). Dans le code : `secret: true` sur la fiche, `siteProjects` la filtre tant que `unlockedIds` ne couvre pas `locks` ; le test de couverture de `siteProjectOrder` l'inclut (elle a sa place : en dernier). Elle est **hors des deux CV** : ajoutée à `condensedExcludedProjectIds`, absente de `cvMap`, PDF vérifiés identiques.

**Le contenu de la fiche** (textes de l'agent, **à relire par Xav**) :
- Le fil : à chaque projet sa boîte, et toujours la même forme — une icône sur le bureau, une petite fenêtre locale, une tuile par outil, un serveur qui n'écoute que le PC, et jamais de push. Le motif est né dans RPG-v2 (`tools/`, « l'établi ») et s'est répété.
- La boîte « Portfolio » : les faits viennent de la spec 16 et de `tools/boite/` (dépôt privé) : neuf tuiles (où changer quoi, aperçu, Claude Code, état, publier, vérifications, note, dettes, retouche), le port local, les notes déposées pour la session suivante, la publication qui ne pousse jamais.
- Le HUD de la base : **seulement ce que la fiche publique « La base privée et son HUD » dit déjà**. La fiche de la base sur sa boîte est `public: false` : rien n'en sort sans dictée de Xav — ni ses tuiles, ni ses interlocuteurs, ni quoi que ce soit de `prive/`. Si Xav veut en dire plus, il dicte.
- Les outils des jeux : RPG-v2 (`tools/README.md` : boîte, file des dettes, encyclopédie des entités, piano, banc de référence), RPGv4 (`tools/boite`, gardes, nuage), TryMe (`tools/boite` et ses scripts PowerShell : sessions, scénarios, décisions). Faits lus dans les dépôts, comme pour la spec 19, métriques comptées et datées.
- Images : une capture de la boîte « Portfolio » (outil CDP du scratchpad, sans chemin ni donnée privée à l'écran — la tuile « État » montre des noms de fichiers : capturer la page d'accueil seulement), une de l'établi de RPG-v2 si elle ne montre rien de privé.
- Statut « en production », étiquette « Outils », année 2026 ; une ligne de limites honnête : ces boîtes ne sont pas publiées, elles tournent sur le PC de Xav.

## 5. Fichiers

- `src/content/locks.ts` : phrases par essai, `lockVoice`. `src/components/locks/LockGate.tsx` : les lit.
- `src/lib/sections/activeSection.ts` (+ test) ; `src/components/layout/Navbar.tsx` s'y branche ; `src/components/orchestriya/OrchestriyaWidget.tsx` : bouton « Suivre la visite », effet de suivi, roulement et cymbale sur abonnement au magasin des serrures ; `src/content/orchestriya.ts` : textes et la table section → musique.
- `src/content/projects.ts` : fiche `boites-a-outils` (`secret: true`), dernière de `siteProjectOrder` ; `siteProjects` devient une fonction de `unlockedIds` (ou un hook `useSiteProjects()`), `Portfolio.tsx` l'utilise ; compteur dans l'en-tête de la grille (`src/components/portfolio/FilterBar.tsx` ou à côté du compte de projets).
- `src/content/cv.ts` : `condensedExcludedProjectIds` += `boites-a-outils`.
- `npm run images` pour les captures (comme spec 19).
- Tests : phrases (huit `mercy`, aucune vide, « On est sympa, voilà. » en tête de chacune) ; table section → musique (toutes les sections de `navLinks`, valeurs connues du moteur) ; magasin de section (abonnés, valeur stable) ; fiche secrète (hors grille tant que les huit ne sont pas ouvertes, présente après ; hors CV ; garde anti-fuite : aucun chemin, aucune adresse, rien de `prive/`, aucun nom d'interlocuteur).

## 6. Vérification prévue

`tsc`, `oxlint`, tests, build ; Chrome sur `vite preview` à 1 440 px et 500 px, sombre et clair : les phrases aux trois essais sur deux fiches ; la musique lancée puis le défilement d'Accueil à Contact (phase et progression lues dans l'état du widget, pas à l'oreille — **l'oreille, c'est Xav**) ; le bouton « Suivre la visite » éteint → plus rien ne bouge ; ouvrir une serrure musique lancée → le roulement dans le message du moteur ; les huit ouvertes → le compteur, la cymbale, la seizième carte, sa modale ; lien direct vers la fiche secrète avant de l'avoir gagnée → ignoré ; les deux CV reconstruits et comparés au texte.

## 7. Hors scope

Le gardien (spec 22) ; le CV à explorer (spec 23) ; une mémoire du bouton « Suivre la visite » ; des phrases différentes à la réussite ; une fiche par boîte (Xav : une seule) ; tout fait sur le HUD de la base qui n'est pas déjà public.

## 8. ARRÊT XAV

Avant le code : le go. Après : relire les dix phrases (§2) et la fiche secrète (§4), écouter la correspondance section → musique (§3) et dire si une case change, dire si le compteur doit plutôt vivre dans la barre de navigation, et si « Suivre la visite » doit être éteint par défaut.

Version à l'exécution : 1.12.0.

## 9. Exécution (2026-11-02)

Faite telle quelle, avec ces écarts à ratifier (détail dans `process/JOURNAL_DEV.md`) :

- « Nuance inchangée » lu comme « la nuance du visiteur » (son dernier choix, mezzo forte au départ) : sinon Jouer, « un cran au-dessus », montait d'un cran de plus à chaque passage.
- Roulement et cymbale suivent aussi le bouton « Suivre la visite », et ne jouent que si l'orchestre tourne. À la huitième serrure : roulement et cymbale ensemble.
- Compteur à côté du nombre de projets, avec une clé, en bleu.
- §4, « le motif est né dans RPG-v2 » : la forme vient de la fenêtre de Régie Maison (spec 24 de RPG-v2, capture envoyée par Xav le 28/09) ; RPG-v2 a la première boîte. La fiche le dit ainsi.
- Pas de capture de la boîte de RPG-v2 (ses tuiles nomment des scènes d'essai d'un dépôt privé). Hors de la fiche : le dossier `nuage` de RPGv4 (en ligne, pas local), la liste des boîtes du README de TryMe (nom interne du HUD), les testeurs de TryMe.
- À trancher en plus : la fiche Harness dit que la recette des outils reste privée ; la fiche secrète nomme les tuiles des boîtes, sans leur code.
