import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { cv } from "../src/content/cv.ts";
import { hero } from "../src/content/hero.ts";
import { projects } from "../src/content/projects.ts";
import { site } from "../src/content/site.ts";
import { skills } from "../src/content/skills.ts";
import { timeline } from "../src/content/timeline.ts";
import { buildCvModel } from "./cv/buildCvModel.ts";
import { CvDocument } from "./cv/CvDocument.tsx";
import { initFonts, resolveFontSet } from "./cv/fonts.ts";

/**
 * Point d'entrée `npm run cv` (spec 09 §3) : modèle pur → rendu
 * `@react-pdf/renderer` → contrôle « exactement 1 page » (`pdf-lib`) → écriture
 * dans `public/cv/`. Câblé en `prebuild`/`predev` : le PDF existe toujours
 * quand le site tourne. Un débordement fait échouer le build (exit ≠ 0),
 * volontairement — voir §3/§4 de la spec.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outputDir = join(root, "public", "cv");
const outputPath = join(outputDir, cv.fileName);

async function main() {
  const startedAt = Date.now();

  const fontResult = await initFonts();
  if (!fontResult.ok) {
    console.warn(`[cv] Polices .woff indisponibles, repli sur Helvetica : ${fontResult.issues.join("; ")}`);
  }
  const fonts = resolveFontSet(fontResult);

  const model = buildCvModel({
    site: {
      name: site.name,
      title: site.title,
      location: site.location,
      contact: { emailPrimary: site.contact.emailPrimary, phone: site.contact.phone },
      links: site.links,
      legal: { status: site.legal.status, siret: site.legal.siret },
      seo: { siteUrl: site.seo.siteUrl },
      languages: site.languages,
    },
    hero: { title: hero.title, subtitle: hero.subtitle },
    projects,
    skills,
    timeline,
    cv,
  });

  const document = (
    <CvDocument
      model={model}
      labels={{ sectionLabels: cv.sectionLabels, generatedLabel: cv.generatedLabel }}
      fonts={fonts}
    />
  );

  const buffer = await renderToBuffer(document);
  const pdfDoc = await PDFDocument.load(buffer);
  const pageCount = pdfDoc.getPageCount();

  if (pageCount !== 1) {
    console.error(`\n❌ CV PDF : ${pageCount} pages générées, 1 attendue (A4, spec 09 §3).`);
    console.error("Le build échoue volontairement plutôt que de livrer un CV de plusieurs pages.");
    console.error("Réduire dans cet ordre (spec 09 §4 — ne jamais retirer un projet, une compétence ou un jalon) :");
    console.error("  1) resserrer marges/interligne dans CvDocument.tsx (bornes : marges 14 mm, corps 9-9,5 pt) ;");
    console.error("  2) vérifier la troncature des taglines projet à 140 caractères (buildCvModel.ts, truncateTagline) ;");
    console.error("  3) limiter les métriques vérifiées à 2 par projet (buildCvModel.ts, buildProject).");
    process.exitCode = 1;
    return;
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, buffer);

  const durationMs = Date.now() - startedAt;
  const sizeKb = (buffer.byteLength / 1024).toFixed(1);
  console.log(`[cv] ${outputPath} — 1 page, ${sizeKb} Ko, ${durationMs} ms.`);
  if (!fontResult.ok) console.log("[cv] Repli Helvetica utilisé (voir l'avertissement ci-dessus).");
}

main().catch((error) => {
  console.error("[cv] Échec de génération :", error);
  process.exitCode = 1;
});
