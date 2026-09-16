import type { Project } from "../../src/content/projects.ts";
import type { Level, Skill } from "../../src/content/skills.ts";
import type { Milestone } from "../../src/content/timeline.ts";

/**
 * Modèle pur du CV PDF (Phase 8, spec 09 §5-§6) : content → CvModel. Aucun
 * rendu ici, aucune I/O — testé isolément avant d'écrire une seule ligne de
 * `@react-pdf/renderer` (même ordre que `compute.ts`, Phase 2). `scripts/build-cv.tsx`
 * assemble le `CvBuildInput` réel depuis `src/content/*.ts` et appelle cette
 * fonction.
 */

// Un seul glyphe connu hors du sous-ensemble "latin"/"latin-ext" de
// @fontsource (vérifié via node_modules/@fontsource/inter/unicode.json) :
// la flèche "→" (U+2192) — présente dans `timeline.ts` (jalon "hatd") et
// `projects.ts` (tagline "terrain"). Remplacée uniquement dans le modèle CV
// (spec 09 §4), jamais dans le contenu source.
const PDF_UNSUPPORTED_GLYPHS: [string, string][] = [["→", "->"]];

export function sanitizeForPdf(text: string): string {
  return PDF_UNSUPPORTED_GLYPHS.reduce((acc, [glyph, replacement]) => acc.split(glyph).join(replacement), text);
}

const TAGLINE_MAX_LENGTH = 140;

/** Edge case §4 (2) : tronquer à 140 caractères avec « … » — appliqué systématiquement, sans effet tant qu'aucune tagline ne dépasse. */
export function truncateTagline(text: string, maxLength: number = TAGLINE_MAX_LENGTH): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export interface CvSiteInput {
  name: string;
  title: string;
  location: string;
  contact: { emailPrimary: string; phone: string };
  links: { github: string; youtube: string; linkedin: string };
  legal: { status: string; siret: string };
  seo: { siteUrl: string };
  languages: { name: string; level: string }[];
}

export interface CvHeroInput {
  title: string;
  subtitle: string;
}

export interface CvLabelsInput {
  footerNote: string;
  levelLabels: Record<Level, string>;
  meta: { subject: string; keywords: string[] };
}

export interface CvBuildInput {
  site: CvSiteInput;
  hero: CvHeroInput;
  projects: Project[];
  skills: Skill[];
  timeline: Milestone[];
  cv: CvLabelsInput;
}

export interface CvLink {
  label: string;
  href: string;
}

export interface CvMetric {
  label: string;
  value: string;
}

export interface CvProject {
  title: string;
  tagline: string;
  tags: string[];
  status: string;
  year: number;
  metrics: CvMetric[];
  links: CvLink[];
}

export interface CvSkillEntry {
  name: string;
  levelLabel: string;
  note?: string;
}

export interface CvSkillGroup {
  family: string;
  skills: CvSkillEntry[];
}

export interface CvMilestone {
  period: string;
  title: string;
  summary: string;
}

export interface CvLanguage {
  name: string;
  level: string;
}

export interface CvModel {
  meta: {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    language: string;
  };
  header: { name: string; title: string; location: string };
  profile: { headline: string; subtitle: string };
  contact: { email: string; phone: string; links: CvLink[] };
  projects: CvProject[];
  skillGroups: CvSkillGroup[];
  timeline: CvMilestone[];
  languages: CvLanguage[];
  footer: { statusLine: string; note: string; siteUrl: string };
}

const CV_LANGUAGE = "fr-FR";

function buildContactLinks(links: CvSiteInput["links"]): CvLink[] {
  return [
    { label: "GitHub", href: links.github },
    { label: "YouTube", href: links.youtube },
    { label: "LinkedIn", href: links.linkedin },
  ].filter((link) => link.href !== ""); // lien vide → ligne absente (même règle que le footer, DETTE-04)
}

function buildProject(project: Project): CvProject {
  return {
    title: sanitizeForPdf(project.title),
    tagline: truncateTagline(sanitizeForPdf(project.tagline)),
    tags: project.tags,
    status: project.status,
    year: project.year,
    // T6 : jamais de métrique auto-déclarée sur un CV.
    metrics: project.metrics
      .filter((metric) => metric.verified)
      .map((metric) => ({ label: sanitizeForPdf(metric.label), value: sanitizeForPdf(metric.value) })),
    links: (project.links ?? []).map((link) => ({ label: link.label, href: link.href })),
  };
}

/** Groupe par famille en préservant l'ordre de première apparition (le contenu source est déjà écrit famille par famille). */
function buildSkillGroups(skills: Skill[], levelLabels: Record<Level, string>): CvSkillGroup[] {
  const order: string[] = [];
  const byFamily = new Map<string, CvSkillEntry[]>();

  for (const skill of skills) {
    if (!byFamily.has(skill.family)) {
      byFamily.set(skill.family, []);
      order.push(skill.family);
    }
    byFamily.get(skill.family)!.push({
      name: sanitizeForPdf(skill.name),
      levelLabel: levelLabels[skill.level],
      note: skill.note ? sanitizeForPdf(skill.note) : undefined,
    });
  }

  return order.map((family) => ({ family, skills: byFamily.get(family)! }));
}

function buildMilestone(milestone: Milestone): CvMilestone {
  return {
    period: milestone.dateKnown ? milestone.period : "—",
    title: sanitizeForPdf(milestone.title),
    summary: sanitizeForPdf(milestone.summary),
  };
}

export function buildCvModel(input: CvBuildInput): CvModel {
  const { site, hero, projects, skills, timeline, cv } = input;

  return {
    meta: {
      title: `${site.name} — ${site.title}`,
      author: site.name,
      subject: cv.meta.subject,
      keywords: cv.meta.keywords,
      language: CV_LANGUAGE,
    },
    header: { name: site.name, title: site.title, location: site.location },
    profile: { headline: sanitizeForPdf(hero.title), subtitle: sanitizeForPdf(hero.subtitle) },
    contact: {
      email: site.contact.emailPrimary, // emailSecondary jamais imprimé (un seul mail sur un CV)
      phone: site.contact.phone,
      links: buildContactLinks(site.links),
    },
    projects: projects.map(buildProject),
    skillGroups: buildSkillGroups(skills, cv.levelLabels),
    timeline: timeline.map(buildMilestone),
    languages: site.languages,
    footer: {
      statusLine: `${site.legal.status} · SIRET ${site.legal.siret}`,
      note: cv.footerNote,
      siteUrl: site.seo.siteUrl,
    },
  };
}
