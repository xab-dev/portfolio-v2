import { useRef, type PropsWithChildren } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";

type Glow = "blue" | "violet" | "emerald";

const glowShadow: Record<Glow, string> = {
  blue: "var(--glow-blue)",
  violet: "var(--glow-violet)",
  emerald: "var(--glow-emerald)",
};

export interface GlassCardProps extends PropsWithChildren {
  className?: string;
  glow?: Glow;
  tilt?: boolean;
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function GlassCard({ children, className, glow, tilt = false }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();
  const tiltEnabled = tilt && !reducedMotion && !isTouchDevice();

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateY.set(px * 16); // max ~±8°
    rotateX.set(-py * 16);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        tiltEnabled
          ? { rotateX, rotateY, transformPerspective: 1000 }
          : undefined
      }
      whileHover={
        glow ? { boxShadow: glowShadow[glow], transition: { duration: 0.3 } } : undefined
      }
      className={cn(
        "rounded-card border border-border-glass bg-bg-panel backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none",
        "p-6",
        className,
      )}
    >
      {children}
    </m.div>
  );
}
