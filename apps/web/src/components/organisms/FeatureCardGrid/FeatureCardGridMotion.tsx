"use client";

import { StaggerContainer, StaggerItem } from "@/components/atoms/Stagger";
import { HoverTiltCard } from "@/components/atoms/HoverTiltCard";

interface FeatureItem {
  title: string;
  desc: string;
  icon: string;
}

interface FeatureCardGridMotionProps {
  items: FeatureItem[];
  gridClass: string;
}

export function FeatureCardGridMotion({ items, gridClass }: FeatureCardGridMotionProps) {
  return (
    <StaggerContainer className={`grid gap-6 ${gridClass}`}>
      {items.map((item) => (
        <StaggerItem key={item.title}>
          <HoverTiltCard className="h-full rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col gap-3">
            <span className="text-3xl" aria-hidden="true">
              {item.icon}
            </span>
            <h3 className="font-semibold text-base-content">{item.title}</h3>
            <p className="text-sm text-base-content/60 leading-relaxed">{item.desc}</p>
          </HoverTiltCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
