# Portfolio v2 — SPEC : FAQ « Comment ce site a été créé ? » (Phase 9)

**Version : 1.0.0** — rédigée le 2026-09-16 à partir des réponses de Xav (16/09, 12:12 → 13:30) et de `JOURNAL_DEV.md`. Contenu relu et validé par Xav (Q1, Q2, 4 questions de base, formulation sobre : « Galaxy A04 », « Claude Pro »).

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T5, T6, T7, T8 ; « Design et animations : figés »), primitives `Modal`, `TypingText`, `Tag`, `NeonButton` (Phase 0), `AgentMessage` (`src/components/agent/`, Phase 1), `useLiteMode()` (Phase 6b), `useReducedMotionSafe()`, `SectionShell`, section `Play.tsx` (Phase 6).

## 1. Rôle du module

Répondre à la question que le site pose implicitement : *comment un consultant IA a-t-il produit ce site ?* — en utilisant le site lui-même comme cas réel, dans le format que le visiteur a déjà vu en haut de page (agent de poche). **Hors du flux principal** : pas dans la nav, pas une section ; un seul bouton discret en haut à droite de la section Jouer, qui ouvre un pop-up. Tout le contenu est **dérivé de `JOURNAL_DEV.md` et des réponses de Xav** ; rien d'inventé (T6/T7), rien qui répète l'agent de poche v1 (4D, outils, non-IA, ROI, disponibilité).

## 2. Entrées / Sorties

### Contenu (`src/content/faq.ts`)

```ts
export interface FaqQuestion {
  id: string;
  label: string;            // texte de la puce et du message "visiteur"
  priority?: boolean;       // les 2 questions mises en avant (premières, style accentué)
  paragraphs: string[];     // réponse de l'agent : une bulle AgentMessage par paragraphe, dans l'ordre
}

export const faqUi = {
  trigger: "Comment ce site a été créé ?",   // libellé du bouton
  title: "Comment ce site a été créé ?",     // titre de la Modal (prop `title`)
  intro: "Ce site est son propre cas réel. Posez la question — les réponses viennent du journal de développement, pas d'un texte marketing.",
  header: "FAQ · réponses scriptées",
  skip: "Tout afficher",                     // saute la frappe en cours
  reset: "Autre question",
};

export const faqQuestions: FaqQuestion[] = [ /* voir tableau ci-dessous, textes de référence */ ];
```

