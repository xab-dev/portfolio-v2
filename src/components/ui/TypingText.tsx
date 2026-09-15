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
    // Compté sur le temps écoulé, pas sur les ticks : un setInterval à 8 ms
    // dérive dès que le rendu d'un caractère coûte plus que l'intervalle
    // (texte long) et double la durée réelle. Ici `speedMs` par caractère est
    // tenu quelle que soit la charge, plusieurs caractères par image si besoin.
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(text.length, Math.floor((now - start) / speedMs));
      setCount(next);
      if (next >= text.length) {
        onDone?.();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
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
