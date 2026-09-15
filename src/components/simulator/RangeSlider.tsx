import { cn } from "../../lib/cn";

export interface RangeSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
  className?: string;
}

const formatter = new Intl.NumberFormat("fr-FR");

export function RangeSlider({ id, label, value, min, max, step, suffix = "", onChange, className }: RangeSliderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-xs text-text-muted">
        <span>{label}</span>
        <span className="font-medium text-text-primary">
          {formatter.format(value)}
          {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-glass accent-neon-blue"
      />
    </div>
  );
}
