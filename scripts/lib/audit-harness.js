// Socle commun aux audits de la Phase 9c (spec 12 §5) : démarrage de
// `vite preview` + Chrome headless, client CDP brut (pas de Puppeteer, §9),
// et liste unique des points de contrôle (§7) partagée par le diff pixel et
// l'audit de contraste — les deux doivent viser exactement les mêmes écrans.
// Reprend le patron de `scripts/audit-reduced-motion.js` (Phase 7).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

export const PREVIEW_PORT = 4173;
export const BASE_URL = `http://localhost:${PREVIEW_PORT}/portfolio-v2/`;
export const CDP_PORT = 9333;
export const WIDTHS = [375, 1280];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

export function findChrome() {
  for (const path of CHROME_CANDIDATES) {
    if (existsSync(path)) return path;
  }
  return null;
}

export async function waitForHttp(url, timeoutMs = 20000) {
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

// --- Client CDP minimal (WebSocket natif Node >= 22, JSON-RPC maison) ---
export class CdpClient {
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

  close() {
    try {
      this.ws.close();
    } catch {
      // déjà fermé
    }
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    const details = res.result?.exceptionDetails;
    if (details) {
      // `text` vaut "Uncaught" tout court : le message utile est dans la
      // description de l'exception (ou son `value` si on a jeté autre chose).
      const message =
        details.exception?.description ?? details.exception?.value ?? details.text ?? "erreur inconnue";
      throw new Error(`Runtime.evaluate a échoué : ${message}`);
    }
    return res.result?.result?.value;
  }
}

export async function openTab() {
  const res = await fetch(`http://localhost:${CDP_PORT}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

export async function closeTab(id) {
  await fetch(`http://localhost:${CDP_PORT}/json/close/${id}`);
}

export async function connect(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", reject);
  });
  return new CdpClient(ws);
}

/**
 * Arrête un processus **et sa descendance**. Sous Windows, `child.kill()` ne
 * tue que le processus lancé : Chrome headless essaime des processus enfants
 * et `vite preview` tourne sous un shell intermédiaire (`shell: true`). Sans
 * ça, le port 4173 et le port CDP restent pris et l'audit suivant échoue —
 * constaté en enchaînant deux exécutions.
 */
function killTree(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    // Ciblé sur ce PID précis (jamais sur un nom d'image : on ne ferme pas le
    // Chrome de l'utilisateur).
    spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill();
}

/** Démarre `vite preview` et Chrome headless ; rend une fonction d'arrêt. */
export async function startEnvironment() {
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error(
      `Chrome introuvable (chemins essayés : ${CHROME_CANDIDATES.join(", ")}). ` +
        "Définir CHROME_PATH ou installer Chrome pour lancer cet audit.",
    );
  }

  const preview = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
    stdio: "ignore",
    shell: true,
  });
  if (!(await waitForHttp(BASE_URL))) {
    preview.kill();
    throw new Error("`vite preview` n'a pas répondu à temps (lancer `npm run build` d'abord ?).");
  }

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
  if (!(await waitForHttp(`http://localhost:${CDP_PORT}/json/version`))) {
    chrome.kill();
    preview.kill();
    throw new Error("Chrome headless n'a pas exposé son port CDP à temps.");
  }

  return {
    chromePath,
    stop() {
      killTree(chrome);
      killTree(preview);
    },
  };
}

export async function navigateAndWaitLoad(client, url) {
  await client.send("Page.enable");
  await client.send("Page.navigate", { url });
  await sleep(800);
}

// --- Points de contrôle (spec 12 §7) : les 7 sections, les mentions légales,
// la FAQ ouverte, une modale projet ouverte, le formulaire de contact avec un
// champ en focus, et l'agent de poche avec une réponse affichée. ---

const FAQ_CLICK = [
  "(function () {",
  "  var btn = Array.from(document.querySelectorAll('#jouer button'))",
  "    .find(function (b) { return (b.textContent || '').indexOf('Comment ce site a') !== -1; });",
  "  if (!btn) throw new Error('FAQ : declencheur introuvable');",
  "  btn.click();",
  "})()",
].join("\n");

const PROJECT_CLICK = [
  "(function () {",
  "  var btn = document.querySelector('#projets button[aria-haspopup=\"dialog\"]');",
  "  if (!btn) throw new Error('Projets : aucune carte ouvrante');",
  "  btn.click();",
  "})()",
].join("\n");

function clickFirstInGroup(label) {
  return [
    "(function () {",
    "  var group = document.querySelector('#contact [role=\"group\"][aria-label=\"" + label + "\"]');",
    "  if (!group) throw new Error('Contact : groupe " + label + " absent');",
    "  var btn = group.querySelector('button');",
    "  if (!btn) throw new Error('Contact : aucun choix dans " + label + "');",
    "  btn.click();",
    "})()",
  ].join("\n");
}

