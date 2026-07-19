import { cache } from "react";
import type { Creator } from "./types";
import { apiFetch } from "./fetcher";
import { isArabicLocale, pickArabic } from "./localize-content";

const DEFAULT_CREATOR: Creator = {
  id: "",
  name: "",
  nameAr: null,
  role: "",
  roleAr: null,
  bio: "",
  bioAr: null,
  skills: [],
  email: null,
  githubUrl: null,
  linkedinUrl: null,
  portfolioUrl: null,
  updatedAt: new Date().toISOString(),
};

export const getCreator = cache(async (): Promise<Creator> => {
  const creator = (await apiFetch<Creator>("/creator")) ?? DEFAULT_CREATOR;

  if (await isArabicLocale()) {
    return {
      ...creator,
      name: pickArabic(creator.name, creator.nameAr),
      role: pickArabic(creator.role, creator.roleAr),
      bio: pickArabic(creator.bio, creator.bioAr),
    };
  }

  return creator;
});
