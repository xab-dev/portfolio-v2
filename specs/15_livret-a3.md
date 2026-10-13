---
projet: portfolio-v2
episode/session: Phase 9f — Livret A3 (spec 15)
type: spec
version: 1.0.0
statut: validée par Xav le 2026-10-13 (P1 à P4 tels quels) — en exécution
catégorie: Spec
date: 2026-10-13
genere_par: claude
verifie_par: xav
---

# Portfolio v2 — SPEC : livret A3, quatre pages (Phase 9f)

> **Résumé** — Un CV à imprimer chez un imprimeur : une feuille A3 pliée en deux, soit quatre pages A4. Page 1, une couverture sobre ; pages 2 et 3, le CV deux pages actuel, à l'identique ; page 4, l'Atelier IA développé, les autres offres et le contact avec un QR code. Deux fichiers : les quatre pages dans l'ordre de lecture, et la feuille A3 déjà imposée. Le livret n'est jamais publié sur le site ; le CV deux pages du site ne change pas.

---

## 1. Rôle du module

Donner à Xav un document papier qui se tient seul : on le reçoit plié, on découvre la couverture, on ouvre sur le CV en double page, on referme sur ce qu'il propose et comment le joindre. Il développe l'**activité formation** : l'Atelier IA, qui « regroupe et partage » ce que Xav a appris par lui-même (la branche « Transmettre, former, coacher » de La suite).

## 2. Décisions

### Tranchées par Xav (2026-10-13)

- **D1** — Format : une feuille A3 pliée en deux, quatre pages A4, imprimée chez un imprimeur.
- **D2** — Le CV deux pages du site reste tel quel ; le livret s'ajoute, il ne le remplace pas (décision à revoir par Xav après relecture).
- **D3** — Couverture sobre, fond blanc : le logo TO en grand, le nom, le titre, la phrase du Hero, le lieu. Pas de photo (préférence constante de Xav).
- **D4** — Quatrième de couverture : l'Atelier IA développé, puis les trois autres offres en une ligne chacune, le premier échange gratuit, le contact.
- **D5** — Pages 2 et 3 : le CV deux pages à l'identique, rendu par le même code (une seule mise en page à entretenir).
- **D6** — Un QR code vers le site en page 4.
- **D7** — Les tarifs sont ceux de `offres.md` (base de Xav, validée le 2026-10-13), déjà publics sur le site depuis 0.17.0.

### Proposées par l'agent, validées par Xav (2026-10-13)

- **P1** — Les compteurs « 1 / 2 » et « 2 / 2 » des pages du CV sont retirés dans le livret (ils deviennent faux en pages 2 et 3). Seul écart avec D5, par une option du gabarit ; le CV du site les garde.
- **P2** — Une phrase relie l'Atelier à son parcours, sous le titre de la page 4. Proposition : « Ce que j'y transmets, je l'ai appris en construisant mes propres outils avec l'IA : ce site, RPG-v2, ma base privée. » À remplacer par la phrase de Xav s'il le souhaite.
- **P3** — Pas de mention de TVA sur le livret, comme sur le site.
- **P4** — Le QR code mène à l'accueil du site (`https://xab-dev.github.io/portfolio-v2/`), pas directement au formulaire.

## 3. Interdits (en plus de T6, T7, T8)

- Rien d'inventé : chaque phrase de la page 4 vient de `offres.md` ou de P2 validée.
- Rien de la base privée au-delà des offres (pas de « Sa preuve », pas des remarques de Claude, pas de « pilote »).
- Le livret ne va jamais dans `public/` ni dans `dist/`.
- Aucun texte sous 8 pt (règle de la spec 13).

## 4. Contenu — une seule source pour le site et le livret (T8)

