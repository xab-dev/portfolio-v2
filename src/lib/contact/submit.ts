import type { Budget, ProjectType, Timing } from "../../content/contact";
import { directContact, formspreeEndpoint } from "../../content/contact";

export interface ContactPayload {
  projectType: ProjectType;
  budget: Budget;
  timing: Timing;
  name: string;
  email: string;
  message: string;
  source: "simulator" | "direct";
  simulatorSelection?: string[];
}

export type SubmitResult = { ok: true } | { ok: false; reason: string };

/** POST vers Formspree (D3). Toute erreur réseau/HTTP/fetch indisponible retombe sur `{ ok: false }`. */
export async function submitContactForm(payload: ContactPayload): Promise<SubmitResult> {
  if (typeof fetch !== "function") {
    return { ok: false, reason: "fetch indisponible" };
  }

  try {
    // `_subject`/`_replyto` : champs spéciaux reconnus par Formspree (sujet du mail,
    // en-tête Reply-To pointé vers le prospect) — un mail directement exploitable,
    // plutôt qu'un JSON brut avec un sujet générique côté Formspree.
    const body = {
      ...payload,
      _subject: `Contact portfolio — ${payload.projectType}`,
      _replyto: payload.email,
    };
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return { ok: false, reason: `réponse ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "réseau indisponible" };
  }
}

/** Fonction pure : construit le lien `mailto:` de repli, sujet/corps pré-remplis (edge case §4). */
export function buildMailtoFallback(payload: ContactPayload): string {
  const subject = `Contact portfolio — ${payload.projectType}`;
  const body = [
    `Type de projet : ${payload.projectType}`,
    `Budget : ${payload.budget}`,
    `Délai : ${payload.timing}`,
    "",
    payload.message,
    "",
    `— ${payload.name} (${payload.email})`,
  ].join("\n");

  // `URLSearchParams` encode les espaces en `+` (forme `application/x-www-form-urlencoded`),
  // invalide pour un `mailto:` (RFC 6068) : `encodeURIComponent` encode bien en `%20`.
  return `mailto:${directContact.emailPrimary}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
