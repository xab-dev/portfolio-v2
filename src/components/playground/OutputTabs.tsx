import { AnimatePresence, m } from "motion/react";
import { playgroundUi } from "../../content/playground";
import { cn } from "../../lib/cn";

export type OutputTab = "before" | "after";

export interface OutputTabsProps {
  active: OutputTab;
  onChange: (tab: OutputTab) => void;
  rawOutput: string;
  expertOutput: string;
  /** Faux tant que l'agent n'a pas rendu son verdict : l'onglet "après" reste verrouillé. */
  ready: boolean;
  instant: boolean;
}

const TABS: { id: OutputTab; label: string }[] = [
  { id: "before", label: playgroundUi.tabBefore },
  { id: "after", label: playgroundUi.tabAfter },
];

export function OutputTabs({ active, onChange, rawOutput, expertOutput, ready, instant }: OutputTabsProps) {
  const text = active === "before" ? rawOutput : ready ? expertOutput : playgroundUi.outputPending;

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={playgroundUi.tabsAria} className="flex gap-1 border-b border-border-glass">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const disabled = tab.id === "after" && !ready;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`playground-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls="playground-tabpanel"
              disabled={disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  const next = tab.id === "before" ? "after" : "before";
                  if (next === "after" && !ready) return;
                  onChange(next);
                  document.getElementById(`playground-tab-${next}`)?.focus();
                }
              }}
              className={cn(
                "relative px-4 py-2 text-sm transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-50",
                isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary",
              )}
            >
              {tab.label}
              {isActive ? (
                <m.span
                  layoutId="playground-tab-indicator"
                  transition={instant ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-neon-blue to-neon-violet"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id="playground-tabpanel"
        role="tabpanel"
        aria-labelledby={`playground-tab-${active}`}
        className="rounded-card border border-border-glass bg-bg-deep/40 p-4 text-sm leading-relaxed text-text-muted"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={`${active}-${ready}`}
            initial={instant ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={instant ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(active === "after" && ready && "text-text-primary")}
          >
            {text}
          </m.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
