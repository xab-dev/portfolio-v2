# Portfolio v2 — SPEC : Export CV classique, PDF une page (Phase 8)

**Créé le 2026-09-16 11:10** à partir de la note de Xav. Format : Module Standard. Ouvre **DETTE-32** et **DETTE-33**, pose la décision **D6**.

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T6, T7, T8, T9), `src/content/site.ts`, `hero.ts`, `projects.ts`, `skills.ts`, `timeline.ts`, `contact.ts`, `NeonButton`, `Hero.tsx` (Phase 1), `Contact.tsx` bloc « Contact direct » (Phase 6), pipeline `scripts/process-images.js` (Phase 4 — même esprit : un script Node qui alimente `public/`), mode allégé `data-perf` (Phase 6b).

## 1. Rôle du module

Donner au visiteur qui veut « un CV normal » (recruteur, service achats, France Travail, pièce jointe à un devis) un **PDF A4 une page, sobre et imprimable**, sans rien retaper. Principe fondateur : **le PDF est une projection de `src/content/*.ts`**, générée à chaque build. Il ne peut pas diverger du site parce qu'il n'a pas de source propre — seule la *sélection* et la *mise en page* lui appartiennent.

Trois contraintes tirées de la note de Xav :
1. Source unique = `src/content/` (T8 étendu au PDF).
2. Bouton « Télécharger le CV » dans le Hero **et** dans Contact.
3. **Génération à la build**, fichier statique dans `dist/` — jamais de génération côté client (poids JS, mode allégé, tactile). Le bouton est un simple lien `<a download>`.

## 2. Entrées / Sorties

### Sources (lecture seule — aucun contenu nouveau n'est saisi pour le PDF)
| Bloc du CV | Source | Règle de sélection |
|---|---|---|
| En-tête : nom, titre, localisation | `site.name`, `site.title`, `site.location` | tel quel |
| Accroche | `hero.title` + `hero.subtitle` | tel quel (validé DETTE-03) |
| Contact | `site.contact.emailPrimary`, `site.contact.phone`, `site.links.github`, `site.links.youtube`, `site.links.linkedin` | lien vide → ligne absente (même règle que le footer, DETTE-04) ; `emailSecondary` **non imprimé** (un seul mail sur un CV) |
| Projets | `projects[]` | tous (6) ; par projet : `title`, `tagline`, `tags`, `status`, `year` + **uniquement** les `metrics` à `verified: true` (T6 — jamais « auto-déclaré » sur un CV) |
| Compétences | `skills[]` groupées par `family` | toutes ; niveau rendu en libellé texte (1 notions … 5 pratique quotidienne), jamais en chiffre nu |
| Parcours | `milestones[]` | tous ; `dateKnown:false` → période « — » (règle spec 06) |
| Langues | `site.languages` | tel quel |
| Statut | `site.legal` | « Auto-entrepreneur · SIRET … » en pied de page |
| Tarif | `contact.ts` (ligne tarif) | **non imprimé** — un CV n'est pas une grille tarifaire ; le PDF renvoie au site pour le devis |

### Contenu propre au PDF (`src/content/cv.ts`) — le seul fichier nouveau de contenu
```ts
export const cv = {
  fileName: "cv-xavier-bou.pdf",          // chemin public : `${BASE_URL}cv/cv-xavier-bou.pdf`
  ctaLabel: "Télécharger le CV (PDF)",
  sectionOrder: ['profil', 'projets', 'competences', 'parcours', 'langues'] as const,
  levelLabels: { 1: 'notions', 2: 'en apprentissage', 3: 'en consolidation', 4: 'maîtrisé', 5: 'pratique quotidienne' },
  footerNote: "CV généré automatiquement depuis le portfolio — version à jour et projets détaillés sur",   // suivi de l'URL du site
  meta: { subject: "CV — Consultant outils et solutions IA", keywords: ['IA', 'consultant', 'automatisation', 'Tarascon'] },
};
```
Ce fichier contient des **libellés et des règles de mise en page**, pas des faits. Si un fait manque pour le CV, il s'ajoute dans son fichier d'origine (`site.ts`, `timeline.ts`…) et apparaît sur le site — c'est le but.

