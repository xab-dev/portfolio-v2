# Portfolio v2 — SPEC : Formulaire de contact "smart" + section Jouer (Phase 6)

**Révision 2026-09-15 12:45** — D4/DETTE-18 tranché (fourchettes validées), DETTE-25 tranché (formulation souple), dépendance à la Phase 2 explicitée (§3, §7), deux tâches annexes intégrées au scope de cette phase (§3 bis).

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T5, T12, D3, D4, D5), `Tag`, `NeonButton`, `GlassCard`, `Modal`. haTD déployé dans un **autre repo** à `https://xab-dev.github.io/cv-portfolio/haTD_V1/` — même origine `xab-dev.github.io`, jamais modifié depuis ce projet.

**Attention à l'ordre des phases** : la Phase 2 (Stack Simulator), qui pose `sessionStorage['simulator']`, n'est **pas encore livrée**. Cette phase doit donc être construite en supposant la clé absente, et rester correcte quand elle apparaîtra plus tard (voir §3 et §7.2).

## 1. Rôle du module
Deux clôtures : (a) permettre à un prospect de qualifier son besoin en 3 clics avant d'écrire, pour que le premier échange soit déjà cadré ; (b) faire jouer le visiteur au jeu de Xav — la preuve la plus concrète qu'il livre des choses qui tournent.

## 2. Entrées / Sorties

### Contact (`src/content/contact.ts`)
```ts
export const projectTypes = ['Diagnostic / cadrage IA', 'Automatisation d’un process', 'Outil sur mesure', 'Formation équipe (4D)', 'Intervention IT / maintenance', 'Créer un site (vitrine ou comme celui-ci)', 'Autre'];
// Patch 9b (17/09) : encart de repères tarifaires affiché quand "Créer un site" est sélectionné (étapes 1 et 2).
export const siteQuoteTiers = [
  { label: 'Site vitrine simple', price: 'à partir de 600 €' },
  { label: 'Un site comme celui-ci', price: 'environ 1 500 €' },
  { label: 'Plus ambitieux que celui-ci', price: 'à partir de 2 000 €' },
];
export const budgets = ['< 500 €', '500 – 2 000 €', '2 000 – 5 000 €', '> 5 000 €', 'À définir'];   // validé par Xav (D4 / DETTE-18, 2026-09-15)
export const timings = ['Cette semaine', 'Ce mois', 'Ce trimestre', 'Pas de date'];
```
Payload envoyé : `{ projectType, budget, timing, name, email, message, source: 'simulator'|'direct', simulatorSelection?: string[] }`.

**Envoi (D3, validé)** : `POST` vers `https://formspree.io/f/xgaegryp` (endpoint public par conception — constante dans `contact.ts`, pas de secret). Repli `mailto:xa.bou@laposte.net` avec sujet/corps pré-remplis si le POST échoue ou si `fetch` est indisponible.

### Jouer (`src/content/play.ts`)
```ts
export const play = {
  url: site.hatdUrl,                 // https://xab-dev.github.io/cv-portfolio/haTD_V1/
  teaserMs: 18_000,                  // validé par Xav (DETTE-24) : le cold-open complet est trop long, 18 s suffisent
  playableOnTouch: false,            // T12 — ne pas changer sans nouvelle version de haTD
};
```
Iframe `src={play.url}` (URL absolue), `title="haTD — tower defense par Xavier B."`, `loading="lazy"`, `allow="fullscreen"`.

## 3. Comportement attendu

### Contact
- Stepper 3 étapes en `GlassCard` : (1) Type de projet (`Tag` single), (2) Budget + Délai (`Tag` single ×2), (3) Coordonnées + message. Barre de progression `layout` animée ; transitions slide via `AnimatePresence`.
- **Lecture de `sessionStorage['simulator']`** : la clé n'existe pas tant que la Phase 2 n'est pas livrée. Comportement attendu :
  - clé absente ou illisible (JSON invalide) → stepper vierge à l'étape 1, `source: 'direct'`, aucune erreur console ;
  - clé présente (format attendu : `{ selection: string[] }`, à confirmer avec la spec 03 au moment de la Phase 2) → étape 1 pré-sélectionnée "Automatisation d'un process" + encart "Depuis le simulateur : Support, Saisie" (modifiable), `source: 'simulator'`, `simulatorSelection` rempli.
  - La lecture est isolée dans une fonction pure (`src/lib/contact/readSimulator.ts`) testée avec Vitest sur les trois cas (absent, invalide, valide), pour que la Phase 2 n'ait rien à changer côté Contact.
