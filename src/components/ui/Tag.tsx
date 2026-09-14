import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface TagProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  active?: boolean;
  className?: string;
}

export function Tag({ active = false, className, children, ...props }: TagProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors duration-fast",
        active
          ? "border-neon-blue bg-neon-blue/15 text-text-primary"
          : "border-border-glass bg-bg-panel text-text-muted hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
