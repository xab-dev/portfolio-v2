import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ScannerOverlay } from "./ScannerOverlay";

export interface PromptPaneProps extends PropsWithChildren {
  title: string;
  /** Élément affiché à droite du titre (ex. bouton Copier). */
  action?: ReactNode;
  /** Bloc fixe entre l'en-tête et la zone scrollable (ex. verdict de l'agent, qui reste visible pendant la frappe). */
  lead?: ReactNode;
  scanning?: boolean;
  scanDurationMs?: number;
  /** Suit le bas du contenu pendant la frappe (même mécanisme que l'agent de poche). */
  followBottom?: boolean;
  className?: string;
}

/** Panneau type éditeur (fonte mono, hauteur max + scroll interne) — spec 04 §3/§4. */
export function PromptPane({
  title,
  action,
  lead,
  scanning = false,
  scanDurationMs = 0,
  followBottom = false,
  className,
  children,
}: PromptPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!followBottom) return;
    const container = scrollRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [followBottom]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-border-glass bg-bg-panel backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none",
        className,
      )}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border-glass px-4 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
        {action}
      </div>
      {lead ? <div className="border-b border-border-glass px-4 py-3">{lead}</div> : null}
      <div className="relative">
        <div ref={scrollRef} className="scrollbar-subtle max-h-80 overflow-y-auto p-4 lg:max-h-[28rem]">
          <div ref={contentRef} className="font-mono text-[13px] leading-relaxed text-text-primary">
            {children}
          </div>
        </div>
        <ScannerOverlay active={scanning} durationMs={scanDurationMs} />
      </div>
    </div>
  );
}

export interface CodeLinesProps {
  lines: string[];
  renderLine?: (line: string, index: number) => ReactNode;
  className?: string;
}

/** Lignes numérotées (numéros discrets, non sélectionnables). */
export function CodeLines({ lines, renderLine, className }: CodeLinesProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {lines.map((line, index) => (
        <div key={index} className="grid grid-cols-[2rem_1fr]">
          <span aria-hidden="true" className="select-none pr-3 text-right text-text-muted/50">
            {index + 1}
          </span>
          {/* `overflow-wrap: anywhere` (pas `break-words` = `break-word`) : seul `anywhere`
              compte comme un point de rupture dans le calcul de la taille min-content de
              cette colonne de grille — cause racine du débordement horizontal (spec 09 §3). */}
          <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
            {renderLine ? renderLine(line, index) : line || " "}
          </span>
        </div>
      ))}
    </div>
  );
}
