# Portfolio v2 — SPEC : Polish, SEO, mentions légales (Phase 7)

**Créée le 2026-09-16** à partir des décisions de Xav (session du 16/09, 00:50-01:30). Format : Module Standard. Clôt **DETTE-31**, la ligne §C « Pas de SEO/OG/sitemap » et la ligne §B DETTE-22 (page Mentions légales). Toutes les décisions ci-dessous sont **tranchées par Xav** : ne pas les rouvrir, ne pas proposer d'alternative.

**Contexte déjà disponible pour Claude Code** : `specs/00_ROADMAP.md` (T5, T8, T10, contraintes de méthode), `index.html` (script inline `data-perf`), `src/content/site.ts`, `src/components/layout/Footer.tsx`, le deep-link `#projets/<id>` de la Phase 4 (patron pour `#mentions-legales`), `src/content/references.ts`, `src/content/simulator.ts`, `src/lib/simulator/compute.ts` + tests, `src/components/simulator/EvidenceBadge.tsx`, `PortalTooltip` (Phase 3), `src/components/playground/PromptPane.tsx`, `scripts/process-images.js` (patron pour le script OG), `JOURNAL_DEV.md` Phase 0 (script Puppeteer d'audit + `emulateMediaFeatures`).

## 1. Rôle du module

Rendre le site **légalement conforme** (LCEN + RGPD) et **partageable proprement** (OG, canonical, sitemap, JSON-LD), résorber la dette de références du Simulateur, et corriger deux points de polish (Playground, reduced-motion). Aucun changement de design, d'animation ni de contenu éditorial hors de ce qui est listé ici : **design et animations sont figés** (patch 23:00).

Le site reste en `noindex` jusqu'au polish final (décision Xav) : tout le SEO est livré et testé, mais une seule constante le désactive pour les moteurs.

## 2. Entrées / Sorties

### `src/content/site.ts` — champs ajoutés (T8 : aucun texte légal en dur dans un composant)

```ts
legal: {
  status: "Entrepreneur individuel (EI)",   // remplace "Auto-entrepreneur" — mention EI obligatoire (loi 2022-172)
  siret: "944 670 066 00017",
  vat: "TVA non applicable, art. 293 B du CGI",
  address: "[À COMPLÉTER — Xav] rue, code postal, Tarascon",  // domicile complet, décision Xav (LCEN art. 6-III-1)
  publisher: "Xavier Joseph Bou",             // directeur de la publication
  host: {
    name: "GitHub, Inc.",
    address: "88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
    phone: "[À VÉRIFIER] — relever sur la page légale de GitHub, ne pas écrire de mémoire",
    url: "https://pages.github.com/",
  },
  dataRetentionMonths: 12,
  lastUpdated: "2026-09-16",
},
seo: {
  siteUrl: "https://xab-dev.github.io/portfolio-v2/",  // seule valeur à changer le jour du domaine perso
  indexable: false,                                    // noindex jusqu'au polish final (décision Xav)
  ogImage: "og.png",                                   // généré par `npm run og`, 1200×630
  locale: "fr_FR",
},
```

### `src/content/legal.ts` — nouveau fichier, contenu complet de la page

Sections, dans cet ordre, en français, phrases courtes, aucune formule creuse. Le texte cite les valeurs de `site.legal` / `site.contact` (jamais recopiées en dur).

1. **Éditeur du site** — nom + « EI », adresse, téléphone, mail principal, SIRET, TVA, directeur de la publication.
2. **Hébergement** — `site.legal.host` (nom, adresse, téléphone, URL). Une phrase : l'hébergeur traite l'adresse IP des visiteurs dans ses journaux techniques (finalité sécurité).
3. **Données personnelles (formulaire de contact)** :
   - Responsable de traitement : l'éditeur (identité ci-dessus).
   - Données collectées : nom, e-mail, message, type de projet, budget, délai (les champs réels de `contact.ts` — vérifier la liste).
   - Finalité : répondre à la demande et, le cas échéant, établir un devis.
   - Base légale : mesures précontractuelles prises à la demande de la personne (art. 6.1.b RGPD).
   - Sous-traitant : Formspree, Inc. (États-Unis), qui héberge les soumissions sur des serveurs situés aux États-Unis ; transfert hors UE encadré par les clauses contractuelles types de la Commission européenne.
   - Durée de conservation : `site.legal.dataRetentionMonths` mois après le dernier échange sans suite ; suppression aussi dans le tableau de bord Formspree.
   - Droits : accès, rectification, effacement, opposition, limitation, portabilité — par mail à `site.contact.emailPrimary` ; droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
4. **Cookies et stockage local** — le site ne dépose aucun cookie ni traceur ; il utilise uniquement le `sessionStorage` du navigateur pour deux réglages techniques (`perf`, `simulator`) effacés à la fermeture de l'onglet, exemptés de consentement (art. 82 loi Informatique et Libertés). Polices auto-hébergées, aucun appel à un service tiers hors Formspree (à l'envoi du formulaire uniquement) et la page du jeu haTD (même origine).
5. **Propriété intellectuelle** — contenus et code de l'éditeur ; le code source est public sur GitHub (lien `site.links.github`), sous la licence du dépôt (si aucune licence n'est présente dans le repo : écrire « tous droits réservés » et **ne pas** ajouter de licence, c'est une décision de Xav).
6. **Dernière mise à jour** — `site.legal.lastUpdated`.

