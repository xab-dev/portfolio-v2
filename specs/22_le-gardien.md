---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, le gardien : l'Agent de poche de retour en personnage (spec 22)
type: spec
version: 1.0.0
statut: exécutée le 2026-11-02 sur le go de Xav (« go spec 22, choix seulement, icône robot »), version 1.13.0, privé `1d06074` ; non déployée, ARRÊT XAV §7 (relire les répliques) — deuxième des trois specs du plan (21 → 22 → 23)
catégorie: Spec
date: 2026-11-02
genere_par: claude
verifie_par: —
---

# Portfolio v2 — SPEC : le gardien (Phase 11, spec 22)

## 1. La demande

Proposition 6 de l'agent, acceptée par Xav le 2026-11-02 (« 6 et 7 : ok ») : « L'Agent de poche retiré revient en personnage non joueur. Il demande au visiteur ce qu'il cherche, recruteur, client, curieux, et lui propose un chemin dans le site, avec des répliques à toi. »

Réponse de Xav sur l'emplacement : **une bulle flottante en bas à droite**, présente partout, qui ouvre le dialogue et peut réagir aux serrures ouvertes.

Ce qui existe : l'Agent de poche de la spec 02 est dans `retire/agent-de-poche/` (panneau de discussion du Hero, saisie libre à mots-clés, six puces, réponses scriptées dont deux validées mot pour mot par Xav — `dispo`, `roi` — et quatre marquées « à relire »). `AgentMessage` et `TypingText` sont restés dans `src/` pour la FAQ. Le gardien n'est pas un rebranchement : c'est un autre objet, qui reprend les textes utiles.

## 2. Ce que fait le gardien

**La bulle.** Un bouton rond en bas à droite (44 px au moins, `position: fixed`), avec le dessin de Xav (l'avatar déjà servi par thème : `avatar_mode-clair.jpg` en clair, l'original en sombre) ; nom accessible « Parler au gardien ». Elle se cache quand une modale est ouverte (fiche, FAQ, mentions légales, et le CV à explorer de la spec 23) et à l'impression. Sur mobile, elle ne recouvre ni le bouton « Plein écran » du cadre RPG-v2 (en haut à droite du cadre, pas de conflit) ni le formulaire de contact (marge basse ajoutée à la section Contact). Un point discret sur la bulle signale qu'il a quelque chose à dire (voir « Réactions ») ; jamais de fenêtre qui s'ouvre toute seule.

**Le dialogue.** Dans la `Modal` existante (piège à focus, Échap, titre « Le gardien »). **À choix seulement**, comme un dialogue de jeu : une réplique du gardien (avec `AgentMessage` et `TypingText`, instantané en mouvement réduit), puis deux à quatre boutons. Pas de saisie libre : la version à mots-clés reste dans `retire/` (question §7 : Xav peut la vouloir).

Le graphe, proposé par l'agent, **à relire par Xav** :

