// Audit de contraste du thème CLAIR (spec 12, D5/D16) : `axe-core` injecté
// dans la page via CDP, règle `color-contrast` seule, sur chaque point de
// contrôle (§7). Sortie attendue : 0 violation.
//
// Pourquoi axe-core plutôt qu'un calcul maison : les chips à fond translucide
// (`bg-neon-blue/15`, `/25`…) exigent le ratio sur les couleurs **composées**
// réellement rendues. axe-core est une devDependency injectée à l'exécution :
// aucun impact sur le bundle.
//
// Usage :
//   npm run build
//   node scripts/audit-contrast.js
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";
import {
  CONTROL_POINTS,
  WIDTHS,
  closeTab,
  connect,
  forceTheme,
  gotoControlPoint,
  openTab,
  startEnvironment,
} from "./lib/audit-harness.js";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const RUN_AXE = `
  (async function () {
    const results = await window.axe.run(document, {
      runOnly: { type: "rule", values: ["color-contrast"] },
      resultTypes: ["violations"],
    });
    return JSON.stringify(
      results.violations.flatMap((v) =>
        v.nodes.map((n) => ({
          impact: n.impact,
          target: Array.isArray(n.target) ? n.target.join(" ") : String(n.target),
          message: n.any?.[0]?.message ?? v.description,
        })),
      ),
    );
  })()
`;

async function auditWidth(client, width) {
  const mobile = width < 768;
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 1000,
    deviceScaleFactor: 1,
    mobile,
  });
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: mobile,
    maxTouchPoints: mobile ? 5 : 0,
  });

  const results = [];
  for (const point of CONTROL_POINTS) {
    await gotoControlPoint(client, point);
    // axe-core est réinjecté après chaque navigation (contexte JS neuf).
    await client.evaluate(AXE_SOURCE);
    await sleep(150);
    const theme = await client.evaluate("document.documentElement.dataset.theme");
    try {
      const raw = await client.evaluate(RUN_AXE);
      results.push({ label: point.label, theme, violations: JSON.parse(raw) });
    } catch (error) {
      results.push({ label: point.label, theme, error: error.message });
    }
  }
  return results;
}

async function main() {
  let env;
  try {
    env = await startEnvironment();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Chrome : ${env.chromePath}`);
  console.log("Audit `color-contrast` (axe-core) en thème clair…");

  const reports = [];
  try {
    for (const width of WIDTHS) {
      const tab = await openTab();
      const client = await connect(tab.webSocketDebuggerUrl);
      try {
        await client.send("Page.enable");
        await forceTheme(client, "light");
        reports.push({ width, results: await auditWidth(client, width) });
      } finally {
        client.close();
        await closeTab(tab.id);
      }
    }
  } finally {
    env.stop();
  }

  console.log("\n=== Contraste — thème clair (WCAG AA, règle color-contrast) ===\n");
  let anyFlag = false;
  for (const { width, results } of reports) {
    console.log(`--- ${width}px ---`);
    for (const r of results) {
      if (r.error) {
        console.log(`  [ERREUR] ${r.label} — ${r.error}`);
        anyFlag = true;
        continue;
      }
      // Garde-fou : un thème mal appliqué rendrait l'audit vide de sens.
      if (r.theme !== "light") {
        console.log(`  [ERREUR] ${r.label} — thème appliqué "${r.theme}" au lieu de "light"`);
        anyFlag = true;
        continue;
      }
      const count = r.violations.length;
      if (count > 0) anyFlag = true;
      console.log(`  [${count > 0 ? "⚠" : "OK"}] ${r.label} — ${count} violation(s)`);
      for (const v of r.violations) {
        console.log(`      ${v.target} — ${v.message}`);
      }
    }
  }
  console.log(
    anyFlag
      ? "\nRésultat : au moins une violation de contraste en clair — à corriger au token, pas au cas par cas."
      : "\nRésultat : 0 violation `color-contrast` sur tous les points de contrôle, aux deux largeurs.",
  );
  if (anyFlag) process.exitCode = 1;
}

main();
