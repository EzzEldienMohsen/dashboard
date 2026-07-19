import type {
  AttendancePoint,
  GradePoint,
} from '../utils/monthly-performance.util';

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

export type ClassSnapshot = AnalyticsSnapshot & {
  classId: string;
  className: string;
};

export type MonthlyRecords = {
  grades: GradePoint[];
  attendance: AttendancePoint[];
};

export interface IAnalyticsRepository {
  /** A classId isn't inherently known to belong to the caller's school. */
  classBelongsToSchool(classId: string, schoolId: string): Promise<boolean>;
  /** A studentId isn't inherently known to belong to the caller's school. */
  studentBelongsToSchool(studentId: string, schoolId: string): Promise<boolean>;
  getSnapshotForClass(classId: string): Promise<AnalyticsSnapshot>;
  getSnapshotForSchool(schoolId: string): Promise<AnalyticsSnapshot>;
  getSnapshotForStudent(studentId: string): Promise<AnalyticsSnapshot>;
  /** One row per class in the school, in a single query pass (no N+1). */
  getClassSnapshotsForSchool(schoolId: string): Promise<ClassSnapshot[]>;
  getMonthlyRecordsForSchool(
    schoolId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords>;
  getMonthlyRecordsForClass(
    classId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords>;
  getMonthlyRecordsForStudent(
    studentId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords>;
}