- **Entrée** : « Vous cherchez quoi, ici ? » → « Quelqu'un à recruter », « Quelqu'un pour un besoin », « Juste curieux », « Rien, je visite » (ferme).
- **Recruteur** : « Alors trois choses à voir. » → « Le parcours » (`#parcours`), « Le CV » (le PDF, ou l'explorateur de la spec 23 quand il existe), « Ce que je fais avec un agent de code » (`#projets/harness`). Puis : « Disponible ? » → la réponse `dispo`, validée (DETTE-06), mise à jour avec la ligne de Contact que Xav a retouchée le 2026-11-02.
- **Client** : « Dites-m'en plus. » → « Automatiser quelque chose », « Un outil sur mesure », « Me former, former mon équipe », « Un site comme celui-ci » → pour chacun, une réplique courte tirée de `offers.ts` (la source commune des tarifs, déjà validée) et le bouton « Qualifier votre besoin » (`#contact`, avec la catégorie pré-choisie si le formulaire le permet déjà, sinon sans). Puis « Et le prix ? » → la fourchette de la catégorie, depuis `offerPricing`, jamais recopiée.
- **Curieux** : « Alors on joue. » → « Un jeu, tout de suite » (`#jouer`), « Les fiches qui se méritent » (`#projets`, avec une phrase sur les serrures), « La musique » (le widget : `#hero`, et le gardien dit comment la lancer).
- Partout : « Autre chose ? » revient à l'entrée ; « Merci » ferme.

**Les serrures.** Le gardien lit le magasin des serrures. Quand il propose une fiche verrouillée : « Celle-là se mérite. Je vous y emmène ? » Quand une serrure s'ouvre pendant la visite, le point apparaît sur la bulle et sa prochaine réplique d'entrée change : « Une de prise. » À huit : « Toutes. Il reste une fiche que vous n'avez pas vue. » (`#projets`, la fiche secrète de la spec 21).

**Mémoire** : aucune. Le dialogue repart de l'entrée à chaque ouverture ; le point sur la bulle vit en mémoire de la page. Rien n'est stocké (rien de nouveau dans les mentions légales).

## 3. Règles

- Les textes sont **dans la voix de Xav** et marqués à relire ; les deux réponses déjà validées sont reprises mot pour mot ; aucune phrase ne contient de chiffre qui ne vienne pas de `offers.ts` ou d'une fiche (T6).
- Tout au clavier : la bulle, les choix, Échap. Tout au doigt : cibles de 44 px. Mouvement réduit : pas de frappe lettre à lettre, pas d'apparition animée de la bulle.
- Le gardien n'est pas dans `navLinks` (pas une section) et n'a pas de hash : il ne vole pas l'historique.
- `retire/README.md` note que l'Agent de poche est repris en partie par la spec 22 (textes) et que le panneau à saisie libre y reste.

## 4. Fichiers

- `src/content/gardien.ts` : les nœuds du graphe (`id`, `text`, `choices: [{ label, next?: id, href?: string, close?: true }]`), les répliques liées aux serrures, les textes de la bulle.
- `src/lib/gardien/dialogue.ts` : le marcheur (nœud courant, historique court, choix), pur, testé.
- `src/components/gardien/GardienButton.tsx`, `GardienPanel.tsx` ; montés dans `App.tsx` après le `Footer`.
- Tests : tout `next` existe ; tout `href` vise une section de `navLinks`, `#contact`, `#faq`, ou `#projets/<id>` d'une fiche existante ; aucun texte vide ni « [À » ; les répliques de serrure existent pour « une » et « toutes » ; le marcheur revient à l'entrée.

## 5. Vérification prévue

`tsc`, `oxlint`, tests, build ; Chrome sur `vite preview` à 1 440 px et 500 px, sombre et clair : les trois routes de bout en bout, à la souris puis au clavier seul ; la bulle cachée quand une fiche est ouverte ; le point après une serrure ouverte ; la bulle au-dessus du formulaire de contact à 500 px sans le recouvrir ; mouvement réduit émulé. Une passe `axe` sur la modale du gardien s'ajoute à DETTE-72.

## 6. Hors scope

La saisie libre ; un vrai modèle derrière (DETTE-58 et la ligne « Agent = scripté » restent) ; une mémoire des visites ; des réactions à autre chose qu'aux serrures ; la version anglaise.

## 7. ARRÊT XAV

Avant le code : le go, et deux choix — la saisie libre revient-elle (sinon choix seulement), et la bulle porte-t-elle l'avatar ou une autre icône ? Après : relire chaque réplique du graphe (§2), les routes et leurs liens.

Version à l'exécution : 1.13.0.

## 8. Exécution (2026-11-02)

Le go de Xav, mot pour mot : « go spec 22, choix seulement, icone Robot: créer par Claude ou emoji en fonction de comment il aime etre représenté (son identité de gardien). » Les deux choix du §7 sont donc tranchés : pas de saisie libre ; pas l'avatar, un robot.

**L'icône.** Dessinée par l'agent, au trait, en `currentColor` (elle suit le thème) : un robot à tête ronde, des yeux ronds, un demi-sourire, et une antenne en forme de clé — l'anneau en haut, une dent sur la tige — parce qu'ici son métier, ce sont les serrures. Un robot plutôt qu'un visage : il ne se fait pas passer pour quelqu'un. Pas d'emoji : son dessin change d'un système à l'autre (`src/components/gardien/GardienIcon.tsx`).

Faite telle quelle, avec ces écarts à ratifier (détail dans `process/JOURNAL_DEV.md`) :

- « Partout : Autre chose ? / Merci » : rendus sous les réponses, en petits liens, sur chaque nœud sauf l'entrée (où « Rien, je visite » ferme déjà). Les « deux à quatre boutons » du §2 sont les réponses propres au nœud ; un nœud de fin n'en a qu'une (« Prendre contact », « Y aller », « La voir »…) plus ces deux liens.
- Recruteur : « Ce que je fais avec un agent de code » devient **« Le travail avec un agent de code »** — les réponses sont dans la bouche du visiteur, le « je » y parlait de lui.
- « Disponible ? » : le gardien dit **la ligne de Contact** retouchée par Xav le 2026-11-02 (`availabilityNote`), lue dans `contact.ts`, plutôt que la réponse `dispo` de l'Agent de poche (qui promettait encore un délai de réponse que Xav a retiré de cette ligne).
- Client : le formulaire ne sait pas recevoir de catégorie pré-choisie (le pré-remplissage venait du Simulateur, retiré) → « Qualifier votre besoin » mène à `#contact` sans catégorie. « Un outil sur mesure » a la même offre que « Automatiser » (« Une tâche automatisée »), comme dans le formulaire. Le prix est lu dans `offers.ts` (`priceLine`, la version en phrase, même source que `offerPricing`) et dans `siteQuoteTiers` pour le site. Ajout : « Lire la FAQ » (`#faq`) sous « Un site comme celui-ci ».
- Curieux : « Les fiches qui se méritent » et « La musique » passent par une réplique, puis « Y aller » ; la première dit aussi où en est le visiteur (« Vous en avez ouvert 3 sur 8. »).
- Serrures : plusieurs tombées depuis la dernière conversation → « Deux de prises. », « Trois de prises. »… ; « Une de prise. » pour une seule. À huit, « La voir » mène droit à la fiche secrète (`#projets/boites-a-outils`).
- Le CV : le PDF se télécharge, le dialogue reste ouvert et répond « Le voilà : deux pages, la carte puis le détail. » (l'explorateur de la spec 23 prendra sa place).
- La bulle et le formulaire : rien n'était caché sur Contact ; c'est la dernière ligne du **pied de page** (« Mentions légales ») que la bulle couvrait en bas de page sur téléphone. La marge basse est donc dans le `Footer` (sous `md` seulement), pas dans la section Contact.
- En plus de la spec : la primitive `Modal` se déclare ouverte (la bulle s'efface pour toute modale, celle de la spec 23 comprise) et prévient quand son animation de fermeture est finie (le gardien emmène à ce moment-là) ; espaces insécables français au rendu (`frenchSpacing`) ; une entrée « Les répliques du gardien » dans la carte de la boîte à outils.
- La passe `axe` prévue pour DETTE-72 est faite ici, sur la bulle et la modale : 0 violation (sombre et clair, 1 280 et 375 px, quatre états du dialogue).
