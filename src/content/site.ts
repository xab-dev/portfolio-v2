export const site = {
  name: "Xavier Joseph Bou",
  shortName: "Xav",
  title: "Consultant outils et solutions IA",
  location: "Tarascon, Provence",
  hatdUrl: "https://xab-dev.github.io/cv-portfolio/haTD_V1",
  links: {
    github: "https://github.com/xab-dev/portfolio-v2",
    youtube: "https://www.youtube.com/@1_Autre_Monde", // chaîne "Un Autre Monde"
    linkedin: "", // [DETTE-04] en cours — masquer le lien tant que vide
  },
  contact: {
    emailPrimary: "xa.bou@laposte.net",
    phone: "07 69 54 74 94", // affichage FR ; lien wa.me au format international +33769547494
    preferred: "Mail, WhatsApp ou SMS",
  },
  legal: {
    status: "Entrepreneur individuel (EI)",
    siret: "944 670 066 00017",
    vat: "TVA non applicable, art. 293 B du CGI",
    address: "4 chemin des Lauriers, 13150, Tarascon", // domicile complet (LCEN art. 6-III-1)
    publisher: "Xavier Joseph Bou", // directeur de la publication
    host: {
      name: "GitHub, Inc.",
      address: "88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
      phone: "+1 877 448 4820",
      url: "https://pages.github.com/",
    },
    dataRetentionMonths: 12,
    lastUpdated: "2026-09-16",
  },
  seo: {
    siteUrl: "https://xab-dev.github.io/portfolio-v2/", // seule valeur à changer le jour du domaine perso
    indexable: false, // noindex jusqu'au polish final (décision Xav)
    ogImage: "og.png", // généré par `npm run og`, 1200×630
    locale: "fr_FR",
  },
  languages: [
    { name: "Français", level: "natif" },
    { name: "Anglais", level: "très bon" },
  ],
};
