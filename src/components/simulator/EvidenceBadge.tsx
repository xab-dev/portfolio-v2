import { EVIDENCE_BADGE_LABEL, type EvidenceLevel } from "../../content/simulator";
import { cn } from "../../lib/cn";

const LEVEL_STYLE: Record<EvidenceLevel, string> = {
  etude: "border-neon-emerald/50 bg-neon-emerald/10 text-neon-emerald",
  editeur: "border-neon-violet/50 bg-neon-violet/10 text-neon-violet",
  aucune: "border-border-glass bg-bg-deep/40 text-text-muted",
};

export interface EvidenceBadgeProps {
  level: EvidenceLevel;
  summary: string;
  className?: string;
}

/** Badge de confiance (spec 03 amendée §3) : tooltip natif = `evidence.summary`, sans chiffre inventé. */
export function EvidenceBadge({ level, summary, className }: EvidenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs",
        LEVEL_STYLE[level],
        className,
      )}
      title={summary}
    >
      {EVIDENCE_BADGE_LABEL[level]}
    </span>
  );
}
