import { useId, useRef, useState, type ReactNode } from "react";
import { m } from "motion/react";
import type { PlaygroundAnnotation } from "../../content/playground";
import { playgroundUi } from "../../content/playground";
import { PortalTooltip } from "../ui/PortalTooltip";
import { CodeLines } from "./PromptPane";

const HIGHLIGHT_STAGGER_S = 0.12;

interface AnnotationMarkProps {
  anchor: string;
  note: string;
  order: number;
  instant: boolean;
}

function AnnotationMark({ anchor, note, order, instant }: AnnotationMarkProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        title={playgroundUi.annotationAria}
        className="relative isolate inline cursor-help rounded-sm border-b border-neon-blue/60 text-text-primary [font:inherit]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <m.span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-sm bg-neon-blue/15"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: instant ? 0 : order * HIGHLIGHT_STAGGER_S }}
        />
        {anchor}
      </button>
      <PortalTooltip id={tooltipId} open={open} anchorRef={ref}>
        {note}
      </PortalTooltip>
    </>
  );
}

export interface AnnotatedPromptProps {
  text: string;
  annotations: PlaygroundAnnotation[];
  instant: boolean;
}

/** Prompt expert avec ses annotations surlignées progressivement (spec 04 §3). */
export function AnnotatedPrompt({ text, annotations, instant }: AnnotatedPromptProps) {
  const lines = text.split("\n");
  let order = 0;

  function renderLine(line: string): ReactNode {
    const found = annotations
      .map((annotation) => ({ annotation, start: line.indexOf(annotation.anchor) }))
      .filter(({ start }) => start >= 0)
      .sort((a, b) => a.start - b.start);
    if (found.length === 0) return line || " ";

    const parts: ReactNode[] = [];
    let cursor = 0;
    for (const { annotation, start } of found) {
      if (start < cursor) continue;
      if (start > cursor) parts.push(line.slice(cursor, start));
      parts.push(
        <AnnotationMark
          key={annotation.anchor}
          anchor={annotation.anchor}
          note={annotation.note}
          order={order++}
          instant={instant}
        />,
      );
      cursor = start + annotation.anchor.length;
    }
    if (cursor < line.length) parts.push(line.slice(cursor));
    return parts;
  }

  return <CodeLines lines={lines} renderLine={renderLine} />;
}
