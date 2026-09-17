import { m } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { fadeUp, fadeUpReduced, revealViewport, shouldSkipReveal, useReducedMotionSafe } from "../../lib/motion";

export type RevealProps = HTMLMotionProps<"div">;

/**
 * Primitive de reveal au scroll (Phase 0, généralisée par
 * `PATCHES_2026-09-17_fix-skills-mobile.md`). Remplace `<div>` : s'utilise
 * BLOC PAR BLOC (une carte, un groupe de badges, une légende…), jamais sur un
 * conteneur qui peut dépasser un écran de téléphone — voir `revealViewport`
 * dans `lib/motion.ts` pour la règle et sa raison d'être (Bug 1 : section
 * Compétences invisible pour toujours sur Galaxy A04 / Firefox Android).
 */
export function Reveal({ children, ...rest }: RevealProps) {
  const reducedMotion = useReducedMotionSafe();
  const skip = shouldSkipReveal(reducedMotion);
  const variants = reducedMotion ? fadeUpReduced : fadeUp;

  return (
    <m.div
      variants={variants}
      initial={skip ? false : "hidden"}
      animate={skip ? "visible" : undefined}
      whileInView={skip ? undefined : "visible"}
      viewport={skip ? undefined : revealViewport}
      {...rest}
    >
      {children}
    </m.div>
  );
}
