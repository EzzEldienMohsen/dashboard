import { cache } from "react";
import type { Creator } from "./types";
import { apiFetch } from "./fetcher";

const DEFAULT_CREATOR: Creator = {
  id: "",
  name: "",
  role: "",
  bio: "",
  skills: [],
  email: null,
  githubUrl: null,
  linkedinUrl: null,
  portfolioUrl: null,
  updatedAt: new Date().toISOString(),
};

export const getCreator = cache(async (): Promise<Creator> => {
  return (await apiFetch<Creator>("/creator")) ?? DEFAULT_CREATOR;
});
