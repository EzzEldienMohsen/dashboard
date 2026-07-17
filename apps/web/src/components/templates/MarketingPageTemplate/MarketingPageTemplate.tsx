import type { ReactNode } from "react";

interface MarketingPageTemplateProps {
  hero: ReactNode;
  children: ReactNode;
}

export function MarketingPageTemplate({ hero, children }: MarketingPageTemplateProps) {
  return (
    <div className="w-[90%] max-w-7xl mx-auto py-12">
      {/* Above fold — eager */}
      {hero}
      {/* Below fold — lazy (wrapped in Suspense by caller) */}
      {children}
    </div>
  );
}
