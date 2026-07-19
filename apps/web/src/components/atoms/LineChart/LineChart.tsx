"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useCssColors } from "@/lib/theme/use-css-colors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

export interface LineChartDataset {
  label: string;
  values: number[];
  /** daisyUI CSS custom property name, e.g. "--color-primary". */
  colorVar: string;
}

export interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
}

/**
 * Generic multi-series trend wrapper — used for month-over-month series
 * (e.g. grade % and attendance % over time). Legend is shown since more
 * than one series can be present, unlike the single-series BarChart.
 */
export function LineChart({ labels, datasets }: LineChartProps) {
  const colors = useCssColors(datasets.map((dataset) => dataset.colorVar));

  const data = useMemo(
    () => ({
      labels,
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.values,
        borderColor: colors[index],
        backgroundColor: colors[index],
        fill: false,
        tension: 0.3,
      })),
    }),
    [labels, datasets, colors],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { position: "bottom" as const } },
      scales: { y: { beginAtZero: true, max: 100 } },
    }),
    [],
  );

  return <Line data={data} options={options} />;
}
