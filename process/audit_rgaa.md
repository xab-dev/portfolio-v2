# Audit d'accessibilité RGAA 4.1 — Portfolio v2

**Date** : 2026-10-04 · **Version auditée** : 0.13.0 (en ligne) puis 0.13.1 (corrigée, non déployée) · **Auditeur** : l'agent (Claude Code), à la demande de Xav · **Point d'entrée** : DETTE-59.

## En bref

| | Avant (0.13.0) | Après (0.13.1) |
|---|---|---|
| Critères conformes | 42 | 66 |
| Critères non conformes | 24 | 2 |
| Taux (conformes / conformes + non conformes) | 64 % | 97 % |
| Défauts relevés par axe-core | 6 règles en défaut | 0 |

Sur les 106 critères du RGAA, 35 sont sans objet pour ce site (pas de vidéo, pas de tableau, pas de CAPTCHA, deux vues seulement), 2 concernent le jeu embarqué et sont traités en dérogation, 1 n'a pas pu être testé.

**Ce taux est celui d'un auto-audit, pas une déclaration de conformité.** Il repose sur une lecture du code, des mesures automatiques et des scénarios pilotés dans Chrome. Aucun test n'a été fait avec un lecteur d'écran réel (NVDA, JAWS, VoiceOver), ce que le RGAA demande pour conclure : voir « Limites ».

Les deux non-conformités qui restent :

1. **8.7 — changements de langue** : le vocabulaire anglais du métier (« Prompt engineering », « Harness engineering », « Playground »…) n'est pas balisé. Seuls les titres d'articles et les intitulés de palier le sont. → DETTE-61.
2. **13.3 — document en téléchargement** : le CV PDF n'est pas balisé pour les lecteurs d'écran (le moteur `react-pdf` ne sait pas le faire). Le site porte les mêmes informations en HTML, mais ne le dit nulle part. → DETTE-62.

## Périmètre et méthode

**Périmètre** : la page unique du site (sept sections) et la vue Mentions légales, dans les deux thèmes, avec leurs états : modale projet, modale FAQ, menu mobile, formulaire de contact aux trois étapes et en erreur, Simulateur rempli, Playground terminé, bulles ouvertes. Soit 20 écrans.

**Hors périmètre** : le contenu du jeu RPG-v2, affiché dans un cadre mais publié depuis un autre dépôt ; le CV PDF au-delà de ses métadonnées.

**Trois sources de constat** :

1. **Lecture du code**, composant par composant, contre la grille des 106 critères.
2. **Mesure automatique** — `npm run audit:rgaa` dans le dépôt du code :
   - axe-core complet (règles WCAG 2.1 A et AA, bonnes pratiques, règles étiquetées RGAA) sur les 20 écrans, en sombre et en clair, à 375 px (rendu allégé puis rendu complet) et à 1280 px : 118 passages ;
   - contrôles de structure écrits pour l'occasion : plan de titres, lien d'évitement, imbrications interdites par HTML, identifiants en double, liens fondus dans le texte, champs sans `autocomplete`, zones défilantes hors d'atteinte du clavier ;
   - redistribution à 320 px et à 640 px (équivalent d'un zoom à 200 % sur un écran de 1280 px), feuille de test d'espacement du texte, parcours complet à la touche Tab.
3. **Onze scénarios de comportement**, pilotés par de vrais événements clavier et souris : où va le focus après un geste, ce qui se ferme à Échap, ce qui reste ouvert sous le pointeur.

Les animations d'apparition sont coupées pendant la mesure (émulation de `prefers-reduced-motion`) : sinon les blocs pas encore révélés échappent aux règles de contraste.

**Défaut trouvé dans l'outillage lui-même** : le socle d'audit de la Phase 9c ne rechargeait pas la page entre deux écrans de même adresse. L'état du précédent restait en place (formulaire déjà à l'étape 3, problématiques déjà cochées). Corrigé avant toute mesure ; les audits de thème et de contraste en profitent.

