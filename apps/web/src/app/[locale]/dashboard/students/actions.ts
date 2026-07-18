"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getStudents } from "@/lib/data";
import type { PaginatedResult, StudentDto } from "@/lib/data";

export async function fetchStudentsAction(
  page: number,
  classId?: string,
): Promise<PaginatedResult<StudentDto> | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getStudents(user.accessToken, page, 20, classId);
}