### Sortie
- `public/cv/cv-xavier-bou.pdf`, copié tel quel dans `dist/cv/` par Vite. **Gitignoré** (artefact de build, comme les WebP dérivés).
- A4 portrait, **exactement 1 page**, ≤ 200 Ko, polices embarquées en sous-ensemble, texte sélectionnable, métadonnées PDF : `Title` = « Xavier Joseph Bou — Consultant outils et solutions IA », `Author`, `Subject`, `Keywords` (depuis `cv.meta`), `Language` = `fr-FR`.

## 3. Comportement attendu

### Génération (`scripts/build-cv.tsx`, exécuté par `npm run cv`)
- Chaîne : `npm run cv` → construit un modèle pur `CvModel` depuis `src/content/*.ts` (`buildCvModel()`, fonction pure testée) → rend le PDF → **compte les pages** → écrit dans `public/cv/`.
- Câblé en **`prebuild`** et **`predev`** dans `package.json` : le PDF existe toujours quand le site tourne, en local comme en CI. Le workflow `deploy.yml` n'a rien à changer (`npm run build` déclenche `prebuild`).
- **Si le rendu dépasse 1 page, le script échoue** (code de sortie ≠ 0, message explicite : quelle section a débordé). Le build casse plutôt que de livrer un CV de deux pages : c'est voulu. L'agent ajuste la mise en page (§4), jamais en supprimant du contenu silencieusement.
- Moteur de rendu : **`@react-pdf/renderer`** côté Node (rendu déterministe, pas de navigateur en CI, composants React typés cohérents avec le reste du repo). Polices : `Space Grotesk` (titres) et `Inter` (texte) déjà présentes via `@fontsource/*` — enregistrer les fichiers `.woff` `latin` (react-pdf lit TTF/OTF/WOFF, **pas WOFF2**). **Vérifier à l'init** que l'enregistrement fonctionne ; sinon repli sur les polices intégrées (`Helvetica`) et le noter dans le journal — même logique que `motion` en Phase 0.