### `src/content/references.ts` — valeurs vérifiées par l'architecte le 2026-09-16 (recopier, ne pas re-chercher)

```ts
{ id: "brynjolfsson2023", authors: "Brynjolfsson, Li & Raymond", title: "Generative AI at Work",
  venue: "The Quarterly Journal of Economics, 140(2), 889–942 (2025) — NBER Working Paper 31161 (2023)",
  year: 2025, url: "https://doi.org/10.1093/qje/qjae044", verified: true },
{ id: "noy2023", authors: "Noy & Zhang",
  title: "Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence",
  venue: "Science, 381(6654), 187–192 (2023)",
  year: 2023, url: "https://doi.org/10.1126/science.adh2586", verified: true },
{ id: "dellacqua2023", authors: "Dell'Acqua et al.",
  title: "Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of Artificial Intelligence on Knowledge Worker Productivity and Quality",
  venue: "Organization Science, 37(2), 403–423 (2026) — HBS Working Paper 24-013 (2023)",
  year: 2026, url: "https://doi.org/10.1287/orsc.2025.21838", verified: true },
```

L'entrée `idp-vendors-2025` est **supprimée** (décision Xav : source éditeurs invérifiable). **Amendement explicite de la spec 03 §6** : la liste passe de 4 à 3 références ; la règle « aucune référence non listée » reste.

### `src/content/simulator.ts` — `saisie` devient qualitative

- `saisie` : retirer `timeSavedPct` et `baseline` ; `evidence.level = "aucune"` ; ajouter `qualitativeNote` (même mécanisme que `tri`) : « Les éditeurs de solutions annoncent des gains importants sur le traitement documentaire, mais aucune étude indépendante ne les mesure sur une semaine de travail réelle. On en parle sur votre cas. »
- `EVIDENCE_BADGE_LABEL.editeur` peut rester dans le type (aucune donnée ne l'utilise plus) — ne pas le supprimer, ne pas le coder en dur ailleurs.

### `EvidenceBadge` — lien dans le badge

Le badge devient un déclencheur (`<button>`, `aria-haspopup`) qui ouvre un `PortalTooltip` (Phase 3, même règles de focus/tap) contenant : `evidence.summary` + la ou les références liées (`authors` — `title`, lien externe `url`, `target="_blank" rel="noreferrer"`). Niveau `aucune` : summary seul, pas de lien. Le `title` natif disparaît (doublon).

### Fichiers SEO générés

- `public/robots.txt` : `User-agent: *` / `Allow: /` / `Sitemap: <siteUrl>sitemap.xml`. Le `noindex` se fait par **meta**, pas par `Disallow` (un `Disallow` empêcherait aussi de lire le `noindex`).
- `public/sitemap.xml` : une seule `<url>` = `siteUrl` (site monopage à ancres ; `#mentions-legales` n'est pas une URL distincte, c'est normal). `<lastmod>` = date de build.
- `public/og.png` : produit par `npm run og` (nouveau `scripts/build-og.js`, `sharp` déjà présent) : fond `#0B0F19`, `avatar.webp` à gauche (cercle, ~360 px), à droite `site.name` (Space Grotesk, blanc) et `site.title` (Inter, `text-muted`), un seul filet néon bleu, rien d'autre. 1200×630, PNG ≤ 150 Ko. **Sobre** : pas de glow, pas de dégradé animé — c'est un placeholder jusqu'au « skin » perso post-V1. Commiter le PNG (GitHub Actions n'exécute pas `npm run og`).

