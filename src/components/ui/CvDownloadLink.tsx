import { Download } from "lucide-react";
import { cv } from "../../content/cv";
import { assetUrl } from "../../lib/assetUrl";
import { cn } from "../../lib/cn";

/**
 * Lien de téléchargement du CV PDF (Phase 8, spec 09 §3) : un simple
 * `<a download>` same-origin, aucun JS, aucune génération à la volée — le
 * fichier existe déjà dans `dist/cv/` par construction (`npm run cv`,
 * `prebuild`). Réutilisé dans le Hero et Contact (« Contact direct »).
 */
export function CvDownloadLink({ className }: { className?: string }) {
  return (
    <a
      href={assetUrl(`/cv/${cv.fileName}`)}
      download
      type="application/pdf"
      className={cn(
        "inline-flex items-center gap-2 text-sm text-text-muted underline decoration-border-glass underline-offset-4 transition-colors duration-fast hover:text-neon-blue hover:decoration-neon-blue",
        className,
      )}
    >
      <Download size={16} aria-hidden="true" />
      {cv.ctaLabel}
    </a>
  );
}
