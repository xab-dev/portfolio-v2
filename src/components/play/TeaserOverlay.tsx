import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useReducedMotionSafe } from "../../lib/motion";

export interface TeaserOverlayProps {
  open: boolean;
  onClose: () => void;
  url: string;
  /** ≤ 0 : pas de fermeture automatique, seul le bouton Fermer agit (edge case §4). */
  teaserMs: number;
}

/** Overlay plein écran : cold-open de haTD comme teaser sur mobile (T12, §3). */
export function TeaserOverlay({ open, onClose, url, teaserMs }: TeaserOverlayProps) {
  const reducedMotion = useReducedMotionSafe();
  const [progress, setProgress] = useState(0); // 0 → 1
  const [copied, setCopied] = useState(false);
  const pushedHistoryRef = useRef(false);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const autoCloseEnabled = teaserMs > 0;

  function requestClose() {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
    } else {
      onClose();
    }
  }

  // Timer d'auto-fermeture en `requestAnimationFrame`, mis en pause pendant que
  // l'onglet est en arrière-plan (`visibilitychange`, edge case §4) — reprend
  // exactement là où il s'était arrêté plutôt que de perdre le temps écoulé.
  useEffect(() => {
    if (!open || !autoCloseEnabled) return;

    elapsedRef.current = 0;
    startRef.current = null;
    setProgress(0);

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = elapsedRef.current + (now - startRef.current);
      const ratio = Math.min(1, elapsed / teaserMs);
      setProgress(ratio);
      if (ratio >= 1) {
        requestClose();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    function start() {
      startRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }

    function pause() {
      if (startRef.current !== null) {
        elapsedRef.current += performance.now() - startRef.current;
        startRef.current = null;
      }
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    }

    function handleVisibilityChange() {
      if (document.hidden) pause();
      else start();
    }

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      pause();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [open, autoCloseEnabled, teaserMs]);

  // Échap et retour arrière ferment l'overlay (edge case §4). Une entrée d'historique
  // est poussée à l'ouverture pour que le bouton "retour" du navigateur/OS ferme
  // l'overlay au lieu de quitter la page.
  useEffect(() => {
    if (!open) return;

    window.history.pushState({ teaserOverlay: true }, "");
    pushedHistoryRef.current = true;

    function handlePopState() {
      pushedHistoryRef.current = false;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions, contexte non sécurisé) : l'URL
      // reste affichée en texte sélectionnable, aucune fonctionnalité bloquante.
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de haTD"
          className="fixed inset-0 z-50 flex flex-col bg-bg-deep"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
        >
          {autoCloseEnabled ? (
            <div className="h-1 w-full bg-bg-panel" aria-hidden="true">
              <div
                className="h-full bg-neon-blue transition-[width] duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          ) : null}

          <div className="relative flex-1">
            <iframe
              src={url}
              title="haTD — tower defense par Xavier B. (aperçu)"
              className="h-full w-full border-0"
              allow="fullscreen"
            />
            <button
              type="button"
              onClick={requestClose}
              aria-label="Fermer l'aperçu"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-bg-deep/90 text-text-primary shadow-lg backdrop-blur-xl lite:backdrop-blur-none"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-glass bg-bg-panel px-4 py-3 text-sm text-text-muted">
            <p>Jouable sur ordinateur — jouez-y depuis un PC pour utiliser le clavier/la souris.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-card border border-border-glass bg-bg-deep px-3 py-1.5 text-xs text-text-primary">
                {url}
              </code>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="shrink-0 rounded-card border border-border-glass px-3 py-1.5 text-xs text-text-primary transition-colors duration-fast hover:border-neon-blue"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
