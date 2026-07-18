"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getClasses } from "@/lib/data";
import type { ClassDto, PaginatedResult } from "@/lib/data";

export async function fetchClassesAction(
  page: number,
): Promise<PaginatedResult<ClassDto> | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getClasses(user.accessToken, page);
}
