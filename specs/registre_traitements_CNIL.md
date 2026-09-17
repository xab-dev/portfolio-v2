# Registre des activités de traitement (art. 30 RGPD — modèle simplifié CNIL)

**Document interne, hors dépôt public.** Version 1.0 — 2026-09-16. À tenir à jour à chaque changement (nouveau sous-traitant, nouvelle finalité, changement de durée).

## Responsable de traitement

| | |
|---|---|
| Organisme | Xavier Joseph Bou — Entrepreneur individuel (EI) |
| SIRET | 944 670 066 00017 |
| Adresse | 4 chemin des Lauriers, 13150 Tarascon |
| Contact | xa.bou@laposte.net · 07 69 54 74 94 |
| Représentant | Le responsable lui-même |
| Délégué à la protection des données | Aucun (non obligatoire — art. 37 RGPD) |
| Effectif | 0 salarié |

## Fiche n° 1 — Gestion des demandes de contact et des prospects

| Rubrique | Contenu |
|---|---|
| **Nom du traitement** | Réception et suivi des demandes de contact (site `xab-dev.github.io/portfolio-v2`, contact direct par mail / WhatsApp / SMS) |
| **Finalités** | Répondre aux demandes ; établir un devis ; suivre les échanges précontractuels |
| **Base légale** | Mesures précontractuelles à la demande de la personne (art. 6.1.b RGPD) — cohérent avec la page Mentions légales du site |
| **Personnes concernées** | Prospects, clients potentiels, toute personne qui écrit |
| **Catégories de données** | Identité : nom. Contact : e-mail (téléphone si la personne le communique). Demande : message, type de projet, fourchette de budget, délai, sélection du simulateur (le cas échéant). Techniques : horodatage et, le cas échéant, adresse IP conservée par Formspree. **Aucune donnée sensible** (art. 9) ; aucun mineur ciblé |
| **Source des données** | La personne elle-même (formulaire ou contact direct) |
| **Destinataires internes** | Le responsable uniquement |
| **Sous-traitants** | **Formspree, Inc.** (États-Unis) — relais et stockage des soumissions du formulaire. **La Poste** (France) — messagerie principale. **Google LLC** (États-Unis) — messagerie secondaire `phenomenxx@gmail.com`. **Meta Platforms** (WhatsApp) — contact direct, à l'initiative de la personne |
| **Transferts hors UE** | Formspree et Google : États-Unis. Encadrement : clauses contractuelles types (CCT) ou certification Data Privacy Framework — **à confirmer dans le DPA de chaque prestataire** (voir « À vérifier ») |
| **Durée de conservation** | 12 mois après le dernier échange sans suite (valeur publiée dans les Mentions légales). Si un contrat est signé : les données passent en gestion client et suivent les durées légales (pièces comptables 10 ans, art. L123-22 C. com.) — fiche n° 2 à ouvrir au premier contrat |
| **Mesures de sécurité** | Site en HTTPS ; aucun cookie ni traceur ; champ honeypot anti-spam ; accès Formspree / messageries protégés par mot de passe unique + authentification à deux facteurs ; aucune copie locale non chiffrée des demandes ; purge des soumissions Formspree à chaque échéance de conservation ; aucune revente ni partage |
| **Exercice des droits** | Par mail à xa.bou@laposte.net (accès, rectification, effacement, opposition, limitation, portabilité) ; réponse sous un mois ; réclamation possible auprès de la CNIL |

## Hors registre (pas un traitement du responsable)

- **Journaux techniques de l'hébergeur** (GitHub, Inc.) : adresses IP traitées par GitHub pour son propre compte, à des fins de sécurité. Mentionné dans les Mentions légales, hors registre.
- **`sessionStorage`** (`perf`, `simulator`) : réglages techniques locaux, effacés à la fermeture de l'onglet, jamais transmis — exemptés (art. 82 loi Informatique et Libertés).
- **Mesure d'audience** : aucune.

## À vérifier / à faire (une fois)

- [ ] Lire le DPA de Formspree et noter ici le mécanisme de transfert réel (CCT ou DPF) ; aligner la phrase des Mentions légales si elle diffère.
- [ ] Idem pour Google (Gmail) si l'adresse secondaire reste publiée.
- [ ] Activer la 2FA sur Formspree, laposte.net et Gmail si ce n'est pas déjà fait.
- [ ] Mettre un rappel de purge Formspree (tous les 6 mois suffit pour tenir les 12 mois).
- [ ] Ouvrir la fiche n° 2 « Gestion des clients et facturation » au premier contrat signé.

## Historique

- 2026-09-16 — v1.0, création (DETTE-34). Rédigé avec l'architecte, valeurs alignées sur `site.legal` / `legal.ts` du site.
