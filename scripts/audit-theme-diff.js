// Diff pixel du thème SOMBRE contre la référence prise en fin de Phase 1
// (spec 12, D4) : les Phases 2 et 3 ne doivent rien changer au rendu sombre.
// Capture les points de contrôle (§7) dans les 4 combinaisons
// sombre × {full, lite} × {375, 1280} et compare à `audit/ref-phase1/`.
//
// Usage :
//   npm run build
//   node scripts/audit-theme-diff.js --ref     → (re)prend la référence
//   node scripts/audit-theme-diff.js           → compare et sort en échec si écart
//
// Chrome piloté en CDP brut, `sharp` pour la comparaison (déjà au projet) :
// aucune dépendance ajoutée, même choix que la Phase 6b.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import sharp from "sharp";
import {
  CONTROL_POINTS,
  WIDTHS,
  closeTab,
  connect,
  forcePerf,
  forceTheme,
  gotoControlPoint,
  openTab,
  startEnvironment,
} from "./lib/audit-harness.js";

const REF_DIR = "audit/ref-phase1";
const OUT_DIR = "audit/current";
const HEIGHT = 1000;

// Tolérance par canal : absorbe le bruit d'anti-aliasing du rendu de texte
// entre deux exécutions de Chrome. Les captures sont des PNG (sans perte),
// donc on reste bien plus strict que les 3/255 de la méthode manuelle 6b.
const CHANNEL_TOLERANCE = 2;
// Seuil d'échec : la spec demande 0 px. On garde 0 — les deux sources de bruit
// connues (halo du Hero, iframe haTD) sont masquées avant la capture, pas
// tolérées après coup.
const MAX_DIFF_PIXELS = 0;

/**
 * Masques D4 (documentés en Phase 6b) : le halo animé du Hero respire en
 * continu (~4 200 px de différence entre deux captures pourtant identiques) et
 * l'iframe haTD s'ouvre à son propre rythme. On les rend invisibles **avant**
 * la capture plutôt que de tolérer leurs pixels après coup : le masque est
 * alors explicite et son périmètre est vérifiable.
 */
const APPLY_MASKS = [
  "(function () {",
  "  var masked = 0;",
  "  document.querySelectorAll('iframe').forEach(function (el) {",
  "    el.style.visibility = 'hidden';",
  "    masked++;",
  "  });",
  "  document.querySelectorAll('div[aria-hidden=\"true\"]').forEach(function (el) {",
  "    var bg = el.style.background || '';",
  "    if (bg.indexOf('38rem') !== -1) { el.style.visibility = 'hidden'; masked++; }",
  "  });",
  "  return masked;",
  "})()",
].join("\n");

function combos() {
  const list = [];
  for (const width of WIDTHS) {
    for (const perf of ["full", "lite"]) {
      list.push({ width, perf });
    }
  }
  return list;
}

async function captureCombo(client, { width, perf }, targetDir) {
  const mobile = width < 768;
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile,
  });
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: mobile,
    maxTouchPoints: mobile ? 5 : 0,
  });
  // Mouvement coupé : les reveals et l'icône du bouton ne doivent pas être
  // capturés à mi-animation (source de faux positifs, pas du thème).
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const files = [];
  for (const point of CONTROL_POINTS) {
    await gotoControlPoint(client, point);
    const masked = await client.evaluate(APPLY_MASKS);
    await sleep(200);
    const shot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    const name = `${point.key}--${width}-${perf}.png`;
    writeFileSync(join(targetDir, name), Buffer.from(shot.result.data, "base64"));
    files.push({ name, label: point.label, masked });
  }
  return files;
}

