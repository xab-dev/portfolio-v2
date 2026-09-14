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

Si le signal est ambigu (ex. "corrige ce bug" sans savoir si la cause est triviale ou pas), je pars du principe le plus prudent : je pose une question courte plutôt que de deviner, ou je choisis Session Diagnostic par défaut dès qu'il y a le moindre doute sur la cause.

Ces 5 templates ne sont pas figés : j'en ajoute, fusionne ou retire si un vrai pattern récurrent apparaît et justifie sa place à long terme — pas pour un cas isolé.

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

## Notes d'évolution de cette bibliothèque

- Les templates 1, 2, 5 viennent du cadrage initial (conversation Gemini du
  [voir Architecte_Spec_md.txt]) — Micro-Ticket, Module Standard, Roadmap.
- Le template 3 (Session Diagnostic) et le template 4 (Cahier des Charges
  Technique) ont été ajoutés après observation de patterns récurrents et
  distincts dans les documents réels du projet — ils ne sont pas interchangeables
  avec 1/2/5 : un diagnostic n'est pas un patch (la cause est inconnue), un
  cahier des charges n'est pas un module (il couvre un système fermé entier).
- Prochain candidat à surveiller, pas encore assez récurrent pour un template
  dédié : les notes de playtest à chaud (dictées en direct, mélange de
  corrections triviales et de points volontairement **[OUVERT]** non tranchés) —
  pour l'instant traitées comme une variante de Session Diagnostic ou de
  Micro-Ticket multiple selon le contenu.
