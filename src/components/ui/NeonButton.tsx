import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from "react";
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

type CommonProps = PropsWithChildren<{
  variant?: Variant;
  className?: string;
}>;

export type NeonButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingHandlers | "href">)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHandlers>)
  );

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-neon-blue text-bg-deep border border-neon-blue font-medium",
  ghost:
    "bg-transparent text-text-primary border border-border-glass hover:border-neon-blue",
};

const motionProps = {
  whileHover: { scale: 1.03, boxShadow: "var(--glow-blue)" },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.15 },
};

export function NeonButton({ children, variant = "primary", className, href, ...props }: NeonButtonProps) {
  const sharedClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-colors duration-base disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    className,
  );

  if (href !== undefined) {
    return (
      <m.a
        href={href}
        className={sharedClassName}
        {...motionProps}
        {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingHandlers | "href">)}
      >
        {children}
      </m.a>
    );
  }

  const buttonProps = props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHandlers>;

  return (
    <m.button
      className={sharedClassName}
      {...(buttonProps.disabled ? undefined : motionProps)}
      {...buttonProps}
    >
      {children}
    </m.button>
  );
}
