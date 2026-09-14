import type { PropsWithChildren, ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "../../lib/cn";
import { fadeUp, fadeUpReduced, stagger, useReducedMotionSafe } from "../../lib/motion";

export interface SectionShellProps extends PropsWithChildren {
  id: string;
  title: string;
  subtitle?: ReactNode;
  className?: string;
}

export function SectionShell({ id, title, subtitle, children, className }: SectionShellProps) {
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
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            {title}
          </h2>
          {subtitle ? <p className="max-w-2xl text-text-muted">{subtitle}</p> : null}
        </m.div>
        <m.div variants={itemVariants}>{children}</m.div>
      </m.div>
    </section>
  );
}
