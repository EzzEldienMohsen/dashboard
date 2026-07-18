"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The one client boundary for the whole dashboard — mounted only in
 * src/app/dashboard/layout.tsx, so React Query never reaches the
 * marketing/auth bundles. One QueryClient per browser tab, never shared
 * across sessions.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
