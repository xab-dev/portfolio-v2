import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotionSafe } from "../../lib/motion";

export interface AnimatedCounterProps {
  value: number;
  suffix?: "%" | "h" | "€" | "";
  className?: string;
}

const DURATION_MS = 900; // --dur-slow (600ms) × 1.5

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const formatter = new Intl.NumberFormat("fr-FR");

export function AnimatedCounter({ value, suffix = "", className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setDisplay(Math.round(value * easeOutCubic(progress)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value]);

  return (
    <span ref={ref} className={className}>
      {formatter.format(display)}
      {suffix}
    </span>
  );
}
