import { AnimatePresence, m } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { Problem } from "../../content/simulator";
import { references } from "../../content/references";
import type { SimulatorOutputs, StackGroup } from "../../lib/simulator/compute";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";
import { NeonButton } from "../ui/NeonButton";
import { RoiCounters } from "./RoiCounters";

export interface StackPanelProps {
  selectedProblems: Problem[];
  outputs: SimulatorOutputs;
  stackGroups: StackGroup[];
  hourlyRate: number;
  onHourlyRateChange: (value: number) => void;
  onDiscuss: () => void;
}

const INDICATIVE_BANNER =
  "Estimation indicative, calculée à partir d'hypothèses affichées. Un chiffrage réel se fait après diagnostic sur site.";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <p className="font-display text-lg text-text-primary">Cochez une problématique</p>
      <p className="max-w-xs text-sm text-text-muted">On commence toujours par le problème, jamais par l'outil.</p>
    </div>
  );
}

function QualitativeState({ problems }: { problems: Problem[] }) {
  const unquantified = problems.filter((problem) => problem.timeSavedPct === undefined);
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-glass bg-bg-deep/40 p-4 text-sm text-text-muted">
      <p className="font-medium text-text-primary">Le gain est qualitatif, pas chiffré ici.</p>
      <ul className="flex flex-col gap-2">
        {unquantified.map((problem) => (
          <li key={problem.id}>
            <span className="font-medium text-text-primary">{problem.label}</span>
            {" — "}
            {problem.qualitativeNote ??
              "Pas de mesure publiée généralisable ; ce gain se discute au cas par cas, pas par compteur."}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StackPanel({
  selectedProblems,
  outputs,
  stackGroups,
  hourlyRate,
  onHourlyRateChange,
  onDiscuss,
}: StackPanelProps) {
  const reducedMotion = useReducedMotionSafe();
  const hasSelection = selectedProblems.length > 0;

  const cited = references.filter((reference) =>
    selectedProblems.some((problem) => problem.evidence.refIds.includes(reference.id)),
  );

  return (
    <div className="flex flex-col gap-6">
      {!hasSelection ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-8">
          {outputs.hasQuantified ? (
            <RoiCounters outputs={outputs} hourlyRate={hourlyRate} onHourlyRateChange={onHourlyRateChange} />
          ) : (
            <QualitativeState problems={selectedProblems} />
          )}

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Stack recommandée</h3>
            <m.div layout transition={{ layout: { duration: reducedMotion ? 0.1 : 0.3 } }} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {stackGroups.map((group) => (
                  <m.div
                    key={group.role}
                    layout
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0.1 : 0.3, layout: { duration: reducedMotion ? 0.1 : 0.3 } }}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-xs text-text-muted">{group.label}</span>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence mode="popLayout">
                        {group.items.map((item) => (
                          <m.span
                            key={item.name}
                            layout
                            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                            transition={{ duration: reducedMotion ? 0.1 : 0.3, layout: { duration: reducedMotion ? 0.1 : 0.3 } }}
                            title={item.why}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm text-text-primary",
                              group.role === "controle"
                                ? "border-neon-emerald/50 bg-neon-emerald/10"
                                : "border-border-glass bg-bg-deep/40",
                            )}
                          >
                            {item.name}
                          </m.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </m.div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Contrôle humain</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
              {selectedProblems.map((problem) => (
                <li key={problem.id}>
                  <span className="font-medium text-text-primary">{problem.label}</span>
                  {" — "}
                  {problem.humanControl}
                </li>
              ))}
            </ul>
          </div>

          {cited.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Sources</h3>
              <ul className="flex flex-col gap-1 text-xs text-text-muted">
                {cited.map((reference) => (
                  <li key={reference.id}>
                    {reference.authors} — {reference.venue}, {reference.year}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <NeonButton onClick={onDiscuss} className="self-start gap-2">
            Discuter de cette stack <ArrowRight size={16} aria-hidden="true" />
          </NeonButton>
        </div>
      )}

      <p className="rounded-card border border-border-glass bg-bg-deep/40 px-4 py-3 text-xs text-text-muted">
        {INDICATIVE_BANNER}
      </p>
    </div>
  );
}
