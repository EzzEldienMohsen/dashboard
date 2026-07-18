"use client";

import dynamic from "next/dynamic";

/** See DoughnutChart/LazyDoughnutChart.tsx for why this wrapper exists. */
export const LazyBarChart = dynamic(
  () => import("./BarChart").then((m) => m.BarChart),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 w-full rounded-2xl" />,
  },
);
