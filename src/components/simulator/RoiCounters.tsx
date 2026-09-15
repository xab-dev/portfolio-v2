import { HOURLY_RATE, WEEKS_PER_YEAR } from "../../content/simulator";
import type { SimulatorOutputs } from "../../lib/simulator/compute";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { RangeSlider } from "./RangeSlider";

export interface RoiCountersProps {
  outputs: SimulatorOutputs;
  hourlyRate: number;
  onHourlyRateChange: (value: number) => void;
}

const oneDecimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const wholeNumber = new Intl.NumberFormat("fr-FR");

/** Les 3 compteurs de la spec 03 §2/§3 : h/sem, h/an, valeur indicative/an. */
export function RoiCounters({ outputs, hourlyRate, onHourlyRateChange }: RoiCountersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-text-muted">Temps gagné / semaine</span>
          <AnimatedCounter
            value={outputs.heuresGagneesSemaine}
            suffix="h"
            decimals={1}
            className="font-display text-2xl text-text-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-text-muted">Temps gagné / an</span>
          <AnimatedCounter value={outputs.heuresGagneesAn} suffix="h" className="font-display text-2xl text-text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-text-muted">Valeur indicative / an</span>
          <AnimatedCounter
            value={outputs.valeurIndicativeAn}
            suffix="€"
            className="font-display text-2xl text-neon-emerald"
          />
        </div>
      </div>

      <RangeSlider
        id="hourly-rate"
        label="Coût horaire interne (votre curseur, pas le tarif de Xav)"
        value={hourlyRate}
        min={HOURLY_RATE.min}
        max={HOURLY_RATE.max}
        step={HOURLY_RATE.step}
        suffix=" €/h"
        onChange={onHourlyRateChange}
      />

      <p className="text-xs text-text-muted">
        Formule : {oneDecimal.format(outputs.heuresGagneesSemaine)} h/sem × {WEEKS_PER_YEAR} sem ×{" "}
        {wholeNumber.format(hourlyRate)} €/h
        {outputs.tempsGagnePct > 0
          ? ` — soit ≈ ${oneDecimal.format(outputs.tempsGagnePct)} % de temps gagné en moyenne pondérée.`
          : "."}
      </p>
    </div>
  );
}
