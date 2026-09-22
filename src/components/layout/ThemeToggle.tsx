import { m } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { site } from "../../content/site";
import { useTheme } from "../../lib/theme/useTheme";
import { useReducedMotionSafe } from "../../lib/motion";
import { useLiteMode } from "../../lib/perf/useLiteMode";

/**
 * Bascule clair ↔ sombre (Phase 9c, spec 12). Deux états seulement, icône
 * seule : `Sun` en thème sombre (cliquer éclaire), `Moon` en thème clair (D1).
 *
 * Pas d'`aria-pressed` : le bouton annonce une action (« Passer en thème
 * clair ») et non l'état d'un interrupteur. Cible ≥ 44 × 44 px (§5).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reducedMotion = useReducedMotionSafe();
  const lite = useLiteMode();
  const isDark = theme === "dark";

  // Aucune transition de couleur au basculement (D8) : seule l'icône s'anime,
  // et seulement si le rendu complet et le mouvement sont acceptés.
  const animated = !reducedMotion && lite === "full";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? site.ui.theme.toLight : site.ui.theme.toDark}
      className="flex h-11 w-11 items-center justify-center rounded-card text-text-primary"
    >
      <m.span
        key={theme}
        initial={animated ? { opacity: 0, rotate: -90 } : false}
        animate={animated ? { opacity: 1, rotate: 0 } : undefined}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex"
      >
        <Icon size={20} aria-hidden="true" />
      </m.span>
    </button>
  );
}
