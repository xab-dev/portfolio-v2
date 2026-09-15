export interface AgentHistoryEntry {
  role: "user" | "agent";
  text: string;
}

export type AgentReply = { text: string; followUps?: string[] };

/**
 * Interface prête pour une vraie API (T5) : V1 = ScriptedAgentProvider.
 * `ApiAgentProvider` (V2, hors scope Phase 1) implémentera la même interface
 * pour un `POST` vers un backend/proxy de Xav — voir JOURNAL_DEV.md.
 */
export interface AgentProvider {
  ask(question: string, history: AgentHistoryEntry[]): Promise<AgentReply>;
}