Texte de référence des 6 questions (**à recopier tel quel**, ponctuation et espaces insécables comprises — `?`, `:`, `»`, `%` précédés d'une U+00A0). Aucune mise en forme (gras, listes) : `TypingText` rend du texte brut ; la structure vient du découpage en bulles.

| id | label | priority | paragraphs |
|---|---|---|---|
| `workflow` | Qu'est-ce qu'un workflow ? | oui | 1. « Une boucle, pas une ligne. Chaque maillon fait ce qu'il fait le mieux, l'humain garde les points de contrôle. Celle qui a produit ce site : » 2. « 1 · Humain — l'idée arrive hors écran, avant de dormir ou en balade. Elle est posée en vrac, au téléphone. » 3. « 2 · ChatGPT — trie, sort les points intéressants, pose des questions. On creuse, d'idée en idée. » 4. « 3 · Humain — dès que ça prend forme, on arrête pour ne pas noyer le contexte : export, correction, reformulation, mise en ordre. » 5. « 4 · Claude — reçoit le tout et sert de cerveau, pas de secrétaire : contradictions, décisions à trancher, ce qui manque. » 6. « 5 · Humain — tranche. » 7. « 6 · Claude — rédige la spec numérotée. » 8. « 7 · Humain — relit et valide la spec. Rien ne part sans ça. » 9. « 8 · Claude Code — exécute, vérifie à l'écran, tient le journal, note la dette. » 10. « 9 · Humain — vérifie le résultat. Sur PC, et sur un Galaxy A04. » 11. « 10 · Claude — repart du journal et de la dette pour préparer la suite. » 12. « 11 · Humain — nouvelle idée. Retour en 1. » 13. « Cinq points de contrôle humain sur onze étapes. Aucun ne se délègue. » |
| `creation` | Comment ce site a été créé ? | oui | 1. « Avec la méthode qu'il décrit — le site est son propre cas réel. » 2. « Le problème. Pas de CV à jour, pas de réseaux, rien qui montre ce que je voulais faire. Un problème d'exposition, pas un problème de code. » 3. « Le contexte d'abord. Un prompt « fais-moi un site perso » sur une session vide donne un site générique. Ici, les LLM avaient deux mois de projets, de décisions et de vocabulaire en mémoire. D'après mon ressenti d'utilisateur, ce contexte pèse autant qu'il est invisible. » 4. « Le cadrage (nuit du 13 au 14/09, kit finalisé le 15/09). Idée dégrossie avec ChatGPT, dont le prompt d'ouverture — « tu agis en tant qu'expert… » — repris une dizaine de fois, à la virgule près. Puis dictée à Claude : une roadmap, 7 specs numérotées, 12 décisions tranchées à l'avance (dont « aucune métrique client inventée »), un fichier de dette. 7 questions de fond posées et tranchées avant la première ligne de code. » 5. « L'exécution (15–16/09). Claude Code, une phase par spec, dans un ordre qui n'est pas celui des numéros : d'abord le cœur du CV (projets, compétences), les modules inédits après. Chaque phase : cause racine avant patch, vérification visuelle réelle à 375 et 1280 px, journal, dette. Le site est en ligne dès la Phase 0. » 6. « Les arrêts. L'agent s'arrête et attend à chaque point qu'il ne peut pas vérifier seul : relecture des fiches, niveaux de compétences, réception d'un mail, ressenti sur un vrai téléphone. » 7. « Ce qui a cassé. Une dizaine de bugs trouvés à l'écran et pas dans les tests : menu mobile transparent, modale non scrollable, texte qui tape deux fois trop lentement. Un bug corrigé puis réintroduit deux phases plus tard, avoué dans le journal. Un journal de phase oublié, reconstitué après coup et signalé comme tel. » 8. « Le test terrain. Défilement saccadé sur un Galaxy A04. Réponse : un mode allégé, avec un critère strict — le rendu PC doit rester identique au pixel près (vérifié : 0 pixel de différence). Verdict sur le téléphone : « nette amélioration ». » 9. « Le bilan. Trois jours, onze phases dont ce pop-up, 81 tests, 36 lignes de dette suivies, un build qui refuse de passer si le CV dépasse une page. Claude Pro + Claude Code + humain : 90 % du travail. Le reste : ChatGPT pour dégrossir, Gemini pour ce qui touche à Google. » |
| `spec` | C'est quoi une spec ? | — | 1. « Un fichier texte numéroté qui décrit une phase avant qu'elle soit codée : rôle, entrées et sorties, comportement attendu, cas limites, critères de passage, hors scope. L'agent ne code jamais sans. » 2. « Ce site en compte onze, celle de cette FAQ comprise. Elles viennent d'une bibliothèque de six templates — le Playground, plus haut, en montre trois à l'œuvre. » |
| `phases` | Pourquoi des phases ? | — | 1. « Une phase = une spec = une session. Assez petit pour être vérifié entièrement à l'écran avant de passer à la suite, assez grand pour livrer quelque chose de visible. » 2. « Ici : socle, hero et agent, simulateur, playground, projets, compétences, contact et jouer, mode allégé, polish et mentions légales, CV PDF, cette FAQ. L'ordre d'exécution n'est pas celui des numéros : le cœur du CV d'abord, les modules inédits quand le contenu était stabilisé. » |
| `dette` | C'est quoi la dette suivie ? | — | 1. « Un fichier où tout ce qui manque ou reste à confirmer est écrit noir sur blanc, avec un numéro, plutôt que masqué par une valeur inventée. L'agent y ajoute des lignes, n'en supprime jamais ; l'humain coche. » 2. « Ce site : 36 lignes numérotées à ce jour — un niveau de compétence provisoire, une photo de poste de travail floutée avant publication, une numérotation en collision entre deux phases, signalée plutôt que corrigée en silence. » |
| `arret` | [ARRÊT HUMAIN], c'est quoi ? | — | 1. « Le marqueur que l'agent pose quand un critère de passage ne peut pas être vérifié par lui : relire un texte, confirmer qu'un mail est arrivé, juger la fluidité sur un vrai téléphone, relire un PDF imprimé. Il s'arrête, rend compte, et rien n'est poussé en ligne. » 2. « Ce site en a connu sept. Aucun n'a été levé par l'agent lui-même. » |

Sources des chiffres (pour vérification, pas pour affichage) : 7 specs initiales → `README.md` du kit ; 12 décisions → ROADMAP T1–T12 ; 7 questions de fond → `dette_suivi.md` §A (S1–S7) ; 81 tests, `ca5fdd2` → journal Phase 8 ; 36 lignes → DETTE-36 ; « nette amélioration », 0 pixel → journal Phase 6b ; bug réintroduit → journal Phase 7 (bug 5) ; journal reconstitué → journal Phase 2 (patch B) ; 7 arrêts → journaux Phases 4, 5, 6, 6b, 3, 7, 8 ; onze phases → 0, 1, 2, 3, 4, 5, 6, 6b, 7, 8, 9. **Si un chiffre du journal a changé au moment de l'exécution, corriger le texte et le noter dans le journal — jamais l'inverse.**

## 3. Comportement attendu

### Déclencheur
- Un `NeonButton variant="ghost"` (icône Lucide `MessageCircleQuestion`, libellé `faqUi.trigger`) placé **en haut à droite de l'en-tête de la section Jouer**, sur la même ligne que le titre. `SectionShell` n'a pas d'emplacement pour cela : ajouter une prop optionnelle `headerAction?: ReactNode` (rendue à droite du titre sur desktop, sous le sous-titre à pleine largeur sur mobile). Seule `Play.tsx` la renseigne ; les autres sections ne changent pas d'un pixel (critère §7.1).
- Absent de `nav.ts`, du menu mobile, du footer, du CV PDF (`buildCvModel` ne lit pas `faq.ts`) et du JSON-LD.
- Deep link `#faq` : ouvre le pop-up au chargement, comme `#projets/<id>` ouvre une modale projet (réutiliser `hashRoute.ts`, Phase 7). Fermeture → hash ramené à `#jouer`. Un hash `faq/...` ou inconnu est ignoré.

### Pop-up (`FaqModal`)
- Primitive `Modal` telle quelle (`title = faqUi.title`) : Échap, clic overlay, bouton fermer, focus trap, focus restauré sur le bouton déclencheur.
- Contenu : en-tête discret `faqUi.header` (même style que « Agent de poche · v1 scriptée »), une bulle agent `faqUi.intro` (statique, pas de frappe), puis la rangée de puces (`Tag`) : les 2 questions `priority` en premier, style actif/accentué, les 4 autres ensuite. **Pas de champ de saisie libre** (différence assumée avec l'agent de poche : ici tout est scripté, on ne fait pas semblant).
- Clic sur une puce → bulle visiteur (`AgentMessage role="user"`, texte = `label`) → indicateur « … » 400–700 ms (même composant que l'agent) → les `paragraphs` apparaissent **une bulle après l'autre**, chacune révélée par `TypingText` (`speedMs = 6`, plus rapide que l'agent : Q2 ≈ 2 200 caractères, ≈ 13 s) ; la bulle suivante démarre au `onDone` de la précédente. Pendant la frappe, puces désactivées, bouton `faqUi.skip` visible : un clic complète instantanément toutes les bulles de la réponse en cours.
- Après la dernière bulle : puces réactivées, la question posée reste dans l'historique ; une nouvelle puce **remplace** la conversation (une seule question affichée à la fois — la Modal ne doit pas devenir un scroll de 40 bulles) avec un fondu de la primitive. Lien `faqUi.reset` = même effet sans poser de question.
- Zone de conversation : scroll interne, suivi du bas par `ResizeObserver` (même mécanisme que `AgentPanel`), classe `scrollbar-subtle`. Hauteur max : 70 vh sur desktop, la Modal reste scrollable sur mobile (correctif Phase 4).

### Modes
- `useReducedMotionSafe()` **ou** `useLiteMode() === "lite"` → `instant` : pas d'indicateur « … », toutes les bulles affichées d'un coup, bouton `skip` masqué. Même règle que le Playground.
- `?perf=lite` : aucun `backdrop-filter`/glow nouveau — `Modal` et `Tag` sont déjà `lite:`-safe ; ne pas en ajouter dans `FaqModal`.

## 4. Edge cases à gérer
- Ouverture pendant le teaser mobile de Jouer (`TeaserOverlay`) : impossible par construction (le bouton est dans l'en-tête de section, l'overlay est plein écran au-dessus) — vérifier qu'aucune superposition de `z-index` ne laisse le bouton cliquable sous l'overlay.
- Fermeture (Échap, overlay, bouton) **pendant** la frappe : l'état est réinitialisé, aucune bulle ne continue de « taper » dans un pop-up fermé (nettoyer le `requestAnimationFrame` de `TypingText` via démontage, pas via un drapeau).
- Double clic sur une puce pendant la frappe : ignoré (puces `disabled`).
- Deep link `#faq` + `#projets/<id>` ne peuvent pas être simultanés : le hash est unique, pas d'état à arbitrer.
- Historique navigateur : la Modal FAQ **n'ajoute pas** d'entrée d'historique (contrairement à l'overlay teaser) — la fermeture par bouton retour n'est pas requise ; le hash `#faq` est posé par `replaceState` à l'ouverture et retiré de la même façon.
- Un `paragraphs` vide ou un `id` dupliqué → test rouge (§7.5), jamais un rendu vide.

## 5. Structure des fichiers
```
src/content/faq.ts                       (nouveau — types, faqUi, faqQuestions)
src/content/faq.test.ts                  (nouveau)
src/components/faq/FaqModal.tsx          (nouveau — Modal + conversation)
src/components/faq/FaqTrigger.tsx        (nouveau — NeonButton ghost + icône)
src/components/ui/SectionShell.tsx       (modifié — prop optionnelle `headerAction`)
src/sections/Play.tsx                    (modifié — headerAction={<FaqTrigger/>}, état open, deep link)
src/lib/router/hashRoute.ts              (modifié — reconnaît `faq`)
```
Réutilisés sans modification : `Modal`, `TypingText`, `Tag`, `AgentMessage`, `NeonButton`, `useLiteMode`, `useReducedMotionSafe`, `scrollbar-subtle`.

## 6. Consignes d'autonomie pour Claude Code
- **Contenu d'abord** : `faq.ts` + `faq.test.ts` verts avant tout composant (même ordre que les Phases 2, 3, 8).
- **Recopier les textes de §2 caractère pour caractère.** Ne pas reformuler, ne pas « améliorer », ne pas ajouter de question. Si un chiffre est contredit par le journal au moment de l'exécution, corriger le chiffre, le noter dans le journal, et signaler l'écart dans le compte-rendu.
- **Design figé** : aucun nouveau token, aucune nouvelle animation, aucun changement sur les 7 sections hors la prop `headerAction` de `Play`. Le critère §7.1 le vérifie.
- Ne pas brancher `AgentProvider` : la FAQ n'est pas un agent, elle n'a pas vocation à devenir dynamique (§8).
- Ne pas indexer la FAQ (`noindex` global déjà en place, DETTE-33) ; ne pas l'ajouter au sitemap.
- Si `AgentMessage` ne convient pas tel quel (ex. besoin de `speedMs`), étendre par prop optionnelle rétrocompatible, jamais dupliquer le composant.

## 7. Critères de validation
1. **Rendu des 7 sections inchangé** hors en-tête de Jouer : captures `vite preview` 1280 px avant/après, diff pixel (même procédure `sharp` que la Phase 6b) — 0 px hors Jouer et hors zones d'animation en cours ; dans Jouer, seule la zone du bouton diffère.
2. **Parcours complet à l'écran** (Claude in Chrome ou script CDP), 1280 px et ~500 px, `?perf=full` : clic bouton → Modal → clic « Comment ce site a été créé ? » → 9 bulles tapées dans l'ordre, texte final du DOM **identique caractère pour caractère** à `faq.ts` (espaces insécables comprises) → « Tout afficher » testé sur une autre question → « Autre question » → Échap, focus revenu sur le bouton.
3. **Deep link** `#faq` : ouverture au chargement, fermeture → `#jouer` ; `#faq/x` ignoré.
4. **Modes** : `?perf=lite` → réponse instantanée, pas de « … », pas de bouton skip, `getComputedStyle` sans `backdrop-filter` sur le dialogue ; `node scripts/audit-reduced-motion.js` toujours conforme avec la Modal ouverte (ajouter l'étape d'ouverture au script si nécessaire).
5. **Tests** `faq.test.ts` : 6 questions, ids uniques, exactement 2 `priority`, aucun `paragraphs` vide, aucune bulle > 600 caractères, aucun `%` hors `creation` (le seul chiffre autorisé est « 90 % »), aucune occurrence de « Claude Max », « 100 € », « phenomenxx », « LinkedIn ». Suite existante (81) toujours verte ; `lint`/`build` verts.
6. **Absence du flux principal** : `grep` sur `dist/` — `faq` absent de la nav, du sitemap, du JSON-LD, du PDF (`pdf-parse` sur `dist/cv/`).
7. **Lighthouse mobile** sur le déploiement : inchangé (le composant est chargé avec `Play`, pas en chunk initial supplémentaire — vérifier la taille du bundle avant/après, écart < 5 Ko gzip attendu).
8. **[ARRÊT XAV]** — relecture des 6 réponses à l'écran dans le pop-up (pas dans le fichier), sur PC et sur le Galaxy A04 en `lite`. Rien n'est poussé avant.

## 8. Hors scope
Saisie libre, réponses dynamiques, `ApiAgentProvider`. Version anglaise (Phase 10 — `faq.ts` suit T8, prêt pour `faq.en.ts`). Toute autre question que les six. Tout changement de design, de nav ou de section. Mesure d'audience sur l'ouverture du pop-up (écartée par Xav).

---

## Patches à reporter

### `00_ROADMAP.md`
- Statut : `Phase 8 close. Phase courante : 9 (spec 10_faq-comment-ce-site.md, contenu validé par Xav le 16/09).`
- Ligne Phase 9 de l'esquisse : ajouter `(\`10_faq-comment-ce-site.md\`)` après le titre, et « 6 questions : workflow, création du site (prioritaires), spec, phases, dette, arrêt humain ; deep link `#faq` ; prop `headerAction` ajoutée à `SectionShell` pour Jouer uniquement ».
- Note de nommage : les fichiers `09_polish-seo-mentions-legales.md` et `09_export-cv-pdf.md` portent le même numéro ; la FAQ prend le **10** et la version anglaise prendra le **11**. Ne pas renommer les deux 09 (liens dans le journal).

### `dette_suivi.md`
- §D : `2026-09-16 — spec 10 (FAQ) écrite, contenu validé par Xav ; collision de numéro 09/09 constatée, FAQ = 10, anglais = 11.`
- Aucune DETTE-xx nouvelle attendue. Si l'exécution en ouvre une (chiffre du journal divergent), la numéroter à partir de **37** après vérification de l'état réel du fichier (leçon Phase 8).

### Prompt de lancement (à coller dans Claude Code)
> Lis `specs/00_ROADMAP.md` en entier puis `specs/10_faq-comment-ce-site.md` et exécute la Phase 9. Commence par `src/content/faq.ts` et `faq.test.ts` (textes de §2 recopiés caractère pour caractère, espaces insécables comprises), tests verts avant tout composant. Puis `FaqTrigger`, `FaqModal`, la prop `headerAction` de `SectionShell` (utilisée par `Play` seulement) et le deep link `#faq`. Vérifie §7.1 par diff pixel comme en Phase 6b, §7.2 par un vrai parcours à l'écran aux deux largeurs, §7.4 en `?perf=lite`. Arrête-toi à l'ARRÊT XAV §7.8 et fais-moi un compte-rendu selon le format de fin de session. Rien n'est committé avant mon go.
