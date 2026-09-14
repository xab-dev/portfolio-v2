import { useState } from "react";
import { SectionShell } from "../components/ui/SectionShell";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { Modal } from "../components/ui/Modal";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { TypingText } from "../components/ui/TypingText";
import { Tag } from "../components/ui/Tag";
import { useReducedMotionSafe } from "../lib/motion";

/**
 * Section temporaire de démonstration des primitives (Phase 0).
 * À retirer quand chaque section réelle aura remplacé les coquilles.
 */
export function KitchenSink() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("Automations");
  const reducedMotion = useReducedMotionSafe();

  const tags = ["Automations", "Formations", "Jeu", "Outils", "Méthode"];

  return (
    <SectionShell
      id="kitchen-sink"
      title="Kitchen sink (temporaire)"
      subtitle="Démonstration des primitives du design system — section retirée en fin de Phase 0+."
    >
      <div className="flex flex-col gap-12">
        <p className="rounded-card border border-border-glass bg-bg-panel px-4 py-3 text-sm text-text-muted">
          `prefers-reduced-motion` détecté : <strong className="text-text-primary">{String(reducedMotion)}</strong>
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard glow="blue">
            <p className="font-display text-lg text-text-primary">GlassCard — glow blue</p>
            <p className="text-sm text-text-muted">Survolez la carte.</p>
          </GlassCard>
          <GlassCard glow="violet" tilt>
            <p className="font-display text-lg text-text-primary">GlassCard — glow violet + tilt</p>
            <p className="text-sm text-text-muted">Bougez la souris dessus (désactivé au tactile).</p>
          </GlassCard>
          <GlassCard glow="emerald">
            <p className="font-display text-lg text-text-primary">GlassCard — glow emerald</p>
            <p className="text-sm text-text-muted">Fond verre, bordure fine.</p>
          </GlassCard>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <NeonButton variant="primary">Bouton primaire</NeonButton>
          <NeonButton variant="ghost">Bouton ghost</NeonButton>
          <NeonButton variant="primary" onClick={() => setModalOpen(true)}>
            Ouvrir la modale
          </NeonButton>
        </div>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Tag key={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)}>
              {tag}
            </Tag>
          ))}
        </div>

        <div className="grid gap-6 text-center md:grid-cols-3">
          <GlassCard>
            <AnimatedCounter value={87} suffix="%" className="font-display text-4xl text-neon-blue" />
            <p className="mt-2 text-sm text-text-muted">Satisfaction (exemple)</p>
          </GlassCard>
          <GlassCard>
            <AnimatedCounter value={12} suffix="h" className="font-display text-4xl text-neon-violet" />
            <p className="mt-2 text-sm text-text-muted">Temps gagné / semaine (exemple)</p>
          </GlassCard>
          <GlassCard>
            <AnimatedCounter value={4200} suffix="€" className="font-display text-4xl text-neon-emerald" />
            <p className="mt-2 text-sm text-text-muted">Économie annuelle (exemple)</p>
          </GlassCard>
        </div>

        <GlassCard>
          <TypingText
            text="L'agent tape ce texte caractère par caractère, sauf en reduced-motion."
            className="font-display text-lg text-text-primary"
          />
        </GlassCard>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modale de démonstration">
          <p className="text-text-muted">
            Échap, clic sur l'overlay ou le bouton ferment cette modale. Le focus est piégé à
            l'intérieur tant qu'elle est ouverte.
          </p>
        </Modal>
      </div>
    </SectionShell>
  );
}
