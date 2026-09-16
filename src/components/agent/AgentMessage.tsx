import { cn } from "../../lib/cn";
import { TypingText } from "../ui/TypingText";

export interface AgentMessageProps {
  role: "user" | "agent";
  text: string;
  /** Anime le texte lettre par lettre (dernier message agent uniquement). */
  typing?: boolean;
  /** Vitesse de frappe en ms/caractère (spec 10 §3 : FAQ plus rapide que l'agent). */
  speedMs?: number;
  onTypingDone?: () => void;
}

export function AgentMessage({ role, text, typing = false, speedMs, onTypingDone }: AgentMessageProps) {
  const isAgent = role === "agent";

  return (
    <div className={cn("flex", isAgent ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-2 text-sm leading-relaxed",
          isAgent
            ? "border-border-glass bg-bg-panel text-text-primary"
            : "border-neon-blue/40 bg-neon-blue/15 text-text-primary",
        )}
      >
        {isAgent && typing ? (
          <TypingText text={text} speedMs={speedMs} onDone={onTypingDone} />
        ) : (
          text
        )}
      </div>
    </div>
  );
}
