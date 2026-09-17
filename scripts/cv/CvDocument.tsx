import React from "react";
import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvModel } from "./buildCvModel.ts";
import type { CvFontSet } from "./fonts.ts";

/**
 * Gabarit *print* du CV (spec 09 §3) : fond blanc, texte quasi-noir, un seul
 * accent (bleu électrique des tokens du site, `--neon-blue` = #3b82f6).
 * Aucune chaîne de contenu en dur ici (T8) : tout vient de `model` (les
 * faits) et `labels` (les libellés de gabarit, `src/content/cv.ts`).
 */

const mm = (value: number) => value * (72 / 25.4);

const COLOR_TEXT = "#111111";
const COLOR_MUTED = "#555555";
const COLOR_TAG = "#777777";
const COLOR_ACCENT = "#3b82f6";
const COLOR_RULE = "#c9d6f5";

export interface CvSectionLabels {
  profil: string;
  projets: string;
  competences: string;
  parcours: string;
  langues: string;
  contact: string;
}

export interface CvUiLabels {
  sectionLabels: CvSectionLabels;
  generatedLabel: string;
}

function buildStyles(fonts: CvFontSet) {
  return StyleSheet.create({
    page: {
      paddingTop: mm(10),
      paddingBottom: mm(7),
      paddingHorizontal: mm(10),
      fontFamily: fonts.body.fontFamily,
      fontWeight: fonts.body.fontWeight,
      fontSize: 9,
      lineHeight: 1.15,
      color: COLOR_TEXT,
    },
    headerName: {
      fontFamily: fonts.display.fontFamily,
      fontWeight: fonts.display.fontWeight,
      fontSize: 17,
      lineHeight: 1.15,
      color: COLOR_TEXT,
    },
    headerTitle: {
      fontFamily: fonts.bodyMedium.fontFamily,
      fontWeight: fonts.bodyMedium.fontWeight,
      fontSize: 10.5,
      lineHeight: 1.15,
      color: COLOR_ACCENT,
      marginTop: 2,
    },
    headerLocation: {
      fontSize: 8.5,
      lineHeight: 1.15,
      color: COLOR_MUTED,
      marginTop: 1,
    },
    headerRule: {
      borderBottomWidth: 1,
      borderBottomColor: COLOR_RULE,
      marginTop: mm(1.5),
      marginBottom: mm(1.8),
    },
    columns: {
      flexDirection: "row",
      gap: mm(5),
    },
    mainColumn: { width: "65%", flexDirection: "column" },
    sideColumn: { width: "35%", flexDirection: "column" },
    section: { marginBottom: mm(1.8) },
    sectionTitle: {
      fontFamily: fonts.bodyBold.fontFamily,
      fontWeight: fonts.bodyBold.fontWeight,
      fontSize: 8,
      color: COLOR_ACCENT,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: mm(0.8),
    },
    paragraph: { fontSize: 9, color: COLOR_TEXT, marginBottom: mm(0.6) },
    muted: { color: COLOR_MUTED },
    project: { marginBottom: mm(1) },
    projectHeadLine: { flexDirection: "row", justifyContent: "space-between" },
    projectTitle: {
      fontFamily: fonts.bodyBold.fontFamily,
      fontWeight: fonts.bodyBold.fontWeight,
      fontSize: 9,
    },
    projectMeta: { fontSize: 8, color: COLOR_MUTED },
    projectTagline: { fontSize: 8.5, color: "#333333", marginTop: 0.5 },
    projectTags: { fontSize: 7, color: COLOR_TAG, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 1 },
    projectMetrics: { fontSize: 7.5, color: COLOR_ACCENT, marginTop: 1 },
    projectLinks: { fontSize: 7.5, color: COLOR_ACCENT, marginTop: 0.5 },
    milestone: { flexDirection: "row", gap: mm(2), marginBottom: mm(0.5) },
    milestonePeriod: {
      fontFamily: fonts.bodyBold.fontFamily,
      fontWeight: fonts.bodyBold.fontWeight,
      fontSize: 7.5,
      color: COLOR_MUTED,
      width: mm(24),
    },
    milestoneBody: { flex: 1 },
    milestoneTitle: {
      fontFamily: fonts.bodyMedium.fontFamily,
      fontWeight: fonts.bodyMedium.fontWeight,
      fontSize: 8.5,
    },
    milestoneSummary: { fontSize: 8, color: COLOR_MUTED },
    contactLine: { fontSize: 8, marginBottom: mm(0.5), color: COLOR_ACCENT },
    skillFamily: { marginBottom: mm(0.8) },
    skillFamilyTitle: { fontSize: 7, fontFamily: fonts.bodyMedium.fontFamily, fontWeight: fonts.bodyMedium.fontWeight, color: COLOR_TEXT, marginBottom: mm(0.4) },
    skillLine: { fontSize: 7.2, color: COLOR_TEXT, marginBottom: mm(0.3) },
    languageLine: { fontSize: 7.5, color: COLOR_TEXT, marginBottom: mm(0.3) },
    footer: {
      position: "absolute",
      bottom: mm(4),
      left: mm(12),
      right: mm(12),
      borderTopWidth: 1,
      borderTopColor: COLOR_RULE,
      paddingTop: mm(1),
      flexDirection: "column",
      fontSize: 7,
      lineHeight: 1.15,
      color: COLOR_MUTED,
    },
    footerLine: { marginBottom: mm(0.3) },
  });
}

function formatGenerationDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export interface CvDocumentProps {
  model: CvModel;
  labels: CvUiLabels;
  fonts: CvFontSet;
  generatedAt?: Date;
}

export function CvDocument({ model, labels, fonts, generatedAt = new Date() }: CvDocumentProps) {
  const styles = buildStyles(fonts);

  return (
    <Document
      title={model.meta.title}
      author={model.meta.author}
      subject={model.meta.subject}
      keywords={model.meta.keywords.join(", ")}
      language={model.meta.language}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerName}>{model.header.name}</Text>
        <Text style={styles.headerTitle}>{model.header.title}</Text>
        <Text style={styles.headerLocation}>{model.header.location}</Text>
        <View style={styles.headerRule} />

        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.profil}</Text>
              <Text style={[styles.paragraph, { fontFamily: fonts.bodyMedium.fontFamily, fontWeight: fonts.bodyMedium.fontWeight }]}>
                {model.profile.headline}
              </Text>
              <Text style={styles.paragraph}>{model.profile.subtitle}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.projets}</Text>
              {model.projects.map((project) => (
                <View key={project.title} style={styles.project} wrap={false}>
                  <View style={styles.projectHeadLine}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectMeta}>
                      {project.year} · {project.status}
                    </Text>
                  </View>
                  <Text style={styles.projectTagline}>{project.tagline}</Text>
                  {project.tags.length > 0 && <Text style={styles.projectTags}>{project.tags.join(" · ")}</Text>}
                  {project.metrics.length > 0 && (
                    <Text style={styles.projectMetrics}>
                      {project.metrics.map((metric) => `${metric.label} : ${metric.value}`).join(" · ")}
                    </Text>
                  )}
                  {project.links.length > 0 && (
                    <Text style={styles.projectLinks}>
                      {project.links.map((link, index) => (
                        <Text key={link.href}>
                          {index > 0 ? "  ·  " : ""}
                          <Link src={link.href} style={{ color: COLOR_ACCENT }}>
                            {link.label}
                          </Link>
                        </Text>
                      ))}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.parcours}</Text>
              {model.timeline.map((milestone) => (
                <View key={`${milestone.period}-${milestone.title}`} style={styles.milestone} wrap={false}>
                  <Text style={styles.milestonePeriod}>{milestone.period}</Text>
                  <View style={styles.milestoneBody}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <Text style={styles.milestoneSummary}>{milestone.summary}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.contact}</Text>
              <Link src={`mailto:${model.contact.email}`} style={styles.contactLine}>
                {model.contact.email}
              </Link>
              <Text style={[styles.contactLine, { color: COLOR_TEXT }]}>{model.contact.phone}</Text>
              {model.contact.links.map((link) => (
                <Link key={link.href} src={link.href} style={styles.contactLine}>
                  {link.label}
                </Link>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.competences}</Text>
              {model.skillGroups.map((group) => (
                <View key={group.family} style={styles.skillFamily} wrap={false}>
                  <Text style={styles.skillFamilyTitle}>{group.family}</Text>
                  {group.skills.map((skill) => (
                    <Text key={skill.name} style={styles.skillLine}>
                      {skill.name} — {skill.levelLabel}
                      {skill.note ? ` (${skill.note})` : ""}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{labels.sectionLabels.langues}</Text>
              {model.languages.map((language) => (
                <Text key={language.name} style={styles.languageLine}>
                  {language.name} : {language.level}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLine}>
            {model.footer.note} <Link src={model.footer.siteUrl} style={{ color: COLOR_MUTED }}>{model.footer.siteUrl}</Link>
          </Text>
          <Text style={styles.footerLine}>
            {model.footer.statusLine} · {labels.generatedLabel} {formatGenerationDate(generatedAt)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
