import { useEffect, useRef, useState } from "react";
import { Bot, Check, RotateCcw, Send } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Tag } from "../ui/Tag";
import { cn } from "../../lib/cn";
import { useReducedMotionSafe } from "../../lib/motion";
import { agentBullets } from "../../content/agent";
import { ScriptedAgentProvider } from "../../lib/agent/ScriptedAgentProvider";
import type { AgentHistoryEntry } from "../../lib/agent/AgentProvider";
import { AgentMessage } from "./AgentMessage";

interface ChatMessage {
  id: number;
  role: "user" | "agent";
  text: string;
  /** false tant que le typing de ce message (le dernier agent) n'est pas fini. */
  done: boolean;
}

const MAX_HISTORY = 12;
const MAX_INPUT_LENGTH = 300;
const PENDING_DELAY_MIN_MS = 400;
const PENDING_DELAY_MAX_MS = 700;

const provider = new ScriptedAgentProvider();

export function AgentPanel() {
  const reducedMotion = useReducedMotionSafe();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Suit le bas de la zone de conversation : nouveaux messages, mais aussi
  // croissance progressive du texte pendant l'effet TypingText (ResizeObserver
  // plutôt qu'un effet sur `messages` seul, qui raterait la frappe en cours).
  useEffect(() => {
    const container = scrollRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const isResponding = pending || messages.some((message) => message.role === "agent" && !message.done);
  const trimmedInput = input.trim();
  const inputTooLong = input.length > MAX_INPUT_LENGTH;
  const canSend = trimmedInput.length > 0 && !inputTooLong && !isResponding;

  function pushMessage(role: ChatMessage["role"], text: string, done: boolean): number {
    const id = nextId.current++;
    setMessages((current) => {
      const next = [...current.map((m) => (m.role === "agent" ? { ...m, done: true } : m)), { id, role, text, done }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    return id;
  }

  async function handleAsk(question: string, displayText: string) {
    if (isResponding) return; // double clic / envoi ignoré tant qu'une réponse est en cours
    pushMessage("user", displayText, true);
    setInput("");

    const history: AgentHistoryEntry[] = messages.map(({ role, text }) => ({ role, text }));

    if (reducedMotion) {
      const reply = await provider.ask(question, history);
      pushMessage("agent", reply.text, true);
      if (reply.id) setAnsweredIds((current) => new Set(current).add(reply.id!));
      return;
    }

    setPending(true);
    const delay = PENDING_DELAY_MIN_MS + Math.random() * (PENDING_DELAY_MAX_MS - PENDING_DELAY_MIN_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
    const reply = await provider.ask(question, history);
    setPending(false);
    pushMessage("agent", reply.text, false);
    if (reply.id) setAnsweredIds((current) => new Set(current).add(reply.id!));
  }

  function handleTypingDone(id: number) {
    setMessages((current) => current.map((m) => (m.id === id ? { ...m, done: true } : m)));
  }

  function handleReset() {
    setMessages([]);
    setInput("");
    setPending(false);
    setAnsweredIds(new Set());
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    void handleAsk(trimmedInput, trimmedInput);
  }

  return (
    <GlassCard glow="violet" className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neon-violet/50 bg-neon-violet/15 text-accent-violet-fg">
          <Bot size={18} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Agent de poche · v1 scriptée</p>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald" aria-hidden="true" />
            Prêt à connecter
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="scrollbar-subtle max-h-72 min-h-[8rem] overflow-y-auto pr-1"
      >
        <div ref={contentRef} className="flex flex-col gap-2">
          {messages.length === 0 ? (
            <p className="text-sm text-text-muted">
              Posez une question via les puces ci-dessous, ou écrivez la vôtre.
            </p>
          ) : (
            messages.map((message) => (
              <AgentMessage
                key={message.id}
                role={message.role}
                text={message.text}
                typing={!message.done}
                onTypingDone={() => handleTypingDone(message.id)}
              />
            ))
          )}
          {pending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border-glass bg-bg-panel px-4 py-2 text-sm text-text-muted">
                …
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {agentBullets.map((bullet) => {
          const alreadyAnswered = answeredIds.has(bullet.id);
          return (
            <Tag
              key={bullet.id}
              disabled={isResponding || alreadyAnswered}
              aria-disabled={alreadyAnswered}
              title={alreadyAnswered ? "Déjà répondu — voir plus haut" : undefined}
              onClick={() => void handleAsk(bullet.id, bullet.label)}
            >
              {alreadyAnswered ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} aria-hidden="true" />
                  {bullet.label}
                </span>
              ) : (
                bullet.label
              )}
            </Tag>
          );
        })}
      </div>

      {messages.length >= MAX_HISTORY || answeredIds.size > 0 ? (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 self-start text-xs text-text-muted transition-colors duration-fast hover:text-accent-blue-fg"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Réinitialiser la conversation
        </button>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label htmlFor="agent-input" className="sr-only">
          Poser une question à l'agent
        </label>
        <input
          id="agent-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Écrivez votre question…"
          className="flex-1 rounded-full border border-border-glass bg-bg-panel px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-neon-blue"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Envoyer"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-fast",
            canSend
              ? "border-neon-blue bg-neon-blue/15 text-accent-blue-fg hover:bg-neon-blue/25"
              : "border-border-glass text-text-muted",
          )}
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
      {inputTooLong ? (
        <p className="-mt-2 text-xs text-accent-violet-fg">300 caractères maximum.</p>
      ) : null}
    </GlassCard>
  );
}
