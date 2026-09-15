import { useRef } from "react";
import { m, useScroll } from "motion/react";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";
import { timeline, type MilestoneKind } from "../../content/timeline";

const KIND_LABELS: Record<MilestoneKind, string> = {
  formation: "Formation",
  experience: "Expérience",
  projet: "Projet",
  pivot: "Pivot",
};

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.75", "end 0.35"],
  });

  return (
    <div ref={containerRef} className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-4 w-0.5 overflow-hidden md:left-1/2 md:-translate-x-1/2">
        <m.div
          aria-hidden="true"
          className="h-full w-full bg-gradient-to-b from-neon-blue to-neon-violet"
          style={{ scaleY: reducedMotion ? 1 : scrollYProgress, transformOrigin: "top" }}
        />
      </div>

      <ul className="flex flex-col gap-8">
        {timeline.map((milestone, index) => {
          const isRight = index % 2 === 1;

          return (
            <m.li
              key={milestone.id}
              className={cn(
                "grid grid-cols-[2rem_1fr] items-start gap-4",
                "md:grid-cols-[1fr_2rem_1fr] md:gap-8",
              )}
              initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative col-start-1 row-start-1 flex justify-center md:col-start-2">
                <span className="mt-1.5 h-3 w-3 rounded-full bg-neon-blue shadow-glow-blue" />
              </div>
              <div
                className={cn(
                  "col-start-2 row-start-1 rounded-card border border-border-glass bg-bg-panel p-4 backdrop-blur-xl",
                  isRight ? "md:col-start-3" : "md:col-start-1",
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-text-muted">
                  <span>{milestone.dateKnown ? milestone.period : "—"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{KIND_LABELS[milestone.kind]}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {milestone.title}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{milestone.summary}</p>
              </div>
            </m.li>
          );
        })}
      </ul>
    </div>
  );
}
