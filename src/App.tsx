import { useEffect, useRef, useState } from "react";
import { LazyMotion } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./sections/Hero";
import { StackSimulator } from "./sections/StackSimulator";
import { PromptPlayground } from "./sections/PromptPlayground";
import { Portfolio } from "./sections/Portfolio";
import { Skills } from "./sections/Skills";
import { Contact } from "./sections/Contact";
import { Play } from "./sections/Play";
import { LegalPage } from "./sections/LegalPage";
import { isLegalRoute, onHashChange, readHashRoute } from "./lib/router/hashRoute";

// Chargées dans un chunk séparé : les primitives animées restent utilisables
// (statiques le temps du fetch) sans alourdir le bundle initial.
const loadMotionFeatures = () => import("./lib/motionFeatures").then((mod) => mod.default);

export default function App() {
  const [legalOpen, setLegalOpen] = useState(() => isLegalRoute(readHashRoute()));
  // Faux seulement quand l'appli démarre déjà sur `#mentions-legales` (lien direct,
  // rechargement) : aucun `hashchange` n'a alors eu lieu en session, donc pas de
  // position précédente à laquelle `history.back()` pourrait raisonnablement revenir.
  const [enteredLegalInApp, setEnteredLegalInApp] = useState(false);
  const legalOpenRef = useRef(legalOpen);
  const savedScrollY = useRef(0);

  useEffect(() => {
    legalOpenRef.current = legalOpen;
  }, [legalOpen]);

  useEffect(
    () =>
      onHashChange(() => {
        const nowLegal = isLegalRoute(readHashRoute());
        // Sauvegarde manuelle : la restauration native du navigateur au
        // `popstate` se joue contre le remontage massif des sections
        // (des milliers de px insérés après coup) et retombe souvent à 0 —
        // trouvé en testant le retour depuis la section Jouer.
        if (nowLegal && !legalOpenRef.current) {
          savedScrollY.current = window.scrollY;
        }
        setLegalOpen(nowLegal);
        if (nowLegal) setEnteredLegalInApp(true);
      }),
    [],
  );

  useEffect(() => {
    if (legalOpen || savedScrollY.current === 0) return;
    const target = savedScrollY.current;
    savedScrollY.current = 0;

    // Le retour aux sections principales remonte des milliers de px de contenu
    // d'un coup ; une partie (radar de compétences, chunk séparé — Phase 0,
    // DETTE-26) se charge après le premier rendu, donc la hauteur finale du
    // document n'est atteinte qu'après ce chargement. Un simple rAF (voire
    // deux) tente le scroll trop tôt et se fait écrêter à 0 — observé en
    // testant le retour depuis la section Jouer. `ResizeObserver` réapplique
    // la cible à chaque changement de hauteur, jusqu'à l'atteindre ou un délai
    // maximal (contenu plus court que prévu : abandon propre, pas de blocage).
    let settled = false;
    const maxWait = window.setTimeout(() => {
      settled = true;
      observer.disconnect();
    }, 2000);

    const observer = new ResizeObserver(() => {
      if (settled) return;
      window.scrollTo({ top: target, left: 0, behavior: "instant" });
      if (document.documentElement.scrollHeight - window.innerHeight >= target) {
        settled = true;
        window.clearTimeout(maxWait);
        observer.disconnect();
      }
    });
    observer.observe(document.body);
    window.scrollTo({ top: target, left: 0, behavior: "instant" });

    return () => {
      window.clearTimeout(maxWait);
      observer.disconnect();
    };
  }, [legalOpen]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className="flex min-h-screen flex-col">
        {legalOpen ? null : <Navbar />}
        <main className="flex-1">
          {legalOpen ? (
            <LegalPage canGoBackInHistory={enteredLegalInApp} />
          ) : (
            <>
              <Hero />
              <StackSimulator />
              <PromptPlayground />
              <Portfolio />
              <Skills />
              <Contact />
              <Play />
            </>
          )}
        </main>
        <Footer />
      </div>
    </LazyMotion>
  );
}
