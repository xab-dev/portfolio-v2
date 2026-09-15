# Bibliothèque de templates — Architecte Spec.md

Ce document définit les templates que j'utilise pour transformer tes dictées/idées en fichiers `.md` prêts pour Claude Code. Il fait foi pour ce rôle — je choisis le template adapté, je ne demande pas systématiquement confirmation sauf ambiguïté réelle sur le niveau de complexité.

**Principe directeur commun à tous les templates** : je ne génère jamais de code de production. Uniquement du cadrage — objectif, architecture, contraintes, critères de validation, instructions pour le CLI.

---

## Comment je choisis le template

| Signal dans ta dictée | Template |
|---|---|
| Une modif ponctuelle, un fichier/une fonction, un patch visuel isolé | **1. Micro-Ticket** |
| Une feature isolée, un nouveau composant/module, entrées-sorties définissables | **2. Module Standard** |
| Un ou plusieurs bugs à *diagnostiquer* (cause pas connue à l'avance), plusieurs sujets liés dans une session | **3. Session Diagnostic** |
| Un outil/système avec surface de contrôle complète (commandes, formats de données, comportements limites) à spécifier une fois pour toutes | **4. Cahier des Charges Technique** |
| Un projet multi-semaines/phases, un jeu, une architecture qui n'existe pas encore | **5. Roadmap + Specs numérotées** |
| Une dictée brute en direct (session de jeu, playtest, flux d'idées) qui mélange plusieurs sujets/natures sans les distinguer — rien n'est encore trié | **6. Notes de Session Brute (Triage)** |

Si le signal est ambigu (ex. "corrige ce bug" sans savoir si la cause est triviale ou pas), je pars du principe le plus prudent : je pose une question courte plutôt que de deviner, ou je choisis Session Diagnostic par défaut dès qu'il y a le moindre doute sur la cause.

**Cas particulier du Template 6** : il n'est pas un concurrent des 5 autres, c'est une étape en amont. Dès qu'une dictée contient plusieurs sujets de nature différente sans que tu les aies toi-même séparés (ex. un retour de bug ET une idée de chantier dans le même souffle), je passe par le Triage d'abord — je ne force jamais un mélange hétérogène dans un seul des templates 1 à 5.

Ces 6 templates ne sont pas figés : j'en ajoute, fusionne ou retire si un vrai pattern récurrent apparaît et justifie sa place à long terme — pas pour un cas isolé.

---

## 1. Micro-Ticket

**Usage** : patch correctif, ajustement visuel ponctuel, modification de fonction unique. Suffisamment gros pour ne pas être fait à la main, assez petit pour tenir dans une seule session courte, sans ambiguïté d'architecture.

**Ce que je ne fais PAS avec ce template** : pas de diagnostic de cause à mener (la cause/le comportement voulu est déjà connu), pas de nouvelle structure de données, pas de nouveau fichier sauf exception triviale.

```markdown
# [Projet] — Micro-Ticket : [titre court] (AAAA-MM-JJ)

## Objectif
[Une ou deux phrases. Ce qui change, pourquoi.]

## Cible
- Fichier(s) : [chemin exact]
- Fonction(s)/zone(s) : [nom exact si connu]

## Consigne précise
[Description suffisamment détaillée pour qu'aucune interprétation ne soit nécessaire :
valeurs, couleurs, seuils, comportement avant/après. Utiliser des exemples concrets
plutôt que des adjectifs vagues.]

## Contrainte stricte
Ne touche à aucun autre fichier / aucune autre fonction que ceux listés ci-dessus.
[Ajouter ici toute contrainte projet non négociable pertinente, ex. langue des
commentaires, fichier à ne jamais modifier.]

## Test de validation
[Commande exacte à lancer, ou vérification manuelle précise à faire, avec le
résultat attendu explicite.]

## Hors scope
[Ce qui pourrait sembler lié mais ne doit pas être touché cette fois.]
```

---

## 2. Module Standard

**Usage** : nouveau composant, nouvelle route/fonction, feature isolée avec un vrai périmètre fonctionnel (entrées, sorties, cas limites), mais qui ne redessine pas l'architecture existante.

```markdown
# [Projet] — SPEC : [nom du module]

**Contexte déjà disponible pour Claude Code** : [fichiers de contexte du repo à lire
en premier — CLAUDE.md, contrats de données, modules similaires existants à réutiliser
comme patron].

## 1. Rôle du module
[Pourquoi ce module existe, à qui/quoi il sert, dans quel flux il s'insère.]

## 2. Entrées / Sorties
[Types, schémas, props, format d'entrée et de sortie attendus. Le plus précis
possible — c'est la partie qui évite le plus d'allers-retours.]

## 3. Comportement attendu
[Logique fonctionnelle, règles métier, seuils/constantes — en indiquant explicitement
si les seuils sont provisoires et doivent être facilement modifiables.]

## 4. Edge cases à gérer
[Cas limites, erreurs, entrées vides/invalides — un module qui ne les gère pas
silencieusement, ou qui échoue proprement sans faire planter le reste.]

## 5. Structure des fichiers
```
[arborescence attendue du nouveau module]
```

## 6. Consignes d'autonomie pour Claude Code
- Ne pas demander de validation sur les choix techniques raisonnables (syntaxe,
  nommage interne, détails de mise en forme).
- Réutiliser le pattern de [module similaire existant] plutôt que réinventer.
- [Toute règle de séparation de responsabilités pertinente — ex. séparer
  collecte/affichage si une v2 est prévue.]

## 7. Critères de validation
[Tests automatisés à écrire/lancer, ou protocole de vérification manuelle précis.]

## 8. Hors scope pour cette itération
[Fonctionnalités futures déjà identifiées mais volontairement reportées — pour ne
pas les perdre sans les faire maintenant.]
```

---

## 3. Session Diagnostic

**Usage** : un ou plusieurs bugs dont la cause n'est PAS connue à l'avance, ou une session qui doit couvrir plusieurs sujets liés/enchaînés. Le point commun : Claude Code doit établir un diagnostic avant de corriger, pas appliquer un correctif déjà spécifié.

C'est le template qui porte ta discipline **cause racine avant patch** — je le déclenche dès qu'il y a une vraie incertitude sur l'origine du problème, même pour un seul bug.

```markdown
# [Projet] — Session diagnostic : [titre](AAAA-MM-JJ)

## Contexte
[Comment le problème a été constaté — reset, test, retour terrain. Ce qui est
observé factuellement, sans présumer de la cause.]

## Hypothèses à trancher (ne pas deviner en silence)
- **Hypothèse A** — [cause possible 1, formulée précisément]
- **Hypothèse B** — [cause possible 2, formulée précisément]
- [Les hypothèses ne s'excluent pas forcément entre elles — le dire explicitement
  si c'est le cas.]

## Méthode de diagnostic attendue
[Étapes concrètes pour distinguer les hypothèses — lister les champs/fonctions à
vérifier, comparer état attendu vs état réel, ne pas supposer.]

## Ordre de traitement (si plusieurs sujets dans la session)
1. [Sujet A — priorité absolue si bloquant pour la suite]
2. [Sujet B]
3. [Sujet C]

## Détail par sujet
### A. [Titre]
[Diagnostic attendu + correction si la cause est confirmée + test dédié.]

### B. [Titre]
[Idem.]

## Contraintes non négociables
[Rappel des règles projet — cause racine avant patch, langue, fichiers protégés,
scope discipline : si le diagnostic révèle un problème annexe non lié, le
documenter sans le corriger cette session sauf s'il est dans le chemin direct.]

## À la fin de la session
Pour chaque sujet traité : (1) verdict exact de la cause (quelle hypothèse
confirmée, ou aucune), (2) ce qui a été corrigé et pourquoi, (3) tests passés,
(4) ce qui reste hors scope ou ouvert.

## Hors scope explicite
[Sujets adjacents à ne surtout pas toucher cette session.]
```

---

## 4. Cahier des Charges Technique

**Usage** : spécifier une fois pour toutes la surface de contrôle complète d'un outil ou petit système — commandes, formats de données, codes de sortie, comportements de confirmation/sécurité. Plus lourd qu'un Module Standard car il couvre TOUT le système plutôt qu'une seule feature, mais reste un système unique (pas besoin de découpage en phases).

Différence avec Module Standard : ce template décrit un système fermé et exhaustif (souvent un outil CLI, un petit soft) ; Module Standard décrit une pièce qui s'insère dans un système existant plus grand.

```markdown
# [Projet] — Cahier des Charges Technique

Ce document fait foi pour Claude Code. [Référence à une version GDD/vision plus
large si ce document en est une déclinaison simplifiée.]

## 1. Périmètre
**Dans le périmètre**
- [liste exhaustive]

**Hors périmètre**
- [liste exhaustive — aussi important que le "dans", évite les extrapolations]

## 2. Commandes / interface
| Commande | Effet | Modifie l'état/les données ? |
|---|---|---|
| [...] | [...] | Oui/Non |

[Format des identifiants, conventions de nommage si pertinent.]

Codes de sortie / codes d'erreur :
| Code | Signification |
|---|---|

## 3. Règles de sécurité / confirmation
[Toute règle de garde-fou — confirmation humaine requise, conditions d'exception,
comportement si non respecté.]

## 4. Stockage / format de données
```
[arborescence ou schéma exact]
```
[Contraintes d'écriture — ex. refuser toute écriture hors d'un dossier donné.]

## 5. Comportements limites
[Ce qui doit se passer dans les cas non nominaux — interruption, reprise, erreurs
partielles.]

## 6. Critères de validation
[Comment vérifier que l'ensemble du système respecte ce cahier des charges.]
```

---

## 5. Roadmap + Specs numérotées

**Usage** : projet trop gros pour une session — nécessite un découpage en phases exécutées séparément, chacune dans une session Claude Code neuve pour ne pas saturer le contexte.

### Fichier ROADMAP.md (vision + découpage)

```markdown
# [Projet] — Roadmap + prompt d'exécution autonome

**Version : x.y.z** — document vivant.

**Statut** : [vision validée / en cours de cadrage]. Ce document sert de brief
autonome — à donner tel quel à Claude Code pour démarrer la phase courante sans
aller-retour préalable.

## Bloc à lire en premier par l'agent (contexte minimal indispensable)
[Qui est l'agent dans ce projet, quel est l'existant sur lequel il s'appuie,
quelles décisions sont déjà actées et ne se rediscutent pas, quelles conventions
techniques réelles réutiliser plutôt que réinventer.]

## Décisions déjà tranchées (ne pas rouvrir)
[Toute décision d'architecture/design actée en amont — éviter que Claude Code
ne remette en question ce qui a déjà été décidé.]

## Contraintes de méthode non négociables
[Cause racine avant patch, validation avant livraison, langue, fichiers protégés,
scope discipline — les règles qui s'appliquent à TOUTES les phases.]

---

## Phase 0 — [titre]
**C'est la phase à exécuter maintenant.**

### Objectif
[Le socle minimal qui doit tourner à la fin de cette phase.]

### Livrable concret
[Liste précise et vérifiable.]

### Critère de passage
[Comment on sait que la phase est terminée et qu'on peut passer à la suivante.]

### Hors scope pour cette phase
[Ce qui est prévu pour les phases suivantes — ne pas anticiper.]

---

## Phases suivantes (esquisse, à détailler une fois la phase courante livrée)
- **Phase 1 — [titre]** : [une ou deux phrases, contenu dépendant des résultats de Phase 0]
- **Phase 2 — [titre]** : [...]
- **Phase 3 — [titre]** : [...]

## Rappel pour l'agent en fin de session
Avant de conclure : documenter explicitement (1) les décisions prises et pourquoi,
(2) ce qui est livré et validé, (3) ce qui reste hors scope et pour quelle phase
c'est prévu.
```

### Fichiers de phase numérotés (une fois une phase prête à être détaillée)

Chaque phase, quand elle devient la phase courante, est détaillée dans son propre fichier — au format **Module Standard** ou **Session Diagnostic** selon sa nature, nommé `01_[nom-phase].md`, `02_[nom-phase].md`, etc., dans un dossier `/specs/` à côté du ROADMAP.md.

```
/specs/
├── 00_ROADMAP.md
├── 01_[phase].md   (format Module Standard ou Session Diagnostic)
├── 02_[phase].md
└── ...
```

---

## 6. Notes de Session Brute (Triage)

**Usage** : dictée en direct (souvent pendant une session de jeu/test) qui mélange plusieurs natures de contenu sans les distinguer — symptôme constaté, diagnostic à chaud, idée de solution, idée de chantier sans rapport, point volontairement laissé ouvert. Contrairement aux templates 1 à 5, celui-ci n'est **pas destiné à partir tel quel vers Claude Code** : c'est une étape de tri qui produit ensuite un ou plusieurs fichiers dans les autres formats.

**Ce qui distingue ce template des autres** : les templates 1-5 sont des formats de *sortie* (vers Claude Code). Celui-ci est un format d'*entrée* — il absorbe le désordre d'une dictée réelle, découpe en unités homogènes, et redirige chaque unité vers le bon template. Je le déclenche dès qu'une dictée contient plusieurs sujets de nature différente sans que tu les aies toi-même séparés — je ne force jamais un mélange hétérogène dans un seul des templates 1 à 5.

**Origine de la source** : toujours ta retranscription à froid, même quand le retour vient d'un tiers (ex. ton neveu qui teste) — une seule voix, la tienne, donc pas de séparation "dit par le testeur" / "déduit par toi" en tags distincts. La distinction symptôme/diagnostic/solution suffit à capturer la nuance.

**Les 5 tags possibles pour une unité** :
- **Symptôme observé** — ce qui a été constaté factuellement en jouant/testant, sans interprétation.
- **Diagnostic/hypothèse spontanée** — ta déduction à chaud sur la cause. Précieuse mais jamais prise pour acquise, même venant de toi : elle devient une *hypothèse* dans le fichier de sortie, pas un fait établi.
- **Solution proposée à chaud** — ton idée d'implémentation, si tu en as donné une pendant la dictée.
- **Idée de chantier** — un sujet qui déborde du symptôme immédiat, sans lien direct (nouvelle direction, nouvelle brique).
- **[OUVERT]** — mentionné mais volontairement pas tranché ; ne jamais trancher à ta place, juste noter.

```markdown
# [Projet] — Notes de session brute : [contexte] (AAAA-MM-JJ)

## Dictée source
[Capture fidèle du dicté, peu importe le désordre — pas de reformulation à ce
stade, juste un nettoyage minimal de lisibilité.]

## Découpage en unités

### Unité 1 — [titre court]
- **Nature** : [Symptôme observé / Diagnostic spontané / Solution proposée /
  Idée de chantier / OUVERT]
- **Contenu** : [reformulation propre de cette unité seule]
- **Destination** : [Template 1/2/3/4/5, ou "en attente — pas assez mûr"]
- **Justification** : [une phrase — pourquoi ce template, ou pourquoi attendre]

### Unité 2 — [titre court]
[Même structure.]

[...]

## Fichiers à générer suite à ce triage
- [ ] `[nom-fichier].md` — [Template X] — [résumé d'une ligne]
- [ ] `[nom-fichier].md` — [Template Y] — [résumé d'une ligne]

## Notes laissées en attente (pas encore un fichier)
[Unités marquées OUVERT ou pas assez mûres pour un template — à ne pas perdre,
à relire à la prochaine session avant de décider si elles sont mûres.]
```

### Exemple de triage (démonstration, dictée réelle de Xav — RPG-monde, 2026-09)

Dictée source (verbatim, deux sujets dans le même souffle) :
> *« Donc je suis en train de tester la dernière version. […] le premier boss a
> été très facile […] j'aimerais qu'on en profite [maintenant que la M2 est
> prête] pour anticiper tous les gros design architecturaux qu'on va y mettre
> dedans. […] tous les choix de build possible, […] accès au livre […] le bien
> et le mal, […] la nouvelle maison […] »*

Découpage :
- **Unité 1 — Boss du premier niveau trop facile**
  - Nature : Symptôme observé + Solution proposée à chaud (augmenter les
    dégâts, sans prérequis autre que le temps de jeu).
  - Destination : **Template 3 (Session Diagnostic)**, pas Micro-Ticket.
  - Justification : la solution proposée par Xav est plausible mais pas
    vérifiée contre l'équilibrage réel (courbe de vitalité sur la durée) — un
    vrai diagnostic doit confirmer que la piste "dégâts" seule suffit avant de
    patcher, plutôt que d'appliquer la solution à chaud telle quelle.
- **Unité 2 — Anticiper l'architecture des chantiers M2 (builds, Livre, bien/
  mal, Maison/stockage)**
  - Nature : Idée de chantier, volontairement large, non détaillée.
  - Destination : **Déclencheur de Template 5 (Roadmap)** — pas encore le
    ROADMAP.md lui-même, une session de cadrage à part pour transformer cette
    liste en phases avant de produire le document.
  - Justification : sans lien direct avec le symptôme boss (Unité 1), portée
    trop large et trop peu tranchée pour un Module Standard unique.

---

## Notes d'évolution de cette bibliothèque

- Les templates 1, 2, 5 viennent du cadrage initial (conversation Gemini du
  [voir Architecte_Spec_md.txt]) — Micro-Ticket, Module Standard, Roadmap.
- Le template 3 (Session Diagnostic) et le template 4 (Cahier des Charges
  Technique) ont été ajoutés après observation de patterns récurrents et
  distincts dans les documents réels du projet — ils ne sont pas interchangeables
  avec 1/2/5 : un diagnostic n'est pas un patch (la cause est inconnue), un
  cahier des charges n'est pas un module (il couvre un système fermé entier).
- Le template 6 (Notes de Session Brute / Triage) a été ajouté après deux
  occurrences identifiées par Xav (recherche d'idée + découverte de problème
  en direct, note de petit défaut à corriger) — rôle différent des 5 autres :
  c'est un format d'entrée/triage, pas un format de sortie vers Claude Code. Il
  devient d'autant plus utile que des retours de tiers (playtest du neveu de
  Xav) vont commencer à arriver, toujours retranscrits à froid par Xav lui-même.
- Prochain candidat à surveiller, pas encore assez récurrent pour un template
  dédié : rien identifié à ce stade.
