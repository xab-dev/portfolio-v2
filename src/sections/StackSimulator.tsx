import { useMemo, useState } from "react";
import { SectionShell } from "../components/ui/SectionShell";
import { GlassCard } from "../components/ui/GlassCard";
import { ProblemGrid } from "../components/simulator/ProblemGrid";
import { StackPanel } from "../components/simulator/StackPanel";
import { HOURLY_RATE, problems } from "../content/simulator";
import {
  buildStorageValue,
  composeStack,
  computeOutputs,
  selectProblems,
  type BaselineOverrides,
} from "../lib/simulator/compute";

const STORAGE_KEY = "simulator";
/** Un autre onglet/section (Contact, Phase 6) écoute cet événement pour relire `sessionStorage` sans reload. */
const SYNC_EVENT = "simulator:updated";

export function StackSimulator() {
  const [selection, setSelection] = useState<string[]>([]);
  const [baselineOverrides, setBaselineOverrides] = useState<BaselineOverrides>({});
  const [hourlyRate, setHourlyRate] = useState(HOURLY_RATE.default);

  function toggleProblem(id: string) {
    setSelection((current) => {
      if (current.includes(id)) {
        // Décocher réinitialise le curseur : pas de valeur fantôme dans sessionStorage (spec 03 §4).
        setBaselineOverrides((overrides) => {
          const next = { ...overrides };
          delete next[id];
          return next;
        });
        return current.filter((problemId) => problemId !== id);
      }
      return [...current, id];
    });
  }

  function updateBaseline(id: string, value: number) {
    setBaselineOverrides((overrides) => ({ ...overrides, [id]: value }));
  }

  function handleDiscuss() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildStorageValue(selection, baselineOverrides)));
    } catch {
      // Navigation privée stricte : on n'écrit rien, mais le scroll vers Contact reste utile (§4, spec 07).
    }
    window.dispatchEvent(new Event(SYNC_EVENT));
    window.location.hash = "contact";
  }

  const selectedProblems = useMemo(() => selectProblems(problems, selection), [selection]);
  const outputs = useMemo(
    () => computeOutputs(selectedProblems, baselineOverrides, hourlyRate),
    [selectedProblems, baselineOverrides, hourlyRate],
  );
  const stackGroups = useMemo(() => composeStack(selectedProblems), [selectedProblems]);

  return (
    <SectionShell
      id="simulateur"
      title="Simulateur"
      subtitle="Cochez vos problématiques : la stack recommandée s'affiche avec ses limites, pas juste ses promesses."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProblemGrid
          selection={selection}
          baselineOverrides={baselineOverrides}
          onToggle={toggleProblem}
          onBaselineChange={updateBaseline}
        />

        <GlassCard glow="emerald">
          <StackPanel
            selectedProblems={selectedProblems}
            outputs={outputs}
            stackGroups={stackGroups}
            hourlyRate={hourlyRate}
            onHourlyRateChange={setHourlyRate}
            onDiscuss={handleDiscuss}
          />
        </GlassCard>
      </div>
    </SectionShell>
  );
}
