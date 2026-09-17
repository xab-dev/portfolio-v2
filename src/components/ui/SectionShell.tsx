import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Reveal } from "./Reveal";

export interface SectionShellProps extends PropsWithChildren {
  id: string;
  title: string;
  subtitle?: ReactNode;
  className?: string;
  /** Action affichée à droite du titre (desktop) / sous le sous-titre (mobile). Réservée à `Play` (spec 10 §3). */
  headerAction?: ReactNode;
  /**
   * `false` quand le contenu de la section peut dépasser un écran de
   * téléphone (Bug 1, `PATCHES_2026-09-17_fix-skills-mobile.md` — ex.
   * Compétences) : un reveal groupé sur tout `children` n'atteindrait alors
   * jamais son seuil de visibilité et resterait caché pour toujours. La
   * section applique ses propres `Reveal` par bloc à la place (radar, carte
   * de famille, légende, bandeau…), jamais sur elle-même en entier. Défaut
   * `true` : la plupart des sections tiennent sur un écran ou deux et
   * profitent du reveal groupé sans rien changer.
   */
  revealContent?: boolean;
}

export function SectionShell({
  id,
  title,
  subtitle,
  children,
  className,
  headerAction,
  revealContent = true,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 px-6 py-16 md:px-12 md:py-28", className)}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <Reveal className="flex flex-col gap-3">
          {headerAction ? (
            // `relative`/`absolute` plutôt qu'un item flex à côté du titre : un item flex
            // aurait réduit la largeur dispo du titre et changé son retour à la ligne
            // (donc la hauteur de l'en-tête, donc la position de tout ce qui suit — le
            // critère maître §7.1 exige que seule la zone du bouton diffère dans Jouer).
            // L'action flotte dans l'espace déjà libre à droite du titre sans toucher au
            // flux du texte.
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
                {title}
              </h2>
              <div className="absolute right-0 top-0 hidden md:block">{headerAction}</div>
            </div>
          ) : (
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
              {title}
            </h2>
          )}
          {subtitle ? <p className="max-w-2xl text-text-muted">{subtitle}</p> : null}
          {headerAction ? <div className="md:hidden">{headerAction}</div> : null}
        </Reveal>
        {revealContent ? <Reveal>{children}</Reveal> : <div>{children}</div>}
      </div>
    </section>
  );
}
