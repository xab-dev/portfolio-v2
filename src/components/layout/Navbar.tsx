import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { navLinks } from "../../content/nav";
import { site } from "../../content/site";

export function Navbar() {
  const [activeId, setActiveId] = useState(navLinks[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* backdrop-blur crée un containing block pour tout descendant `fixed` (spec CSS) :
          le panneau mobile est donc rendu hors du header, pas comme enfant, pour rester
          positionné par rapport au viewport. */}
      <header className="sticky top-0 z-40 h-16 border-b border-border-glass bg-bg-deep/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <a href="#hero" className="font-display font-semibold text-text-primary">
            {site.shortName}
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.id} className="relative">
                <a
                  href={`#${link.id}`}
                  className={cn(
                    "relative block px-4 py-2 text-sm transition-colors duration-fast",
                    activeId === link.id
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary",
                  )}
                >
                  {link.label}
                  {/* Soulignement en transition CSS pure (pas de layout animation JS) :
                      domAnimation, le bundle LazyMotion le plus léger, ne le supporte pas. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-4 -bottom-px h-px origin-center bg-neon-blue transition-transform duration-base",
                      activeId === link.id ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="text-text-primary md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 top-16 bottom-0 z-30 bg-bg-deep/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col items-center gap-2 px-6 py-10">
              {navLinks.map((link) => (
                <li key={link.id} className="w-full">
                  <a
                    href={`#${link.id}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block rounded-card border border-border-glass bg-bg-panel px-4 py-3 text-center text-lg transition-colors duration-fast",
                      activeId === link.id ? "text-text-primary" : "text-text-muted",
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
