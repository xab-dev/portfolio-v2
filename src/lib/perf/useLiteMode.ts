import { useState } from "react";
import type { PerfMode } from "./liteMode";

/**
 * Lit `data-perf` posé sur `<html>` par le script inline de `index.html`.
 * Valeur figée au montage : le mode n'est pas suivi à chaud (§4, décision
 * assumée — un changement de pointeur en cours de session n'est pas retracé).
 */
export function useLiteMode(): PerfMode {
  const [mode] = useState<PerfMode>(() => {
    if (typeof document === "undefined") return "full";
    return document.documentElement.getAttribute("data-perf") === "lite" ? "lite" : "full";
  });
  return mode;
}
