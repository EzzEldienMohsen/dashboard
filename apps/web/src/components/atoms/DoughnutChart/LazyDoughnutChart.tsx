"use client";

import dynamic from "next/dynamic";

/**
 * `next/dynamic`'s `ssr: false` is only valid inside a Client Component —
 * this file's sole job is satisfying that constraint so Server Component
 * organisms can render a chart without ever attempting to SSR Chart.js
 * (which needs a real Canvas, unavailable during server render).
 */
export const LazyDoughnutChart = dynamic(
  () => import("./DoughnutChart").then((m) => m.DoughnutChart),
  {
    ssr: false,
    loading: () => <div className="skeleton mx-auto h-48 w-48 rounded-full" />,
  },
);
