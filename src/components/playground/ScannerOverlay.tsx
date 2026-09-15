import { AnimatePresence, m } from "motion/react";

export interface ScannerOverlayProps {
  active: boolean;
  durationMs: number;
}

/**
 * Ligne lumineuse bleu→violet qui balaie la zone *visible* du panneau
 * (spec 04 §3 ; §4 amendé : pas la hauteur totale du texte scrollable).
 * Jamais monté en reduced-motion / mode allégé : le parent bascule d'un coup.
 */
export function ScannerOverlay({ active, durationMs }: ScannerOverlayProps) {
  return (
    <AnimatePresence>
      {active ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <m.div
            className="absolute inset-x-0 top-0 h-full"
            initial={{ y: "-4%" }}
            animate={{ y: "100%" }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
          >
            <div className="absolute inset-x-0 -top-6 h-12 bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-neon-blue via-neon-violet to-neon-blue" />
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
