import { cache } from "react";
import type { SchoolProfile } from "./types";
import { apiFetch } from "./fetcher";

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: "",
  name: "School Dashboard",
  mission: "Empowering schools with modern tools.",
  foundedYear: 2020,
  address: "N/A",
  contactEmail: "info@example.com",
  contactPhone: null,
  updatedAt: new Date().toISOString(),
};

export const getSchoolProfile = cache(async (): Promise<SchoolProfile> => {
  return (await apiFetch<SchoolProfile>("/school-profile")) ?? DEFAULT_SCHOOL_PROFILE;
});
