export const ANALYTICS_REPOSITORY = Symbol('ANALYTICS_REPOSITORY');

// `type`, not `interface` — DTOs' fromEntity(entity: Record<string,
// unknown>) requires an index-signature-compatible shape, which plain
// `interface` declarations don't structurally satisfy in strict mode.
export type AttendanceBreakdown = {
  present: number;
  absent: number;
  late: number;
  excused: number;
};

export type SubjectAverage = {
  subject: string;
  averagePercentage: number;
};

export type AnalyticsSnapshot = {
  attendanceRatePercentage: number;
  attendanceBreakdown: AttendanceBreakdown;
  averageGradePercentage: number;
  gradesBySubject: SubjectAverage[];
};

export interface IAnalyticsRepository {
  /** A classId isn't inherently known to belong to the caller's school. */
  classBelongsToSchool(classId: string, schoolId: string): Promise<boolean>;
  getSnapshotForClass(classId: string): Promise<AnalyticsSnapshot>;
  getSnapshotForSchool(schoolId: string): Promise<AnalyticsSnapshot>;
}
