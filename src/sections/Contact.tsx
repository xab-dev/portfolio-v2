import { Mail, MessageCircle } from "lucide-react";
import { SectionShell } from "../components/ui/SectionShell";
import { GlassCard } from "../components/ui/GlassCard";
import { GithubIcon, LinkedinIcon, YoutubeIcon } from "../components/ui/BrandIcons";
import { ContactForm } from "../components/contact/ContactForm";
import { availabilityNote, directContact, indicativeRateNote } from "../content/contact";
import { site } from "../content/site";

const socialLinks = [
  { href: site.links.github, label: "GitHub", Icon: GithubIcon },
  { href: site.links.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: site.links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
].filter((link) => link.href !== ""); // DETTE-04 : LinkedIn masqué tant que vide

export function Contact() {
  return (
    <SectionShell
      id="contact"
      title="Contact"
      subtitle="Qualifiez votre besoin en 3 clics : le premier échange sera déjà cadré."
    >
      <div className="flex flex-col gap-8">
        <p className="flex items-center gap-2 rounded-card border border-border-glass bg-bg-panel px-4 py-3 text-sm text-text-muted">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-emerald" aria-hidden="true" />
          {availabilityNote}
        </p>

        <GlassCard glow="blue">
          <ContactForm />
        </GlassCard>

        <div className="flex flex-col gap-4 border-t border-border-glass pt-6">
          <p className="text-sm font-medium text-text-primary">Contact direct (préféré)</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-text-muted">
            <a
              href={`mailto:${directContact.emailPrimary}`}
              className="inline-flex items-center gap-2 transition-colors duration-fast hover:text-text-primary"
            >
              <Mail size={16} aria-hidden="true" /> {directContact.emailPrimary}
            </a>
            <a
              href={`mailto:${directContact.emailSecondary}`}
              className="inline-flex items-center gap-2 transition-colors duration-fast hover:text-text-primary"
            >
              <Mail size={16} aria-hidden="true" /> {directContact.emailSecondary}
            </a>
            <a
              href={directContact.telHref}
              className="transition-colors duration-fast hover:text-text-primary"
            >
              {directContact.phoneDisplay}
            </a>
            <a
              href={directContact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-fast hover:text-text-primary"
            >
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp
            </a>
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-text-muted transition-colors duration-fast hover:text-neon-blue"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-muted">{indicativeRateNote}</p>
      </div>
    </SectionShell>
  );
}
