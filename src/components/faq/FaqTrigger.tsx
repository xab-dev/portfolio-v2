import { MessageCircleQuestion } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";
import { faqUi } from "../../content/faq";

export interface FaqTriggerProps {
  onOpen: () => void;
}

/** Bouton discret, hors flux principal (spec 10 §3) : ni nav, ni section, un seul point d'entrée. */
export function FaqTrigger({ onOpen }: FaqTriggerProps) {
  return (
    <NeonButton variant="ghost" onClick={onOpen} className="gap-1.5 px-4 py-2 text-xs">
      <MessageCircleQuestion size={14} aria-hidden="true" />
      {faqUi.trigger}
    </NeonButton>
  );
}
