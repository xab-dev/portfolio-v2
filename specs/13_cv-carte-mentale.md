---
projet: portfolio-v2
episode/session: Phase 9d — CV carte mentale (spec 13)
type: spec
version: 1.0.0
statut: relu — Phase 0 close (« ok » de Xav sur la maquette le 2026-10-04)
catégorie: Spec
date: 2026-10-03
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : CV carte mentale, deux pages (Phase 9d)

**Créé le 2026-10-03** à partir de la conversation avec Xav (retour d'une relectrice du dossier : « le CV est un des points faibles, trop chargé, pas au goût du jour »). Format : Module Standard. Remplace le CV PDF principal ; **ne supprime pas** le CV actuel, qui devient la version condensée.

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T6, T7, T8), `09_export-cv-pdf.md` (principe « le PDF est une projection de `src/content/` », contrôle de pages, polices `.woff`, interdiction de Puppeteer/Playwright), `src/content/cv.ts`, `site.ts`, `hero.ts`, `projects.ts`, `skills.ts`, `timeline.ts`, `scripts/build-cv.tsx`, `scripts/cv/buildCvModel.ts` (+ tests), `scripts/cv/CvDocument.tsx`, `scripts/cv/fonts.ts`, `CvDownloadLink.tsx`.

**Référence visuelle** : `specs/assets/13_maquette-cv-carte.html`, validée dans l'ensemble par Xav le 2026-10-03 (« ça me va très bien »). Elle sera mise à jour avec les contenus de la Phase 0 avant l'exécution. C'est une maquette HTML, pas le rendu final : le PDF doit en reprendre la composition, les proportions et la palette, pas le pixel.

## 1. Rôle du module

Le CV actuel tient sur une page au prix d'un corps de 9 pt, de marges de 10 mm et de notes entre parenthèses qui se répètent. Il se lit comme un document généré par une machine. Le nouveau CV le remplace par **deux pages A4** :

- **Page 1, la carte** : une carte mentale. Nom et accroche en haut, logo de Xav au centre, six branches autour, bandeau de contact en bas. Elle se comprend d'un coup d'œil, et elle raconte une trajectoire de gauche (avant) à droite (la suite).
- **Page 2, le détail** : six cartes projets avec leurs chiffres vérifiés, la frise du parcours 2026, les compétences notées par des points. Une lecture classique pour un recruteur, France Travail ou un logiciel de tri.

Le CV actuel **reste généré**, inchangé dans son contenu, sous le nom de version condensée : Xav s'en sert comme aide-mémoire.

## 2. Décisions

### Tranchées par Xav (2026-10-03)

