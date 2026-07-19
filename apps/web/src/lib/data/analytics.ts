import "server-only";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type {
  AnalyticsSnapshotDto,
  ClassSummaryDto,
  MonthlyAnalyticsDto,
  StudentAnalyticsSnapshotDto,
} from "./types";

export function getSchoolAnalytics(token: string, schoolId: string) {
  return authenticatedFetchClient.get<AnalyticsSnapshotDto>(
    `/schools/${schoolId}/analytics`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}

export function getClassAnalytics(token: string, classId: string) {
  return authenticatedFetchClient.get<AnalyticsSnapshotDto>(
    `/classes/${classId}/analytics`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}

export function getStudentAnalytics(
  token: string,
  studentId: string,
  locale: string,
) {
  return authenticatedFetchClient.get<StudentAnalyticsSnapshotDto>(
    `/students/${studentId}/analytics`,
    token,
    { revalidate: 30, tags: ["analytics"], locale },
  );
}

export function getSchoolMonthlyAnalytics(
  token: string,
  schoolId: string,
  months = 6,
) {
  return authenticatedFetchClient.get<MonthlyAnalyticsDto[]>(
    `/schools/${schoolId}/analytics/monthly?months=${months}`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}

export function getClassMonthlyAnalytics(
  token: string,
  classId: string,
  months = 6,
) {
  return authenticatedFetchClient.get<MonthlyAnalyticsDto[]>(
    `/classes/${classId}/analytics/monthly?months=${months}`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}

export function getStudentMonthlyAnalytics(
  token: string,
  studentId: string,
  months = 6,
) {
  return authenticatedFetchClient.get<MonthlyAnalyticsDto[]>(
    `/students/${studentId}/analytics/monthly?months=${months}`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}

export function getClassesSummary(token: string, schoolId: string) {
  return authenticatedFetchClient.get<ClassSummaryDto[]>(
    `/schools/${schoolId}/classes/analytics-summary`,
    token,
    { revalidate: 30, tags: ["analytics"] },
  );
}
