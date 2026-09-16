import { useEffect, useRef } from "react";
import { m } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { legalSections } from "../content/legal";
import { fadeUp, fadeUpReduced, useReducedMotionSafe } from "../lib/motion";

export interface LegalPageProps {
  /**
   * `false` quand l'appli a démarré directement sur `#mentions-legales` (lien
   * direct, rechargement) : aucune entrée d'historique interne à laquelle
   * revenir dans cet onglet — `history.back()` sortirait du site. Dans ce
   * cas, retour à la section d'accueil plutôt qu'un retour arrière.
   */
  canGoBackInHistory: boolean;
}

/** Page Mentions légales (Phase 7, spec 09 §3) : vue pleine page, remplace la nav. */
export function LegalPage({ canGoBackInHistory }: LegalPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotionSafe();

  function goBack() {
    if (canGoBackInHistory) {
      window.history.back();
    } else {
      window.location.hash = "hero";
    }
  }

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Mentions légales — Xavier Joseph Bou";
    // `behavior: "instant"` explicite : la forme à 2 arguments hérite de
    // `scroll-behavior: smooth` (global, nav ancrée) et peut rester bloquée
    // en cours de route sur une page longue (scroll anchoring en conflit
    // avec les fondus `whileInView` qui se déclenchent pendant le scroll) —
    // trouvé en testant l'ouverture depuis une position de scroll profonde.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") goBack();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.title = previousTitle;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // `canGoBackInHistory` est fixé une fois pour toutes par App.tsx au montage
    // (ne change jamais pendant la vie de ce composant) : dépendance stable.
  }, [canGoBackInHistory]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-glass bg-bg-deep/70 px-6 backdrop-blur-xl md:px-12 lite:bg-bg-deep/95 lite:backdrop-blur-none">
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-lg font-semibold text-text-primary">
          Mentions légales
        </h1>
        <NeonButton variant="ghost" onClick={goBack} className="gap-2">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au site
        </NeonButton>
      </header>

      <div className="px-6 py-16 md:px-12 md:py-20">
        <m.div
          initial="hidden"
          animate="visible"
          variants={reducedMotion ? fadeUpReduced : fadeUp}
          className="mx-auto max-w-3xl"
        >
          <GlassCard className="flex flex-col gap-8">
            {legalSections.map((section) => (
              <section key={section.id} className="flex flex-col gap-2">
                <h2 className="font-display text-lg font-semibold text-text-primary">{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-text-muted">
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="flex flex-col gap-1 pl-4 text-sm leading-relaxed text-text-muted [list-style:disc]">
                    {section.list.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </GlassCard>
        </m.div>
      </div>
    </>
  );
}
