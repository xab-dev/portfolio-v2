---
projet: portfolio-v2
episode/session: Phase 11 — Refonte jeu / CV interactif, le gardien : l'Agent de poche de retour en personnage (spec 22)
type: spec
version: 0.1.0
statut: écrite le 2026-11-02, en attente du go de Xav — deuxième des trois specs du plan (21 → 22 → 23)
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
