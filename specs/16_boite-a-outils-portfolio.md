---
projet: portfolio-v2
episode/session: Phase 9g — Boîte à outils « Portfolio » (spec 16)
type: spec
version: 1.0.0
statut: validée par Xav le 2026-10-14 (P1 à P6 et P8 tels quels, P7 corrigé : version 1.1.1)
catégorie: Spec
date: 2026-10-14
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : la boîte à outils « Portfolio » (Phase 9g)

> **Résumé** — Une icône « Portfolio » sur le bureau (un papyrus, le papier), qui ouvre une petite fenêtre de tuiles, sur le modèle des boîtes de RPG-v2 et de la base : trouver où changer une ligne, voir le site et les CV, l'état des deux dépôts, publier, les vérifications, les dettes, une note pour la prochaine session, une retouche à demander à Claude. Le code vit dans le dépôt privé. La boîte ne pousse jamais : le push reste un geste de Xav, dans un terminal ouvert sur `portfolio-v2`. Livrée en trois paliers le soir du 2026-10-14. Le site ne change pas.

---

## 1. Rôle du module

Le contenu du site et des CV est déjà rangé dans `src/content/` (T8), mais rien ne dit quel fichier tient quelle ligne : le 2026-10-14, Xav cherchait une date à changer et ne l'a pas trouvée. La boîte répond d'abord à ça, puis regroupe les gestes qu'il fait aujourd'hui à la main dans un terminal (générer un CV, déployer, regarder où en sont les dépôts).

## 2. Décisions

### Tranchées par Xav (2026-10-14)

- **D1** — Toutes les tuiles proposées, livrées par paliers le soir même (§5).
- **D2** — Le code vit dans `portfolio-v2-src` (privé), dossier `tools/boite/`.
- **D3** — Le push reste à part, comme aujourd'hui : un terminal ouvert sur `portfolio-v2`, la commande git tapée par Xav. C'est le dernier filet : il l'oblige à relire avant d'agir.
- **D4** — Nom : « Portfolio ». Icône : un papyrus, le rouleau de papier (pas la plante).
- **D5** — npm ne doit pas bloquer (§4.2).

### Proposées par l'agent, validées par Xav (2026-10-14)

