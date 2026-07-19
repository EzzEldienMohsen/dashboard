"use client";

import { motion } from "framer-motion";
import { FadeInSection } from "@/components/atoms/FadeInSection";
import { StaggerContainer, StaggerItem } from "@/components/atoms/Stagger";
import type { Creator } from "@/lib/api/types";

interface CreatorSectionMotionProps {
  creator: Creator;
  labels: {
    heading: string;
    skillsHeading: string;
    github: string;
    linkedin: string;
    portfolio: string;
    email: string;
  };
}

export function CreatorSectionMotion({ creator, labels }: CreatorSectionMotionProps) {
  const links = [
    creator.githubUrl ? { href: creator.githubUrl, label: labels.github } : null,
    creator.linkedinUrl ? { href: creator.linkedinUrl, label: labels.linkedin } : null,
    creator.portfolioUrl ? { href: creator.portfolioUrl, label: labels.portfolio } : null,
    creator.email ? { href: `mailto:${creator.email}`, label: labels.email } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  return (
    <FadeInSection>
      <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-8 md:p-12">
        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-6">
          {labels.heading}
        </p>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-bold text-base-content">{creator.name}</h3>
            <p className="text-primary font-medium mt-1">{creator.role}</p>
          </div>

          {creator.bio ? (
            <p className="text-base-content/70 leading-relaxed max-w-2xl">{creator.bio}</p>
          ) : null}

          {creator.skills.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-3">
                {labels.skillsHeading}
              </h4>
              <StaggerContainer className="flex flex-wrap gap-2">
                {creator.skills.map((skill) => (
                  <StaggerItem key={skill}>
                    <motion.span
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="badge badge-outline badge-lg"
                    >
                      {skill}
                    </motion.span>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          ) : null}

          {links.length > 0 ? (
            <div className="flex flex-wrap gap-4 mt-2">
              {links.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  whileHover={{ y: -2 }}
                  className="link link-primary font-medium"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </FadeInSection>
  );
}
