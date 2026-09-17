import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "../../lib/cn";
import {
  computeRadarData,
  LEVEL_SCALE,
  POSITIONING,
  POSITIONING_DISCLAIMER,
  type SkillFamily,
} from "../../content/skills";

export interface SkillRadarProps {
  activeFamily: SkillFamily | null;
  onFamilyHover: (family: SkillFamily | null) => void;
}

const SHORT_LABELS: Record<SkillFamily, string> = {
  "Méthode IA": "Méthode IA",
  "LLMs & agents": "LLMs",
  "No-code / automatisation": "No-code",
  Développement: "Dev",
  Données: "Données",
  Humain: "Humain",
};

function useNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 399px)");
    setNarrow(query.matches);
    const handler = (event: MediaQueryListEvent) => setNarrow(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return narrow;
}

function AngleTick({
  x,
  y,
  payload,
  activeFamily,
  narrow,
  onFamilyHover,
}: {
  x: number | string;
  y: number | string;
  payload: { value: SkillFamily };
  activeFamily: SkillFamily | null;
  narrow: boolean;
  onFamilyHover: (family: SkillFamily | null) => void;
}) {
  const family = payload.value;
  const isActive = family === activeFamily;
  const label = narrow ? SHORT_LABELS[family] : family;

  return (
    <g
      transform={`translate(${x},${y})`}
      onMouseEnter={() => onFamilyHover(family)}
      onMouseLeave={() => onFamilyHover(null)}
      onClick={() => onFamilyHover(isActive ? null : family)}
      className="cursor-pointer"
    >
      <text
        textAnchor="middle"
        fontSize={narrow ? 10 : 12}
        fill={isActive ? "rgb(var(--neon-blue))" : "rgb(var(--text-muted))"}
        fontWeight={isActive ? 600 : 400}
      >
        {label}
      </text>
    </g>
  );
}

function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { family: SkillFamily; average: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const roundedLevel = Math.round(point.average) as 1 | 2 | 3 | 4 | 5;

  return (
    <div className="rounded-lg border border-border-glass bg-bg-panel px-3 py-2 text-sm text-text-primary backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none">
      <p className="font-medium">{point.family}</p>
      <p className="text-text-muted">
        {point.average}/5 — {LEVEL_SCALE[roundedLevel].label}
      </p>
    </div>
  );
}

function PositioningBand() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 border-t border-border-glass pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Positionnement
      </h4>
      <div className="flex flex-wrap gap-3">
        {POSITIONING.map((entry) => {
          const isHovered = hoveredTier === entry.tier;

          return (
            <div
              key={entry.tier}
              className="relative"
              onMouseEnter={() => setHoveredTier(entry.tier)}
              onMouseLeave={() => setHoveredTier(null)}
              onFocus={() => setHoveredTier(entry.tier)}
              onBlur={() => setHoveredTier(null)}
            >
              <button
                type="button"
                className="flex flex-col items-center gap-1"
                aria-label={`${entry.tier} — ${entry.role} (${entry.status})`}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border-2 border-neon-blue",
                    entry.status === "acquis" && "bg-neon-blue",
                    entry.status === "en cours" &&
                      "bg-gradient-to-r from-neon-blue from-50% to-transparent to-50%",
                    entry.status === "cible" && "bg-transparent",
                  )}
                />
                <span className="text-[10px] text-text-muted">{entry.tier}</span>
              </button>
              {isHovered ? (
                <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border-glass bg-bg-panel p-3 text-xs text-text-muted backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none">
                  <p className="font-medium text-text-primary">
                    {entry.tier} — {entry.role}
                  </p>
                  {entry.note ? <p className="mt-1">{entry.note}</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted">{POSITIONING_DISCLAIMER}</p>
    </div>
  );
}

export function SkillRadar({ activeFamily, onFamilyHover }: SkillRadarProps) {
  const narrow = useNarrowViewport();
  const data = computeRadarData();

  return (
    <div className="flex min-h-[260px] flex-col gap-4">
      <ResponsiveContainer width="100%" height={narrow ? 260 : 320}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="rgb(var(--text-muted) / 0.3)" />
          <PolarAngleAxis
            dataKey="family"
            tick={(props) => (
              <AngleTick
                {...props}
                activeFamily={activeFamily}
                narrow={narrow}
                onFamilyHover={onFamilyHover}
              />
            )}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tickCount={6}
            axisLine={false}
            tick={{ fill: "rgb(var(--text-muted))", fontSize: 10 }}
          />
          <Radar
            dataKey="average"
            stroke="rgb(var(--neon-blue))"
            fill="rgb(var(--neon-blue) / 0.25)"
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
        {(Object.entries(LEVEL_SCALE) as [string, { label: string }][]).map(([level, { label }]) => (
          <li
            key={level}
            className={cn(Number(level) >= 6 && "text-neon-emerald/90")}
          >
            <span className="font-medium text-text-primary">{level}</span> {label}
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-text-muted">
        Radar sur 5 (maîtrise pratique). Niveaux 6–7 = mise en production et architecture — voir
        Positionnement.
      </p>

      <PositioningBand />
    </div>
  );
}
