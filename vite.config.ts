import { existsSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import { site } from "./src/content/site.ts";
import { directContact } from "./src/content/contact.ts";

const DESCRIPTION_FALLBACK = `${site.name} — ${site.title}`;

/**
 * Injecte les balises SEO/OG/Twitter/JSON-LD statiquement dans `index.html`
 * (spec 09 §2) : les crawlers et les aperçus de lien ne lisent pas le DOM
 * React, donc ces valeurs ne peuvent pas venir d'un composant. Générées
 * depuis `site.ts` (T8) plutôt que dupliquées à la main.
 */
function seoHeadPlugin(): Plugin {
  let isBuild = false;

  return {
    name: "portfolio-seo-head",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    buildStart() {
      if (!isBuild) return;
      const ogPath = resolve(import.meta.dirname, "public", "og.png");
      if (!existsSync(ogPath)) {
        throw new Error(
          "public/og.png est absent : lancer `npm run og` avant le build (spec 09 §2/§4).",
        );
      }
    },
    transformIndexHtml(html) {
      const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
      const description = descriptionMatch?.[1] ?? DESCRIPTION_FALLBACK;

      const canonical = site.seo.siteUrl;
      const ogImage = `${site.seo.siteUrl}${site.seo.ogImage}`;
      const avatarUrl = `${site.seo.siteUrl}images/avatar.webp`;
      const ogTitle = `${site.name} — ${site.title}`;
      const sameAs = [site.links.github, site.links.youtube].filter((url) => url !== ""); // LinkedIn omis tant que vide (DETTE-04)

      const personJsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: site.name,
        alternateName: site.shortName,
        jobTitle: site.title,
        url: canonical,
        image: avatarUrl,
        email: `mailto:${site.contact.emailPrimary}`,
        telephone: directContact.telHref.replace(/^tel:/, ""),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Tarascon",
          addressRegion: "Provence-Alpes-Côte d'Azur",
          addressCountry: "FR",
        },
        sameAs,
      };

      const tags: HtmlTagDescriptor[] = [
        { tag: "link", attrs: { rel: "canonical", href: canonical }, injectTo: "head" },
        ...(site.seo.indexable
          ? []
          : [{ tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" }, injectTo: "head" } as const]),
        { tag: "meta", attrs: { property: "og:type", content: "profile" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:locale", content: site.seo.locale }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:site_name", content: site.name }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:title", content: ogTitle }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:description", content: description }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:url", content: canonical }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image", content: ogImage }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image:alt", content: ogTitle }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:title", content: ogTitle }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:description", content: description }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:image", content: ogImage }, injectTo: "head" },
        { tag: "meta", attrs: { name: "theme-color", content: "#0B0F19" }, injectTo: "head" },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          // `<` : défense contre une valeur qui contiendrait "</script>" (aucune ici, mais JSON.stringify n'échappe pas "<").
          children: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          injectTo: "head",
        },
      ];

      return tags;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/portfolio-v2/",
  plugins: [react(), seoHeadPlugin()],
});
