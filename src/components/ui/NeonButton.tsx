import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { m } from "motion/react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "ghost";

type ConflictingHandlers =
  | "className"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd";

export interface NeonButtonProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHandlers> {
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-neon-blue text-bg-deep border border-neon-blue font-medium",
  ghost:
    "bg-transparent text-text-primary border border-border-glass hover:border-neon-blue",
};

export function NeonButton({
  children,
  variant = "primary",
  className,
  ...props
}: NeonButtonProps) {
  return (
    <m.button
      whileHover={{
        scale: 1.03,
        boxShadow: "var(--glow-blue)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-colors duration-base",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </m.button>
  );
}
