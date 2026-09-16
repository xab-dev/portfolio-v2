import { useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

/** Vrai si l'utilisateur a demandé `prefers-reduced-motion: reduce`. */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// 0.15 s (pas 0.3 s comme `fadeUp`) : budget reduced-motion de la spec 09 §3
// (aucune transform/opacity transitionnée > 150 ms). Trouvé par l'audit
// `scripts/audit-reduced-motion.js` — le duration partagé dépassait le budget
// sur toutes les sections construites avec `SectionShell`.
export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/**
 * Variante reduced-motion de `scaleIn` (Modal — spec 09 §3, trouvé par l'audit :
 * la modale projet ouvrait/fermait avec le fondu+échelle complet même sous
 * `prefers-reduced-motion: reduce`). Fondu simple, ≤ 150 ms.
 */
export const scaleInReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const glowPulse: Variants = {
  rest: { boxShadow: "0 0 0 rgba(59,130,246,0)" },
  hover: {
    boxShadow: "var(--glow-blue)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};