## Constats et corrections, par thématique

Statuts : **C** conforme · **NC** non conforme · **NA** sans objet · **D** dérogation · **NT** non testé. La colonne « Avant » décrit la version en ligne.

### 1. Images

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 1.1 Alternative textuelle | NC | C | Le radar des compétences (SVG) n'avait ni nom ni alternative. Il porte désormais ses six valeurs : « Radar des compétences — niveau moyen par famille, sur 5 : Méthode IA 4,5 ; … ». Avatar et captures de projets avaient déjà un texte alternatif. |
| 1.2 Images de décoration ignorées | C | C | Toutes les icônes sont masquées aux lecteurs d'écran (vérifié sur le DOM rendu). |
| 1.3 Alternative pertinente | C | C | Relu : chaque capture est décrite par ce qu'elle montre. |
| 1.6, 1.7 Description détaillée | NC | C | Même correction que 1.1 : le nom du radar donne les données, pas seulement « un graphique ». |
| 1.4, 1.5, 1.8, 1.9 | NA | NA | Ni CAPTCHA (un champ piège le remplace), ni image de texte, ni légende. |

### 2. Cadres

| Critère | Avant | Après | Constat |
|---|---|---|---|
| 2.1, 2.2 Titre de cadre | C | C | Le cadre du jeu porte « RPG-v2 — RPG action-aventure par Xavier B. ». |

### 3. Couleurs

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 3.1 Information par la couleur seule | NC | C | La section courante du menu mobile et l'étape courante du formulaire n'étaient signalées que par une couleur de texte. Ajout d'une graisse, d'une bordure et de `aria-current`. |
| 3.2 Contraste du texte | NC | C | Quatre défauts mesurés, tous sous 4,5:1. **Thème sombre** : texte violet à 4,15:1 sur un panneau et 3,76:1 sur une puce violette (dates du parcours, messages d'erreur, badge de verdict) ; numéros de ligne du Playground à 2,70:1 (DETTE-41). **Thème clair** : prompt brut atténué à 4,16:1 une fois l'analyse lancée. Corrections : violet de texte `#8b5cf6` → `#a78bfa` en sombre (6,46:1 et 5,86:1) ; numéros de ligne à 4,87:1 ; atténuation de 55 % à 60 %, portée par le texte seul (4,89:1). Après correction : 0 défaut sur 118 passages. Les 125 éléments qu'axe-core ne sait pas trancher (texte sur un halo, sur du verre dépoli, dans un SVG) ont été revus à la main, par famille. |
| 3.3 Contraste des composants | NC | C | Bordure des champs de saisie et rail des curseurs à 1,25:1 (DETTE-40). Nouveau token `--border-control` : 3,36:1 en clair, 3,18:1 en sombre. La bordure d'origine reste pour le décor (cartes, séparateurs). |

### 4. Multimédia

| Critère | Statut | Constat |
|---|---|---|
| 4.1 à 4.7, 4.11 | NA | Ni audio ni vidéo. |
| 4.8, 4.9 Alternative au média non temporel | C | Le jeu a une alternative en texte : le lien « Voir la fiche projet », juste au-dessus, mène à sa description. |
| 4.10 Son déclenché automatiquement | NT | Dépend du jeu lui-même, non audité. |
| 4.12, 4.13 Média contrôlable au clavier, compatible avec les technologies d'assistance | D | Un jeu dessiné dans un canevas n'est pas restituable par un lecteur d'écran. Dérogation assumée : c'est une démonstration, décrite en texte par sa fiche. Vérifié en revanche : le jeu ne retient pas le clavier, Tab en ressort. |

### 5. Tableaux

5.1 à 5.8 : **NA**, le site n'a aucun tableau.

### 6. Liens

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 6.1 Intitulé explicite | C | C | Les liens courts (« Voir la fiche projet ») suivent un titre qui les situe. Bonne pratique ajoutée : les liens qui ouvrent un nouvel onglet l'annoncent, hors écran, par « (nouvelle fenêtre) ». |
| 6.2 Chaque lien a un intitulé | C | C | Les liens réduits à une icône portent un nom. |

### 7. Scripts

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 7.1 Compatibilité avec les technologies d'assistance | NC | C | `aria-pressed` posé sur des boutons qui ne sont pas des bascules (puces de question de l'agent et de la FAQ) ; badge de preuve annoncé comme ouvrant un dialogue alors qu'il déplie une bulle ; bouton du menu mobile non relié à son panneau. Corrigé. La frappe lettre à lettre de l'agent, dans une zone annoncée en direct, aurait été lue par fragments : le texte complet est désormais donné d'emblée aux lecteurs d'écran. |
| 7.2 Alternative au script | NA | NA | |
| 7.3 Contrôle au clavier | NC | C | Trois défauts. Les zones à défilement interne (Playground, agent, FAQ) ne pouvaient pas recevoir le focus — c'est le défaut de DETTE-59. Les liens de sources du Simulateur étaient hors d'atteinte : au clavier, et aussi à la souris, la bulle se fermant dès que le pointeur quittait le badge. La justification de chaque brique de la stack n'existait que dans un attribut `title`, donc ni au clavier ni au toucher. Et le menu mobile ne se fermait pas à Échap. |
| 7.4 Changement de contexte | C | C | Aucun changement de contexte sans action de l'utilisateur. |
| 7.5 Messages de statut | NC | C | Rien n'annonçait la confirmation d'envoi du formulaire, le verdict du Playground, le « Copié », ni le résultat du Simulateur. Quatre zones `role="status"` ajoutées ; la confirmation d'envoi reçoit aussi le focus. |

