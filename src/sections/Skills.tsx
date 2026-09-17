import { lazy, Suspense, useState } from "react";
import { SectionShell } from "../components/ui/SectionShell";
import { SkillBadges } from "../components/skills/SkillBadges";
import { Timeline } from "../components/skills/Timeline";
import type { SkillFamily } from "../content/skills";

// Recharts (~150 Ko gzip) alourdirait sensiblement le bundle initial (menace le
// budget Lighthouse Performance ≥90 fixé en Phase 0, DETTE-26) : chargé dans un
// chunk séparé, sur le même principe que `motionFeatures` (Phase 0).
const SkillRadar = lazy(() =>
  import("../components/skills/SkillRadar").then((mod) => ({ default: mod.SkillRadar })),
);

function RadarFallback() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-card border border-border-glass bg-bg-panel text-sm text-text-muted">
      Chargement du radar…
    </div>
  );
}

export function Skills() {
  const [activeFamily, setActiveFamily] = useState<SkillFamily | null>(null);

  return (
    <SectionShell
      id="competences"
      title="Compétences"
      subtitle="Un niveau par famille, affiché avec son statut réel — pas de niveau gonflé. Un parcours court et daté, sans jalon inventé."
      revealContent={false}
    >
      <div className="flex flex-col gap-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Suspense fallback={<RadarFallback />}>
            <SkillRadar activeFamily={activeFamily} onFamilyHover={setActiveFamily} />
          </Suspense>
          <SkillBadges activeFamily={activeFamily} onFamilyHover={setActiveFamily} />
        </div>

        <Timeline />
      </div>
    </SectionShell>
  );
}
