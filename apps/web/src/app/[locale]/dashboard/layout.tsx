import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { AppTopBar } from "@/components/organisms/AppTopBar";
import { SidebarNav } from "@/components/organisms/SidebarNav";
import { logoutAction } from "@/app/[locale]/(auth)/actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Authoritative check — proxy.ts's redirect is UX-only (same decode-only
  // trust level as this), but relying on proxy alone is explicitly against
  // Next's own guidance; every real data fetch is still gated server-side
  // by the NestJS JwtAuthGuard/RolesGuard regardless of what renders here.
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    return null;
  }

  return (
    <DashboardShell>
      <div className="flex min-h-full flex-1">
        <SidebarNav role={user.role} />
        <div className="flex flex-1 flex-col">
          <AppTopBar userEmail={user.email} role={user.role} logoutAction={logoutAction} />
          <main id="main-content" className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}
