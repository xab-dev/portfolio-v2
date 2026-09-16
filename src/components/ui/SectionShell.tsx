import type { PropsWithChildren, ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "../../lib/cn";
import { fadeUp, fadeUpReduced, stagger, useReducedMotionSafe } from "../../lib/motion";

export interface SectionShellProps extends PropsWithChildren {
  id: string;
  title: string;
  subtitle?: ReactNode;
  className?: string;
  /** Action affichée à droite du titre (desktop) / sous le sous-titre (mobile). Réservée à `Play` (spec 10 §3). */
  headerAction?: ReactNode;
}

export function SectionShell({ id, title, subtitle, children, className, headerAction }: SectionShellProps) {
  const reducedMotion = useReducedMotionSafe();
  const itemVariants = reducedMotion ? fadeUpReduced : fadeUp;

  return (
    <section
      id={id}
      className={cn("scroll-mt-24 px-6 py-16 md:px-12 md:py-28", className)}
    >
      <m.div
        className="mx-auto flex max-w-5xl flex-col gap-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <m.div variants={itemVariants} className="flex flex-col gap-3">
          {headerAction ? (
            // `relative`/`absolute` plutôt qu'un item flex à côté du titre : un item flex
            // aurait réduit la largeur dispo du titre et changé son retour à la ligne
            // (donc la hauteur de l'en-tête, donc la position de tout ce qui suit — le
            // critère maître §7.1 exige que seule la zone du bouton diffère dans Jouer).
            // L'action flotte dans l'espace déjà libre à droite du titre sans toucher au
            // flux du texte.
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
                {title}
              </h2>
              <div className="absolute right-0 top-0 hidden md:block">{headerAction}</div>
            </div>
          ) : (
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
              {title}
            </h2>
          )}
          {subtitle ? <p className="max-w-2xl text-text-muted">{subtitle}</p> : null}
          {headerAction ? <div className="md:hidden">{headerAction}</div> : null}
        </m.div>
        <m.div variants={itemVariants}>{children}</m.div>
      </m.div>
    </section>
  );
}
