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
import { computeRadarData, LEVEL_LABELS, type SkillFamily } from "../../content/skills";

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
        {point.average}/5 — {LEVEL_LABELS[roundedLevel]}
      </p>
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
        {(Object.entries(LEVEL_LABELS) as [string, string][]).map(([level, label]) => (
          <li key={level}>
            <span className="font-medium text-text-primary">{level}</span> {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
