import { m } from "motion/react";
import type { Variants } from "motion/react";
import { hero } from "../content/hero";
import { NeonButton } from "../components/ui/NeonButton";
import { AgentPanel } from "../components/agent/AgentPanel";
import { assetUrl } from "../lib/assetUrl";
import { fadeUp, fadeUpReduced, useReducedMotionSafe } from "../lib/motion";

const titleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

function HeroGlow({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(38rem 30rem at 20% 15%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(34rem 28rem at 85% 30%, rgba(59,130,246,0.35), transparent 60%)",
      }}
      initial={{ opacity: 0.15 }}
      animate={reducedMotion ? { opacity: 0.2 } : { opacity: [0.15, 0.25, 0.15] }}
      transition={reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function HeroAvatar() {
  const hasImage = hero.avatar.src !== "";

  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-neon-violet/40 shadow-glow-violet">
      {hasImage ? (
        <img
          src={assetUrl(hero.avatar.src)}
          alt={hero.avatar.alt}
          width={96}
          height={96}
          className="h-full w-full object-cover"
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
        </div>

        <AgentPanel />
      </div>
    </section>
  );
}
