import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";

export interface StepperProps {
  step: 1 | 2 | 3;
  labels: [string, string, string];
  children: ReactNode;
}

const STEP_COUNT = 3;

/** Barre de progression + conteneur d'étape animé (slide). Ne porte aucun état de formulaire. */
export function Stepper({ step, labels, children }: StepperProps) {
  const reducedMotion = useReducedMotionSafe();
  const progressPercent = (step / STEP_COUNT) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-deep">
          <m.div
            className="h-full rounded-full bg-neon-blue"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex flex-wrap justify-between gap-x-2 text-xs text-text-muted">
          {labels.map((label, index) => (
            <span key={label} className={cn(index + 1 <= step && "text-text-primary")}>
              {index + 1}. {label}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={step}
          initial={reducedMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
