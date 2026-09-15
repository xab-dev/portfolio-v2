import { ArrowRight } from "lucide-react";
import type { Project } from "../../content/projects";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/cn";

export interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      className="group block w-full text-left"
      aria-haspopup="dialog"
    >
      <GlassCard glow={project.accent} tilt className="h-full transition-colors">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              {project.title}
            </h3>
            <span className="whitespace-nowrap rounded-full border border-border-glass px-3 py-1 text-xs text-text-muted">
              {project.status}
            </span>
          </div>

          <p className="flex-1 text-sm text-text-muted">{project.tagline}</p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-glass px-2.5 py-0.5 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
              <span className="px-1 text-xs text-text-muted">{project.year}</span>
            </div>

            <span
              className={cn(
                "flex items-center gap-1 text-xs text-neon-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            >
              Voir le cas
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </GlassCard>
    </button>
  );
}
