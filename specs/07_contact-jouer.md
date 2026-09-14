# Portfolio v2 — SPEC : Formulaire de contact "smart" + section Jouer (Phase 6)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T5, T12, D3, D4, D5), `sessionStorage['simulator']` posé en Phase 2, `Tag`, `NeonButton`, `GlassCard`. haTD déployé dans un **autre repo** à `https://xab-dev.github.io/cv-portfolio/haTD_V1/` — même origine `xab-dev.github.io`, jamais modifié depuis ce projet.

## 1. Rôle du module
Deux clôtures : (a) permettre à un prospect de qualifier son besoin en 3 clics avant d'écrire, pour que le premier échange soit déjà cadré ; (b) faire jouer le visiteur au jeu de Xav — la preuve la plus concrète qu'il livre des choses qui tournent.

## 2. Entrées / Sorties

### Contact (`src/content/contact.ts`)
```ts
export const projectTypes = ['Diagnostic / cadrage IA', 'Automatisation d’un process', 'Outil sur mesure', 'Formation équipe (4D)', 'Intervention IT / maintenance', 'Autre'];
export const budgets = ['< 500 €', '500 – 2 000 €', '2 000 – 5 000 €', '> 5 000 €', 'À définir'];   // [D4 — DETTE-18]
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
- Si `sessionStorage['simulator']` existe : étape 1 pré-sélectionnée "Automatisation d'un process" + encart "Depuis le simulateur : Support, Saisie" (modifiable).
- Étape 3 : `name` (requis), `email` (requis, format), `message` (requis, ≥ 20 caractères), case RGPD ("J'accepte que ces informations servent uniquement à me répondre") requise. Champ honeypot caché anti-spam.
- Envoi → état `sending` (bouton désactivé, spinner) → `sent` (carte de confirmation avec récap des choix + "Réponse sous 24 h" — DETTE-06 validé) ou `error` (message + bouton "Réessayer" + lien mailto de secours).
- Sous le formulaire, bloc "Contact direct" (préféré par Xav) : `xa.bou@laposte.net` (principal, `mailto:`), `phenomenxx@gmail.com` (secondaire), `07 69 54 74 94` avec deux liens : `tel:+33769547494` et WhatsApp `https://wa.me/33769547494` (DETTE-20 validé). Icônes Lucide `Mail`, `MessageCircle`, `Github`, `Youtube` ; LinkedIn masqué tant que vide.
- Ligne "Disponibilité" au-dessus du stepper : "Disponible — réponse sous 24 h. À distance de préférence ; déplacement possible, même longue durée (audit en immersion), sur devis signé."
- Ligne "Tarif indicatif" : "25 à 50 €/h selon l'intervention et les outils IA mobilisés" (réponse DETTE-08). Formulation exacte à valider [DETTE-25].

### Jouer
- Titre : "Jouer — haTD, mon tower defense (v1 en ligne)". Une ligne de contexte + lien "Voir la fiche projet" (`#projets/haTD`).
- **Détection** : `pointer: coarse` (media query) = mobile/tactile ; sinon PC.
- **PC** : iframe dans un cadre verre, ratio 16/9, bouton "Plein écran" (Fullscreen API sur le conteneur). Le jeu est jouable.
- **Mobile (T12)** : ne pas cacher le jeu. Un bouton "Voir l'intro" (`NeonButton`) ouvre un **overlay plein écran** contenant l'iframe : le cold-open de haTD joue comme teaser. L'overlay porte (a) un bouton "Fermer" toujours visible en haut à droite, zone tactile ≥ 44 px, (b) une fermeture automatique après `play.teaserMs` avec un fin bandeau de progression, (c) une ligne "Jouable sur ordinateur" avec l'URL copiable. Aucune tentative de rendre le jeu jouable au tactile.
- L'iframe ne se charge qu'à l'entrée en viewport (PC) ou à l'ouverture de l'overlay (mobile) — jamais au chargement de page, pour ne pas pénaliser Lighthouse.

## 4. Edge cases à gérer
- Endpoint absent : le formulaire fonctionne quand même via `mailto:` — jamais un bouton mort.
- Réponse Formspree ≠ 2xx : état `error`, données conservées.
- Retour en arrière dans le stepper : sélections conservées.
- Iframe bloquée (X-Frame-Options improbable, même origine) : repli lien direct.
- Overlay mobile : Échap/retour arrière ferme ; la fermeture auto ne se déclenche pas si l'onglet est en arrière-plan (`visibilitychange`) — le timer reprend au retour.
- `play.teaserMs` ≤ 0 → pas de fermeture auto, bouton Fermer seul.
- Reduced-motion : pas de slide, changement d'étape instantané.

## 5. Structure des fichiers
```
src/sections/Contact.tsx
src/components/contact/Stepper.tsx
src/components/contact/ContactForm.tsx
src/lib/contact/submit.ts        (fetch + repli mailto, fonction pure testable)
src/sections/Play.tsx
src/components/play/TeaserOverlay.tsx
src/content/contact.ts
src/content/play.ts
```

## 6. Consignes d'autonomie pour Claude Code
- Emails, téléphone et endpoint sont des constantes de contenu (`contact.ts` / `site.ts`), pas des variables d'env : rien n'est secret ici.
- Pas de captcha tiers en V1 (honeypot suffit).

## 7. Critères de validation
1. Parcours complet en 3 clics + saisie, envoi réel vers `formspree.io/f/xgaegryp` **confirmé reçu par Xav** sur `xa.bou@laposte.net` (adresse déjà validée côté Formspree par Xav le 2026-09-15) ; repli `mailto:` vérifié en coupant le réseau.
2. Pré-remplissage depuis le simulateur vérifié.
3. Validation des champs et messages d'erreur accessibles (`aria-describedby`).
4. Desktop : le jeu se charge et le plein écran fonctionne. Mobile émulé (pointeur coarse) : l'overlay s'ouvre, le cold-open joue, "Fermer" et la fermeture auto fonctionnent tous les deux.
5. Lighthouse Performance ne chute pas de plus de 5 points par rapport à la Phase 5 (grâce au lazy).

## 8. Hors scope
CRM, prise de rendez-vous en ligne (Calendly), analytics, tracking des parties jouées, version tactile de haTD (projet jeu, pas projet portfolio).
