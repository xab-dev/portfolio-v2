import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Triplets "R G B" dans tokens.css : rgb(var(--x) / <alpha-value>) permet
        // les modificateurs d'opacité Tailwind (bg-bg-deep/70, bg-neon-blue/15...).
        "bg-deep": "rgb(var(--bg-deep) / <alpha-value>)",
        "bg-panel": "var(--bg-panel)",
        "border-glass": "var(--border-glass)",
        "neon-blue": "rgb(var(--neon-blue) / <alpha-value>)",
        "neon-violet": "rgb(var(--neon-violet) / <alpha-value>)",
        "neon-emerald": "rgb(var(--neon-emerald) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
      },
      boxShadow: {
        "glow-blue": "var(--glow-blue)",
        "glow-violet": "var(--glow-violet)",
        "glow-emerald": "var(--glow-emerald)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    // Mode allégé tactile (Phase 6b, spec 08 §2) : `lite:` ne s'applique jamais
    // sous `data-perf="full"` — le PC reste protégé par construction.
    plugin(({ addVariant }) => {
      addVariant("lite", 'html[data-perf="lite"] &');
    }),
  ],
} satisfies Config;
