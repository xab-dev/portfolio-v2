// Audit `prefers-reduced-motion: reduce` par émulation réelle (spec 09 §3),
// à 375 px et 1280 px, sur toutes les sections livrées + la page Mentions
// légales. Pilote Chrome headless en CDP brut (pas de dépendance ajoutée au
// projet — même choix que le script maison de la Phase 6b, voir JOURNAL_DEV.md).
// Nécessite Chrome installé localement (`CHROME_PATH` pour surcharger le chemin).
//
// Usage : `npm run preview` dans un terminal, puis `node scripts/audit-reduced-motion.js`
// (ou laisser ce script démarrer/arrêter son propre `vite preview`, comportement par défaut).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PREVIEW_PORT = 4173;
const BASE_URL = `http://localhost:${PREVIEW_PORT}/portfolio-v2/`;
const CDP_PORT = 9333;
const WIDTHS = [375, 1280];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

function findChrome() {
  for (const path of CHROME_CANDIDATES) {
    if (existsSync(path)) return path;
  }
  return null;
}

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // pas encore prêt
    }
    await sleep(200);
  }
  return false;
}

// --- Client CDP minimal (WebSocket natif Node ≥ 22, JSON-RPC maison) ---
class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id).resolve(msg);
        this.pending.delete(msg.id);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (res.result?.exceptionDetails) {
      throw new Error(`Runtime.evaluate a échoué : ${res.result.exceptionDetails.text}`);
    }
    return res.result?.result?.value;
  }
}

async function openTab() {
  const res = await fetch(`http://localhost:${CDP_PORT}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

async function closeTab(id) {
  await fetch(`http://localhost:${CDP_PORT}/json/close/${id}`);
}

async function connect(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", reject);
  });
  return new CdpClient(ws);
}

async function navigateAndWaitLoad(client, url) {
  await client.send("Page.enable");
  const loaded = client.send("Page.navigate", { url });
  await loaded;
  // Attente pragmatique du load event (pas de souscription persistante nécessaire ici).
  await sleep(600);
}

const ANIMATION_BUDGET_MS = 150;

// La règle de la spec 09 §3 ("aucune transform/opacity transitionnée > 150 ms")
// ne vise QUE `transform`/`opacity` : les transitions CSS de couleur (état
// coché d'une carte, focus, hover) ne sont pas de la « motion » vestibulaire
// et restent hors budget — trouvé en diagnostiquant de faux positifs (5
// `CSSTransition` sur `background-color`/`border-*-color`, aucune sur
// `transform`/`opacity`) via `document.getAnimations()[i].transitionProperty`
// (CSS Transitions) / `effect.getKeyframes()` (animations à base de keyframes,
// dont celles générées par `motion`).
const COLLECT_ANIMATIONS_JS = `
  JSON.stringify(document.getAnimations().map((a) => {
    const timing = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
    let properties = [];
    if (a.transitionProperty) {
      properties = [a.transitionProperty];
    } else if (a.effect && a.effect.getKeyframes) {
      const seen = new Set();
      for (const kf of a.effect.getKeyframes()) {
        for (const key of Object.keys(kf)) {
          if (key !== "offset" && key !== "easing" && key !== "composite") seen.add(key);
        }
      }
      properties = Array.from(seen);
    }
    return {
      playState: a.playState,
      durationMs: typeof timing.duration === "number" ? timing.duration : null,
      delayMs: timing.delay ?? 0,
      iterations: timing.iterations ?? 1,
      properties,
      targetTag: a.effect && a.effect.target ? a.effect.target.tagName : null,
      targetClass: a.effect && a.effect.target ? a.effect.target.className : null,
    };
  }))
`;

async function checkEmulationApplied(client, expectCoarsePointer) {
  const reducedOk = await client.evaluate(
    "window.matchMedia('(prefers-reduced-motion: reduce)').matches",
  );
  const pointerOk = expectCoarsePointer
    ? await client.evaluate("window.matchMedia('(pointer: coarse)').matches")
    : true;
  return { reducedOk, pointerOk };
}

