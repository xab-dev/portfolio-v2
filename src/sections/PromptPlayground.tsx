import { useEffect, useState } from "react";
import { m } from "motion/react";
import { Check, Copy, Sparkles } from "lucide-react";
import { SectionShell } from "../components/ui/SectionShell";
import { NeonButton } from "../components/ui/NeonButton";
import { Tag } from "../components/ui/Tag";
import { TypingText } from "../components/ui/TypingText";
import { CodeLines, PromptPane } from "../components/playground/PromptPane";
import { VerdictLine } from "../components/playground/VerdictLine";
import { AnnotatedPrompt } from "../components/playground/AnnotatedPrompt";
import { OutputTabs, type OutputTab } from "../components/playground/OutputTabs";
import { DEFAULT_CASE_ID, playgroundCases, playgroundUi, type PlaygroundCaseId } from "../content/playground";
import { useReducedMotionSafe } from "../lib/motion";
import { useLiteMode } from "../lib/perf/useLiteMode";

/** idle → scanning → verdict → typing → done ; en mode instantané : idle → done. */
type Phase = "idle" | "scanning" | "verdict" | "typing" | "done";

const SCAN_MS = 600;
/** Le verdict s'affiche seul un court instant avant que le prompt expert ne commence à s'écrire. */
const VERDICT_MS = 350;
const TYPING_SPEED_MS = 8;
const COPIED_FEEDBACK_MS = 1500;

function canUseClipboard(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function";
}

export function PromptPlayground() {
  const reducedMotion = useReducedMotionSafe();
  const liteMode = useLiteMode();
  // Mode allégé : scanner remplacé par une bascule instantanée, même traitement que reduced-motion (patch §3).
  const instant = reducedMotion || liteMode === "lite";

  const [caseId, setCaseId] = useState<PlaygroundCaseId>(DEFAULT_CASE_ID);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tab, setTab] = useState<OutputTab>("before");
  const [copied, setCopied] = useState(false);
  const [clipboardAvailable] = useState(canUseClipboard);

  const current = playgroundCases.find((playgroundCase) => playgroundCase.id === caseId) ?? playgroundCases[0];
  const isRunning = phase === "scanning" || phase === "verdict" || phase === "typing";
  const isDone = phase === "done";

  useEffect(() => {
    if (phase === "scanning") {
      const timer = window.setTimeout(() => setPhase("verdict"), SCAN_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "verdict") {
      const timer = window.setTimeout(() => setPhase("typing"), VERDICT_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "done") setTab("after");
  }, [phase]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function selectCase(id: PlaygroundCaseId) {
    if (id === caseId) return;
    // Changement en cours d'animation : les timers ci-dessus sont nettoyés par le retour à idle (§4).
    setCaseId(id);
    setPhase("idle");
    setTab("before");
    setCopied(false);
  }

  function run() {
    if (isRunning) return;
    setTab("before");
    setPhase(instant ? "done" : "scanning");
  }

  async function copyExpertPrompt() {
    try {
      await navigator.clipboard.writeText(current.expertPrompt);
      setCopied(true);
    } catch {
      // Permission refusée : pas de retour visuel, le texte reste sélectionnable à la main (§4).
    }
  }

  const showCopy = isDone && clipboardAvailable && current.verdict.kind === "template";
  const runLabel = isRunning ? playgroundUi.runningButton : isDone ? playgroundUi.rerunButton : playgroundUi.runButton;

  return (
    <SectionShell id="playground" title={playgroundUi.title} subtitle={playgroundUi.subtitle}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label={playgroundUi.selectorLabel} className="flex flex-wrap gap-2">
            {playgroundCases.map((playgroundCase) => (
              <Tag
                key={playgroundCase.id}
                active={playgroundCase.id === caseId}
                onClick={() => selectCase(playgroundCase.id)}
              >
                {playgroundCase.label}
              </Tag>
            ))}
          </div>
          <NeonButton onClick={run} disabled={isRunning} aria-busy={isRunning}>
            <Sparkles size={16} aria-hidden="true" />
            {runLabel}
          </NeonButton>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <PromptPane title={playgroundUi.rawPaneTitle} scanning={!instant && phase === "scanning"} scanDurationMs={SCAN_MS}>
            <m.div
              animate={{
                opacity: phase === "idle" ? 1 : 0.55,
                ...(instant ? {} : { filter: phase === "scanning" ? "blur(1.5px)" : "blur(0px)" }),
              }}
              transition={{ duration: instant ? 0 : 0.4 }}
            >
              <CodeLines lines={current.rawPrompt.split("\n")} />
            </m.div>
          </PromptPane>

          <PromptPane
            title={playgroundUi.expertPaneTitle}
            followBottom={phase === "typing"}
            lead={
              phase === "verdict" || phase === "typing" || phase === "done" ? (
                <VerdictLine key={current.id} verdict={current.verdict} instant={instant} />
              ) : null
            }
            action={
              showCopy ? (
                <button
                  type="button"
                  onClick={copyExpertPrompt}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-glass px-3 py-1 text-xs text-text-muted transition-colors duration-fast hover:border-neon-blue hover:text-text-primary"
                >
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {copied ? playgroundUi.copiedFeedback : playgroundUi.copyButton}
                </button>
              ) : null
            }
          >
            {phase === "idle" || phase === "scanning" ? (
              <p className="font-sans text-sm text-text-muted">{playgroundUi.expertPlaceholder}</p>
            ) : null}
            {phase === "typing" ? (
              <div className="grid grid-cols-[2rem_1fr]">
                <span aria-hidden="true" />
                <TypingText
                  key={current.id}
                  text={current.expertPrompt}
                  speedMs={TYPING_SPEED_MS}
                  // Même règle que `CodeLines` (PromptPane.tsx) : `anywhere`, pas `break-words`
                  // (spec 09 §3 — la ligne en cours de frappe vit dans la même grille `[2rem_1fr]`).
                  className="block whitespace-pre-wrap [overflow-wrap:anywhere]"
                  onDone={() => setPhase("done")}
                />
              </div>
            ) : null}
            {phase === "done" ? (
              <AnnotatedPrompt
                key={current.id}
                text={current.expertPrompt}
                annotations={current.annotations}
                instant={instant}
              />
            ) : null}
          </PromptPane>
        </div>

        <OutputTabs
          active={tab}
          onChange={setTab}
          rawOutput={current.rawOutput}
          expertOutput={current.expertOutput}
          ready={isDone}
          instant={instant}
        />

        <p className="text-xs text-text-muted">{playgroundUi.illustrativeNote}</p>
      </div>
    </SectionShell>
  );
}
