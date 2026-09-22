import { useState } from "react";
import { m } from "motion/react";
import type { Variants } from "motion/react";
import { hero } from "../content/hero";
import { NeonButton } from "../components/ui/NeonButton";
import { CvDownloadLink } from "../components/ui/CvDownloadLink";
import { AgentPanel } from "../components/agent/AgentPanel";
import { assetUrl } from "../lib/assetUrl";
import { fadeUp, fadeUpReduced, useReducedMotionSafe } from "../lib/motion";
import { useLiteMode } from "../lib/perf/useLiteMode";
import { useTheme } from "../lib/theme/useTheme";

const titleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

/**
 * Halo d'ambiance du Hero (§3.3, hors de la liste de fichiers indicative de
 * la spec 08 mais explicitement nommé par son texte : "les halos radiaux du
 * fond de page et du Hero"). En lite : opacité 0 (décision visuelle simple —
 * pas de dégradé linéaire statique de repli, le fond de page reste défini
 * par les halos de `globals.css`, eux aussi coupés en lite — vérifié à
 * l'écran, pas d'aplat trop nu). Boucle `animate` (8 s, `repeat: Infinity`)
 * entièrement évitée en lite, pas seulement masquée par opacité : c'est le
 * recompositing continu, pas juste sa visibilité, qui coûtait cher.
 */
function HeroGlow({ reducedMotion }: { reducedMotion: boolean }) {
  const liteMode = useLiteMode();
  const isLite = liteMode === "lite";

  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(38rem 30rem at 20% 15%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(34rem 28rem at 85% 30%, rgba(59,130,246,0.35), transparent 60%)",
      }}
      initial={{ opacity: isLite ? 0 : 0.15 }}
      animate={
        isLite ? { opacity: 0 } : reducedMotion ? { opacity: 0.2 } : { opacity: [0.15, 0.25, 0.15] }
      }
      transition={isLite || reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/**
 * Avatar du Hero. Deux tirages du même dessin selon le thème (Phase 9c/4) :
 * l'original sur fond sombre reste servi en thème sombre — D4 de la spec 12
 * gèle ce rendu au pixel — et la version claire prend sa place en thème clair.
 *
 * Choix en JS plutôt qu'en CSS (deux `<img>` superposés, ou `<picture>` +
 * `prefers-color-scheme`) pour deux raisons : le navigateur ne téléchargerait
 * qu'une seule des deux images ici, et surtout `<picture>` ne verrait que la
 * préférence système, donc raterait le choix explicite stocké par le bouton.
 * `useTheme` relit `data-theme` posé avant le premier rendu par le script
 * inline d'`index.html` : pas de flash, pas de bascule après coup.
 */
function HeroAvatar() {
  const { theme } = useTheme();
  const [lightFailed, setLightFailed] = useState(false);
  const hasImage = hero.avatar.src !== "";
  // Repli explicite : si `avatar-light.webp` manque (source `mode-clair` non
  // fournie à `npm run images`), on retombe sur le tirage sombre plutôt que
  // d'afficher une image cassée. Le sombre, lui, n'a pas de repli : son absence
  // serait un build cassé, pas une variante optionnelle.
  const useLight = theme === "light" && !lightFailed;
  const src = useLight ? hero.avatar.srcLight : hero.avatar.src;

  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-neon-violet/40 shadow-glow-violet">
      {hasImage ? (
        <img
          src={assetUrl(src)}
          alt={hero.avatar.alt}
          width={96}
          height={96}
          className="h-full w-full object-cover"
          onError={useLight ? () => setLightFailed(true) : undefined}
        />
      ) : (
        <div
          role="img"
          aria-label={hero.avatar.alt}
          className="flex h-full w-full items-center justify-center bg-bg-panel font-display text-lg font-semibold text-text-primary"
        >
          {hero.avatar.initials}
        </div>
      )}
    </div>
  );
}

export function Hero() {
  const reducedMotion = useReducedMotionSafe();
  const words = hero.title.split(" ");
  const wordVariant = reducedMotion ? fadeUpReduced : fadeUp;
  const subtitleVariant = reducedMotion ? fadeUpReduced : fadeUp;

  return (
    <section id="hero" className="relative z-0 scroll-mt-24 overflow-hidden px-6 py-20 md:px-12 md:py-28">
      <HeroGlow reducedMotion={reducedMotion} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[55%_45%]">
        <div className="flex flex-col gap-6">
          <HeroAvatar />

          <p className="text-sm uppercase tracking-wide text-text-muted">{hero.eyebrow}</p>

          <m.h1
            initial="hidden"
            animate="visible"
            variants={titleContainer}
            className="font-display text-4xl font-bold leading-tight text-text-primary md:text-5xl"
          >
            {words.map((word, index) => (
              <m.span key={index} variants={wordVariant} className="mr-[0.3em] inline-block">
                {word}
              </m.span>
            ))}
          </m.h1>

          <m.p
            initial="hidden"
            animate="visible"
            variants={subtitleVariant}
            className="max-w-xl text-text-muted"
          >
            {hero.subtitle}
          </m.p>

          <div className="flex flex-wrap gap-4">
            <NeonButton href={hero.ctaPrimary.href} variant="primary">
              {hero.ctaPrimary.label}
            </NeonButton>
            <NeonButton href={hero.ctaSecondary.href} variant="ghost">
              {hero.ctaSecondary.label}
            </NeonButton>
          </div>

          <CvDownloadLink />
        </div>

        <AgentPanel />
      </div>
    </section>
  );
}
