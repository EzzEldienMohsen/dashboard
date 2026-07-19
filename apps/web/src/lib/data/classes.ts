import "server-only";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { ClassDto, PaginatedResult } from "./types";

export function getClasses(token: string, page: number, limit = 20) {
  return authenticatedFetchClient.get<PaginatedResult<ClassDto>>(
    `/classes?page=${page}&limit=${limit}`,
    token,
    { revalidate: 30, tags: ["classes"] },
  );
}

export function getClassById(token: string, classId: string) {
  return authenticatedFetchClient.get<ClassDto>(`/classes/${classId}`, token, {
    revalidate: 30,
    tags: ["classes"],
  });
}