### 8. Éléments obligatoires

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 8.1 Type de document | C | C | |
| 8.2 Code valide | NC | C | Chaque carte projet était un `<button>` contenant un titre, des blocs et un paragraphe : interdit par HTML, et le titre disparaissait du plan lu par un lecteur d'écran. Seul le titre est désormais un bouton ; son pseudo-élément recouvre la carte, donc même surface de clic et même rendu. Contrôlé par script (imbrications, identifiants en double) et par axe-core, pas par le validateur du W3C. |
| 8.3, 8.4 Langue de la page | C | C | `lang="fr"`. |
| 8.5, 8.6 Titre de page | C | C | Le titre change à l'ouverture des mentions légales. |
| 8.7 Changements de langue | NC | **NC** | Partiellement corrigé : titres d'articles et intitulés de palier (« AI Workflow Architect ») marqués `lang="en"`. Le vocabulaire anglais du métier ne l'est pas → DETTE-61. |
| 8.8 Code de langue valide | NA | C | |
| 8.9 Balises détournées pour la présentation | C | C | |
| 8.10 Sens de lecture | NA | NA | |

### 9. Structuration de l'information

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 9.1 Titres | NC | C | Saut du `h2` au `h4` sur « Positionnement » — l'autre défaut de DETTE-59 — et titres des cartes projet invisibles (voir 8.2). Le titre d'accueil, découpé en mots animés collés sans espace, se lisait « L'IAn'ade… » dans le code : la phrase entière est fournie hors écran. |
| 9.2 Structure du document | NC | C | Le menu mobile était hors de toute zone de navigation ; la modale FAQ ajoutait un second bandeau de page ; les bulles flottaient hors de toute région. |
| 9.3 Listes | NC | C | Les étapes du formulaire forment une liste ordonnée, plus une suite de `<span>`. |
| 9.4 Citations | NA | NA | |

