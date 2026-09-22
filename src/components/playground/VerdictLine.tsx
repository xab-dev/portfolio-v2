import { useId, useRef, useState } from "react";
import { m } from "motion/react";
import { playgroundUi, templateNames, type PlaygroundVerdict } from "../../content/playground";
import { cn } from "../../lib/cn";
import { PortalTooltip } from "../ui/PortalTooltip";

export interface VerdictLineProps {
  verdict: PlaygroundVerdict;
  instant: boolean;
}

const CONSEIL_BADGE = "Conseil";

/** Ligne de verdict de l'agent (patch 19:30 §3) : headline puis badge cliquable → tooltip `why`. */
export function VerdictLine({ verdict, instant }: VerdictLineProps) {
  const badgeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const isTemplate = verdict.kind === "template" && verdict.templateRef !== undefined;

  return (
    <m.div
      className="flex flex-col gap-2 font-sans"
      initial={instant ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm font-medium leading-snug text-text-primary">{verdict.headline}</p>
      <button
        ref={badgeRef}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`${isTemplate ? `${verdict.templateRef} · ${templateNames[verdict.templateRef!]}` : CONSEIL_BADGE} — ${playgroundUi.verdictBadgeAria}`}
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-fast",
          isTemplate
            ? "border-neon-violet/50 bg-neon-violet/10 text-accent-violet-fg hover:bg-neon-violet/20"
            : "border-neon-emerald/50 bg-neon-emerald/10 text-accent-emerald-fg hover:bg-neon-emerald/20",
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {isTemplate ? (
          <>
            <span className="font-semibold">{verdict.templateRef}</span>
            <span aria-hidden="true">·</span>
            <span>{templateNames[verdict.templateRef!]}</span>
          </>
        ) : (
          CONSEIL_BADGE
        )}
      </button>
      <PortalTooltip id={tooltipId} open={open} anchorRef={badgeRef}>
        {verdict.why}
      </PortalTooltip>
    </m.div>
  );
}
