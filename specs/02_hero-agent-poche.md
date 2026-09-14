# Portfolio v2 — SPEC : Hero + Agent IA de poche (Phase 1)

**Contexte déjà disponible pour Claude Code** : `00_ROADMAP.md` (T5, T5b, T6, T10), primitives de Phase 0 (`TypingText`, `GlassCard`, `NeonButton`), `src/content/site.ts`.

## 1. Rôle du module
Première impression : en 5 secondes, dire *ce que Xav apporte* et prouver qu'il maîtrise l'IA — pas en le disant, mais en laissant le visiteur poser une question à un agent qui répond de façon utile et honnête. L'agent est **simulé** en V1 (T5) mais son interface est celle d'un vrai client d'API.

## 2. Entrées / Sorties

### Contenu (`src/content/hero.ts`)
```ts
export const hero = {
  eyebrow: "Consultant indépendant · Tarascon, Provence",
  title: "L'IA n'a de valeur que si elle résout un vrai problème.",   // [À CONFIRMER] accroche
  subtitle: "Je conçois des workflows, des outils et des usages IA adaptés aux besoins réels — et je dis aussi quand l'IA n'est pas le bon outil.",
  ctaPrimary: { label: "Voir mes projets", href: "#projets" },
  ctaSecondary: { label: "Qualifier mon besoin", href: "#contact" },
};
```

### Agent (`src/content/agent.ts` + `src/lib/agent/`)
```ts
export type AgentReply = { text: string; followUps?: string[] };
export interface AgentProvider {
  ask(question: string, history: {role:'user'|'agent'; text:string}[]): Promise<AgentReply>;
}
// V1 : ScriptedAgentProvider (table question→réponse, matching par id de puce ou par mots-clés, réponse par défaut)
// V2 (hors scope) : ApiAgentProvider (POST vers un backend/proxy de Xav) — même interface, zéro changement de composant
```

Puces et réponses V1 (texte final à valider par Xav — **[DETTE-05]**) :

| id | Puce | Réponse scriptée (esprit — reformulable) |
|---|---|---|
| `roi` | "Quel est le ROI de tes projets ?" | "Honnêtement : je ne vous sortirai pas un chiffre client inventé. Mes projets publiés sont des cas réels documentés (problème → architecture → limites). Pour *votre* contexte, le simulateur juste en dessous donne une estimation indicative — et un vrai chiffrage se fait après diagnostic." *(Optionnel, ton de Xav : "Une certitude quand même : le ROI de l'IA bat celui du poker." — à valider [DETTE-05])* |
| `dispo` | "Es-tu disponible ?" | "Oui — consultant indépendant basé près d'Arles, disponible pour des missions courtes (diagnostic, cadrage, mise en place d'un premier workflow) en présentiel dans la région ou à distance. [DETTE-06 : délai/volume]" |
| `methode` | "Comment tu travailles avec l'IA ?" | Résumé 4D en 3 phrases + "je délègue l'exécution, jamais la vérification". |
| `outils` | "Quels outils tu utilises ?" | Claude au quotidien — Fable 5.1, Opus 5, Sonnet 5 selon la tâche — et Claude Code piloté par specs ; Python, JS, PowerShell. Automatisation (Make, n8n) et RAG : notions, à creuser quand un projet le demandera. "Je choisis l'outil après le problème, pas avant." |
| `non-ia` | "Quand l'IA n'est PAS la bonne réponse ?" | 3 exemples concrets (process instable, donnée sensible sans cadre, tâche déjà rapide à la main). |
| défaut | (saisie libre) | "Je suis une version scriptée de l'agent — les réponses libres arrivent avec la V2. En attendant, une de ces questions vous aide ?" + repropose les puces. |

## 3. Comportement attendu
- Layout : 2 colonnes desktop (texte 55 % / agent 45 %), empilé mobile (texte puis agent).
- Fond du Hero : lueurs radiales violet + bleu très diffuses, animées lentement (opacité 0.15 → 0.25, 8 s, boucle) ; désactivées en reduced-motion.
- Titre : apparition mot par mot (stagger 40 ms). Sous-titre fadeUp. CTA : `NeonButton`.
- **Agent** dans une `GlassCard glow="violet"` : en-tête (avatar icône `Bot` Lucide + "Agent de poche · v1 scriptée" + pastille "prêt à connecter"), zone de conversation (max 4 échanges visibles, scroll interne), rangée de puces (`Tag`), champ de saisie libre + bouton envoyer (`Send`).
- Clic sur une puce → message utilisateur ajouté → indicateur "…" 400-700 ms → réponse révélée par `TypingText` → puces `followUps` proposées.
- Saisie libre : Entrée envoie ; réponse par défaut si pas de match.
- L'état de conversation est local au composant (pas de persistance).

## 4. Edge cases à gérer
- Double clic rapide sur une puce : ignoré tant qu'une réponse est en cours.
- Saisie vide / > 300 caractères : bouton désactivé, message court.
- Historique plein (12 messages) : les plus anciens sortent, un lien "réinitialiser".
- `TypingText` interrompu (nouvelle question) : le texte précédent est complété instantanément.
- Reduced-motion : réponses instantanées, pas de "…" animé.

## 5. Structure des fichiers
```
src/sections/Hero.tsx
src/components/agent/AgentPanel.tsx
src/components/agent/AgentMessage.tsx
src/lib/agent/AgentProvider.ts
src/lib/agent/ScriptedAgentProvider.ts
src/content/hero.ts
src/content/agent.ts
```

## 6. Consignes d'autonomie pour Claude Code
- Reformuler les réponses scriptées pour qu'elles sonnent naturel est autorisé ; **inventer une disponibilité, un tarif ou un chiffre client ne l'est pas**.
- Ne pas implémenter `ApiAgentProvider` ; laisser l'interface et une note dans `JOURNAL_DEV.md`.
- Réutiliser `Tag` et `TypingText` de Phase 0, ne pas en recréer.

## 7. Critères de validation
1. À 375 px : le Hero tient en ≤ 1,5 écran, l'agent est utilisable au pouce.
2. Chaque puce déclenche sa réponse ; la saisie libre "bonjour" déclenche la réponse par défaut.
3. Navigation clavier complète (Tab → puces → champ → envoyer).
4. Reduced-motion vérifié dans DevTools : aucun typing, aucune lueur animée.

## 8. Hors scope
Connexion à une vraie API, mémoire de conversation, analytics des questions posées.
