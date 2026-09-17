import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Tag } from "../ui/Tag";
import { NeonButton } from "../ui/NeonButton";
import { cn } from "../../lib/cn";
import {
  budgets,
  confirmationDelayNote,
  gdprConsentLabel,
  projectTypes,
  simulatorProjectType,
  siteQuoteNote,
  siteQuoteTiers,
  timings,
  type Budget,
  type ProjectType,
  type Timing,
} from "../../content/contact";
import { readSimulator } from "../../lib/contact/readSimulator";
import { buildMailtoFallback, submitContactForm, type ContactPayload } from "../../lib/contact/submit";
import { Stepper } from "./Stepper";

type Step = 1 | 2 | 3;
type Status = "idle" | "sending" | "sent" | "error";
type TouchedField = "name" | "email" | "message" | "consent";

const STEP_LABELS: [string, string, string] = ["Type de projet", "Budget & délai", "Coordonnées"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN_LENGTH = 20;
const SITE_PROJECT_TYPE: ProjectType = "Créer un site (vitrine ou comme celui-ci)";

function SiteQuoteTiers() {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-border-glass bg-bg-panel px-4 py-3 text-sm text-text-muted">
      {siteQuoteTiers.map((tier) => (
        <p key={tier.label} className="flex items-center justify-between gap-4">
          <span>{tier.label}</span>
          <span className="text-text-primary">{tier.price}</span>
        </p>
      ))}
      <p className="text-xs">{siteQuoteNote}</p>
    </div>
  );
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-card border bg-bg-panel px-4 py-2 text-sm text-text-primary placeholder:text-text-muted",
    invalid ? "border-neon-violet" : "border-border-glass focus-visible:border-neon-blue",
  );