- Étape 3 : `name` (requis), `email` (requis, format), `message` (requis, ≥ 20 caractères), case RGPD ("J'accepte que ces informations servent uniquement à me répondre") requise. Champ honeypot caché anti-spam.
- Envoi → état `sending` (bouton désactivé, spinner) → `sent` (carte de confirmation avec récap des choix + "Réponse sous 24 h" — DETTE-06 validé) ou `error` (message + bouton "Réessayer" + lien mailto de secours).
- Sous le formulaire, bloc "Contact direct" (préféré par Xav) : `xa.bou@laposte.net` (seul mail, Gmail secondaire retiré le 17/09 — patch 9b), `07 69 54 74 94` avec deux liens : `tel:+33769547494` et WhatsApp `https://wa.me/33769547494` (DETTE-20 validé). Icônes `Mail`, `MessageCircle` (Lucide) et `Github`, `Youtube` (`BrandIcons.tsx`, Phase 0) ; LinkedIn masqué tant que vide.
- Type "Créer un site (vitrine ou comme celui-ci)" (patch 9b) : sélectionné à l'étape 1, affiche un encart compact (`siteQuoteTiers` + note) sous les tags, qui reste visible en haut de l'étape 2 (Budget). Aucun autre type n'affiche cet encart.
- Ligne "Disponibilité" au-dessus du stepper : "Disponible — réponse sous 24 h. À distance de préférence ; déplacement possible, même longue durée (audit en immersion), sur devis signé."
- Ligne "Tarif indicatif" (DETTE-25 tranché, formulation volontairement souple) : **"Tarif indicatif : à partir de 25 €/h, ajusté selon l'intervention et les outils IA mobilisés. Devis après un premier échange."** Texte dans `contact.ts`, pas dans le composant (T8).

### Jouer
- Titre de section : "Jouer" (patch 9b, 17/09 — sans sous-titre). Dans le corps : `<h3>` "haTD, mon tower defense (v1 en ligne) :" en titre de paragraphe, une ligne de contexte + lien "Voir la fiche projet" (`#projets/hatd`).
- **Détection** : `pointer: coarse` (media query) = mobile/tactile ; sinon PC.
- **PC** : iframe dans un cadre verre, ratio 16/9, bouton "Plein écran" (Fullscreen API sur le conteneur). Le jeu est jouable.
- **Mobile (T12)** : ne pas cacher le jeu. Un bouton "Voir l'intro" (`NeonButton`) ouvre un **overlay plein écran** contenant l'iframe : le cold-open de haTD joue comme teaser. L'overlay porte (a) un bouton "Fermer" toujours visible en haut à droite, zone tactile ≥ 44 px, (b) une fermeture automatique après `play.teaserMs` avec un fin bandeau de progression, (c) une ligne "Jouable sur ordinateur" avec l'URL copiable. Aucune tentative de rendre le jeu jouable au tactile.
- L'iframe ne se charge qu'à l'entrée en viewport (PC) ou à l'ouverture de l'overlay (mobile) — jamais au chargement de page, pour ne pas pénaliser Lighthouse.

## 3 bis. Tâches annexes intégrées à cette phase
Deux restes des phases précédentes, petits et sans dépendance, sont **dans le scope** de cette phase pour ne pas traîner :

