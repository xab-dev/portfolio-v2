import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, YoutubeIcon } from "../ui/BrandIcons";
import { site } from "../../content/site";

export function Footer() {
  const socialLinks = [
    { href: site.links.github, label: "GitHub", Icon: GithubIcon },
    { href: site.links.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: site.links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  ].filter((link) => link.href !== "");

  return (
    <footer className="border-t border-border-glass px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div>
          <p className="font-display text-lg font-semibold text-text-primary">{site.name}</p>
          <p className="text-sm text-text-muted">{site.title}</p>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-text-muted transition-colors duration-fast hover:text-neon-blue"
            >
              <Icon size={20} />
            </a>
          ))}
          <a
            href={`mailto:${site.contact.emailPrimary}`}
            aria-label="Envoyer un e-mail"
            className="text-text-muted transition-colors duration-fast hover:text-neon-blue"
          >
            <Mail size={20} />
          </a>
        </div>

        <p className="text-xs text-text-muted">
          {site.legal.status} · SIRET {site.legal.siret}
        </p>
      </div>
    </footer>
  );
}