### `index.html` / `<head>` — balises

Rendues **statiquement dans `index.html`** (les crawlers et les aperçus de lien ne lisent pas le DOM React). Générer les valeurs depuis `site.ts` via un petit plugin Vite `transformIndexHtml` (ou un script de pré-build) plutôt que de les dupliquer à la main — T8.

- `<link rel="canonical" href={siteUrl}>`
- `<meta name="robots" content="noindex, nofollow">` **si et seulement si** `site.seo.indexable === false` ; sinon la balise est absente.
- OG : `og:type=profile`, `og:locale=fr_FR`, `og:site_name`, `og:title` (= `<title>`), `og:description` (= meta description existante), `og:url` (= canonical), `og:image` (URL absolue), `og:image:width/height`, `og:image:alt`.
- Twitter : `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- `<meta name="theme-color" content="#0B0F19">`
- JSON-LD `Person` (`<script type="application/ld+json">`) — contenu **tranché par Xav**, tout y est volontairement :
  ```json
  { "@context": "https://schema.org", "@type": "Person",
    "name": "Xavier Joseph Bou", "alternateName": "Xav",
    "jobTitle": "Consultant outils et solutions IA",
    "url": "<siteUrl>", "image": "<siteUrl>images/avatar.webp",
    "email": "mailto:xa.bou@laposte.net", "telephone": "+33769547494",
    "address": { "@type": "PostalAddress", "addressLocality": "Tarascon", "addressRegion": "Provence-Alpes-Côte d'Azur", "addressCountry": "FR" },
    "sameAs": ["https://github.com/xab-dev/portfolio-v2", "https://www.youtube.com/@1_Autre_Monde"] }
  ```
  `sameAs` lit `site.links` et **omet** LinkedIn tant que la valeur est vide (DETTE-04). Pas de `PostalAddress.streetAddress` dans le JSON-LD (la rue est sur la page Mentions légales, pas dans les données structurées).

## 3. Comportement attendu

### Page Mentions légales (`#mentions-legales`)

- Vue **pleine page** dédiée, même mécanisme que le deep-link `#projets/<id>` : l'URL `…/#mentions-legales` ouvre la page directement (rechargement compris), `history.back()` et Échap ramènent à la page principale à la position de scroll précédente.
- Quand la vue est active : la nav principale est **masquée**, un en-tête minimal (titre « Mentions légales » + bouton « ← Retour au site ») la remplace, le footer reste. Scroll en haut à l'ouverture, `document.title` = « Mentions légales — Xavier Joseph Bou », focus posé sur le `<h1>`.
- Lien « Mentions légales » dans le footer, à côté de la ligne SIRET, visible sur toutes les vues.
- Rendu texte simple : `GlassCard` unique, typographie du site, `max-w-3xl`, aucune animation d'entrée autre que le fondu standard de `SectionShell`. Lisible en `?perf=lite` et en reduced-motion sans traitement particulier.
- La ligne du footer devient : `{site.legal.status} · SIRET {site.legal.siret} · Mentions légales`.

### Simulateur