1. **Retrait de la section temporaire `#kitchen-sink`** (prévu "au plus tard fin de Phase 6" depuis la Phase 0). Supprimer la section, son lien éventuel, et le fichier `KitchenSink.tsx`. Vérifier que `NeonButton` (prop `href`), `Modal`, `Tag`, `AnimatedCounter`, `TypingText`, `GlassCard` restent tous utilisés par au moins une vraie section (`AnimatedCounter` ne le sera qu'en Phase 2 : le garder, ne pas le supprimer).
2. **Câblage des images déjà générées (DETTE-14)** : `public/images/projects/templates/templates-01.webp` et `public/images/projects/1am/1am-01.webp` existent mais ne sont pas référencés. Ajouter `images[]` avec un `alt` descriptif en français dans `src/content/projects.ts` pour les fiches `templates` et `1am`. `terrain` reste sans image (source non fournie). Mettre à jour la ligne DETTE-14 de `dette_suivi.md` en conséquence (ne reste que `terrain`).

## 4. Edge cases à gérer
- Endpoint absent : le formulaire fonctionne quand même via `mailto:` — jamais un bouton mort.
- Réponse Formspree ≠ 2xx : état `error`, données conservées.
- Retour en arrière dans le stepper : sélections conservées.
- `sessionStorage` inaccessible (navigation privée stricte, `SecurityError`) : traité comme "clé absente".
- Iframe bloquée (X-Frame-Options improbable, même origine) : repli lien direct.
- Overlay mobile : Échap/retour arrière ferme ; la fermeture auto ne se déclenche pas si l'onglet est en arrière-plan (`visibilitychange`) — le timer reprend au retour.
- `play.teaserMs` ≤ 0 → pas de fermeture auto, bouton Fermer seul.
- Reduced-motion : pas de slide, changement d'étape instantané.

## 5. Structure des fichiers
```
src/sections/Contact.tsx
src/components/contact/Stepper.tsx
src/components/contact/ContactForm.tsx
src/lib/contact/submit.ts            (fetch + repli mailto, fonction pure testable)
src/lib/contact/readSimulator.ts     (lecture sessionStorage, fonction pure testée — 3 cas)
src/lib/contact/readSimulator.test.ts
src/sections/Play.tsx
src/components/play/TeaserOverlay.tsx
src/content/contact.ts
src/content/play.ts
```

## 6. Consignes d'autonomie pour Claude Code
- Emails, téléphone et endpoint sont des constantes de contenu (`contact.ts` / `site.ts`), pas des variables d'env : rien n'est secret ici.
- Pas de captcha tiers en V1 (honeypot suffit).
- Ne pas implémenter le simulateur ni écrire dans `sessionStorage['simulator']` depuis cette phase : seulement le lire.
- Ne pas modifier le repo `cv-portfolio`.

## 7. Critères de validation
1. Parcours complet en 3 clics + saisie, envoi réel vers `formspree.io/f/xgaegryp` **confirmé reçu par Xav** sur `xa.bou@laposte.net` (adresse déjà validée côté Formspree par Xav le 2026-09-15) ; repli `mailto:` vérifié en coupant le réseau. **[ARRÊT XAV]** : la confirmation de réception est le seul point que l'agent ne peut pas vérifier seul.
2. Pré-remplissage depuis le simulateur : **vérifiable en conditions réelles seulement après la Phase 2** — ne pas le cocher. En attendant : tests `readSimulator.test.ts` verts (3 cas) + vérification manuelle en injectant la clé dans DevTools (`sessionStorage.setItem('simulator', '{"selection":["support","saisie"]}')`, puis rechargement). Noter explicitement le report dans `JOURNAL_DEV.md`.
3. Validation des champs et messages d'erreur accessibles (`aria-describedby`).
4. Desktop : le jeu se charge et le plein écran fonctionne. Mobile émulé (pointeur coarse) : l'overlay s'ouvre, le cold-open joue, "Fermer" et la fermeture auto fonctionnent tous les deux.
5. Lighthouse Performance ne chute pas de plus de 5 points par rapport à la Phase 5 (grâce au lazy).
6. `#kitchen-sink` absent du site déployé ; les fiches `templates` et `1AM` affichent leur image dans la modale, `loading="lazy"`, agrandissement au clic (§3 bis).

## 8. Hors scope
CRM, prise de rendez-vous en ligne (Calendly), analytics, tracking des parties jouées, version tactile de haTD (projet jeu, pas projet portfolio). Le simulateur lui-même (Phase 2). Image de la fiche `terrain` (source non fournie).
