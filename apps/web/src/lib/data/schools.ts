import "server-only";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { SchoolDto } from "./types";

export function getMySchool(token: string, schoolId: string) {
  return authenticatedFetchClient.get<SchoolDto>(`/schools/${schoolId}`, token, {
    revalidate: 30,
    tags: ["school"],
  });
}
