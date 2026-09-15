import { agentDefaultReply, agentKeywords, agentReplies } from "../../content/agent";
import type { AgentHistoryEntry, AgentProvider, AgentReply } from "./AgentProvider";

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Résout une entrée (id de puce ou saisie libre) vers une réponse scriptée.
 * Fonction pure — testée directement (`ScriptedAgentProvider.test.ts`).
 */
export function matchReply(input: string): AgentReply {
  const normalized = normalize(input);

  if (normalized in agentReplies) {
    return { text: agentReplies[normalized] };
  }

  for (const [id, keywords] of Object.entries(agentKeywords)) {
    if (keywords.some((keyword) => normalized.includes(normalize(keyword)))) {
      return { text: agentReplies[id] };
    }
  }

  return { text: agentDefaultReply };
}

export class ScriptedAgentProvider implements AgentProvider {
  async ask(question: string, _history: AgentHistoryEntry[]): Promise<AgentReply> {
    return matchReply(question);
  }
}
