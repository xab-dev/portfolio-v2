// Convertit images-src/projects/<id>/raw/*.{png,jpg,jpeg} en
// public/images/projects/<id>/<id>-NN.webp (1600px max, ~200 Ko max), et
// images-src/avatar/raw/* (une seule image, DETTE-02) en public/images/avatar.webp
// (carré 512px, ~100 Ko max). Les originaux vivent hors de public/ (jamais copiés
// dans le build) et hors du repo (voir .gitignore, DETTE-14).
//
// Convention de dossier : `avatar/` est un pair de `projects/` sous `images-src/`
// (pas un sous-dossier de `projects/`) car ce n'est pas une fiche projet — évite
// qu'il soit traité par la boucle générique ci-dessous avec les mauvaises
// dimensions/le mauvais budget (bug rencontré : voir JOURNAL_DEV.md, Phase 1).
import { readdirSync, statSync, mkdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const SOURCE_DIR = join(process.cwd(), "images-src", "projects");
const PROJECTS_DIR = join(process.cwd(), "public", "images", "projects");
const AVATAR_SOURCE_DIR = join(process.cwd(), "images-src", "avatar", "raw");
const AVATAR_OUTPUT = join(process.cwd(), "public", "images", "avatar.webp");
const AVATAR_SIZE = 512;
const AVATAR_MAX_BYTES = 100 * 1024;
const MAX_WIDTH = 1600;
const MAX_BYTES = 200 * 1024;
const QUALITY_STEPS = [82, 75, 68, 60, 52];
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function listProjectDirs() {
  try {
    return readdirSync(SOURCE_DIR).filter((name) =>
      statSync(join(SOURCE_DIR, name)).isDirectory(),
    );
  } catch {
    return [];
  }
}

function listRawImages(projectId) {
  const rawDir = join(SOURCE_DIR, projectId, "raw");
  try {
    return readdirSync(rawDir)
      .filter((name) => SOURCE_EXTENSIONS.has(extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "fr"))
      .map((name) => join(rawDir, name));
  } catch {
    return [];
  }
}

async function encodeUnderBudget(pipeline, maxBytes = MAX_BYTES) {
  let lastBuffer = null;
  for (const quality of QUALITY_STEPS) {
    lastBuffer = await pipeline.clone().webp({ quality }).toBuffer();
    if (lastBuffer.byteLength <= maxBytes) {
      return { buffer: lastBuffer, quality };
    }
  }
  return { buffer: lastBuffer, quality: QUALITY_STEPS.at(-1) };
}

function listAvatarSource() {
  try {
    const [first] = readdirSync(AVATAR_SOURCE_DIR)
      .filter((name) => SOURCE_EXTENSIONS.has(extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "fr"));
    return first ? join(AVATAR_SOURCE_DIR, first) : null;
  } catch {
    return null;
  }
}

async function processAvatar() {
  const sourcePath = listAvatarSource();
  if (!sourcePath) {
    console.log("Aucune image source trouvée sous images-src/avatar/raw/.");
    return;
  }

  const pipeline = sharp(sourcePath).resize({
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    fit: "cover",
  });
  const { buffer, quality } = await encodeUnderBudget(pipeline, AVATAR_MAX_BYTES);

  mkdirSync(join(process.cwd(), "public", "images"), { recursive: true });
  await sharp(buffer).toFile(AVATAR_OUTPUT);

  const kb = (buffer.byteLength / 1024).toFixed(0);
  const overBudget = buffer.byteLength > AVATAR_MAX_BYTES ? "  ⚠ au-dessus de 100 Ko" : "";
  console.log(`avatar.webp ← ${basename(sourcePath)} (q${quality}, ${kb} Ko)${overBudget}`);
}

async function run() {
  const projectIds = listProjectDirs();
  let converted = 0;

  for (const projectId of projectIds) {
    const rawImages = listRawImages(projectId);
    if (rawImages.length === 0) continue;

    for (const [index, sourcePath] of rawImages.entries()) {
      const outputName = `${projectId}-${String(index + 1).padStart(2, "0")}.webp`;
      const outputPath = join(PROJECTS_DIR, projectId, outputName);

      const pipeline = sharp(sourcePath).resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
      });
      const { buffer, quality } = await encodeUnderBudget(pipeline);

      mkdirSync(join(PROJECTS_DIR, projectId), { recursive: true });
      await sharp(buffer).toFile(outputPath);

      const kb = (buffer.byteLength / 1024).toFixed(0);
      const overBudget = buffer.byteLength > MAX_BYTES ? "  ⚠ au-dessus de 200 Ko" : "";
      console.log(
        `${projectId}/${outputName} ← ${basename(sourcePath)} (q${quality}, ${kb} Ko)${overBudget}`,
      );
      converted += 1;
    }
  }

  if (converted === 0) {
    console.log("Aucune image source trouvée sous images-src/projects/*/raw/.");
  }

  await processAvatar();
}

run();
