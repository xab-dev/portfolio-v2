import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";

export interface TypingTextProps {
  text: string;
  speedMs?: number;
  className?: string;
  onDone?: () => void;
}

export function TypingText({ text, speedMs = 18, className, onDone }: TypingTextProps) {
  const reducedMotion = useReducedMotionSafe();
  const [count, setCount] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setCount(text.length);
      onDone?.();
      return;
    }

    setCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, reducedMotion]);

  const done = count >= text.length;

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {text.slice(0, count)}
      <span
        aria-hidden="true"
        className={cn(
          "ml-0.5 inline-block h-[1em] w-[2px] bg-current",
          !reducedMotion && !done && "animate-pulse",
          done && "opacity-0",
        )}
      />
    </span>
  );
}