| # | Sujet | Décision |
|---|---|---|
| D1 | Outil | **Code**, pas Canva : `@react-pdf/renderer` à la build, comme la spec 09. La qualité visuelle visée est celle d'un modèle Canva. |
| D2 | Photo | **Aucune photo.** Le centre de la carte porte le **logo de Xav** : un T et un O entrelacés, tracés au pinceau large façon calligraphie chinoise, avec des défauts de tracé voulus. Le T se trace de gauche à droite puis de haut en bas ; le O fait la moitié de la hauteur du T et son sommet dépasse un peu au-dessus du croisement. Le logo est **généré par le code** (même approche procédurale que RPG-v2) : un tirage numéroté et quatre réglages (épaisseur, pinceau sec, irrégularités, sens de l'entrelacs) redonnent toujours le même tracé. Prototype : `specs/assets/13_logo-to-generateur.html`. Repli si la génération échoue : les initiales `hero.avatar.initials`, avec un avertissement dans la sortie de `npm run cv` (pas un échec). |
| D3 | Ancien CV | **Conservé** comme version condensée, une page. |
| D4 | Pages | Nouveau CV : **exactement 2 pages**. Condensé : **exactement 1 page**. Les deux contrôles font échouer le build. |
| D5 | Parcours antérieur | **D6 de la ROADMAP est rouvert** : Xav veut parler de ses expériences d'avant 2026 dans les grandes lignes, et de ce qu'il veut pour la suite (relations avec les humains, protection de la nature…). DETTE-17 n'est plus « non affiché » pour ces grandes lignes. |

### Tranchées par Xav le 2026-10-04

| # | Question | Décision |
|---|---|---|
| D6 | Les blocs « Avant » et « La suite » apparaissent-ils **aussi sur le site** ? | **Oui**, dans la section Parcours : « Avant 2026 » avant la frise, « La suite » après, avec les styles de cartes existants. Le CV reste une projection du site (spec 09), et la version anglaise (Phase 10) traduira une seule source. |
| D7 | Le CV condensé est-il **lié depuis le site** ? | **Non.** Aucun lien visible, et **pas publié** sur le site : il est pour Xav seul. Il s'obtient de deux façons, dans le dépôt privé : `npm run cv:condense`, ou un **double-clic** sur `CV-condense.cmd` à la racine, qui lance la même commande et ouvre le PDF. Fichier produit hors de `public/` (par exemple `out/cv-xavier-bou-condense.pdf`, gitignoré), pour qu'il ne parte jamais dans `dist/`. |
| D8 | Le condensé reçoit-il aussi « Avant » et « La suite » ? | **Non.** Il reste une copie du CV actuel ; seul son défaut de chevauchement est corrigé (§4). |

## 3. Phase 0 — à fournir par Xav (ARRÊT XAV avant toute exécution)

Rien de ce qui suit ne doit être inventé ni complété par l'agent (T7). Tant qu'un champ manque, l'exécution ne commence pas.

1. **Le logo** : ✅ **choisi par Xav le 2026-10-03** : `{"seed":60538,"width":7,"dry":0.1,"rough":2,"weave":"none"}` (pinceau fin, peu sec, très irrégulier, sans entrelacs). Tracé de référence : `specs/assets/13_logo-to-60538.svg`, produit par le prototype avec ces réglages. Le portage doit redonner **le même tracé** : un test compare la sortie du générateur porté à ce fichier (identifiants des masques mis à part). Fond du disque central : foncé, logo blanc, comme dans la maquette mise à jour (à confirmer par Xav). À l'exécution, le générateur est porté tel quel dans `scripts/logo/` (fonctions pures, sans dépendance au navigateur) et les réglages vivent dans `src/content/` (T8). Sortie : un SVG de référence, plus un **PNG à fond transparent** (1 200 px, rendu par `sharp`) pour le PDF. `@react-pdf/renderer` ne lit pas les SVG avec `<Image>`, et son `<Svg>` ne gère pas les masques qui creusent les traînées sèches et l'entrelacs.
2. **Parcours avant 2026** : ✅ **dicté par Xav le 2026-10-04** (texte ci-dessous, mot pour mot sur le fond ; mise en forme de l'agent à valider). Il va dans `story.ts` (`before[]`), une entrée par ligne, avec `period`, `title`, `detail`, `place` facultatif et `onMap` (affichée ou non sur la carte de la page 1).

   | Période | Intitulé | Détail | Lieu / clients | Sur la carte |
   |---|---|---|---|---|
   | 2012 | CQP École Carrefour, niveau 3 | Mise en rayon, gestion des stocks, approvisionnement, réserve | Carrefour, Beaucaire | oui (« CQP École Carrefour ») |
   | 2013 – 2014 | Gestion d'un négoce multi-services | Jardinerie, produits pour le bétail, semences agricoles | Virebayre, Florac | oui (« Négoce multi-services, Florac ») |
   | 2015 – 2016 | Gestion d'un camping municipal | 120 emplacements, 8 chalets, 8 tentes aménagées | Camping du Pré Morjal, Ispagnac | oui (« Camping municipal, Ispagnac ») |
   | 2017 – 2018 | Poker semi-professionnel, coaching | L'« El-Dorado » du poker qui s'ouvre à l'Europe | — | oui (« Poker semi-pro, coaching ») |
   | 2019 – 2020 | Période Covid | Sans emploi | — | **non** (page 2 seulement, proposition de l'agent) |
   | 2021 – 2024 | Rénovation de bâtiment | Isolation, plaque de plâtre, enduit | Isolis, Tarascon | oui (« Rénovation de bâtiment ») |
   | 2025 – 2026 | Auto-entrepreneur, rénovation | Vieux mas et cave viticole | Phare de la Gacholle, Château des Mourgues du Grès, Domaine Dalmeran, Enza Zaden | oui (« Rénovation de mas et de caves ») |

   Les libellés courts de la carte (colonne de droite) ont besoin d'un champ `shortTitle` : une feuille de la branche « Avant 2026 » ne dépasse pas 34 caractères, année comprise (§5.2). Ces entrées vont aussi sur le site si D6 = oui. **DETTE-17 et D6 sont rouverts par Xav lui-même** : il fournit ce parcours pour qu'il soit affiché.
3. **« La suite »** : ✅ **dictée par Xav le 2026-10-04, mise en forme par l'agent à sa demande** (« je te laisse y mettre les formes »). **À relire par Xav avant l'exécution** : c'est un texte de l'agent, construit uniquement sur ce que Xav a dit ce jour-là. Le dossier personnel `04_Formation` a été lu pour le contexte mais n'est **pas** une source publiable (il est marqué personnel). Deux formes, dans `story.ts` (`after`) :

   - **Carte (page 1)**, cinq feuilles de 28 caractères au plus : « Transmettre, former, coacher » (Xav : la référence au professeur Xavier « fait trop » sur la carte), « Purple team, IA plus sûre », « Sapeur-pompier volontaire », « Éthologie, chiens et chats », « Servir le plus grand nombre ».
   - **Site (bloc « La suite »)**, texte en première personne :

   > Depuis longtemps, j'ai en tête l'image du professeur Xavier, dans X-Men : quelqu'un qui ouvre une école pour que chacun apprenne à se servir de son don. C'est ce que je veux construire, à ma façon.
   >
   > Le fil était là bien avant l'IA. Au camping, j'aimais faire un peu de tout, et voir arriver des gens venus pour le plaisir. Aujourd'hui, c'est mon neveu : RPG-v2, je le fais aussi pour lui. Il est mon testeur, il vient me voir pour apprendre, et on parle de tout.
   >
   > La suite tient au même fil. Une purple team, où ceux qui attaquent et ceux qui défendent travaillent ensemble pour rendre l'IA plus sûre. Un cursus de sapeur-pompier volontaire : deux fois, j'ai été le premier arrivé sur un accident de la route, et j'étais assis à côté d'un homme victime d'un malaise grave en pleine réunion. Un cursus autour des animaux : je lis les chiens et les chats, et récemment, le maître d'un chien de 70 kg m'a dit : « Personne ne réagit comme toi devant lui. »
   >
   > Ce que j'installe doit rendre service au plus grand nombre : des choses presque logiques et simples, que personne ne regarde.

   Relu par Xav le 2026-10-04 : « malaise grave » plutôt que le nom médical (plus sobre) ; le clin d'œil sur le prénom proposé par l'agent est **refusé** (« ça reste un CV, on reste sobre ») : ne pas le réintroduire. Les deux cursus sont **envisagés**, pas engagés. Le texte ne doit jamais les présenter comme acquis. Le neveu n'est jamais nommé.
4. **Réponses à D6, D7, D8** (ou silence = défauts).
5. **Relecture des textes courts** de la maquette (§5.2). Ce sont des reformulations de l'agent, à valider une à une. Le jalon « haTD, premier jeu » (non vérifié) a été remplacé dans la maquette par « haTD, prototype de jeu », conforme à `timeline.ts`. Le résumé « Négoce agricole » a disparu : la branche « Avant 2026 », désormais en haut à gauche, a la place d'écrire « Négoce multi-services, Florac ».

## 4. Défaut existant à corriger dans le condensé

Dans le PDF en ligne (généré le 02/10), la dernière ligne du parcours (« RPG-v2… jouable (v1.2 le 01/10/2026) ») **passe sous le pied de page**. Le contrôle « exactement 1 page » n'a rien vu : le pied de page est positionné en fixe, le texte coule dessous sans créer de seconde page. Diagnostiquer la cause avant de corriger, puis couvrir le cas par le contrôle de chevauchement du §6.3, qui s'applique aux deux PDF. DETTE-54 (flèches « ↔ » imprimées en guillemets) se corrige dans la même passe ; la page 2 du nouveau CV l'évite déjà en écrivant « humain, LLM, agent de code ».

## 5. Entrées / Sorties

### 5.1 Contenu (`src/content/`, T8)

Aucune chaîne de contenu dans les composants PDF. Nouveaux éléments :

| Élément | Où | Remarque |
|---|---|---|
| `story` : `before[]`, `after[]` (intitulé, détail, période facultative) | nouveau `src/content/story.ts` | Faits de Xav (Phase 0). Lu par le CV **et** par le site si D6 = oui. |
| `cvMap` : les six branches de la page 1 (libellé, couleur, feuilles) | nouveau `src/content/cvMap.ts` | Chaque feuille porte une **référence** à sa source (`project:<id>`, `skill:<name>`, `story:<id>`) et son texte court. Pas de fait nouveau ici : un fait manquant s'ajoute à son fichier source. |
| Cartes de la page 2 : projets retenus et leurs chiffres | `cvMap.ts` (section `detail`) | La **valeur** d'un chiffre est lue dans `projects.ts` (`metrics`, `verified: true` obligatoire), jamais recopiée. Seule la légende courte (« commits », « tests ») vit ici. |
| Noms courts de compétences | champ facultatif `shortName` dans `skills.ts` | Ex. « Claude (Fable 5.1, Opus 5, Sonnet 5) / Claude Code » → « Claude, Claude Code ». Le site garde le nom long. |
| Titres courts des jalons | champ facultatif `shortTitle` dans `timeline.ts` | Pour la frise de la page 2. |
| Libellés de gabarit (titres de section, pied de page, légende des points) | `cv.ts` | Le pied de page « CV généré automatiquement… » est remplacé par « Projets jouables et version complète : » + l'adresse du site. |

### 5.2 Page 1 — branches (maquette relue par Xav le 2026-10-04)

**Règle de composition** (demande de Xav) : l'ordre de lecture d'une page, de gauche à droite puis de haut en bas, suit l'ordre du temps. La carte commence en haut à gauche par « Avant 2026 », continue avec la reconversion, passe par les outils, et finit en bas à droite par « La suite ». Ne jamais remettre une branche de compétences en premier.

| Ordre | Position | Branche | Couleur | Feuilles (source) | Forme |
|---|---|---|---|---|---|
| 1 | Haut gauche | **Avant 2026** | ocre | Six lignes « année + intitulé » : CQP École Carrefour ; Négoce multi-services, Florac ; Camping municipal, Ispagnac ; Poker semi-pro, coaching ; Rénovation de bâtiment ; Rénovation de mas et de caves (`story.before`, `onMap: true`, `shortTitle`) | compacte, 34 caractères au plus |
| 2 | Haut droite | **Reconversion 2026** | cyan | Indépendant, consultant IA (depuis le 10/09/2026, `timeline:pivot-consultant`) ; RPG-v2 ; Portfolio v2 ; miniCiel (`projects`) | intitulé + détail |
| 3 | Milieu gauche | Méthode | violet | Harness engineering ; Spec-driven, 6 templates ; Cadre 4D au quotidien ; Cause racine avant patch (`skills`, `projects:harness`) | compacte, 25 caractères au plus (le disque est large à cette hauteur) |
| 4 | Milieu droite | IA & agents | bleu | Claude et Claude Code ; Autres LLM selon l'usage ; Prompt engineering ; Agents et MCP (`skills`) | compacte, 25 caractères au plus |
| 5 | Bas gauche | Développement | ardoise | HTML·JS·CSS ; Python·PowerShell ; Architecture data-driven ; GitHub Pages et Actions (`skills`) | intitulé + détail |
| 6 | Bas droite | **La suite** | émeraude | Les cinq feuilles du §3, point 3 (`story.after`) | compacte, 34 caractères au plus |

Régie Maison n'est plus sur la carte (quatre feuilles au plus par branche) ; elle reste dans les cartes projets de la page 2. Les niveaux de compétence ne sont pas sur la carte : ils sont en page 2.

En-tête : `site.name`, `site.title`, `site.location`, accroche `hero.title` + `hero.subtitle`. Bandeau : mail, téléphone, adresse du site, langues (`site.languages`).

### 5.3 Page 2 — détail

Comme la maquette : six cartes projets **sur trois colonnes** (RPG-v2, Portfolio v2, Harness engineering, Templates de spec, miniCiel, Régie Maison ; haTD sorti des cartes et gardé dans le parcours, à confirmer en Phase 0), **parcours en deux colonnes** (à gauche « Avant 2026 » : les sept entrées de `story.before` avec détail et lieu ; à droite « Reconversion 2026 », même nom que sur la carte : les huit jalons de `timeline.ts` en une ligne chacun, le pivot du 10/09 mis en valeur), compétences en deux colonnes par famille avec des points (`min(level, 5)`, mention « prod » au niveau 6, comme le radar du site), légende des points, pied de page avec statut légal (`site.legal`). La compétence « Langues : Français / English » n'est pas répétée : les langues sont dans le bandeau de la page 1.

### 5.4 Sorties

- `public/cv/cv-xavier-bou.pdf` : nouveau CV, 2 pages A4. Même nom de fichier qu'aujourd'hui, donc les liens existants et `cv.fileName` restent valables.
- `out/cv-xavier-bou-condense.pdf` (dépôt privé, gitignoré, jamais publié) : CV actuel, 1 page. Script `npm run cv:condense` et lanceur `CV-condense.cmd` (D7).
- Poids : 300 Ko au plus pour le nouveau (le logo compte), 200 Ko au plus pour le condensé. Texte sélectionnable, métadonnées présentes (`cv.meta`).

## 6. Comportement attendu

### 6.1 Rendu (design *print*)

- Polices : Space Grotesk (titres, chiffres) et Inter (texte), déjà enregistrées par `scripts/cv/fonts.ts`. Pas de nouvelle famille.
- Corps de texte entre **9,5 et 11 pt** (plancher 8 pt pour les légendes, contre 9 pt pour tout aujourd'hui). Marges de 14 mm. Le vide fait partie du dessin : ne pas le combler.
- Palette : les accents du site (`--neon-blue`, `--neon-violet`, `--neon-emerald`) plus un ardoise. **Correctif par rapport à la maquette** : les pastilles de branche portent du texte blanc. Sur l'émeraude clair (#10b981), le contraste est d'environ 2,5:1, illisible en impression noir et blanc. Les pastilles prennent donc les tons foncés (`--accent-*-fg` ou équivalents, au moins 4,5:1 sur blanc), les tons clairs restant pour les traits et les fonds teintés.
- Connecteurs de la carte : courbes `<Svg><Path>` de `@react-pdf/renderer`, positions fixes. Une carte mentale n'a pas de mise en page automatique : chaque bulle a sa place et sa longueur maximale (§6.3).
- Pas de Puppeteer ni de Playwright (spec 09 §6, toujours valable). Si un élément de la maquette est irréalisable avec `@react-pdf/renderer`, s'arrêter et documenter au lieu de changer de moteur.

### 6.2 Site

- `CvDownloadLink` (Hero et Contact) : inchangé, il pointe déjà vers `cv.fileName`.
- Blocs « Avant 2026 » et « La suite » dans la section Parcours (D6), lus dans `story.ts`, dans les deux thèmes, en mode allégé, à 375 px et 1280 px. Aucun nouveau composant de style : réutiliser les cartes existantes.
- Pas de lien vers le condensé (D7).

### 6.3 Contrôles qui font échouer le build

1. Nombre de pages : 2 (nouveau), 1 (condensé), lu par `pdf-lib`.
2. **Aucun chevauchement de texte**, dans les deux PDF : extraction des positions de texte (`pdfjs-dist` en devDependency, rendu sans navigateur) ; aucune boîte de texte n'en recoupe une autre, et aucun texte du corps n'entre dans la zone du pied de page. C'est ce contrôle qui aurait attrapé le défaut du §4.
3. Longueurs : chaque feuille de la carte respecte ses limites (intitulé 28 caractères, détail 48, valeurs à ajuster une fois la mise en page réelle mesurée). Test Vitest sur `cvMap.ts` et `story.ts`, avec un message qui nomme la feuille fautive.
4. Références : toute référence de `cvMap.ts` existe dans sa source ; tout chiffre affiché vient d'une métrique `verified: true`.

## 7. Cas limites

- **Génération du logo en échec** (exception, réglages invalides) → initiales, avertissement, build vert.
- **Logo clair sur disque clair** (ou foncé sur foncé) → le fond du disque est un réglage de `cv.ts`, choisi avec Xav.
- **`story.before` ou `story.after` vide** → la branche disparaît de la carte (comme un lien vide, DETTE-04) au lieu d'afficher une bulle vide.
- **Un projet de la page 2 change de statut** (par exemple passe en `cadrage`) → la règle D7 de la ROADMAP s'applique toujours : exclu du PDF, et le test de références le signale.
- **Chiffres qui vieillissent** (DETTE-51) → aucune valeur recopiée, le CV suit `projects.ts` à chaque build.

## 8. Phases d'exécution

1. **Phase 0 (Xav)** : §3. L'agent met à jour la maquette avec les vrais contenus et le logo, puis **ARRÊT XAV** sur la maquette.
2. **Phase 1, contenu et modèle** : `story.ts`, `cvMap.ts`, `shortName`, `shortTitle`, modèle pur `buildCvMapModel.ts` et ses tests en premier (références, longueurs, chiffres vérifiés, branche vide masquée).
3. **Phase 2, rendu** : `scripts/cv/CvMapDocument.tsx` (pages 1 et 2), logo, palette corrigée. `CvDocument.tsx` devient le condensé ; correction du §4 et de DETTE-54, cause racine documentée.
4. **Phase 3, contrôles** : §6.3 branché dans `scripts/build-cv.tsx`. Preuve par l'échec : un texte trop long et un débordement forcés temporairement font échouer le build avec un message clair, puis sont annulés.
5. **Phase 4, site et vérification** : D6/D7 appliqués, lecture des deux PDF rendus (pas seulement les tests), aperçu noir et blanc, `test`/`lint`/`build` verts, journal et dette. **ARRÊT XAV** : relecture imprimée par Xav et par la relectrice.

## 9. Critères d'acceptation

1. `npm run cv` produit les deux PDF ; pages, poids, métadonnées conformes au §5.4.
2. Les contrôles du §6.3 passent, et leur échec a été démontré une fois chacun.
3. Le nouveau CV reprend la composition de la maquette mise à jour ; écarts listés dans le journal.
4. Aucun texte, chiffre ou date absent de `src/content/` n'apparaît dans un PDF (test de non-divergence de la spec 09, étendu au nouveau CV).
5. Lisible en impression noir et blanc : pastilles, points de compétence, frise.
6. Le site sert le nouveau CV (200 après déploiement) et **pas** le condensé (404 attendu à `/cv/cv-xavier-bou-condense.pdf`) ; le bouton mène au nouveau CV. `CV-condense.cmd` testé par un vrai double-clic.
7. **[ARRÊT XAV]** relecture imprimée, avis de la relectrice.

## 10. Hors scope

- Le logo ailleurs que sur le CV (favicon, bandeau, image de partage) : à proposer comme dette, pas à faire.
- La version anglaise du CV : Phase 10.
- Toute réécriture du contenu du condensé.
- L'image de partage (OG), le README, le profil GitHub.

## Patches à reporter (par l'agent qui exécute la phase)

### `00_ROADMAP.md`
- Version : vérifier la ligne `**Version : …**` réelle avant d'écrire. Au 2026-10-03 elle est en **0.11.0** ; nouvelle phase complète → **0.12.0**.
- Esquisse des phases, après la Phase 9c : `- **Phase 9d — CV carte mentale** (\`13_cv-carte-mentale.md\`) : nouveau CV PDF deux pages (carte mentale + détail), logo au centre, blocs Avant / La suite ; l'ancien CV devient la version condensée. Précède la Phase 10, car elle ajoute du contenu à traduire.`
- D6 : noter qu'il est **rouvert le 2026-10-03** (spec 13, D5) pour les grandes lignes d'avant 2026.

### `process/dette_suivi.md`
- DETTE-17 et DETTE-35 : annoter (ne pas supprimer) : rouvertes par la spec 13, à cocher par Xav une fois la phase close.
- DETTE-54 : cocher si corrigée en Phase 2.
- Nouvelles dettes au prochain numéro libre (DETTE-56 au 2026-10-03) : selon ce que l'exécution révèle, au minimum le logo hors CV (§10).
- §D : ligne datée de la phase.