### Mise en page du PDF (design *print*, pas Premium Tech)
- Fond blanc, texte `#111`, **un seul accent** : le bleu électrique des tokens, pour les titres de section et un filet fin. Imprimable en noir et blanc sans perte de hiérarchie.
- Gabarit deux colonnes : colonne principale (~65 %) Profil → Projets → Parcours ; colonne latérale (~35 %) Contact → Compétences par famille → Langues. Marges 14 mm, corps 9–9,5 pt, interligne serré mais lisible.
- Projets : titre + année + statut sur une ligne, tagline dessous, tags en petites capitales grises, métriques vérifiées en fin de ligne. Liens (`links[]`) rendus comme **hyperliens cliquables** dans le PDF (pas d'URL imprimée en clair, sauf le site en pied de page).
- Pied de page : `cv.footerNote` + URL du site en clair, ligne statut/SIRET, date de génération (`JJ/MM/AAAA`).

### Boutons sur le site
- **Hero** : sous les deux CTA existants, un lien secondaire discret (style `NeonButton` variante `ghost` ou lien souligné, au choix de l'agent — pas un 3e bouton plein qui concurrencerait « Voir mes projets ») : icône Lucide `Download` + `cv.ctaLabel`. Attributs : `href="${import.meta.env.BASE_URL}cv/${cv.fileName}"`, `download`, `type="application/pdf"`.
- **Contact** : même lien, dans le bloc « Contact direct », après les mails/téléphone. Un seul composant `CvDownloadLink` réutilisé aux deux endroits.
- Aucun JS, aucune génération, aucun `fetch` : un lien same-origin avec `download`. En mode allégé, rien de spécifique à faire (critère §7.6 = vérification, pas travail).

## 4. Edge cases à gérer
- **Débordement 1 page** : ordre de réduction autorisé, à appliquer dans cet ordre et à documenter : (1) resserrer marges/interligne dans les bornes ci-dessus, (2) tronquer les `tagline` projet à 140 caractères avec « … », (3) limiter les métriques vérifiées à 2 par projet. Jamais retirer un projet, une compétence ou un jalon.
- **Contenu court** (DETTE-17 : la frise ne couvre que 2026, 7 jalons) : le CV peut paraître aéré. Ne pas combler avec du remplissage — voir **D6**.
- Lien vide (`linkedin: ""`) → ligne absente, pas de libellé orphelin.
- `avatar` : **non imprimé** en V1 (dessin stylisé, pas une photo ; un CV français sans photo est la norme). Décision réversible dans `cv.ts`.
- Caractères : apostrophes typographiques, `€`, `→` présents dans le contenu — vérifier qu'ils sont couverts par le sous-ensemble `latin`/`latin-ext`, sinon remplacer par le glyphe ASCII dans le **modèle CV** uniquement (pas dans le contenu source).
- `public/cv/` absent au premier `git clone` : `predev`/`prebuild` le régénèrent ; le `.gitignore` ignore `public/cv/*.pdf`, pas le dossier (garder un `.gitkeep`).
- Contenu marqué `[DETTE-xx]` : reste tel quel dans le PDF (le CV ne fait pas mieux que le site) — l'agent liste dans le journal les marqueurs qui apparaissent dans le PDF pour que Xav voie ce qu'un recruteur verrait.

## 5. Structure des fichiers
```
scripts/build-cv.tsx                     (point d'entrée : modèle → rendu → contrôle 1 page → écriture)
scripts/cv/buildCvModel.ts               (fonction pure : content → CvModel ; sélection, libellés, filtres verified/dateKnown/liens vides)
scripts/cv/buildCvModel.test.ts          (≥ 6 cas : metrics non vérifiées exclues, linkedin vide masqué, dateKnown:false → « — », 6 projets présents, niveaux → libellés, troncature tagline)
scripts/cv/CvDocument.tsx                (composants @react-pdf/renderer, aucune chaîne de contenu en dur)
scripts/cv/fonts.ts                      (enregistrement Inter / Space Grotesk depuis node_modules/@fontsource)
src/content/cv.ts                        (libellés + règles, voir §2)
src/components/ui/CvDownloadLink.tsx     (lien <a download>, icône Download)
src/sections/Hero.tsx                    (ajout du lien)
src/sections/Contact.tsx                 (ajout du lien dans « Contact direct »)
public/cv/.gitkeep                       (+ règle .gitignore public/cv/*.pdf)
package.json                             (scripts cv / prebuild / predev ; devDeps @react-pdf/renderer, tsx, pdf-lib pour le comptage de pages)
```
`tsconfig` : les scripts importent `src/content/*.ts` — s'assurer qu'ils se compilent hors Vite (pas d'`import.meta.env` dans les fichiers de contenu ; si `site.ts` en a un, le sortir).

## 6. Consignes d'autonomie pour Claude Code
- **Modèle pur d'abord, tests verts, puis rendu.** Même ordre que `compute.ts` en Phase 2.
- **Ne rien dupliquer** : si une donnée manque pour le CV, l'ajouter à son fichier source avec le marqueur `[DETTE-xx]`, pas dans `cv.ts`.
- Ne pas installer Puppeteer/Playwright pour ce rendu : on refuse de télécharger un Chromium dans le workflow Pages pour un fichier d'une page. Si `@react-pdf/renderer` s'avère inutilisable (polices, glyphes), **s'arrêter et documenter** au lieu de basculer seul sur un moteur navigateur.
- Ne pas toucher au rendu Premium Tech du site au-delà des deux liens. Aucune nouvelle chaîne en dur dans `Hero.tsx`/`Contact.tsx` (T8).
- Ne pas committer le PDF. Ne pas régénérer le PDF dans un `useEffect` ou au clic « pour être sûr qu'il est à jour » : il l'est par construction.
- Mesurer et noter dans le journal : poids du PDF, durée de `npm run cv`, delta de durée du build.

## 7. Critères de validation
1. `npm run cv` produit `public/cv/cv-xavier-bou.pdf` ; `pdf-lib` (ou `pdfinfo`) confirme **1 page**, A4 ; poids ≤ 200 Ko ; texte sélectionnable ; métadonnées présentes.
2. **Test de non-divergence** : modifier temporairement `hero.subtitle` et un `milestone.title` dans le contenu, relancer `npm run cv`, retrouver les deux chaînes dans le texte extrait du PDF (`pdf-parse` ou `pdftotext`), puis annuler la modification. Joindre les deux extraits au journal.
3. Aucune métrique `verified:false` dans le texte extrait ; aucune occurrence de `emailSecondary`, du tarif, ni de « LinkedIn » tant que le lien est vide.
4. `buildCvModel.test.ts` vert ; suite existante verte (≥ 53 tests) ; `lint`/`build` verts ; `npm run build` échoue de façon lisible si l'on force un débordement (test manuel : dupliquer temporairement les 6 projets → build rouge avec message → annuler).
5. À l'écran (`vite preview`, 375 px et 1280 px) : lien visible dans le Hero et dans Contact, clic → téléchargement du PDF (pas d'ouverture dans un onglet si `download` est honoré, ouverture sinon — les deux sont acceptables), aucune erreur console.
6. `?perf=lite` : les deux liens fonctionnent, aucun nouveau `backdrop-filter`/glow introduit (`getComputedStyle` sur le lien).
7. Déploiement : `https://xab-dev.github.io/portfolio-v2/cv/cv-xavier-bou.pdf` répond 200 après le push ; Lighthouse mobile inchangé par rapport à la Phase 6b (le lien ne pèse rien).
8. **[ARRÊT XAV]** : relecture du PDF imprimé (ou aperçu impression N&B) — lisibilité, hiérarchie, rien de gênant à montrer à un recruteur. Et réponse à **D6** si elle n'a pas été donnée avant la phase.

## 8. Hors scope
Version anglaise du CV. Génération à la demande / personnalisation par visiteur. Photo. Lettre de motivation. Indexation/robots du PDF (Phase 7, DETTE-33). Page « Mentions légales » (Phase 7). Toute modification du contenu source.

---

## Patches à reporter

### `00_ROADMAP.md`
- Version → `0.7.0`, en-tête : ajouter `puis le 2026-09-16 11:10 (Phase 8 ajoutée — spec 09, D6, DETTE-32/33)`.
- Tableau « Décisions à confirmer par Xav » : nouvelle ligne
  `| D6 | Le CV PDF n'affiche que la trajectoire 2026 (conséquence de DETTE-17). Accepter tel quel, ou ajouter dans \`timeline.ts\` des jalons antérieurs (formation, expériences) — qui apparaîtront **aussi** sur la frise du site, par construction ? | **Défaut : tel quel.** Le CV est cohérent avec le site ; un recruteur qui veut le parcours complet le demande par mail. Requis avant l'ARRÊT XAV §7.8 seulement. |`
- Esquisse des phases : ajouter après la Phase 7 : `- **Phase 8 — Export CV classique** (\`09_export-cv-pdf.md\`) : PDF A4 une page généré à la build depuis \`src/content/*.ts\` (\`npm run cv\`, \`prebuild\`), servi depuis \`dist/cv/\`, lien \`download\` dans le Hero et Contact. Aucune génération côté client.`
- Ordre conseillé : `0 → 4 → 5 → 1 → 6 → 6b → 2 → 3 → 8 → 7` — la Phase 8 passe **avant** la 7 pour que l'audit final (SEO, robots, Lighthouse) couvre aussi le PDF.

### `process/dette_suivi.md`
- §C, deux lignes :
  `☐ **[DETTE-32]** CV PDF limité à la trajectoire 2026 (DETTE-17 propagée) ; peut paraître mince hors contexte du site. Décision D6. | Phase 8`
  `☐ **[DETTE-33]** PDF contenant mail + téléphone (déjà publics sur le site) indexable par les moteurs sans en-tête \`noindex\` (GitHub Pages ne permet pas d'en-têtes) ; trancher \`robots.txt\` \`Disallow: /portfolio-v2/cv/\` ou assumer. | Phase 7`
- §D : `- 2026-09-16 11:10 — Phase 8 spécifiée (spec 09) ; D6 posée ; DETTE-32/33 ouvertes. ROADMAP v0.7.0.`

### Prompt de lancement (à coller dans Claude Code)
> Lis `specs/00_ROADMAP.md` en entier (v0.7.0) puis `specs/09_export-cv-pdf.md` et exécute la Phase 8. Commence par `scripts/cv/buildCvModel.ts` et ses tests (§5, §6), puis le rendu `@react-pdf/renderer` ; vérifie à l'init l'enregistrement des polices `.woff` de `@fontsource` et note l'issue dans le journal. Le contrôle « exactement 1 page » doit faire échouer le build (§3). Produis les preuves des critères §7.1 à §7.4 (comptage de pages, extraits de texte du test de non-divergence, sortie du build forcé en débordement). Vérifie les deux liens à 375 px et 1280 px et sous `?perf=lite`. Arrête-toi à l'ARRÊT XAV §7.8 et fais-moi un compte-rendu selon le format de fin de session, en listant les marqueurs `[DETTE-xx]` qui apparaissent dans le PDF.
