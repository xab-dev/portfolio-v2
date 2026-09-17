import { site } from "./site";

// [DECISION Phase 1] `eyebrow` dérive de site.title/site.location plutôt que de
// dupliquer une chaîne en dur : c'est le "titre public" (T10, réponse S5 de Xav)
// qui doit apparaître dans le Hero, pas la valeur générique du brouillon de spec.
export const hero = {
  eyebrow: `${site.title} · ${site.location}`,
  title: "L'IA n'a de valeur que si elle résout un vrai problème.",
  subtitle:
    "Je conçois des workflows, des outils et des usages IA adaptés aux besoins réels — et je dis aussi quand l'IA n'est pas le bon outil.",
  ctaPrimary: { label: "Voir mes projets", href: "#projets" },
  ctaSecondary: { label: "Qualifier votre besoin", href: "#contact" },
  // DETTE-02 résolue : avatar dessiné par Xav, traité en carré 512px ≤100 Ko
  // par `npm run images` (voir scripts/process-images.js). Le repli initiales
  // reste géré par HeroAvatar si `src` est vide (robustesse, pas un besoin actuel).
  avatar: { src: "/images/avatar.webp", alt: "Silhouette encapuchonnée — avatar de Xav", initials: initialsOf(site.name) },
};

/** "Xavier Joseph Bou" → "XB" (première lettre du premier et du dernier mot). */
function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = words.at(0)?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