Nouveau fichier `src/content/offers.ts` : les quatre offres (nom, pour qui, durée, prix, phrase d'accroche, déroulé, livrable, limites), recopiées de `offres.md` sans les parties privées. `contact.ts` lit ses tarifs dans ce fichier (`offerPricing` devient dérivé) : **le site doit rester identique au pixel** (vérifié par capture avant / après).

Page 4, dans l'ordre :

1. **Titre** : « Ce que je propose », puis P2.
2. **Atelier IA · 2 h** : sa phrase d'accroche (« Offres, modèles, limites d'utilisation, spécialités : il y a de quoi s'y perdre… ») ; pour qui (de 1 à 8 personnes : indépendants, associations, curieux) ; le déroulé (20 min ce qu'est une IA et comment choisir, 60 min trois exercices tirés du métier des participants, 20 min les règles de prudence, 20 min les questions) ; le livrable (un support imprimé) ; le prix (70 € pour une personne seule, 150 à 250 € pour un groupe) ; les trois limites, en petit.
3. **Les autres offres**, une ligne chacune : Bilan PC et IA, 2 h (70 € particulier ; 150 à 299 € TPE) · Une tâche automatisée (sur devis, à partir de 300 €) · Coaching, séances d'une heure (première séance gratuite, puis 35 € la séance).
4. « Le premier échange de 30 minutes est gratuit. »
5. **Contact** : mail, téléphone, site, QR code ; en pied, la ligne « Entrepreneur individuel (EI) · SIRET » du CV.

## 5. Sorties

- `npm run cv:livret` → `out/livret/` (gitignoré, comme le condensé) :
  - `cv-xavier-bou-livret-a4.pdf` : 4 pages A4 portrait, ordre de lecture 1, 2, 3, 4 — le fichier que la plupart des imprimeurs demandent (ils imposent eux-mêmes).
  - `cv-xavier-bou-livret-a3.pdf` : 2 pages A3 paysage (420 × 297 mm) ; recto = page 4 à gauche, page 1 à droite ; verso = page 2 à gauche, page 3 à droite. À imprimer en recto-verso, **retournement sur le bord court**.
- Assemblage par `pdf-lib` (déjà dans le projet) : couverture et page 4 rendues par un nouveau gabarit react-pdf, pages 2 et 3 par `CvMapDocument` (option `hidePageCounters`, P1), puis fusion et imposition. Logo par `renderLogoPng` en encre sombre ; QR code par `qrcode` (1.5.4, MIT, version figée) en PNG.

## 6. Contrôles qui font échouer la commande

- Nombre de pages : 4 (A4) et 2 (A3) ; dimensions des pages vérifiées.
- `checkPdfLayout` sur les pages 1 et 4 : pas de chevauchement, marges ≥ 10 mm (le pli et la coupe de l'imprimeur).
- Ordre d'imposition : test unitaire de la fonction pure (page → position).
- Prix : un test vérifie que le site et le livret lisent les mêmes valeurs (`offers.ts`).
- Le QR code se décode vers l'URL de P4 (test, si une lib de lecture est déjà disponible ; sinon, vérification au téléphone par Xav, ARRÊT XAV final).

## 7. Risques connus

- L'imprimeur peut demander un fond perdu ou des traits de coupe : inutiles sur fond blanc, mais à confirmer avec lui ; le fichier A4 page à page reste la valeur sûre.
- Le pli au milieu : les pages 2 et 3 gardent leurs 14 mm de marge, rien ne tombe dans la pliure.
- Les chiffres datés du CV (commits au 01/10, base au 11/10) vieillissent sur le papier comme sur le site.

## 8. Phases d'exécution

- **A** — `offers.ts`, `contact.ts` dérivé, tests ; captures avant / après du formulaire (site identique).
- **B** — Gabarit couverture + page 4, QR code ; rendu en image, relu par l'agent.
- **C** — Assemblage A4, imposition A3, commande `cv:livret`, contrôles du §6.
- **D** — Rendu des deux PDF en image, vérification visuelle, journal, dette, ROADMAP **0.17.0 → 0.18.0**. **ARRÊT XAV** : impression d'essai (A4 recto-verso chez lui ou BAT de l'imprimeur), QR code scanné au téléphone, puis go.

Un commit par étape dans le dépôt privé.

## 9. Hors scope

- Le choix du papier et de la finition (à voir avec l'imprimeur ; un 120 à 170 g/m² se plie bien).
- Une version anglaise (Phase 10).
- Remplacer le CV du site par le livret (D2, plus tard si Xav le décide).
