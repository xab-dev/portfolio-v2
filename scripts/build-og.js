// Génère public/og.png (1200×630, ≤ 150 Ko) à partir de `public/images/avatar.webp`
// et de `src/content/site.ts` : fond #0B0F19, avatar en cercle à gauche, nom +
// titre à droite, un seul filet néon bleu. Sobre : placeholder jusqu'au « skin »
// perso post-V1 (spec 09 §2). Non exécuté par GitHub Actions (image commitée) —
// à relancer à la main (`npm run og`) si `site.name`/`site.title` changent.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const AVATAR_PATH = join(ROOT, "public", "images", "avatar.webp");
const OUTPUT_PATH = join(ROOT, "public", "og.png");
const WIDTH = 1200;
const HEIGHT = 630;
const AVATAR_SIZE = 360;
const AVATAR_X = 120;
const TEXT_X = 560;
const MAX_BYTES = 150 * 1024;

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function buildAvatarCircle() {
  const circleMask = Buffer.from(
    `<svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}"><circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="#fff"/></svg>`,
  );
  return sharp(AVATAR_PATH)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

function buildTextOverlay(name, title) {
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <text x="${TEXT_X}" y="290" font-family="Space Grotesk, Arial, sans-serif" font-size="56" font-weight="700" fill="#e5e7eb">${escapeXml(name)}</text>
      <text x="${TEXT_X}" y="336" font-family="Inter, Arial, sans-serif" font-size="26" fill="#9ca3af">${escapeXml(title)}</text>
      <rect x="${TEXT_X}" y="366" width="360" height="3" fill="#3b82f6"/>
    </svg>
  `;
  return Buffer.from(svg);
}

async function run() {
  const { site } = await import("../src/content/site.ts");

  const avatarCircle = await buildAvatarCircle();
  const textOverlay = buildTextOverlay(site.name, site.title);
  const avatarY = Math.round((HEIGHT - AVATAR_SIZE) / 2);

  const buffer = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#0b0f19" },
  })
    .composite([
      { input: avatarCircle, left: AVATAR_X, top: avatarY },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Écriture directe du buffer déjà encodé (compressionLevel 9) : repasser
  // par `sharp().toFile()` décoderait/ré-encoderait en PNG avec les réglages
  // par défaut (compressionLevel 6), produisant un fichier plus lourd que
  // celui mesuré ci-dessous — bug trouvé en vérifiant la taille réelle sur disque.
  writeFileSync(OUTPUT_PATH, buffer);

  const kb = (buffer.byteLength / 1024).toFixed(0);
  const overBudget = buffer.byteLength > MAX_BYTES ? "  ⚠ au-dessus de 150 Ko" : "";
  console.log(`og.png ← avatar.webp + site.ts (${WIDTH}×${HEIGHT}, ${kb} Ko)${overBudget}`);
}

run();
