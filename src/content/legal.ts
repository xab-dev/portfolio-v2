import { site } from "./site";

/**
 * Contenu de la page Mentions légales (Phase 7, spec 09 §2). Aucune valeur
 * légale en dur ici : tout est composé à partir de `site.legal` / `site.contact`
 * (T8) pour que le test de garde (`legal.test.ts`) reste la seule source de
 * vérité sur les placeholders restants.
 */
export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export const legalSections: LegalSection[] = [
  {
    id: "editeur",
    heading: "Éditeur du site",
    paragraphs: [
      `${site.legal.publisher} — ${site.legal.status}.`,
      `Adresse : ${site.legal.address}.`,
      `Téléphone : ${site.contact.phone}.`,
      `E-mail : ${site.contact.emailPrimary}.`,
      `SIRET : ${site.legal.siret}.`,
      `${site.legal.vat}.`,
      `Directeur de la publication : ${site.legal.publisher}.`,
    ],
  },
  {
    id: "hebergement",
    heading: "Hébergement",
    paragraphs: [
      `${site.legal.host.name}, ${site.legal.host.address}.`,
      `Téléphone : ${site.legal.host.phone}.`,
      `Site : ${site.legal.host.url}.`,
      "L'hébergeur traite l'adresse IP des visiteurs dans ses journaux techniques, à des fins de sécurité.",
    ],
  },
  {
    id: "donnees-personnelles",
    heading: "Données personnelles (formulaire de contact)",
    paragraphs: [
      `Responsable de traitement : l'éditeur du site (identité ci-dessus, contact ${site.contact.emailPrimary}).`,
      "Données collectées : nom, e-mail, message, type de projet, budget, délai.",
      "Finalité : répondre à la demande et, le cas échéant, établir un devis.",
      "Base légale : mesures précontractuelles prises à la demande de la personne concernée (art. 6.1.b du RGPD).",
      "Sous-traitant : Formspree, Inc. (États-Unis), qui héberge les soumissions sur des serveurs situés aux États-Unis ; ce transfert hors Union européenne est encadré par les clauses contractuelles types de la Commission européenne.",
      `Durée de conservation : ${site.legal.dataRetentionMonths} mois après le dernier échange sans suite ; suppression également possible depuis le tableau de bord Formspree.`,
    ],
    list: [
      `Droits : accès, rectification, effacement, opposition, limitation, portabilité — par mail à ${site.contact.emailPrimary}.`,
      "Droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies et stockage local",
    paragraphs: [
      "Le site ne dépose aucun cookie ni traceur.",
      "Il utilise le `sessionStorage` du navigateur pour deux réglages techniques (`perf`, `simulator`), effacés à la fermeture de l'onglet.",
      "Il utilise en outre le `localStorage` du navigateur pour un seul réglage technique persistant (`theme`, le choix thème clair ou sombre), conservé d'une visite à l'autre et effaçable depuis les réglages du navigateur.",
      "Ces trois réglages sont strictement nécessaires au fonctionnement du site et ne servent à aucune mesure d'audience ni à aucun suivi : ils sont exemptés de consentement (art. 82 de la loi Informatique et Libertés).",
      "Polices auto-hébergées. Aucun appel à un service tiers, hors Formspree (à l'envoi du formulaire uniquement) et la page du jeu haTD (même origine).",
    ],
  },
  {
    id: "propriete-intellectuelle",
    heading: "Propriété intellectuelle",
    paragraphs: [
      "Les contenus et le code de ce site sont la propriété de l'éditeur.",
      `Le code source est public sur GitHub : ${site.links.github}.`,
      "Aucune licence n'étant présente dans le dépôt : tous droits réservés.",
    ],
  },
  {
    id: "derniere-mise-a-jour",
    heading: "Dernière mise à jour",
    paragraphs: [`${site.legal.lastUpdated}.`],
  },
];
