"use client";

import { StaggerContainer, StaggerItem } from "@/components/atoms/Stagger";
import { HoverTiltCard } from "@/components/atoms/HoverTiltCard";
import type { SchoolProfile } from "@/lib/api/types";

interface SchoolProfileSectionMotionProps {
  profile: SchoolProfile;
  labels: {
    mission: string;
    founded: string;
    address: string;
    email: string;
    phone: string;
  };
}

export function SchoolProfileSectionMotion({ profile, labels }: SchoolProfileSectionMotionProps) {
  return (
    <StaggerContainer className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
      <div className="p-8 md:p-12 flex flex-col gap-8">
        {profile.mission ? (
          <StaggerItem className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
              {labels.mission}
            </h2>
            <p className="text-base-content text-lg leading-relaxed">{profile.mission}</p>
          </StaggerItem>
        ) : null}

        <hr className="border-base-300" />

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profile.foundedYear ? (
            <StaggerItem>
              <HoverTiltCard>
                <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {labels.founded}
                </dt>
                <dd className="text-base-content font-medium">{profile.foundedYear}</dd>
              </HoverTiltCard>
            </StaggerItem>
          ) : null}
          {profile.address ? (
            <StaggerItem>
              <HoverTiltCard>
                <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {labels.address}
                </dt>
                <dd className="text-base-content">{profile.address}</dd>
              </HoverTiltCard>
            </StaggerItem>
          ) : null}
          {profile.contactEmail ? (
            <StaggerItem>
              <HoverTiltCard>
                <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {labels.email}
                </dt>
                <dd>
                  <a href={`mailto:${profile.contactEmail}`} className="link link-primary">
                    {profile.contactEmail}
                  </a>
                </dd>
              </HoverTiltCard>
            </StaggerItem>
          ) : null}
          {profile.contactPhone ? (
            <StaggerItem>
              <HoverTiltCard>
                <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {labels.phone}
                </dt>
                <dd>
                  <a href={`tel:${profile.contactPhone}`} className="link link-primary">
                    {profile.contactPhone}
                  </a>
                </dd>
              </HoverTiltCard>
            </StaggerItem>
          ) : null}
        </dl>
      </div>
    </StaggerContainer>
  );
}
