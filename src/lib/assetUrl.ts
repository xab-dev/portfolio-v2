// Préfixe un chemin absolu (ex. "/images/x.webp") avec le `base` Vite
// (`/portfolio-v2/` en production) : les fichiers de `public/` ne passent pas
// par le bundler, leurs chemins ne sont donc jamais réécrits automatiquement.
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}
