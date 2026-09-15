import { cn } from "../../lib/cn";
import { TypingText } from "../ui/TypingText";

export interface AgentMessageProps {
  role: "user" | "agent";
  text: string;
  /** Anime le texte lettre par lettre (dernier message agent uniquement). */
  typing?: boolean;
  onTypingDone?: () => void;
}

export function AgentMessage({ role, text, typing = false, onTypingDone }: AgentMessageProps) {
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
          <TypingText text={text} onDone={onTypingDone} />
        ) : (
          text
        )}
      </div>
    </div>
  );
}