### 10. Présentation de l'information

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 10.1 à 10.3, 10.5 Feuilles de style | C | C | L'ordre du code est celui de l'affichage. |
| 10.4 Zoom à 200 % | C | C | Aucun débordement à 640 px sur les 20 écrans. |
| 10.6 Liens visibles dans le texte | NC | C | « Mentions légales », dans le pied de page, avait la couleur du texte voisin et aucun soulignement. Souligné. |
| 10.7 Focus visible | NC | C | Menu mobile ouvert, le focus pouvait partir sous le panneau, donc devenir invisible. Il y reste désormais. Le contour de 2 px était déjà présent partout (104 arrêts de tabulation vérifiés à 1280 px, 97 à 375 px). |
| 10.8 à 10.10 | C | C | |
| 10.11 Redistribution à 320 px | C | C | Aucun défilement horizontal sur les 20 écrans. |
| 10.12 Espacement du texte | C | C | Feuille de test appliquée : aucun texte rogné. |
| 10.13 Contenus au survol ou au focus | NC | C | Les bulles n'étaient pas survolables (elles se fermaient avant que le pointeur n'y arrive), et celle des badges de compétence ne se fermait pas à Échap. Un hook commun, `useTooltip`, porte désormais les trois règles : survolable, masquable, persistante. Les scénarios ont trouvé un cas oublié, corrigé dans la foulée : la bulle du bandeau Positionnement, ouverte au seul survol, ignorait Échap. |
| 10.14 Contenus révélés par CSS | C | C | L'invite « Voir le cas » apparaît au survol et au focus. |

### 11. Formulaires

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 11.1, 11.2, 11.4 Étiquettes | C | C | |
| 11.5 à 11.7 Regroupements | C | C | Les choix sont groupés et nommés ; le filtre des projets l'est maintenant aussi. |
| 11.9 Intitulés de bouton | C | C | |
| 11.10 Contrôle de saisie | NC | C | Rien n'indiquait que les champs étaient obligatoires. Mention « Tous les champs sont obligatoires. » avant les champs, et attribut `required`. L'erreur de longueur du champ de l'agent est reliée au champ. |
| 11.11 Suggestion de correction | NC | C | L'erreur d'e-mail donne un exemple : « par exemple nom@exemple.fr ». |
| 11.13 Finalité des champs | NC | C | `autocomplete="name"` et `autocomplete="email"`. |
| 11.3, 11.8, 11.12 | NA | NA | |

### 12. Navigation

| Critère | Avant | Après | Constat et correction |
|---|---|---|---|
| 12.1 à 12.5 | NA | NA | Site d'une page et d'une vue de mentions légales : ni plan du site ni moteur de recherche à exiger. |
| 12.6 Zones de regroupement | NC | C | Voir 9.2. Deux zones de navigation nommées. |
| 12.7 Lien d'évitement | NC | C | Aucun. Ajout de « Aller au contenu », premier arrêt du clavier, visible au focus. |
| 12.8 Ordre de tabulation | NC | C | Changer d'étape dans le formulaire retirait du DOM le bouton activé : le focus retombait en tête de page. Le panneau de la nouvelle étape le reprend et s'annonce « Étape 2 sur 3 ». Même reprise à la fermeture d'une image agrandie et au retour des mentions légales. |
| 12.9 Piège au clavier | C | C | Vérifié, jeu embarqué compris. |
| 12.10 Raccourcis à une touche | NA | NA | |
| 12.11 Contenus additionnels au clavier | NC | C | Voir 7.3 : Tab entre dans la bulle des sources, puis en ressort vers la suite de la page. |

### 13. Consultation

| Critère | Avant | Après | Constat |
|---|---|---|---|
| 13.1, 13.4, 13.12 | NA | NA | |
| 13.2 Nouvelle fenêtre | C | C | Aucune ouverture sans action de l'utilisateur. |
| 13.3 Document en téléchargement | NC | **NC** | Le CV PDF a un titre et une langue (`fr-FR`), mais pas de balisage → DETTE-62. |
| 13.5, 13.6 Contenu cryptique | C | C | Les points de suspension de l'attente ont un libellé. |
| 13.7 Flashs | C | C | |
| 13.8 Contenu en mouvement | C | C | Seul mouvement automatique : la lueur du Hero, une variation d'opacité de 0,10 en huit secondes, coupée par `prefers-reduced-motion` et par le mode allégé. Les frappes animées sont déclenchées par l'utilisateur. |
| 13.9 à 13.11 Orientation, gestes, pointeur | C | C | |

