"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SiteHeaderScrollWrapperProps {
  children: ReactNode;
}

export function SiteHeaderScrollWrapper({ children }: SiteHeaderScrollWrapperProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-base-100/80 border-b border-base-300 shadow-sm"
          : "bg-base-100",
      )}
    >
      {children}
    </header>
  );
}
