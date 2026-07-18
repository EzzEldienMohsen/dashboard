"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useCssColors } from "@/lib/theme/use-css-colors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export interface BarChartProps {
  labels: string[];
  values: number[];
  /** Single daisyUI CSS custom property name — one series, one hue. */
  colorVar: string;
  maxValue?: number;
}

/**
 * Generic wrapper — single-series magnitude-by-category. No legend (a
 * single series needs none — the title/label names it, per the dataviz
 * skill's accessibility rule).
 */
export function BarChart({ labels, values, colorVar, maxValue }: BarChartProps) {
  const [color] = useCssColors([colorVar]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [{ data: values, backgroundColor: color, borderRadius: 4 }],
    }),
    [labels, values, color],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: maxValue } },
    }),
    [maxValue],
  );

  return <Bar data={data} options={options} />;
}
