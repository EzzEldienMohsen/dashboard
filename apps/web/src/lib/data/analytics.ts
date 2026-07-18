import "server-only";
import { authenticatedFetchClient } from "@/lib/api/authenticated-fetcher";
import type { AnalyticsSnapshotDto } from "./types";

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
