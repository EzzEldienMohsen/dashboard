"use client";

import dynamic from "next/dynamic";

/** See DoughnutChart/LazyDoughnutChart.tsx for why this wrapper exists. */
export const LazyLineChart = dynamic(
  () => import("./LineChart").then((m) => m.LineChart),
  {
    ssr: false,
    loading: () => <div className="skeleton h-64 w-full rounded-2xl" />,
  },
);