// Les champs de saisie n'existent qu'à l'étape 3 du stepper : on traverse les
// deux premières étapes (type de projet, puis budget et délai) avant de poser
// le focus — sinon le point de contrôle capture une étape sans champ.
const CONTACT_FOCUS = [
  clickFirstInGroup("Type de projet"),
  clickFirstInGroup("Budget"),
  clickFirstInGroup("Délai"),
  [
    "(function () {",
    "  var field = document.querySelector('#contact input, #contact textarea');",
    "  if (!field) throw new Error('Contact : aucun champ a l etape 3');",
    "  field.focus();",
    "})()",
  ].join("\n"),
];

const AGENT_ASK = [
  "(function () {",
  "  var btn = Array.from(document.querySelectorAll('#hero button'))",
  "    .find(function (b) {",
  "      return b.getAttribute('aria-label') !== 'Envoyer' && (b.textContent || '').trim().length > 0;",
  "    });",
  "  if (!btn) throw new Error('Agent : aucune puce de suggestion');",
  "  btn.click();",
  "})()",
].join("\n");

export const CONTROL_POINTS = [
  { key: "01-hero", label: "Accueil", hash: "#hero", scrollTo: "hero" },
  { key: "02-simulateur", label: "Simulateur", hash: "#hero", scrollTo: "simulateur" },
  { key: "03-playground", label: "Playground", hash: "#hero", scrollTo: "playground" },
  { key: "04-projets", label: "Projets", hash: "#hero", scrollTo: "projets" },
  { key: "05-competences", label: "Compétences", hash: "#hero", scrollTo: "competences" },
  { key: "06-contact", label: "Contact", hash: "#hero", scrollTo: "contact" },
  { key: "07-jouer", label: "Jouer", hash: "#hero", scrollTo: "jouer" },
  { key: "08-mentions-legales", label: "Mentions légales", hash: "#mentions-legales" },
  {
    key: "09-faq",
    label: "FAQ (modale ouverte)",
    hash: "#hero",
    scrollTo: "jouer",
    interact: FAQ_CLICK,
  },
  {
    key: "10-projet-modale",
    label: "Modale projet ouverte",
    hash: "#hero",
    scrollTo: "projets",
    interact: PROJECT_CLICK,
  },
  {
    key: "11-contact-focus",
    label: "Contact — champ en focus",
    hash: "#hero",
    scrollTo: "contact",
    interact: CONTACT_FOCUS,
  },
  {
    key: "12-agent-reponse",
    label: "Agent de poche — réponse affichée",
    hash: "#hero",
    scrollTo: "hero",
    interact: AGENT_ASK,
  },
];

/** Amène la page sur un point de contrôle (navigation fraîche à chaque fois). */
export async function gotoControlPoint(client, point) {
  await navigateAndWaitLoad(client, `${BASE_URL}${point.hash}`);
  if (point.scrollTo) {
    await client.evaluate(
      `document.getElementById(${JSON.stringify(point.scrollTo)})?.scrollIntoView({behavior: "instant", block: "start"})`,
    );
    await sleep(300);
  }
  // `interact` accepte une expression seule ou une séquence : certains écrans
  // se gagnent en plusieurs clics (le stepper du formulaire de contact).
  const steps = point.interact
    ? Array.isArray(point.interact)
      ? point.interact
      : [point.interact]
    : [];
  for (const step of steps) {
    try {
      await client.evaluate(step);
    } catch (error) {
      throw new Error(`Point de contrôle "${point.key}" — ${error.message}`);
    }
    await sleep(400);
  }
  if (steps.length > 0) await sleep(300);

  // Les polices doivent être posées avant toute capture ou mesure : à la
  // toute première visite d'une instance de Chrome, elles arrivent après le
  // premier rendu et le texte est dessiné en police de repli. Sans cette
  // attente, seule la première combinaison capturée différait de la référence
  // (jusqu'à 35 000 px d'écart pour un rendu pourtant identique).
  await client.evaluate("document.fonts.ready.then(function () { return true; })");
  await sleep(150);
}

/**
 * Pré-pose la clé `theme` avant tout script de page : c'est exactement l'état
 * laissé par un clic sur le bouton, donc le thème est appliqué dès le premier
 * rendu (aucun flash à capturer).
 */
export async function forceTheme(client, theme) {
  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("theme", ${JSON.stringify(theme)}); } catch (e) {}`,
  });
}

/** Pré-pose le mode de rendu (`lite` / `full`) de la même façon. */
export async function forcePerf(client, mode) {
  await client.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { sessionStorage.setItem("perf", ${JSON.stringify(mode)}); } catch (e) {}`,
  });
}
