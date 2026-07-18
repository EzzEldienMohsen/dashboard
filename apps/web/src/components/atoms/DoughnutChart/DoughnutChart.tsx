"use client";

import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useCssColors } from "@/lib/theme/use-css-colors";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface DoughnutChartProps {
  labels: string[];
  values: number[];
  /** daisyUI CSS custom property names, e.g. "--color-success". */
  colorVars: string[];
}

/**
 * Generic wrapper — no domain knowledge of what the slices represent.
 * Legend + tooltip are Chart.js defaults (hover layer ships by default).
 */
export function DoughnutChart({ labels, values, colorVars }: DoughnutChartProps) {
  const colors = useCssColors(colorVars);

  const data = useMemo(
    () => ({
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 2 }],
    }),
    [labels, values, colors],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "bottom" as const },
      },
    }),
    [],
  );

  return <Doughnut data={data} options={options} />;
}