function isMotionProperty(name) {
  return name === "opacity" || name === "transform" || name.startsWith("transform-") || name === "translate" || name === "scale" || name === "rotate";
}

async function snapshotAnimations(client) {
  const raw = await client.evaluate(COLLECT_ANIMATIONS_JS);
  const animations = JSON.parse(raw);
  // Seules `transform`/`opacity` sont couvertes par le budget 150 ms (spec 09 §3) —
  // une transition de couleur (état coché, focus) n'est pas de la motion vestibulaire.
  const motionAnimations = animations.filter((a) => a.properties.some(isMotionProperty));
  const finite = motionAnimations.filter((a) => Number.isFinite(a.durationMs) && a.iterations !== Infinity);
  const infinite = motionAnimations.filter((a) => a.iterations === Infinity || !Number.isFinite(a.durationMs));
  const maxFiniteMs = finite.reduce((max, a) => Math.max(max, a.durationMs ?? 0), 0);
  return {
    count: animations.length,
    motionCount: motionAnimations.length,
    maxFiniteMs,
    infiniteCount: infinite.length,
    raw: animations,
  };
}

const INTERACTIONS = {
  simulateur: `
    (function () {
      const btn = document.querySelector('[role="group"][aria-label="Problématiques"] button');
      if (btn) btn.click();
    })()
  `,
  playground: `
    (function () {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === "Passer par l'agent");
      if (btn) btn.click();
    })()
  `,
  projets: `
    (function () {
      const btn = document.querySelector('#projets button[aria-haspopup="dialog"]');
      if (btn) btn.click();
    })()
  `,
  contact: `
    (function () {
      const first = (label) => document.querySelector('[role="group"][aria-label="' + label + '"] button');
      first("Type de projet")?.click();
    })()
  `,
  faq: `
    (function () {
      const btn = Array.from(document.querySelectorAll('#jouer button')).find((b) => b.textContent?.includes("Comment ce site a été créé"));
      if (btn) btn.click();
    })()
  `,
};

const STOPS = [
  { id: "hero", label: "Hero + agent de poche" },
  { id: "simulateur", label: "Simulateur", interactKey: "simulateur" },
  { id: "playground", label: "Prompt Playground", interactKey: "playground" },
  { id: "projets", label: "Portfolio + modale projet", interactKey: "projets" },
  { id: "competences", label: "Skills radar/badges" },
  { id: "competences", label: "Timeline (défilée depuis Compétences)", extraScroll: 700 },
  { id: "contact", label: "Contact stepper", interactKey: "contact" },
  { id: "jouer", label: "Jouer" },
  { id: "jouer", label: "Jouer — FAQ ouverte (spec 10 §7.4)", interactKey: "faq" },
];

