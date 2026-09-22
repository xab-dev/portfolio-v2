# 🛡️ Journal d'Audit, Prévention & Robustesse des Outils IA

Bienvenue sur ce dépôt open-source. En tant que **Consultant en Prévention et Outils IA**, j'utilise cet espace pour documenter méthodiquement, au quotidien, mes flux de travail en production réelle (notamment avec les architectures en CLI comme *Claude Code* et les modèles de la gamme Claude 5).

L'objectif de ce journal de bord est de mettre en lumière les forces, les limites techniques, les comportements imprévus (erreurs de fusion de diff, hallucinations de contexte) et la robustesse globale des LLM en situation de développement intensif.

Le terrain d'observation est réel et vérifiable : **ce dépôt est aussi le code source de mon site portfolio**, construit de bout en bout selon la méthode décrite plus bas.

**→ Site en ligne : [xab-dev.github.io/portfolio-v2](https://xab-dev.github.io/portfolio-v2/)**

---

## 📋 Contenu du Dépôt

*   **Synthèses Quotidiennes :** Analyse des performances et de la vélocité des modèles au fil des versions.
*   **Logs d'Erreurs IA vs Développeur :** Cartographie des frictions techniques pour identifier si l'origine d'un blocage est humaine ou algorithmique.
*   **Points Faibles & Vecteurs de Risques :** Documentation des cas limites (ex: gestion des structures répétitives comme Tailwind CSS, instabilité des contextes lourds).

Concrètement, dans l'arborescence :

| Dossier | Contenu |
| --- | --- |
| `process/JOURNAL_DEV.md` | Le journal d'audit lui-même : chaque session, ce qui a fonctionné, ce qui a dérapé, la cause identifiée. |
| `process/dette_suivi.md` | Dette technique et de contenu, numérotée (`DETTE-NN`), ouverte par l'agent, tranchée par moi. |
| `specs/` | Le cadrage écrit **avant** chaque phase de code, plus la roadmap versionnée (`00_ROADMAP.md`) et les patchs archivés. |
| `docs/` | Documents de méthode : bibliothèque de templates de cadrage, séquence d'intervention terrain, déclaration de diligence AI Fluency. |
| `src/`, `scripts/` | Le code du site et son outillage (génération du CV PDF, pipeline d'images, audits automatisés de contraste et de thème). |

---

## 🛠️ Méthodologie & Workflow de Sécurité

Mes interventions suivent un cadre strict et itératif visant à garantir la sécurité de la chaîne d'approvisionnement logicielle (*Supply Chain Security*) :
1. **Cadrage & Spécifications** (IA Textuelle classique)
2. **Relecture Humaine** (Validation des barrières de sécurité et de logique)
3. **Exécution Ciblée** (Claude Code CLI au format fichier par fichier)
4. **Audit de Diff & Validation Git** (Détection immédiate des régressions ou duplications de code)

---

## 🎯 Objectifs de Prévention

1.  **Sensibilisation :** Aider les entreprises et les développeurs à comprendre comment fonctionnent les LLM sous le capot pour mieux anticiper leurs failles.
2.  **Sécurisation des environnements locaux :** Promouvoir le cloisonnement des privilèges des agents autonomes (Sandboxing, gestion stricte des permissions).
3.  **Contribution à l'AI Safety :** Documenter les comportements émergents pour aider à la création de modèles plus robustes et plus sûrs.

---

## ⚙️ Faire tourner le site en local

Stack : React 19 + TypeScript + Vite + Tailwind CSS. Node 20+.

```bash
npm install
npm run dev      # serveur de dev (régénère d'abord le CV PDF)
npm run build    # tsc -b && vite build → dist/
npm test         # vitest
npm run lint     # oxlint
```

Outillage d'audit maison :

```bash
npm run audit:contrast   # axe-core, thèmes clair et sombre
npm run audit:theme      # diff pixel du rendu sombre (référence locale)
npm run images           # images-src/ → .webp dans public/images/
npm run cv               # génère le CV PDF depuis src/content/
```

**Déploiement** : une seule branche de travail, `main`. Chaque push déclenche `.github/workflows/deploy.yml` (build + publication de `dist/` sur GitHub Pages). Pour tester une modification sans toucher au site en ligne : `npm run build && npx vite preview --host`, puis ouvrir `http://<ip-du-pc>:4173/portfolio-v2/` depuis le mobile sur le même Wi-Fi.

---

## 🏷️ Mots-clés / Topics GitHub
`#ai-safety` `#red-teaming` `#prompt-engineering` `#anthropic` `#claude-code` `#ai-prevention` `#consultant-ia`
