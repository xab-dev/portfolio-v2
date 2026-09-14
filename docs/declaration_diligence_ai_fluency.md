# Déclaration de Diligence — AI Fluency

**Xavier B.** — Cadre 4D (Délégation, Description, Discernment, Diligence)
Ancrée sur l'état du projet RPG-monde au 14/09/2026

---

## Position

Dans le cadre 4D, la Diligence est le pilier que je refuse de déléguer, même partiellement. Je délègue l'exécution, je délègue une partie de la description quand le contexte est déjà posé, je m'appuie sur Claude pour du Discernment complémentaire — mais la vérification que ce qui est produit correspond réellement à ce qui a été demandé, et n'a rien cassé en silence, reste de ma responsabilité pleine et entière. C'est le socle qui rend le reste du système praticable.

## Ce que ça signifie concrètement

**Rien n'est acté sur ma seule confiance dans un résumé.** Le projet RPG-monde n'a pas de git — `CLAUDE.md` et les fichiers de `tests/` sont la seule mémoire inter-session. Cette architecture n'est pas un choix par défaut : c'est une conséquence directe de ma posture de Diligence. Si la trace écrite est la seule mémoire du projet, alors la qualité de cette trace n'est pas négociable — elle documente autant les décisions actées que ce qui reste explicitement hors scope, pour qu'aucune régression ne se glisse par omission.

**La vérification visuelle réelle prime sur l'inspection de code.** Le rendu (`draw()`, canvas) n'est jamais exercé par les tests headless — je le sais, et je l'exige quand même en navigateur, sur la vraie sauvegarde de playtest, jamais modifiée sans backup préalable et restauration explicite. La session de polish M1 en est l'illustration directe : chaque point livré (rocher, Conteur, boutons Journal) a été revérifié à l'écran, pas seulement en test Node — jour et nuit quand la mécanique le justifiait.

**Un bug trouvé pendant la vérification n'est jamais mis de côté au prétexte qu'il sort du périmètre demandé.** Le bug de z-index découvert pendant le polish du respec d'affinité (`#dialogue-djinn` rendu derrière le Journal) préexistait silencieusement depuis la fonctionnalité "Changer de relique" — je veux qu'il soit signalé et corrigé à la racine dès qu'il est visible, même s'il n'était pas dans la consigne initiale.

**Diligence n'exige pas que je diagnostique moi-même chaque défaut — observer suffit.** J'ai pu repérer un défaut sans en avoir la cause exacte ni la correction : c'est un rôle de Discernment valide en soi, pas une faille dans ma vigilance. La Diligence, c'est l'exigence que le défaut soit remonté et tracé — pas que je porte seul toute l'expertise de diagnostic.

**Le scope tenu se documente, il ne se devine pas.** Chaque session de développement se referme sur trois points explicites : ce qui a été livré et validé, les décisions techniques prises et pourquoi, ce qui reste hors scope et pour quelle session future. Cette discipline n'est pas de la paperasse — c'est la condition pour que la Délégation croissante reste sûre d'une session à l'autre, sans devoir tout revérifier depuis zéro à chaque reprise.

## Pourquoi cette Diligence-là, et pas une case à cocher

Mon modèle multi-branches (jeu, biostatistique, IA-santé) n'a de cohérence que si chaque branche est fiable indépendamment des autres — je n'ai pas la structure d'une équipe pour rattraper une erreur qui passerait inaperçue. La Diligence est donc moins une étape de process qu'une condition de viabilité du système entier : c'est elle qui permet à la Délégation d'augmenter sans que la confiance devienne aveugle.

---

*Déclaration rédigée à partir de l'état réel du projet RPG-monde (session polish M1 "touche de l'artiste", 2026-09-13/14) et du cadre 4D documenté dans le projet Tower Defense.*
