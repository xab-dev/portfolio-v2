import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Modal } from "../ui/Modal";
import { Tag } from "../ui/Tag";
import { AgentMessage } from "../agent/AgentMessage";
import { faqQuestions, faqUi, type FaqQuestion } from "../../content/faq";
import { useReducedMotionSafe } from "../../lib/motion";
import { useLiteMode } from "../../lib/perf/useLiteMode";

export interface FaqModalProps {
  open: boolean;
  onClose: () => void;
}

const PENDING_DELAY_MIN_MS = 400;
const PENDING_DELAY_MAX_MS = 700;
const TYPING_SPEED_MS = 6;

type Stage = "pending" | "typing" | "done";

const priorityQuestions = faqQuestions.filter((question) => question.priority);
const otherQuestions = faqQuestions.filter((question) => !question.priority);
const orderedQuestions = [...priorityQuestions, ...otherQuestions];

export function FaqModal({ open, onClose }: FaqModalProps) {
  const reducedMotion = useReducedMotionSafe();
  const liteMode = useLiteMode();
  const instant = reducedMotion || liteMode === "lite";

  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("done");
  const [revealCount, setRevealCount] = useState(0);
  const pendingTimeoutRef = useRef<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeQuestion: FaqQuestion | null =
    faqQuestions.find((question) => question.id === activeId) ?? null;

  // Suit le bas de la zone de conversation pendant la frappe progressive
  // (même mécanisme que `AgentPanel`, spec 10 §3).
  useEffect(() => {
    const container = scrollRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Fermeture (Échap, overlay, bouton) pendant la frappe : l'état est
  // réinitialisé au démontage/à la fermeture, aucune bulle ne continue de
  // « taper » dans un pop-up fermé (edge case §4).
  useEffect(() => {
    if (open) return;
    window.clearTimeout(pendingTimeoutRef.current);
    setActiveId(null);
    setStage("done");
    setRevealCount(0);
  }, [open]);

  useEffect(() => () => window.clearTimeout(pendingTimeoutRef.current), []);

  function handleAsk(question: FaqQuestion) {
    window.clearTimeout(pendingTimeoutRef.current);
    setActiveId(question.id);

    if (instant) {
      setStage("done");
      setRevealCount(question.paragraphs.length);
      return;
    }

    setStage("pending");
    setRevealCount(0);
    const delay = PENDING_DELAY_MIN_MS + Math.random() * (PENDING_DELAY_MAX_MS - PENDING_DELAY_MIN_MS);
    pendingTimeoutRef.current = window.setTimeout(() => setStage("typing"), delay);
  }

  function handleParagraphDone(total: number) {
    setRevealCount((current) => {
      const next = current + 1;
      if (next >= total) setStage("done");
      return next;
    });
  }

  function handleSkip() {
    if (!activeQuestion) return;
    window.clearTimeout(pendingTimeoutRef.current);
    setStage("done");
    setRevealCount(activeQuestion.paragraphs.length);
  }

  function handleReset() {
    window.clearTimeout(pendingTimeoutRef.current);
    setActiveId(null);
    setStage("done");
    setRevealCount(0);
  }

  const isBusy = activeId !== null && stage !== "done";
  const showSkip = !instant && activeQuestion !== null && stage !== "done";

  return (
    <Modal open={open} onClose={onClose} title={faqUi.title}>
      <div className="flex flex-col gap-4">
        <header className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald" aria-hidden="true" />
          {faqUi.header}
        </header>

        <div
          ref={scrollRef}
          aria-live="polite"
          className="scrollbar-subtle max-h-[70vh] overflow-y-auto pr-1"
        >
          <div ref={contentRef} className="flex flex-col gap-2">
            <AgentMessage role="agent" text={faqUi.intro} />

            <AnimatePresence mode="wait">
              {activeQuestion ? (
                <m.div
                  key={activeQuestion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
                  className="flex flex-col gap-2"
                >
                  <AgentMessage role="user" text={activeQuestion.label} />
                  {stage === "pending" ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-border-glass bg-bg-panel px-4 py-2 text-sm text-text-muted">
                        …
                      </div>
                    </div>
                  ) : (
                    activeQuestion.paragraphs
                      .slice(0, stage === "typing" ? revealCount + 1 : activeQuestion.paragraphs.length)
                      .map((paragraph, index) => (
                        <AgentMessage
                          key={index}
                          role="agent"
                          text={paragraph}
                          typing={stage === "typing" && index === revealCount}
                          speedMs={TYPING_SPEED_MS}
                          onTypingDone={() => handleParagraphDone(activeQuestion.paragraphs.length)}
                        />
                      ))
                  )}
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {orderedQuestions.map((question) => (
            <Tag
              key={question.id}
              active={Boolean(question.priority)}
              disabled={isBusy}
              onClick={() => handleAsk(question)}
            >
              {question.label}
            </Tag>
          ))}
        </div>

        {showSkip || activeQuestion ? (
          <div className="flex items-center gap-4">
            {showSkip ? (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-text-muted underline underline-offset-4 transition-colors duration-fast hover:text-text-primary"
              >
                {faqUi.skip}
              </button>
            ) : null}
            {activeQuestion ? (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-text-muted underline underline-offset-4 transition-colors duration-fast hover:text-text-primary"
              >
                {faqUi.reset}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