async function diffPair(refPath, curPath) {
  const [ref, cur] = await Promise.all([
    sharp(refPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(curPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (ref.info.width !== cur.info.width || ref.info.height !== cur.info.height) {
    return { differing: -1, note: `taille ${ref.info.width}×${ref.info.height} vs ${cur.info.width}×${cur.info.height}` };
  }
  let differing = 0;
  for (let i = 0; i < ref.data.length; i += 4) {
    if (
      Math.abs(ref.data[i] - cur.data[i]) > CHANNEL_TOLERANCE ||
      Math.abs(ref.data[i + 1] - cur.data[i + 1]) > CHANNEL_TOLERANCE ||
      Math.abs(ref.data[i + 2] - cur.data[i + 2]) > CHANNEL_TOLERANCE ||
      Math.abs(ref.data[i + 3] - cur.data[i + 3]) > CHANNEL_TOLERANCE
    ) {
      differing++;
    }
  }
  return { differing, note: null };
}

async function main() {
  const takeRef = process.argv.includes("--ref");
  const targetDir = takeRef ? REF_DIR : OUT_DIR;
  mkdirSync(targetDir, { recursive: true });

  if (!takeRef && !existsSync(REF_DIR)) {
    console.error(
      `Aucune référence dans ${REF_DIR}/ : lancer d'abord \`node scripts/audit-theme-diff.js --ref\` (fin de Phase 1, D4).`,
    );
    process.exitCode = 1;
    return;
  }

  let env;
  try {
    env = await startEnvironment();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Chrome : ${env.chromePath}`);
  console.log(takeRef ? "Prise de la référence (thème sombre)…" : "Comparaison contre la référence…");

  const captured = [];
  try {
    for (const combo of combos()) {
      const tab = await openTab();
      const client = await connect(tab.webSocketDebuggerUrl);
      try {
        // Thème et mode posés avant tout script de page : rendu correct dès la
        // première frame, donc aucune capture prise pendant un flash.
        await client.send("Page.enable");
        await forceTheme(client, "dark");
        await forcePerf(client, combo.perf);
        const files = await captureCombo(client, combo, targetDir);
        captured.push({ combo, files });
        console.log(`  ${combo.width}px / ${combo.perf} : ${files.length} capture(s)`);
      } finally {
        client.close();
        await closeTab(tab.id);
      }
    }
  } finally {
    env.stop();
  }

  if (takeRef) {
    const total = captured.reduce((n, c) => n + c.files.length, 0);
    console.log(`\nRéférence D4 enregistrée : ${total} captures dans ${REF_DIR}/ (non committées, cf. .gitignore).`);
    return;
  }

  console.log("\n=== Diff pixel — thème sombre contre la référence de fin de Phase 1 (D4) ===\n");
  let worst = 0;
  let anyFlag = false;
  for (const { combo, files } of captured) {
    console.log(`--- ${combo.width}px / ${combo.perf} ---`);
    for (const file of files) {
      const refPath = join(REF_DIR, file.name);
      if (!existsSync(refPath)) {
        console.log(`  [ERREUR] ${file.label} — pas de référence (${file.name})`);
        anyFlag = true;
        continue;
      }
      const { differing, note } = await diffPair(refPath, join(OUT_DIR, file.name));
      if (differing < 0) {
        console.log(`  [ERREUR] ${file.label} — ${note}`);
        anyFlag = true;
        continue;
      }
      worst = Math.max(worst, differing);
      const flagged = differing > MAX_DIFF_PIXELS;
      if (flagged) anyFlag = true;
      console.log(
        `  [${flagged ? "⚠" : "OK"}] ${file.label} — ${differing} px différents (${file.masked} élément(s) masqué(s))`,
      );
    }
  }
  console.log(
    anyFlag
      ? `\nRésultat : écart détecté (pire cas ${worst} px, seuil ${MAX_DIFF_PIXELS}). Captures fautives dans ${OUT_DIR}/.`
      : `\nRésultat : rendu sombre strictement inchangé sur les 4 combinaisons (0 px, tolérance ${CHANNEL_TOLERANCE}/255 par canal).`,
  );
  if (anyFlag) process.exitCode = 1;
}

main();
