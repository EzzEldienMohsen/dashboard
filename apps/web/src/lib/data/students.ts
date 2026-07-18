import "server-only";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { PaginatedResult, StudentDto } from "./types";

export function getStudents(
  token: string,
  page: number,
  limit = 20,
  classId?: string,
) {
  const classFilter = classId ? `&classId=${classId}` : "";
  return authenticatedFetchClient.get<PaginatedResult<StudentDto>>(
    `/students?page=${page}&limit=${limit}${classFilter}`,
    token,
    { revalidate: 30, tags: ["students"] },
  );
}
