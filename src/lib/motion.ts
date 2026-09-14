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

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
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

export const glowPulse: Variants = {
  rest: { boxShadow: "0 0 0 rgba(59,130,246,0)" },
  hover: {
    boxShadow: "var(--glow-blue)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};
