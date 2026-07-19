import type { CSSProperties } from "react";

export interface RadialProgressProps {
  /** 0-100. Values outside that range are clamped. */
  value: number;
  /** Text shown in the center of the ring — defaults to `${value}%`. */
  label?: string;
  /** daisyUI text-color utility class driving the ring's color, e.g. "text-success". */
  colorClassName?: string;
}

/**
 * daisyUI's CSS-only `radial-progress` component — no canvas, no client JS,
 * renders on the server. Deliberately not a Chart.js atom (unlike
 * BarChart/DoughnutChart/LineChart): a single-value gauge doesn't need a
 * canvas library, and skipping one keeps this the cheapest chart on the page.
 */
export function RadialProgress({
  value,
  label,
  colorClassName = "text-primary",
}: RadialProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`radial-progress ${colorClassName}`}
      style={
        { "--value": clamped, "--size": "8rem", "--thickness": "0.75rem" } as CSSProperties
      }
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {label ?? `${clamped}%`}
    </div>
  );
}
