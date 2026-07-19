"use server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  getStudents,
  getStudentAnalytics,
  getStudentMonthlyAnalytics,
} from "@/lib/data";
import type {
  MonthlyAnalyticsDto,
  PaginatedResult,
  StudentAnalyticsSnapshotDto,
  StudentDto,
} from "@/lib/data";

export async function fetchStudentsAction(
  page: number,
  classId?: string,
): Promise<PaginatedResult<StudentDto> | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getStudents(user.accessToken, page, 20, classId);
}

export async function fetchStudentAnalyticsAction(
  studentId: string,
  locale: string,
): Promise<StudentAnalyticsSnapshotDto | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getStudentAnalytics(user.accessToken, studentId, locale);
}

export async function fetchStudentMonthlyAnalyticsAction(
  studentId: string,
): Promise<MonthlyAnalyticsDto[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getStudentMonthlyAnalytics(user.accessToken, studentId);
}
