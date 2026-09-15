import { useState } from "react";
import { X } from "lucide-react";
import type { Project } from "../../content/projects";
import { Modal } from "../ui/Modal";
import { assetUrl } from "../../lib/assetUrl";

export interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

function MetricRow({ label, value, verified }: { label: string; value: string; verified: boolean }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border-glass py-2 last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">
        {value}
        {verified ? null : <span className="ml-1 text-xs text-text-muted">(auto-déclaré)</span>}
      </span>
    </li>
  );
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);

  if (!project) {
    // Modal reste monté (fermé) pour que son animation de sortie puisse jouer.
    return <Modal open={false} onClose={onClose} title="" />;
  }

  const images = project.images ?? [];
  const enlarged = enlargedIndex !== null ? images[enlargedIndex] : null;

  return (
    <Modal open onClose={onClose} title={project.title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border-glass px-3 py-1 text-xs text-text-muted">
            {project.status}
          </span>
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-glass px-2.5 py-0.5 text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs text-text-muted">{project.year}</span>
        </div>

        {images.length > 0 ? (
          enlarged ? (
            <div className="relative">
              <img
                src={assetUrl(enlarged.src)}
                alt={enlarged.alt}
                className="max-h-[60vh] w-full rounded-card border border-border-glass object-contain"
              />
              <button
                type="button"
                aria-label="Fermer l'agrandissement"
                onClick={() => setEnlargedIndex(null)}
                className="absolute right-2 top-2 rounded-full bg-bg-deep/80 p-1.5 text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setEnlargedIndex(index)}
                  className="shrink-0 rounded-card border border-border-glass"
                  aria-label={`Agrandir : ${image.alt}`}
                >
                  <img
                    src={assetUrl(image.src)}
                    alt={image.alt}
                    loading="lazy"
                    className="h-32 w-auto rounded-card object-cover"
                  />
                </button>
              ))}
            </div>
          )
        ) : null}

        <section className="flex flex-col gap-2">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Problème
          </h3>
          <p className="text-sm text-text-primary">{project.problem}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Architecture &amp; rôle de l&apos;IA
          </h3>
          <ul className="flex flex-col gap-1.5">
            {project.architecture.map((line) => (
              <li key={line} className="flex gap-2 text-sm text-text-primary">
                <span className="text-text-muted">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Métriques
          </h3>
          {project.metrics.length > 0 ? (
            <ul>
              {project.metrics.map((metric) => (
                <MetricRow key={metric.label} {...metric} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">
              Pas de métrique publiée à ce stade — statut : {project.status}.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2 rounded-card border border-border-glass bg-bg-panel p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
            Limites
          </h3>
          <ul className="flex flex-col gap-1.5">
            {project.limits.map((line) => (
              <li key={line} className="flex gap-2 text-sm text-text-primary">
                <span className="text-text-muted">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {project.links && project.links.length > 0 ? (
          <div className="flex flex-wrap gap-4 border-t border-border-glass pt-4">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neon-blue underline underline-offset-4"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
