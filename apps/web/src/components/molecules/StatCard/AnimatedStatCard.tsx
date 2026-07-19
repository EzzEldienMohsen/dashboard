"use client";

import { AnimatedCounter } from "@/components/atoms/AnimatedCounter";

interface AnimatedStatCardProps {
  count: number;
  label: string;
}

export function AnimatedStatCard({ count, label }: AnimatedStatCardProps) {
  return (
    <div className="stat bg-base-100 border border-base-300 rounded-2xl text-center px-6 py-8">
      <div className="stat-value text-primary text-5xl font-extrabold tabular-nums">
        <AnimatedCounter value={count} />
      </div>
      <div className="stat-title text-base-content/60 mt-2 text-sm font-medium uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