async function auditWidth(client, width) {
  const mobile = width < 768;
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 1000,
    deviceScaleFactor: 1,
    mobile,
  });
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 0 });
  await client.send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: "reduce" },
      ...(mobile ? [{ name: "pointer", value: "coarse" }] : []),
    ],
  });

  await navigateAndWaitLoad(client, `${BASE_URL}#hero`);
  const emulation = await checkEmulationApplied(client, mobile);

  const results = [];
  for (const stop of STOPS) {
    await client.evaluate(
      `document.getElementById(${JSON.stringify(stop.id)})?.scrollIntoView({behavior: "instant", block: "start"})`,
    );
    if (stop.extraScroll) {
      await client.evaluate(`window.scrollBy(0, ${stop.extraScroll})`);
    }
    await sleep(250);
    if (stop.interactKey && INTERACTIONS[stop.interactKey]) {
      try {
        await client.evaluate(INTERACTIONS[stop.interactKey]);
      } catch (error) {
        results.push({ width, label: stop.label, error: `interaction : ${error.message}` });
        continue;
      }
      await sleep(250);
    }
    const snap = await snapshotAnimations(client);
    results.push({ width, label: stop.label, ...snap });
  }

  // Jouer, mobile : ouvrir le teaser (bouton "Voir l'intro") et re-snapshot.
  if (mobile) {
    await client.evaluate(
      `document.getElementById("jouer")?.scrollIntoView({behavior: "instant", block: "start"})`,
    );
    await sleep(200);
    await client.evaluate(`
      (function () {
        const btn = Array.from(document.querySelectorAll('#jouer button')).find((b) => b.textContent?.includes("Voir l'intro"));
        if (btn) btn.click();
      })()
    `);
    await sleep(250);
    const snap = await snapshotAnimations(client);
    results.push({ width, label: "Jouer — overlay teaser ouvert", ...snap });
  }

  // Mentions légales : navigation fraîche (remplace toute la vue, spec 09 §3).
  await navigateAndWaitLoad(client, `${BASE_URL}#mentions-legales`);
  await sleep(250);
  const legalSnap = await snapshotAnimations(client);
  results.push({ width, label: "Mentions légales", ...legalSnap });

  return { emulation, results };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error(
      "Chrome introuvable (chemins essayés : " +
        CHROME_CANDIDATES.join(", ") +
        "). Définir CHROME_PATH ou installer Chrome pour lancer cet audit.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Chrome : ${chromePath}`);
  console.log("Démarrage de `vite preview`…");
  const preview = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
    stdio: "ignore",
    shell: true,
  });

  const previewReady = await waitForHttp(BASE_URL);
  if (!previewReady) {
    console.error("`vite preview` n'a pas répondu à temps.");
    preview.kill();
    process.exitCode = 1;
    return;
  }

  console.log("Démarrage de Chrome headless…");
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${CDP_PORT}`,
      "--window-size=1280,1000",
    ],
    { stdio: "ignore" },
  );

  const chromeReady = await waitForHttp(`http://localhost:${CDP_PORT}/json/version`);
  if (!chromeReady) {
    console.error("Chrome headless n'a pas exposé son port CDP à temps.");
    chrome.kill();
    preview.kill();
    process.exitCode = 1;
    return;
  }

  const allReports = [];
  try {
    for (const width of WIDTHS) {
      const tabInfo = await openTab();
      const client = await connect(tabInfo.webSocketDebuggerUrl);
      try {
        const report = await auditWidth(client, width);
        allReports.push(report);
      } finally {
        await closeTab(tabInfo.id);
      }
    }
  } finally {
    chrome.kill();
    preview.kill();
  }

  console.log("\n=== Audit prefers-reduced-motion (spec 09 §3) ===\n");
  let anyFlag = false;
  for (const { emulation, results } of allReports) {
    const width = results[0]?.width;
    console.log(
      `--- ${width}px --- émulation reduced-motion appliquée : ${emulation.reducedOk} ; pointer:coarse appliqué : ${emulation.pointerOk}`,
    );
    if (!emulation.reducedOk || !emulation.pointerOk) anyFlag = true;
    for (const r of results) {
      if (r.error) {
        console.log(`  [ERREUR] ${r.label} — ${r.error}`);
        anyFlag = true;
        continue;
      }
      const flagged = r.maxFiniteMs > ANIMATION_BUDGET_MS || r.infiniteCount > 0;
      if (flagged) anyFlag = true;
      const status = flagged ? "⚠" : "OK";
      console.log(
        `  [${status}] ${r.label} — ${r.count} animation(s) dont ${r.motionCount} transform/opacity, max ${r.maxFiniteMs} ms, ${r.infiniteCount} boucle(s) infinie(s)`,
      );
      if (flagged) console.log(`      détail : ${JSON.stringify(r.raw)}`);
    }
  }
  console.log(
    anyFlag
      ? "\nRésultat : au moins un écart détecté (voir ⚠ ci-dessus) — à corriger à la cause dans le composant concerné."
      : "\nRésultat : conforme sur tous les points vérifiés (getAnimations() vide ou ≤ 150 ms partout).",
  );
}

main();
