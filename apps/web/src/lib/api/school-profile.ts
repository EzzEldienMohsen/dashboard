import { cache } from "react";
import type { SchoolProfile } from "./types";
import { apiFetch } from "./fetcher";

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: "",
  name: "Campus Dashboard",
  mission: "",
  foundedYear: 0,
  address: "",
  contactEmail: "",
  contactPhone: null,
  updatedAt: new Date().toISOString(),
};

export const getSchoolProfile = cache(async (): Promise<SchoolProfile> => {
  return (await apiFetch<SchoolProfile>("/school-profile")) ?? DEFAULT_SCHOOL_PROFILE;
});
