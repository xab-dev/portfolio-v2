import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Font } from "@react-pdf/renderer";

/**
 * Enregistrement des polices du CV (spec 09 §3) : `Space Grotesk` (titres) et
 * `Inter` (texte), déjà présentes via `@fontsource/*`. `@react-pdf/renderer`
 * lit TTF/OTF/WOFF côté Node — **pas WOFF2** — en passant un chemin de
 * fichier local à `Font.register` (résolu via `fontkit.open`, pas `fetch` :
 * le `fetch` natif de Node ne sait pas lire un chemin de fichier local, piège
 * découvert pendant cette session — voir JOURNAL_DEV.md).
 *
 * `initFonts()` vérifie l'enregistrement réel (un `Font.load` par graisse) et
 * bascule sur les polices intégrées (`Helvetica`/`Helvetica-Bold`) en cas
 * d'échec — même logique de repli documenté que `motion` en Phase 0.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

export const FONT_INTER = "Inter";
export const FONT_DISPLAY = "Space Grotesk";
export const FONT_FALLBACK_BODY = "Helvetica";
export const FONT_FALLBACK_DISPLAY = "Helvetica-Bold";

const WEIGHTS = [400, 500, 600, 700] as const;

function woffPath(pkg: string, family: string, weight: number): string {
  return join(root, "node_modules", "@fontsource", pkg, "files", `${family}-latin-${weight}-normal.woff`);
}

export interface FontInitResult {
  ok: boolean;
  bodyFamily: string;
  displayFamily: string;
  /** Détail des échecs éventuels, à consigner dans le journal. */
  issues: string[];
}

export async function initFonts(): Promise<FontInitResult> {
  const issues: string[] = [];

  const interSources = WEIGHTS.map((weight) => ({ src: woffPath("inter", "inter", weight), fontWeight: weight }));
  const displaySources = WEIGHTS.map((weight) => ({
    src: woffPath("space-grotesk", "space-grotesk", weight),
    fontWeight: weight,
  }));

  for (const source of [...interSources, ...displaySources]) {
    if (!existsSync(source.src)) issues.push(`Fichier introuvable : ${source.src}`);
  }
  if (issues.length > 0) {
    return { ok: false, bodyFamily: FONT_FALLBACK_BODY, displayFamily: FONT_FALLBACK_DISPLAY, issues };
  }

  Font.register({ family: FONT_INTER, fonts: interSources });
  Font.register({ family: FONT_DISPLAY, fonts: displaySources });

  try {
    for (const weight of WEIGHTS) {
      await Font.load({ fontFamily: FONT_INTER, fontWeight: weight });
      await Font.load({ fontFamily: FONT_DISPLAY, fontWeight: weight });
    }
  } catch (error) {
    Font.clear();
    issues.push(error instanceof Error ? error.message : String(error));
    return { ok: false, bodyFamily: FONT_FALLBACK_BODY, displayFamily: FONT_FALLBACK_DISPLAY, issues };
  }

  return { ok: true, bodyFamily: FONT_INTER, displayFamily: FONT_DISPLAY, issues: [] };
}

export interface CvFontVariant {
  fontFamily: string;
  fontWeight: number;
}

export interface CvFontSet {
  body: CvFontVariant;
  bodyMedium: CvFontVariant;
  bodyBold: CvFontVariant;
  display: CvFontVariant;
}

/**
 * Traduit le résultat de `initFonts()` en graisses concrètes pour `CvDocument`.
 * En repli Helvetica, la graisse n'existe qu'au travers du nom de police
 * PostScript (`Helvetica-Bold`) — pas d'un `fontWeight` numérique.
 */
export function resolveFontSet(result: FontInitResult): CvFontSet {
  if (result.ok) {
    return {
      body: { fontFamily: result.bodyFamily, fontWeight: 400 },
      bodyMedium: { fontFamily: result.bodyFamily, fontWeight: 500 },
      bodyBold: { fontFamily: result.bodyFamily, fontWeight: 700 },
      display: { fontFamily: result.displayFamily, fontWeight: 700 },
    };
  }
  return {
    body: { fontFamily: FONT_FALLBACK_BODY, fontWeight: 400 },
    bodyMedium: { fontFamily: FONT_FALLBACK_BODY, fontWeight: 400 },
    bodyBold: { fontFamily: FONT_FALLBACK_DISPLAY, fontWeight: 700 },
    display: { fontFamily: FONT_FALLBACK_DISPLAY, fontWeight: 700 },
  };
}
