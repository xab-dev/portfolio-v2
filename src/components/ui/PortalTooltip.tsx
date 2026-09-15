import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export interface PortalTooltipProps {
  id: string;
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

const GAP = 8;
const MAX_WIDTH = 288;
/** Hauteur supposée avant la première mesure — corrigée dès le premier rendu. */
const FALLBACK_HEIGHT = 96;

/**
 * Tooltip rendu en portail (règle issue du fix f856c54, spec 06 §4) : un
 * élément qui déborde de sa carte ne peut pas gagner l'empilement contre une
 * carte sœur rendue après, ni sortir d'un conteneur `overflow: auto`. Position
 * `fixed` calculée depuis l'ancre, bascule au-dessus quand la place manque
 * en bas (ex. près des onglets sous les panneaux).
 */
export function PortalTooltip({ id, open, anchorRef, children }: PortalTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }
    const anchor = anchorRef.current;
    if (!anchor) return;

    function place() {
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const height = tooltipRef.current?.offsetHeight ?? FALLBACK_HEIGHT;
      const width = Math.min(MAX_WIDTH, window.innerWidth - 2 * GAP);
      const left = Math.min(Math.max(GAP, rect.left), window.innerWidth - width - GAP);
      const fitsBelow = rect.bottom + GAP + height <= window.innerHeight;
      const fitsAbove = rect.top - GAP - height >= 0;
      const below = fitsBelow || !fitsAbove;
      setStyle(
        below
          ? { top: rect.bottom + GAP, left, width }
          : { bottom: window.innerHeight - rect.top + GAP, left, width },
      );
    }

    place();
    // Second passage une fois le tooltip monté : hauteur réelle au lieu de la valeur supposée.
    const raf = window.requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef]);

  if (!open || !style) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      id={id}
      role="tooltip"
      style={{ position: "fixed", ...style }}
      className="z-50 rounded-lg border border-border-glass bg-bg-panel p-3 text-xs leading-relaxed text-text-muted shadow-lg backdrop-blur-xl lite:bg-bg-deep/95 lite:backdrop-blur-none"
    >
      {children}
    </div>,
    document.body,
  );
}
