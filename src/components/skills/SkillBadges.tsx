import { useId, useRef, useState } from "react";
import { m } from "motion/react";
import { cn } from "../../lib/cn";
import { PortalTooltip } from "../ui/PortalTooltip";
import { Reveal } from "../ui/Reveal";
import {
  FAMILIES,
  LEVEL_SCALE,
  skills,
  type Skill,
  type SkillFamily,
} from "../../content/skills";

export interface SkillBadgesProps {
  activeFamily: SkillFamily | null;
  onFamilyHover: (family: SkillFamily | null) => void;
}

interface SkillBadgeItemProps {
  skill: Skill;
  family: SkillFamily;
  isFamilyActive: boolean;
  onFamilyHover: (family: SkillFamily | null) => void;
}

/**
 * Bulle rendue en portail (`PortalTooltip`, règle du fix `f856c54`, spec 06
 * §4) plutôt qu'en `absolute` dans la carte : la carte de famille ne coupe
 * plus jamais la bulle (patch tooltip-rag, régression du patch mobile —
 * `overflow-hidden` sur la carte + bulle en `absolute` la tronquait), et le
 * portail échappe aussi au contexte d'empilement que le `transform` du
 * reveal peut laisser sur la carte une fois l'animation terminée.
 */
function SkillBadgeItem({ skill, family, isFamilyActive, onFamilyHover }: SkillBadgeItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const isProofTier = skill.level >= 6;

  return (
    <m.div
      className={cn("relative min-w-0", open && "z-20")}
      animate={{ scale: open ? 1.05 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <button
        ref={ref}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => onFamilyHover(isFamilyActive ? null : family)}
        className={cn(
          "break-words rounded-full border border-border-glass bg-bg-deep/40 px-3 py-1.5 text-sm text-text-primary",
          isProofTier && "border-neon-emerald/50 lite:border-neon-emerald/70",
        )}
      >
        {skill.name}
      </button>
      <PortalTooltip id={tooltipId} open={open} anchorRef={ref}>
        <p className="font-medium text-text-primary">
          Niveau {skill.level}/7 — {LEVEL_SCALE[skill.level].label}
        </p>
        {skill.note ? <p className="mt-1">{skill.note}</p> : null}
      </PortalTooltip>
    </m.div>
  );
}

export function SkillBadges({ activeFamily, onFamilyHover }: SkillBadgesProps) {
  return (
    <div className="flex flex-col gap-6">
      {FAMILIES.map((family) => {
        const familySkills = skills.filter((skill) => skill.family === family);
        const isFamilyActive = family === activeFamily;

        return (
          <Reveal
            key={family}
            className={cn(
              "rounded-card border border-border-glass bg-bg-panel p-4 transition-shadow duration-base",
              isFamilyActive && "shadow-glow-blue lite:border-neon-blue/40",
            )}
            onMouseEnter={() => onFamilyHover(family)}
            onMouseLeave={() => onFamilyHover(null)}
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              {family}
            </h3>
            <div className="flex flex-wrap gap-2">
              {familySkills.map((skill) => (
                <SkillBadgeItem
                  key={`${family}:${skill.name}`}
                  skill={skill}
                  family={family}
                  isFamilyActive={isFamilyActive}
                  onFamilyHover={onFamilyHover}
                />
              ))}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