- **P1** — Port `8097`. Les ports 8080 et 8090 à 8096 sont déjà pris par les autres boîtes (§8).
- **P2** — « Publier » va jusqu'au commit de `dist/` (adresse noreply vérifiée avant), pas plus loin. Le commit ne prend que `dist/` : un journal ou une spec en cours dans le dépôt public n'est pas emporté par mégarde.
- **P3** — Publier depuis un dépôt privé qui a des modifications non commitées est permis, mais la boîte le dit en rouge et demande une seconde confirmation (on publierait du code qui n'est dans aucun commit).
- **P4** — Les notes et les retouches vont dans `portfolio-v2-src/notes/` (privé, versionné). Les sessions de Claude ouvertes sur `portfolio-v2` l'apprennent par un `CLAUDE.local.md` à la racine de `portfolio-v2`, exclu de git par `.git/info/exclude` : il n'est jamais publié.
- **P5** — La tuile « Dettes » ne modifie pas `process/dette_suivi.md` : une réponse de Xav part en note (P4), la session suivante l'applique. Une seule main tient la dette.
- **P6** — `CV-condense.cmd` est retiré une fois la tuile « CV condensé » essayée (palier 1).
- **P7** — Version **1.1.1**, corrigée par Xav (l'agent proposait 0.19.0).
- **P8** — Les deux doublons de ports trouvés en passant (§8) ne sont pas corrigés par cette spec : ils sont dans d'autres projets.

## 3. Interdits

- Jamais de `git push`, ni de commit dans le dépôt privé. Un seul commit possible, celui de `dist/` dans le dépôt public (P2), sur un clic de Xav.
- Aucune commande libre : la page envoie un identifiant d'action, le serveur a la liste fermée des commandes (§4.3).
- Le serveur n'écoute que `127.0.0.1` et refuse toute requête qui ne vient pas de sa propre page (même garde que la base).
- Rien n'écrit dans `src/` : la boîte trouve et ouvre, c'est Xav ou Claude qui modifient.
- Pas de dépendance nouvelle : Node seul (`node:http`, `node:child_process`), plus `sharp` (déjà là) pour l'icône.

## 4. Socle

### 4.1 Lancement

Comme les autres boîtes : l'icône lance `powershell -WindowStyle Hidden … node tools\boite\serveur.mjs`, le serveur ouvre Chrome en mode application dans un profil à part (`%LOCALAPPDATA%\Portfolio-boite`). Relancer l'icône rouvre la fenêtre sans dédoubler le serveur. « Quitter » arrête le serveur et ce qu'il a lancé (le site local compris). `tools/boite/creer_raccourci.ps1` recrée l'icône.

L'icône : un rouleau de papyrus dessiné en SVG dans `tools/boite/icone.mjs`, rendu par `sharp` en PNG 16, 32, 48 et 256 px, assemblé en `portfolio.ico` (un ICO peut contenir des PNG). Le raccourci pointe sur ce fichier.

### 4.2 npm sans blocage

Vérifié le 2026-10-14 sur ce PC : `npm.cmd` lancé par Node sans shell échoue (`EINVAL`, garde de Node depuis 2024), et `npm` dans PowerShell passe par `npm.ps1`, que la politique d'exécution par défaut bloque. La boîte ne passe par aucun des deux : elle lance `node <dossier de Node>\node_modules\npm\bin\npm-cli.js run <script>`, avec le Node qui la fait tourner (`process.execPath`). Essayé : `npm-cli.js --version` répond `11.19.0`. Aucune politique d'exécution, aucun `.cmd`, aucun shell.

### 4.3 Commandes autorisées

Une table dans `serveur.mjs`, identifiant → commande, répertoire, durée maximale. Une seule commande longue à la fois ; sa sortie s'affiche en direct dans la page (lignes envoyées au fil de l'eau) et reste lisible après la fin, avec le code de retour en vert ou en rouge.

| Action | Commande | Dans |
|---|---|---|
| `cv`, `cv-condense`, `cv-livret` | `npm run cv`, `cv:condense`, `cv:livret` | privé |
| `dev` | `npm run dev` (reste lancé, arrêtable) | privé |
| `tests`, `lint`, `types` | `npm run test`, `npm run lint`, `tsc -b` | privé |
| `deploy` | `npm run deploy` | privé |
| `etat` | `git status`, `git log`, `git rev-list` (lecture) | les deux |
| `commit-dist` | `git add dist && git commit -m <message>` | public |

## 5. Les tuiles, par palier

### Palier 1 — trouver, voir

1. **🔎 Où changer quoi.**
   - Un champ de recherche sur les fichiers de `src/content/` (sans tenir compte des accents ni des majuscules). Chaque résultat : le fichier, la ligne, la ligne elle-même, et où elle se voit (site, CV, CV condensé, livret), déduit des imports des sections du site et de `scripts/cv/`. Un clic l'ouvre dans VS Code à la bonne ligne (adresse `vscode://file/…:ligne`, sans `code.cmd`).
   - Au-dessus, une liste courte des réglages fréquents, tenue dans `tools/boite/carte.json` : la date de mise à jour des mentions légales, le mail et le téléphone, les lignes d'en-tête du CV, les tarifs, les jalons du Parcours, les chiffres datés du CV, la version de RPG-v2. Chaque entrée pointe sur un fichier et un texte repère, pas un numéro de ligne : elle survit aux modifications. Un test échoue si un repère n'est plus trouvé.
2. **👁️ Aperçu.** « Voir le site » lance `npm run dev`, lit l'adresse que donne Vite et l'ouvre dans le navigateur habituel ; « Arrêter » le coupe. Trois boutons « CV », « CV condensé », « Livret » génèrent le PDF puis l'ouvrent (le livret ouvre le fichier A4 et montre le chemin du A3). Une génération qui échoue (un chevauchement, un débordement) montre le message de `checkPdfLayout` en rouge.
3. **⌨️ Claude Code.** Un terminal ouvert sur `portfolio-v2`, Claude lancé.

### Palier 2 — l'état, publier, vérifier

4. **📊 État du portfolio.** Lecture seule, rien ne s'écrit :
   - la version du dépôt privé (`package.json`) et celle du ROADMAP, en rouge si elles diffèrent ;
   - le dernier commit de chaque dépôt, et le dernier déploiement (dernier commit qui touche `dist/`) ;
   - les fichiers modifiés et non commités, dépôt par dépôt ;
   - les commits pas encore poussés du dépôt public (sans `git fetch` : « d'après la dernière synchronisation ») ;
   - les dettes ouvertes (lignes `☐` de `process/dette_suivi.md`), en nombre et en liste ;
   - les specs dont le statut dit « ARRÊT XAV » ;
   - les notes qui attendent dans `notes/` (palier 3).
5. **🚀 Publier.** Quatre étapes, un bouton chacune, chacune possible seulement après la précédente :
   1. vérifier : tests, lint, types ;
   2. déployer : `npm run deploy` (P3 s'il y a des modifications non commitées) ;
   3. relire : la liste des fichiers changés dans `dist/`, la version qui part ;
   4. commiter `dist/` : un message proposé (« Déploiement 0.x.y : »), modifiable ; refus si `user.email` du dépôt public n'est pas l'adresse noreply.

   Puis un bouton « Ouvrir un terminal sur portfolio-v2 », avec sous les yeux la commande à taper (`git push`). La boîte s'arrête là (D3).
6. **🧪 Vérifications.** Tests, lint, types en un clic, un voyant par commande. Contraste et RGAA s'ajoutent s'ils tournent sans préparation à la main (à vérifier à l'exécution) ; sinon, une ligne dans la dette.

### Palier 3 — écrire pour la prochaine session

7. **📥 Note pour la prochaine session.** Un champ, un bouton : le texte part tel quel dans `notes/AAAA-MM-JJ_HHMM.md`, sous un en-tête daté. `CLAUDE.local.md` (P4) dit à la session suivante de lister `notes/`, d'appliquer ou de lui demander, puis de ranger la note dans `notes/traite/`.
8. **📋 Dettes.** Les dettes ouvertes, une par une (comme l'outil Dettes de RPG-v2) ou toutes en liste. Sous chacune : « Répondre… », qui dépose une note `notes/AAAA-MM-JJ_HHMM_DETTE-xx.md` (P5).
9. **✏️ Demander une retouche.** Xav écrit ce qu'il veut changer (« la date des mentions légales au 14/10 ») ; la boîte le dépose en note (`…_retouche.md`) et ouvre Claude Code sur `portfolio-v2` avec la demande d'appliquer cette note. Passer par un fichier évite de faire traverser le texte au terminal (le `;` de Windows Terminal, les guillemets).

## 6. Contrôles

- Tests unitaires (vitest, à côté du code) : la recherche (accents, majuscules, ligne juste), les repères de `carte.json` tous trouvés, la lecture des dettes et des statuts de spec, la table des actions (une action inconnue est refusée), le nom des notes.
- Essai du serveur sur un port à part, sans fenêtre (`PORTFOLIO_SANS_FENETRE=1`, `PORTFOLIO_PORT`).
- « Publier » essayé jusqu'au commit sur une **copie** du dépôt public (`npm run deploy -- <copie>` le permet déjà), jamais sur le vrai : le vrai déploiement est le premier geste de Xav avec la boîte.
- Une requête venue d'une autre origine est refusée (essai).
- La fenêtre vue dans Chrome à chaque palier.

## 7. Fin de chaque palier

Commit dans le dépôt privé ; journal (`process/JOURNAL_DEV.md`) et dette tenus avant le commit du dépôt public ; ROADMAP à 1.1.1 au dernier palier (P7). **ARRÊT XAV** final : l'icône sur son bureau, une recherche, un CV généré, puis son premier vrai « Publier » quand il en aura un à faire.

## 8. Risques connus

- **Ports.** Relevés le 2026-10-14 : 8080 et 8090 à 8094 pour RPG-v2, 8094 pour la base, 8095 pour le Scriptorium et pour Trouble in Order, 8096 pour Trouble in Order. Deux doublons : 8094 (la base et le Piano de RPG-v2) et 8095 (le Scriptorium et les Réponses de Trouble in Order). Deux outils du même port ne peuvent pas tourner ensemble. Hors de cette spec (P8).
- `npm run dev` choisit un autre port si 5173 est pris : la boîte lit l'adresse dans la sortie de Vite au lieu de la supposer.
- Le lien `vscode://` demande une confirmation de VS Code la première fois.
- Les « commits pas encore poussés » ne voient pas ce qui a changé sur GitHub depuis la dernière synchronisation (pas de `fetch`, la boîte ne touche pas au réseau).
