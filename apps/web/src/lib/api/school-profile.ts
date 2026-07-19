import { cache } from "react";
import type { SchoolProfile } from "./types";
import { apiFetch } from "./fetcher";
import { isArabicLocale, pickArabic } from "./localize-content";

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: "",
  name: "Campus Dashboard",
  nameAr: null,
  mission: "",
  missionAr: null,
  foundedYear: 0,
  address: "",
  contactEmail: "",
  contactPhone: null,
  updatedAt: new Date().toISOString(),
};

export const getSchoolProfile = cache(async (): Promise<SchoolProfile> => {
  const profile =
    (await apiFetch<SchoolProfile>("/school-profile")) ?? DEFAULT_SCHOOL_PROFILE;

  if (await isArabicLocale()) {
    return {
      ...profile,
      name: pickArabic(profile.name, profile.nameAr),
      mission: pickArabic(profile.mission, profile.missionAr),
    };
  }

  return profile;
});
