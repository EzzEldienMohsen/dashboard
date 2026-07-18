import { SiteHeader } from "@/components/organisms/SiteHeader";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { getSchoolProfile } from "@/lib/api";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { name: schoolName } = await getSchoolProfile();

  return (
    <>
      <SiteHeader schoolName={schoolName} />
      <main className="flex flex-col flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
