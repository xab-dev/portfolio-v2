import { useCallback, useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { SectionShell } from "../components/ui/SectionShell";
import { NeonButton } from "../components/ui/NeonButton";
import { TeaserOverlay } from "../components/play/TeaserOverlay";
import { FaqTrigger } from "../components/faq/FaqTrigger";
import { FaqModal } from "../components/faq/FaqModal";
import { play } from "../content/play";
import { isFaqRoute, onHashChange, readHashRoute } from "../lib/router/hashRoute";

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    function handleChange(event: MediaQueryListEvent) {
      setCoarse(event.matches);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return coarse;
}

export function Play() {
  const isTouch = useCoarsePointer();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(() => isFaqRoute(readHashRoute()));
  const frameRef = useRef<HTMLDivElement>(null);

  function handleFullscreen() {
    const el = frameRef.current;
    if (!el || !document.fullscreenEnabled) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }

  useEffect(() => onHashChange(() => setFaqOpen(isFaqRoute(readHashRoute()))), []);

  const openFaq = useCallback(() => {
    window.history.replaceState(null, "", "#faq");
    setFaqOpen(true);
  }, []);

  // Pas de `pushState` (edge case §4) : le hash `#faq` est posé/retiré par
  // `replaceState`, la Modal FAQ n'ajoute aucune entrée d'historique.
  const closeFaq = useCallback(() => {
    window.history.replaceState(null, "", "#jouer");
    setFaqOpen(false);
  }, []);

  return (
    <SectionShell
      id="jouer"
      title={play.title}
      subtitle={play.intro}
      headerAction={<FaqTrigger onOpen={openFaq} />}
    >
      <div className="flex flex-col gap-4">
        <a
          href="#projets/hatd"
          className="self-start text-sm text-neon-blue underline underline-offset-4"
        >
          Voir la fiche projet
        </a>

        {isTouch ? (
          <div className="flex flex-col gap-4 rounded-card border border-border-glass bg-bg-panel p-6 text-center">
            <p className="text-sm text-text-muted">
              haTD n'est pas jouable au tactile. L'intro (cold-open) donne un aperçu concret du jeu.
            </p>
            <NeonButton variant="primary" className="self-center" onClick={() => setOverlayOpen(true)}>
              Voir l'intro
            </NeonButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              ref={frameRef}
              className="relative aspect-video overflow-hidden rounded-card border border-border-glass bg-bg-panel backdrop-blur-xl"
            >
              <iframe
                src={play.url}
                title="haTD — tower defense par Xavier B."
                loading="lazy"
                allow="fullscreen"
                className="h-full w-full border-0"
              />
              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Plein écran"
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-bg-deep/80 px-3 py-1.5 text-xs text-text-primary backdrop-blur-xl transition-colors duration-fast hover:text-neon-blue"
              >
                <Expand size={14} aria-hidden="true" /> Plein écran
              </button>
            </div>
            <a
              href={play.url}
              target="_blank"
              rel="noreferrer"
              className="self-start text-xs text-text-muted underline underline-offset-4 hover:text-text-primary"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        )}
      </div>

      <TeaserOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        url={play.url}
        teaserMs={play.teaserMs}
      />
      <FaqModal open={faqOpen} onClose={closeFaq} />
    </SectionShell>
  );
}