## Ce qui change à l'écran

L'audit touche surtout le code. Trois changements se voient, à relire par Xav :

1. **Violet de texte en thème sombre**, plus clair : dates du parcours « Avant 2026 », messages d'erreur du formulaire, badge de verdict du Playground, icône de l'agent.
2. **Bordure des champs de saisie et rail des curseurs**, plus marqués, dans les deux thèmes.
3. **Numéros de ligne du Playground**, plus lisibles en sombre ; ils ne s'atténuent plus avec le prompt.

S'y ajoutent des détails : « Mentions légales » souligné, section courante en gras dans le menu mobile, étape courante en gras, mention « Tous les champs sont obligatoires. », lien « Aller au contenu » au premier Tab.

**Conséquence pour la spec 12** : la décision D4 (thème sombre identique au pixel à la référence de la Phase 9c) n'est plus tenue. C'est le prix des corrections de contraste, que la Phase 9c avait écartées pour cette raison (DETTE-40, DETTE-41).

## Limites

- **Aucun test avec un lecteur d'écran réel.** Les noms, rôles et états ont été relus dans l'arbre d'accessibilité de Chrome, pas écoutés. Le RGAA demande NVDA ou JAWS sous Windows, VoiceOver sous macOS et iOS → DETTE-63.
- **Un seul navigateur** : Chrome sans écran. Ni Firefox, ni Safari, ni téléphone réel ; la largeur de 375 px est émulée.
- **Le jeu embarqué** n'est pas audité (4.10 non testé, 4.12 et 4.13 en dérogation).
- **Pas de validation W3C** du HTML généré : les contrôles d'imbrication et d'identifiants sont ceux du script.
- **La pertinence** des textes alternatifs et des intitulés est un jugement de l'agent, à relire.
- **Pas de déclaration d'accessibilité** en ligne. Elle n'est obligatoire que pour les organismes publics et les grandes entreprises ; pour un indépendant, c'est un choix.

## Relancer l'audit

Dans le dépôt du code :

```
npm run build
npm run audit:rgaa                  # tout, quelques minutes
npm run audit:rgaa -- --scenarios   # les onze scénarios, quelques secondes
```

Le détail de chaque passage est écrit dans `audit/rgaa/report.json` (dossier local, non versionné). La commande sort en échec au premier défaut : elle peut servir de garde-fou avant un déploiement.

## Commits (dépôt du code)

| Commit | Contenu |
|---|---|
| `b2dce6d` | Script d'audit ; rechargement réel entre deux écrans dans le socle. |
| `a46f126` | Plan de titres sans saut, zones défilantes au clavier (DETTE-59). |
| `c6f09cf` | Lien d'évitement, zones de navigation, menu mobile au clavier. |
| `c82e88a` | Cartes projet au code valide. |
| `8824f11` | Contrastes : violet et numéros de ligne en sombre, champs, prompt atténué. |
| `aa8eb8b` | Formulaires : champs obligatoires, `autocomplete`, focus entre les étapes. |
| `6b27d37` | Bulles survolables, fermables à Échap, liens de sources au clavier. |
| `804723e` | Messages de statut, alternative du radar, liens vers un nouvel onglet. |
| `8c083f3` | Titre d'accueil, langues signalées, Échap sur le bandeau Positionnement. |
| `653f1e4` | Scénarios de comportement de l'audit. |
| `2d48f13` | Mode allégé ajouté aux passages d'axe-core. |
| `1248f43` | Version 0.13.1. |
| `404d078` | Onzième scénario : agrandissement d'une image dans la modale projet. |

Chaque commit de correction s'annule seul par `git revert <commit>`.
