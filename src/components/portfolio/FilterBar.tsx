import type { ProjectTag } from "../../content/projects";
import { Tag } from "../ui/Tag";

const ALL_TAGS: ProjectTag[] = ["Automations", "Formations", "Jeu", "Outils", "Méthode"];

export interface FilterBarProps {
  activeTags: ProjectTag[];
  onToggle: (tag: ProjectTag) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterBar({ activeTags, onToggle, onReset, resultCount }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3">
        <Tag active={activeTags.length === 0} onClick={onReset}>
          Tous
        </Tag>
        {ALL_TAGS.map((tag) => (
          <Tag key={tag} active={activeTags.includes(tag)} onClick={() => onToggle(tag)}>
            {tag}
          </Tag>
        ))}
      </div>
      <p className="text-sm text-text-muted" aria-live="polite">
        {resultCount} projet{resultCount > 1 ? "s" : ""}
      </p>
    </div>
  );
}
