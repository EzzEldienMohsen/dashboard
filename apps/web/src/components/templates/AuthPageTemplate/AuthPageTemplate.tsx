import type { ReactNode } from "react";
import { Title } from "@/components/atoms/Title";
import { Subtitle } from "@/components/atoms/Subtitle";

export interface AuthPageTemplateProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerSlot?: ReactNode;
}

/**
 * Fully server-renderable shell — no 'use client'. Interactivity lives only
 * inside the organism passed as `children`.
 */
export function AuthPageTemplate({
  title,
  subtitle,
  children,
  footerSlot,
}: AuthPageTemplateProps) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-base-200 px-[4%] py-12">
      <div className="w-full" style={{ maxWidth: "min(92%, 28rem)" }}>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-[6%] shadow-sm">
          <div className="mb-8 flex flex-col gap-2 text-center">
            <Title as="h1">{title}</Title>
            <Subtitle as="p">{subtitle}</Subtitle>
          </div>
          {children}
          {footerSlot ? (
            <div className="mt-6 text-center text-small text-base-content/70">
              {footerSlot}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