export function ContactForm() {
  const [step, setStep] = useState<Step>(1);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState<Partial<Record<TouchedField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [source, setSource] = useState<"simulator" | "direct">("direct");
  const [simulatorSelection, setSimulatorSelection] = useState<string[] | undefined>(undefined);
  const [showSimulatorBanner, setShowSimulatorBanner] = useState(false);

  // Lu au montage (cas d'un rechargement avec la clé déjà posée, §7.2 de la spec 07) puis
  // re-synchronisé sur `simulator:updated` : le Simulateur (Phase 2) écrit la clé et scrolle
  // vers Contact sans recharger la page, donc sans re-déclencher ce montage.
  useEffect(() => {
    function syncFromSimulator() {
      const result = readSimulator();
      if (result.source === "simulator") {
        setSource("simulator");
        setSimulatorSelection(result.simulatorSelection);
        setProjectType(simulatorProjectType);
        setShowSimulatorBanner(true);
      }
    }

    syncFromSimulator();
    window.addEventListener("simulator:updated", syncFromSimulator);
    return () => window.removeEventListener("simulator:updated", syncFromSimulator);
  }, []);

  function markTouched(field: TouchedField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function selectProjectType(value: ProjectType) {
    setProjectType(value);
    setStep(2);
  }

  function selectBudget(value: Budget) {
    setBudget(value);
    if (timing) setStep(3);
  }

  function selectTiming(value: Timing) {
    setTiming(value);
    if (budget) setStep(3);
  }

  const nameValid = name.trim().length > 0;
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const messageValid = message.trim().length >= MESSAGE_MIN_LENGTH;
  const canSubmit = nameValid && emailValid && messageValid && consent && status !== "sending";

  function buildPayload(): ContactPayload | null {
    if (!projectType || !budget || !timing) return null;
    return {
      projectType,
      budget,
      timing,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      source,
      simulatorSelection,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true, consent: true });

    const payload = buildPayload();
    if (!payload || !canSubmit) return;

    // Honeypot rempli → spam probable : on affiche un succès sans jamais appeler l'API,
    // pour ne pas révéler au bot que sa soumission a été filtrée.
    if (honeypot.trim() !== "") {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setErrorReason(null);
    const result = await submitContactForm(payload);
    if (result.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setErrorReason(result.reason);
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 size={32} className="text-neon-emerald" aria-hidden="true" />
        <p className="font-display text-lg text-text-primary">Message envoyé</p>
        <p className="max-w-sm text-sm text-text-muted">
          {projectType ? `${projectType} · ${budget} · ${timing}. ` : null}
          {confirmationDelayNote}
        </p>
      </div>
    );
  }

  const payloadForRetry = buildPayload();

  return (
    <div className="flex flex-col gap-6">
      <Stepper step={step} labels={STEP_LABELS}>
        {step === 1 ? (
          <div className="flex flex-col gap-4">
            {showSimulatorBanner ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-neon-blue/40 bg-neon-blue/10 px-4 py-3 text-sm text-text-primary">
                <span>
                  Depuis le simulateur :{" "}
                  {simulatorSelection && simulatorSelection.length > 0
                    ? simulatorSelection.map(capitalize).join(", ")
                    : "sélection vide"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSimulatorBanner(false)}
                  className="text-xs text-text-muted underline underline-offset-4 hover:text-text-primary"
                >
                  Masquer
                </button>
              </div>
            ) : null}
            <p className="text-sm text-text-muted">Quel type de projet ?</p>
            <div role="group" aria-label="Type de projet" className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <Tag key={type} active={projectType === type} onClick={() => selectProjectType(type)}>
                  {type}
                </Tag>
              ))}
            </div>
            {projectType === SITE_PROJECT_TYPE ? <SiteQuoteTiers /> : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-6">
            {projectType === SITE_PROJECT_TYPE ? <SiteQuoteTiers /> : null}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text-muted">Budget estimé</p>
              <div role="group" aria-label="Budget" className="flex flex-wrap gap-2">
                {budgets.map((value) => (
                  <Tag key={value} active={budget === value} onClick={() => selectBudget(value)}>
                    {value}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text-muted">Délai souhaité</p>
              <div role="group" aria-label="Délai" className="flex flex-wrap gap-2">
                {timings.map((value) => (
                  <Tag key={value} active={timing === value} onClick={() => selectTiming(value)}>
                    {value}
                  </Tag>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="self-start text-xs text-text-muted underline underline-offset-4 hover:text-text-primary"
            >
              ← Précédent
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Honeypot anti-spam : masqué visuellement (clip, pas `-9999px` qui créerait un
                débordement horizontal dans le conteneur transformé du Stepper), jamais atteignable
                au clavier ni à l'assistance technique par un humain. */}
            <div
              className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)]"
              aria-hidden="true"
            >
              <label htmlFor="contact-company">Ne pas remplir ce champ</label>
              <input
                id="contact-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="contact-name" className="text-sm text-text-muted">
                Nom
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => markTouched("name")}
                aria-invalid={touched.name && !nameValid}
                aria-describedby={touched.name && !nameValid ? "contact-name-error" : undefined}
                className={inputClass(Boolean(touched.name) && !nameValid)}
              />
              {touched.name && !nameValid ? (
                <p id="contact-name-error" className="text-xs text-neon-violet">
                  Le nom est requis.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="contact-email" className="text-sm text-text-muted">
                E-mail
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => markTouched("email")}
                aria-invalid={touched.email && !emailValid}
                aria-describedby={touched.email && !emailValid ? "contact-email-error" : undefined}
                className={inputClass(Boolean(touched.email) && !emailValid)}
              />
              {touched.email && !emailValid ? (
                <p id="contact-email-error" className="text-xs text-neon-violet">
                  Une adresse e-mail valide est requise.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="contact-message" className="text-sm text-text-muted">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onBlur={() => markTouched("message")}
                aria-invalid={touched.message && !messageValid}
                aria-describedby={touched.message && !messageValid ? "contact-message-error" : undefined}
                className={inputClass(Boolean(touched.message) && !messageValid)}
              />
              {touched.message && !messageValid ? (
                <p id="contact-message-error" className="text-xs text-neon-violet">
                  20 caractères minimum ({message.trim().length}/{MESSAGE_MIN_LENGTH}).
                </p>
              ) : null}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="contact-consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                onBlur={() => markTouched("consent")}
                aria-invalid={touched.consent && !consent}
                aria-describedby={touched.consent && !consent ? "contact-consent-error" : undefined}
                className="mt-1 h-4 w-4 shrink-0 accent-neon-blue"
              />
              <label htmlFor="contact-consent" className="text-sm text-text-muted">
                {gdprConsentLabel}
              </label>
            </div>
            {touched.consent && !consent ? (
              <p id="contact-consent-error" className="-mt-2 text-xs text-neon-violet">
                Cette case est requise pour envoyer le formulaire.
              </p>
            ) : null}

            {status === "error" ? (
              <div
                role="alert"
                className="flex flex-col gap-2 rounded-card border border-neon-violet/50 bg-neon-violet/10 px-4 py-3 text-sm text-text-primary"
              >
                <p className="flex items-center gap-2">
                  <TriangleAlert size={16} className="shrink-0 text-neon-violet" aria-hidden="true" />
                  L'envoi a échoué{errorReason ? ` (${errorReason})` : ""}. Vos informations sont conservées.
                </p>
                {payloadForRetry ? (
                  <a
                    href={buildMailtoFallback(payloadForRetry)}
                    className="self-start text-xs text-neon-blue underline underline-offset-4"
                  >
                    Écrire un e-mail à la place
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-text-muted underline underline-offset-4 hover:text-text-primary"
              >
                ← Précédent
              </button>
              <NeonButton type="submit" disabled={!canSubmit} className="gap-2">
                {status === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                {status === "error" ? "Réessayer" : status === "sending" ? "Envoi…" : "Envoyer"}
              </NeonButton>
            </div>
          </form>
        ) : null}
      </Stepper>
    </div>
  );
}
