# Séquence d'intervention terrain — Diagnostic & Maintenance informatique

Document de méthode, à faire évoluer au fil des premières interventions réelles. Pas encore testé sur un vrai client au 14/09/2026 — statut : cadrage théorique construit à partir d'outils déjà fonctionnels et d'une méthode de travail déjà rodée ailleurs (voir §5).

---

## 1. Principe général

Une escalade en trois paliers, à coût et à profondeur croissants. Chaque palier n'est engagé que si le précédent n'a pas suffi — l'objectif n'est jamais de sauter une étape par réflexe technique, mais de ne mobiliser que le niveau d'effort réellement nécessaire au problème rencontré.

| Palier | Durée | Outil | Nature |
|---|---|---|---|
| 1 | 0–30 min | Clé USB diagnostic/entretien perso | Automatisé, sans dépendance réseau |
| 2 | 30 min – 1h | Bibliothèque de templates de spec | Formalisation structurée du problème |
| 3 | Après 1h | Claude / Claude Pro en diagnostic actif | Expertise combinée humain-IA |

---

## 2. Palier 1 — Clé USB diagnostic/entretien (0–30 min)

**Statut** : fonctionnelle, déjà construite (détail technique dans un autre projet — non redupliqué ici).

**Fonction** : diagnostic, maintenance, et compte-rendu en un clic. Premier geste sur toute intervention — rapide, reproductible, ne dépend d'aucune connexion ni d'aucune réflexion au cas par cas.

**Ce que ce palier doit couvrir** (à valider/enrichir au fil des interventions réelles) :
- État général de la machine (disque, RAM, mises à jour, doublons potentiels — inspiré du module miniCiel "État des lieux")
- Un compte-rendu exploitable immédiatement, à montrer ou remettre au client

**Chantier en cours, non urgent** : une **deuxième clé, bootable**, pour le cas où le Windows du client ne démarre pas du tout — hors scope de ce document tant qu'aucun client réel n'impose son urgence. Support (WinPE, Live Linux, autre) pas encore tranché.

**Sortie de ce palier** : soit le problème est résolu et documenté (fin d'intervention), soit un compte-rendu de diagnostic sert de matière brute au palier 2.

---

## 3. Palier 2 — Templates de spec (30 min – 1h)

**Statut** : bibliothèque de 6 templates déjà construite et disponible (`TEMPLATES_SPEC.md`).

**Fonction** : si le palier 1 ne suffit pas, le problème est formalisé — dicté ou noté à chaud pendant/après le diagnostic — puis structuré dans le format le plus adapté à sa nature :

| Nature du problème rencontré | Template mobilisé |
|---|---|
| Correction ponctuelle déjà comprise | Micro-Ticket |
| Nouveau composant/script à construire | Module Standard |
| Cause du problème non identifiée | Session Diagnostic |
| Système/outil à spécifier dans son ensemble | Cahier des Charges Technique |
| Chantier multi-étapes | Roadmap + Specs numérotées |
| Observations en vrac pendant l'intervention (plusieurs symptômes mélangés) | Notes de Session Brute (Triage) |

**Ce qui change par rapport à l'usage habituel de ces templates (contexte projet)** : en intervention terrain, la source n'est pas toujours une dictée réfléchie a posteriori — elle peut être prise en direct, sous pression de temps, avec un client qui attend. Le Template 6 (Triage) est probablement le plus sollicité dans ce contexte précis, pour la même raison qu'il l'est en dev : absorber le désordre d'une observation en direct avant de savoir quel format de sortie choisir.

**Sortie de ce palier** : soit une spec suffisamment précise permet une résolution rapide (retour au palier 1 ou action manuelle directe), soit le problème dépasse ce qu'une formalisation seule peut résoudre — passage au palier 3.

---

## 4. Palier 3 — Diagnostic actif avec Claude / Claude Pro (après 1h)

**Statut** : méthode déjà pratiquée et documentée sur d'autres projets (RPG-monde, miniCiel) — à transposer au contexte "intervention chez un client tiers", pas encore testé dans ce contexte précis.

**Fonction** : les cas qui résistent aux deux premiers paliers demandent un vrai travail de diagnostic combiné humain-IA — pas une application mécanique de procédure, mais un jugement conjoint sur la cause probable, les hypothèses à écarter, et la solution à construire ou adapter en direct.

**Principes déjà éprouvés ailleurs, à appliquer ici** :
- **Cause racine avant patch** — ne pas appliquer de correctif avant d'avoir confirmé la cause réelle, même sous pression de temps client.
- **Vérification réelle, pas de confiance aveugle dans un résumé** — un problème "réglé" doit être revérifié concrètement (redémarrage, test fonctionnel), pas juste supposé réglé parce qu'une commande s'est bien exécutée.
- **Diligence documentée** — même en intervention courte, noter ce qui a été fait, pourquoi, et ce qui reste en surveillance (utile pour un futur retour du même client).

**Limite actuelle assumée** : les compétences techniques profondes restent en construction (cf. auto-évaluation méthodologique déjà posée par ailleurs) — ce palier s'appuie donc explicitement sur le jugement combiné avec l'IA plutôt que sur une expertise solitaire déjà consolidée. C'est une force du dispositif, pas une faiblesse à cacher : la vérification systématique (voir ci-dessus) compense précisément ce point.

---

## 5. Pourquoi cette séquence tient déjà la route sur le papier

Elle n'est pas construite dans le vide : chaque palier repose sur un outil ou une méthode qui existe déjà et fonctionne dans un autre contexte (le développement de projets perso) :
- Le palier 1 est un outil fini, testé, pas un concept.
- Le palier 2 s'appuie sur une bibliothèque de templates déjà éprouvée sur des dizaines de sessions de développement réelles.
- Le palier 3 s'appuie sur une méthode de collaboration humain-IA (cadre 4D — Délégation, Description, Discernment, Diligence) déjà pratiquée et documentée en detail ailleurs, pas improvisée pour l'occasion.

Ce qui manque à ce stade, et que seul un vrai cas client permettra de vérifier : est-ce que le rythme (30 min / 1h) est réaliste en conditions réelles, et est-ce que le palier 3 se transpose sans friction à un environnement inconnu (machine, logiciels, habitudes d'un client) plutôt qu'à un projet personnel déjà maîtrisé de fond en comble.

---

## 6. Prochaines étapes pour faire mûrir ce document

- [ ] Premier cas client réel : chronométrer chaque palier, noter les écarts avec cette séquence théorique.
- [ ] Décider du support de la clé bootable (Palier 1, volet secours) une fois qu'un vrai cas de non-démarrage se présente — pas avant.
- [ ] Évaluer si le Palier 2 doit avoir une version allégée spécifique au contexte "chez le client, en direct" (les templates actuels sont calibrés sur du dev logiciel réfléchi, pas sur du dépannage sous pression).
- [ ] Une fois 2-3 interventions réelles faites : consolider ce document en process réutilisable pour le démarchage (cf. Fiche Professionnelle).
