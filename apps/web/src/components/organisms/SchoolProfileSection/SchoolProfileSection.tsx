import { getTranslations } from "next-intl/server";
import type { SchoolProfile } from "@/lib/api/types";

interface SchoolProfileSectionProps {
  profile: SchoolProfile;
}

export async function SchoolProfileSection({ profile }: SchoolProfileSectionProps) {
  const t = await getTranslations("about.profile");

  return (
    <section className="py-16">
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col gap-8">
          {/* Mission */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
              {t("mission")}
            </h2>
            <p className="text-base-content text-lg leading-relaxed">{profile.mission}</p>
          </div>

          <hr className="border-base-300" />

          {/* Details grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                {t("founded")}
              </dt>
              <dd className="text-base-content font-medium">{profile.foundedYear}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                {t("address")}
              </dt>
              <dd className="text-base-content">{profile.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                {t("email")}
              </dt>
              <dd>
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="link link-primary"
                >
                  {profile.contactEmail}
                </a>
              </dd>
            </div>
            {profile.contactPhone ? (
              <div>
                <dt className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                  {t("phone")}
                </dt>
                <dd>
                  <a href={`tel:${profile.contactPhone}`} className="link link-primary">
                    {profile.contactPhone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}