- `saisie` s'affiche comme `tri` (carte sélectionnable, `qualitativeNote`, aucun compteur). La formule affichée et le total excluent `saisie` — comportement déjà couvert par « problématique non chiffrée exclue » dans `compute.test.ts` ; mettre à jour les fixtures et ajouter un test qui **nomme** `saisie` comme non chiffrée.
- Le pré-remplissage Contact via `sessionStorage['simulator']` ne change pas (`saisie` reste une sélection valide).

### Playground — longues lignes

- Dans `PromptPane` / `CodeLines` : `white-space: pre-wrap` + `overflow-wrap: anywhere`, plus aucun défilement horizontal, à toutes les largeurs. Les numéros de ligne restent alignés sur le **premier** rendu de chaque ligne logique (une ligne longue enroulée = un seul numéro). La hauteur max + scroll vertical interne (spec 04 §4) reste.
- Cause racine à identifier avant patch : trouver la règle exacte (`white-space: pre` ? `min-width` d'un enfant `flex` ?) qui produit le débordement, la noter au journal.

### Audit `prefers-reduced-motion`

- Réutiliser le script Puppeteer de la Phase 0 avec `page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])`, à 375 px et 1280 px, sur **toutes** les sections livrées depuis (Hero/agent, Simulateur, Playground, Portfolio + modale, Skills radar/badges, Timeline, Contact stepper, Jouer, et la nouvelle page Mentions légales).
- Attendu : compteurs instantanés, `TypingText` d'un coup, scanner remplacé par une bascule, frise sans `scaleY` animé, radar sans `isAnimationActive`, aucune `transform`/`opacity` transitionnée > 150 ms (vérifier par `getAnimations()` sur chaque section : liste vide ou durées ≤ 150 ms). Chaque écart est un bug à corriger à la cause dans le composant concerné (hook `useReducedMotionSafe`), pas par une règle CSS globale `* { animation: none }`.
- Le test manuel sur appareil n'est **pas** demandé par Xav pour cette phase.

### Lighthouse

- Mesure locale (`vite preview`, mobile, throttling par défaut) avant push : Performance ≥ 90, Accessibilité 100, Bonnes pratiques 100. **SEO : attendu < 100 tant que `indexable: false`** (Lighthouse pénalise `noindex`) — c'est voulu, ne pas « corriger », le noter au journal. Vérifier que le seul audit SEO en échec est bien `is-crawlable`.
- Xav reconfirme sur le déploiement avec PageSpeed Insights (hors agent).

## 4. Edge cases à gérer

- `#mentions-legales` + `#projets/<id>` dans la même session : un seul routeur de hash ; la page légale a priorité, la modale projet ne s'ouvre pas par-dessus.
- Adresse encore marquée `[À COMPLÉTER — Xav]` au moment du build : le build **échoue** (test Vitest sur `site.legal` : aucun champ ne contient `[À`), pour empêcher un déploiement avec un placeholder légal. Idem pour `host.phone` `[À VÉRIFIER]`.
- `site.seo.indexable` basculé à `true` : la meta robots disparaît, rien d'autre ne change — vérifier par un build de test des deux valeurs.
- `og.png` absent (script non lancé) : le build **échoue** avec un message clair (`npm run og` à lancer), pas de balise OG cassée.
- Référence sans `url` (cas futur) : le tooltip affiche la citation sans lien, pas de lien vide.
- `PortalTooltip` sur le badge en mode `lite` et en reduced-motion : ouverture instantanée, même comportement qu'en Phase 3.
- JSON-LD : échapper correctement l'apostrophe et les accents (`JSON.stringify`, pas de concaténation manuelle).
- Aperçu de lien : les scrapers (LinkedIn, WhatsApp, Discord) lisent l'URL `og:image` **absolue** — pas de chemin relatif ni de `base` Vite non résolu.

## 5. Structure des fichiers
```
src/content/site.ts                     (legal + seo étendus)
src/content/legal.ts                    (texte de la page, sections typées)
src/content/legal.test.ts               (aucun placeholder [À …], toutes les sections présentes)
src/content/references.ts               (3 références vérifiées, url + verified: true)
src/content/simulator.ts                (saisie qualitative)
src/lib/simulator/compute.test.ts       (fixtures + test « saisie non chiffrée »)
src/lib/router/hashRoute.ts             (extension du deep-link Phase 4 : `mentions-legales`)
src/sections/LegalPage.tsx              (vue pleine page)
src/components/layout/Footer.tsx        (lien Mentions légales)
src/components/simulator/EvidenceBadge.tsx (bouton + PortalTooltip + liens)
src/components/playground/PromptPane.tsx (pre-wrap / overflow-wrap)
scripts/build-og.js                     (npm run og → public/og.png)
scripts/audit-reduced-motion.js         (Puppeteer, emulateMediaFeatures, getAnimations)
vite.config.ts                          (plugin transformIndexHtml : canonical, robots, OG, Twitter, JSON-LD depuis site.ts)
index.html                              (balises statiques injectées)
public/robots.txt · public/sitemap.xml · public/og.png
package.json                            (script `og`, version → 0.7.0 — la version n'a jamais été montée depuis 0.1.0)
```

## 6. Consignes d'autonomie pour Claude Code

- **Ne pas inventer de texte légal** au-delà de §2 : si une mention semble manquer, la signaler au journal comme question pour Xav, ne pas l'ajouter.
- **Ne pas rechercher les références** : les valeurs de §2 sont vérifiées, les recopier telles quelles.
- Aucun changement de design, d'animation, de palette, de contenu des autres sections (patch 23:00 : figés). Le Playground ne change que son comportement d'enroulement.
- Pas de bannière cookies, pas de script d'analytics, pas de Google Fonts — le site n'en a pas besoin et Xav a écarté la mesure d'audience.
- Cause racine avant patch (Playground, écarts reduced-motion).
- Vérification visuelle réelle à 375 px (ou la largeur minimale atteignable par l'outil, à noter) et 1280 px, `?perf=full` et `?perf=lite`, pour : page Mentions légales, badge Simulateur ouvert, Playground cas `long`.
- Tester les aperçus OG **sans réseau externe** : ouvrir `dist/index.html` et vérifier les balises par `document.head` ; l'aperçu réel sur LinkedIn/WhatsApp est fait par Xav après déploiement.
- `dette_suivi.md` : ajouter, ne jamais supprimer.

## 7. Critères de validation

1. `…/#mentions-legales` ouvre la page pleine, y compris au rechargement ; retour navigateur et Échap reviennent à la page principale ; lien présent dans le footer ; toutes les sections de §2 affichées avec les valeurs de `site.ts`.
2. Build refusé si un placeholder `[À` subsiste dans `site.legal` (test vert avec l'adresse renseignée, rouge sans).
3. `dist/index.html` contient canonical, meta robots `noindex, nofollow`, OG/Twitter complets avec `og:image` absolue, `theme-color`, JSON-LD `Person` valide (vérifier avec `JSON.parse` et, si l'outil est disponible, le validateur schema.org hors ligne) ; `robots.txt` et `sitemap.xml` servis ; `og.png` 1200×630 ≤ 150 Ko, commité.
4. Simulateur : 3 références `verified: true` avec DOI cliquable dans le badge (tooltip ouvert au survol **et** au tap) ; `saisie` sans compteur, exclue de la formule ; tests verts (`compute`, `references`).
5. Playground, cas `long`, à 375 px et 1280 px : aucun `scrollWidth > clientWidth` mesuré sur les panneaux ; numéros de ligne alignés.
6. Audit reduced-motion : rapport joint au journal (section par section, largeur par largeur), `getAnimations()` conforme à §3 partout, écarts corrigés à la cause.
7. Lighthouse local : Performance ≥ 90, Accessibilité 100, Bonnes pratiques 100 ; SEO : seul `is-crawlable` en échec.
8. `npm run build` / `lint` / `test` verts ; suite existante intacte.
9. **[ARRÊT XAV]** avant push : Xav renseigne l'adresse et le téléphone GitHub (ou valide ceux trouvés), relit la page Mentions légales à l'écran, puis donne le go. Après déploiement, Xav vérifie l'aperçu de lien (WhatsApp ou LinkedIn) et PageSpeed Insights.

## 8. Hors scope

Basculer `indexable` à `true` (polish final, avant la version anglaise). Image OG définitive / « skin » perso (post-V1). Domaine personnalisé (statu quo). DETTE-32 (Xav, à la main). Optimisation du mode complet notée en Phase 6b : **uniquement** si Lighthouse Performance passe sous 90, sinon reportée. Registre des traitements CNIL (document hors repo, rédigé avec l'architecte). Test reduced-motion sur appareil réel. Export CV (Phase 8), FAQ (Phase 9), anglais (Phase 10).

---

## Patches à reporter

### `00_ROADMAP.md`
- Version → `0.9.0`, ajouter à l'historique : « le 2026-09-16 (spec 09 Phase 7 écrite, décisions Xav du 16/09) ».
- Statut : `V1 fonctionnelle complète et validée par Xav. Phase courante : **7** (spec 09).`
- Phase 7 dans l'esquisse : remplacer « (spec à écrire — Module Standard) » par « (\`09_polish-seo-mentions-legales.md\`) » et ajouter en fin : « Décisions du 16/09 : domicile complet publié, TVA art. 293 B, vue \`#mentions-legales\` pleine page, JSON-LD complet (mail + téléphone inclus), OG générée par script sharp, \`noindex\` jusqu'au polish final, 4ᵉ référence retirée / \`saisie\` non chiffrée, liens de références dans le badge, Playground en retour à la ligne, audit reduced-motion par émulation seule, DETTE-32 traitée à la main par Xav. »
- Ligne « Phase 0 — … Phase à exécuter maintenant » : `Phase 7 (09_polish-seo-mentions-legales.md)`.

### `dette_suivi.md`
- §B DETTE-22 : ajouter « Page Mentions légales livrée en Phase 7 (spec 09) ; statut affiché "Entrepreneur individuel (EI)" ; adresse et TVA (293 B) ajoutées. »
- §C « Pas de SEO/OG/sitemap en Phases 0-6 » → ☑ « livré Phase 7 ; \`noindex\` volontaire jusqu'au polish final (\`site.seo.indexable\`) ».
- §C DETTE-31 → ☑ « 3 références vérifiées par l'architecte le 2026-09-16 (DOI QJE 10.1093/qje/qjae044, Science 10.1126/science.adh2586, Organization Science 10.1287/orsc.2025.21838) ; référence éditeurs IDP retirée, \`saisie\` passée en non chiffrée (décision Xav). »
- §C nouvelle ligne : `☐ **[DETTE-33]** Basculer \`site.seo.indexable\` à \`true\` et retirer la meta robots au polish final (avant la Phase 10). | Polish final`
- §C nouvelle ligne : `☐ **[DETTE-34]** Registre des traitements (modèle simplifié CNIL) à rédiger hors repo — formulaire de contact / Formspree. | Hors repo, Xav + architecte`
- §D : ligne datée 2026-09-16 « spec 09 écrite, décisions Xav (voir ROADMAP) ».

### Prompt de lancement (à coller dans Claude Code)
> Lis `specs/00_ROADMAP.md` en entier puis `specs/09_polish-seo-mentions-legales.md` et exécute la Phase 7. Toutes les décisions y sont tranchées : ne propose pas d'alternative, n'invente aucun texte légal ni aucune référence (les valeurs sont dans §2). Commence par les contenus (`site.ts`, `legal.ts`, `references.ts`, `simulator.ts`) et leurs tests, puis la page `#mentions-legales`, puis le SEO/OG, puis le badge, le Playground et l'audit reduced-motion (§3). Les deux placeholders `[À COMPLÉTER — Xav]` / `[À VÉRIFIER]` de `site.legal` doivent faire échouer le build tant qu'ils sont là (§4). Arrête-toi à l'ARRÊT XAV §7.9, sans committer, avec un compte-rendu au format de fin de session et la liste exacte des deux valeurs que j'ai à fournir.
