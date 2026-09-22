// Convertit images-src/projects/<id>/raw/*.{png,jpg,jpeg} en
// public/images/projects/<id>/<id>-NN.webp (1600px max, ~200 Ko max), et
// images-src/avatar/raw/* en public/images/avatar.webp + avatar-light.webp
// (carrés 512px, ~100 Ko max). Les originaux vivent hors de public/ (jamais copiés
// dans le build) et hors du repo (voir .gitignore, DETTE-14).
//
// Convention de nommage de l'avatar (Phase 9c/4) : un fichier source dont le nom
// contient `mode-clair` alimente `avatar-light.webp` (affiché en thème clair) ;
// le premier des fichiers restants, par ordre alphabétique, alimente
// `avatar.webp` (thème sombre, et seule image utilisée par l'OG et le CV).
// Le tri par nom seul ne suffisait plus : `avatar_mode-clair.jpg` passe *après*
// `20230603_001451.png`, mais s'appuyer sur cet ordre aurait fait dépendre le
// rendu sombre — gelé par D4, spec 12 — du nom d'un fichier qu'on ne contrôle pas.
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
const AVATAR_OUTPUT_DIR = join(process.cwd(), "public", "images");
/** Marqueur, dans le nom du fichier source, de la variante « thème clair ». */
const AVATAR_LIGHT_MARKER = "mode-clair";
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

/**
 * Répartit les sources de `images-src/avatar/raw/` entre les deux variantes.
 * Renvoie `{ dark, light }`, chaque entrée étant un chemin ou `null`.
 */
function listAvatarSources() {
  let names;
  try {
    names = readdirSync(AVATAR_SOURCE_DIR)
      .filter((name) => SOURCE_EXTENSIONS.has(extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "fr"));
  } catch {
    return { dark: null, light: null };
  }

  const isLight = (name) => name.toLowerCase().includes(AVATAR_LIGHT_MARKER);
  const light = names.find(isLight) ?? null;
  const dark = names.find((name) => !isLight(name)) ?? null;

  return {
    dark: dark ? join(AVATAR_SOURCE_DIR, dark) : null,
    light: light ? join(AVATAR_SOURCE_DIR, light) : null,
  };
}

/** Encode une source en carré 512px sous budget et l'écrit dans public/images/. */
async function writeAvatarVariant(sourcePath, outputName) {
  const pipeline = sharp(sourcePath).resize({
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    fit: "cover",
  });
  const { buffer, quality } = await encodeUnderBudget(pipeline, AVATAR_MAX_BYTES);

  mkdirSync(AVATAR_OUTPUT_DIR, { recursive: true });
  await sharp(buffer).toFile(join(AVATAR_OUTPUT_DIR, outputName));

  const kb = (buffer.byteLength / 1024).toFixed(0);
  const overBudget = buffer.byteLength > AVATAR_MAX_BYTES ? "  ⚠ au-dessus de 100 Ko" : "";
  console.log(`${outputName} ← ${basename(sourcePath)} (q${quality}, ${kb} Ko)${overBudget}`);
}

async function processAvatar() {
  const { dark, light } = listAvatarSources();

  if (!dark && !light) {
    console.log("Aucune image source trouvée sous images-src/avatar/raw/.");
    return;
  }

  if (dark) {
    await writeAvatarVariant(dark, "avatar.webp");
  } else {
    console.log(
      "Aucune source pour avatar.webp (thème sombre) : tous les fichiers portent le marqueur " +
        `\`${AVATAR_LIGHT_MARKER}\`. avatar.webp est laissé en l'état.`,
    );
  }

  if (light) {
    await writeAvatarVariant(light, "avatar-light.webp");
  } else {
    console.log(
      `Aucune source \`${AVATAR_LIGHT_MARKER}\` : avatar-light.webp est laissé en l'état ` +
        "(le Hero retombe sur avatar.webp si le fichier n'existe pas).",
    );
  }
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
