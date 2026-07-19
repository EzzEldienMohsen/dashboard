"use client";

import { StaggerContainer, StaggerItem } from "@/components/atoms/Stagger";
import { AnimatedStatCard } from "@/components/molecules/StatCard";

interface StatItem {
  count: number;
  label: string;
}

interface StatsSectionMotionProps {
  items: StatItem[];
}

export function StatsSectionMotion({ items }: StatsSectionMotionProps) {
  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {items.map((item) => (
        <StaggerItem key={item.label}>
          <AnimatedStatCard count={item.count} label={item.label} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
