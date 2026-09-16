import { useId, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { EVIDENCE_BADGE_LABEL, type EvidenceLevel } from "../../content/simulator";
import { references } from "../../content/references";
import { cn } from "../../lib/cn";
import { PortalTooltip } from "../ui/PortalTooltip";

const LEVEL_STYLE: Record<EvidenceLevel, string> = {
  etude: "border-neon-emerald/50 bg-neon-emerald/10 text-neon-emerald",
  editeur: "border-neon-violet/50 bg-neon-violet/10 text-neon-violet",
  aucune: "border-border-glass bg-bg-deep/40 text-text-muted",
};

export interface EvidenceBadgeProps {
  level: EvidenceLevel;
  summary: string;
  refIds: string[];
  className?: string;
}

/**
 * Badge de confiance (spec 09 §2/§3) : déclencheur `<button>` qui ouvre un
 * `PortalTooltip` avec le résumé et les références liées (lien externe,
 * DOI cliquable). Niveau `aucune` : résumé seul, jamais de lien vide.
 */
export function EvidenceBadge({ level, summary, refIds, className }: EvidenceBadgeProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const cited = references.filter((reference) => refIds.includes(reference.id));

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        // Toujours ouvrir (jamais basculer) : au tap mobile, `onMouseEnter` ne se
        // déclenche pas, donc un simple bascule refermerait ce que le survol
        // venait d'ouvrir côté souris (bug déjà rencontré Phase 3, `AnnotationMark`).
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={cn(
          "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs",
          LEVEL_STYLE[level],
          className,
        )}
      >
        {EVIDENCE_BADGE_LABEL[level]}
      </button>
      <PortalTooltip id={tooltipId} open={open} anchorRef={ref}>
        <p>{summary}</p>
        {cited.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1 border-t border-border-glass pt-2">
            {cited.map((reference) => (
              <li key={reference.id}>
                {reference.url ? (
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-neon-blue hover:underline"
                  >
                    {reference.authors} — {reference.title}
                    <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                  </a>
                ) : (
                  <span>
                    {reference.authors} — {reference.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </PortalTooltip>
    </>
  );
}
