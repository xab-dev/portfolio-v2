import { useState } from "react";
import { m } from "motion/react";
import { cn } from "../../lib/cn";
import {
  FAMILIES,
  LEVEL_SCALE,
  skills,
  type SkillFamily,
} from "../../content/skills";

export interface SkillBadgesProps {
  activeFamily: SkillFamily | null;
  onFamilyHover: (family: SkillFamily | null) => void;
}

export function SkillBadges({ activeFamily, onFamilyHover }: SkillBadgesProps) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {FAMILIES.map((family) => {
        const familySkills = skills.filter((skill) => skill.family === family);
        const isFamilyActive = family === activeFamily;

        return (
          <div
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
              {familySkills.map((skill) => {
                const key = `${family}:${skill.name}`;
                const isHovered = hoveredSkill === key;
                const isProofTier = skill.level >= 6;

                return (
                  <m.div
                    key={key}
                    className={cn("relative", isHovered && "z-20")}
                    onMouseEnter={() => setHoveredSkill(key)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onFocus={() => setHoveredSkill(key)}
                    onBlur={() => setHoveredSkill(null)}
                    onClick={() => onFamilyHover(isFamilyActive ? null : family)}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      type="button"
                      className={cn(
                        "rounded-full border border-border-glass bg-bg-deep/40 px-3 py-1.5 text-sm text-text-primary",
                        isProofTier && "border-neon-emerald/50 lite:border-neon-emerald/70",
                      )}
                    >
                      {skill.name}
                    </button>
                    {isHovered ? (
                      <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border-glass bg-bg-panel p-3 text-xs text-text-muted backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none">
                        <p className="font-medium text-text-primary">
                          Niveau {skill.level}/7 — {LEVEL_SCALE[skill.level].label}
                        </p>
                        {skill.note ? <p className="mt-1">{skill.note}</p> : null}
                      </div>
                    ) : null}
                  </m.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
