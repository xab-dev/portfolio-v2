import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { SectionShell } from "../components/ui/SectionShell";
import { FilterBar } from "../components/portfolio/FilterBar";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import { ProjectModal } from "../components/portfolio/ProjectModal";
import { projects, type ProjectTag } from "../content/projects";

const SECTION_ID = "projets";

function readProjectIdFromHash(): string | null {
  const [, sub] = window.location.hash.replace(/^#/, "").split("/");
  return sub ?? null;
}

export function Portfolio() {
  const [activeTags, setActiveTags] = useState<ProjectTag[]>([]);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  useEffect(() => {
    function syncFromHash() {
      const id = readProjectIdFromHash();
      // Hash invalide (id inconnu) : ignoré silencieusement, pas de modale.
      setOpenProjectId(id && projects.some((p) => p.id === id) ? id : null);
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const handleOpen = useCallback((id: string) => {
    window.location.hash = `${SECTION_ID}/${id}`;
  }, []);

  const handleClose = useCallback(() => {
    window.location.hash = SECTION_ID;
  }, []);

  const toggleTag = useCallback((tag: ProjectTag) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }, []);

  const resetTags = useCallback(() => setActiveTags([]), []);

  const filteredProjects = useMemo(() => {
    if (activeTags.length === 0) return projects;
    return projects.filter((project) => project.tags.some((tag) => activeTags.includes(tag)));
  }, [activeTags]);

  const openProject = useMemo(
    () => projects.find((project) => project.id === openProjectId) ?? null,
    [openProjectId],
  );

  return (
    <SectionShell
      id={SECTION_ID}
      title="Projets"
      subtitle="Problème → architecture & rôle de l'IA → résultat → limites. Les limites font partie de la preuve."
    >
      <div className="flex flex-col gap-8">
        <FilterBar
          activeTags={activeTags}
          onToggle={toggleTag}
          onReset={resetTags}
          resultCount={filteredProjects.length}
        />

        <m.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <m.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <ProjectCard project={project} onOpen={handleOpen} />
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
      </div>

      <ProjectModal project={openProject} onClose={handleClose} />
    </SectionShell>
  );
}
