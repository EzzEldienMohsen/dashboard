import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSchoolProfile } from "@/lib/api";
import { FOOTER_LINKS } from "@/lib/config/nav-links";

export async function SiteFooter() {
  const { name: schoolName, contactEmail } = await getSchoolProfile();
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300 bg-base-100 mt-auto">
      <div className="mx-auto w-[90%] max-w-7xl py-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-xs">
          <span className="font-bold text-base-content">{schoolName}</span>
          <a
            href={`mailto:${contactEmail}`}
            className="text-sm text-base-content/60 hover:text-primary transition-colors"
          >
            {contactEmail}
          </a>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-base-content/60 hover:text-base-content transition-colors"
                >
                  {t(link.labelKey as Parameters<typeof t>[0])}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-300 py-4">
        <p className="text-center text-xs text-base-content/40">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
