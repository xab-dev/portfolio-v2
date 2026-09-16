import { m } from "motion/react";
import { problems } from "../../content/simulator";
import type { BaselineOverrides } from "../../lib/simulator/compute";
import { resolveBaseline } from "../../lib/simulator/compute";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";
import { EvidenceBadge } from "./EvidenceBadge";
import { RangeSlider } from "./RangeSlider";

export interface ProblemGridProps {
  selection: string[];
  baselineOverrides: BaselineOverrides;
  onToggle: (id: string) => void;
  onBaselineChange: (id: string, value: number) => void;
}

export function ProblemGrid({ selection, baselineOverrides, onToggle, onBaselineChange }: ProblemGridProps) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <div role="group" aria-label="Problématiques" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {problems.map((problem) => {
        const checked = selection.includes(problem.id);
        const Icon = problem.icon;
        const baseline = resolveBaseline(problem, baselineOverrides);

        return (
          <div
            key={problem.id}
            className={cn(
              "flex flex-col gap-3 rounded-card border p-4 transition-colors duration-base",
              checked ? "border-neon-blue bg-neon-blue/5" : "border-border-glass bg-bg-panel",
            )}
          >
            <button
              type="button"
              aria-pressed={checked}
              onClick={() => onToggle(problem.id)}
              className="flex items-start gap-3 text-left"
            >
              <Icon
                className={cn("mt-0.5 h-5 w-5 shrink-0", checked ? "text-neon-blue" : "text-text-muted")}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-1">
                <span className="font-medium text-text-primary">{problem.label}</span>
                <span className="text-sm text-text-muted">{problem.description}</span>
              </span>
            </button>

            {checked ? (
              <m.div
                initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: reducedMotion ? 0 : 0.25 }}
                className="flex flex-col gap-3 overflow-hidden border-t border-border-glass pt-3"
              >
                <EvidenceBadge
                  level={problem.evidence.level}
                  summary={problem.evidence.summary}
                  refIds={problem.evidence.refIds}
                />

                {problem.baseline ? (
                  <RangeSlider
                    id={`baseline-${problem.id}`}
                    label="Temps passé aujourd'hui"
                    value={baseline}
                    min={problem.baseline.min}
                    max={problem.baseline.max}
                    step={problem.baseline.step}
                    suffix=" h/sem"
                    onChange={(value) => onBaselineChange(problem.id, value)}
                  />
                ) : null}

                {problem.aiNotNeededIf ? (
                  <p className="text-xs text-text-muted">
                    <span className="font-medium text-text-primary">Quand ce n'est pas la bonne réponse : </span>
                    {problem.aiNotNeededIf}
                  </p>
                ) : null}
              </m.div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
