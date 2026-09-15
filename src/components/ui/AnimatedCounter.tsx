import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotionSafe } from "../../lib/motion";

export interface AnimatedCounterProps {
  value: number;
  suffix?: "%" | "h" | "€" | "";
  /** Décimales affichées (défaut 0). Ex. le compteur "h/sem" du Simulateur veut 1 décimale. */
  decimals?: number;
  className?: string;
}

const DURATION_MS = 900; // --dur-slow (600ms) × 1.5

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({ value, suffix = "", decimals = 0, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);
  const formatter = useMemo(
    () => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals],
  );

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let frame: number;
    const start = performance.now();
    const factor = 10 ** decimals;

    function tick(now: number) {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setDisplay(Math.round(value * easeOutCubic(progress) * factor) / factor);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {formatter.format(display)}
      {suffix}
    </span>
  );
}
