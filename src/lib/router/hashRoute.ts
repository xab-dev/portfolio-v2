/**
 * Lecture partagée du hash de navigation (`#section` ou `#section/param`),
 * factorisée depuis le deep-link `#projets/<id>` de la Phase 4 (spec 09 §5).
 */
export interface HashRoute {
  section: string;
  param: string | null;
}

export function readHashRoute(): HashRoute {
  const [section, param] = window.location.hash.replace(/^#/, "").split("/");
  return { section: section ?? "", param: param ?? null };
}

export function onHashChange(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

/** Edge case spec 09 §4 : `#mentions-legales` a priorité sur toute autre route de hash. */
export const LEGAL_SECTION = "mentions-legales";

export function isLegalRoute(route: HashRoute): boolean {
  return route.section === LEGAL_SECTION;
}
