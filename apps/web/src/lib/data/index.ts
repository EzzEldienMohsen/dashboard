export { getMySchool } from "./schools";
export { getClasses, getClassById } from "./classes";
export { getStudents, getStudentById } from "./students";
export {
  getSchoolAnalytics,
  getClassAnalytics,
  getStudentAnalytics,
  getSchoolMonthlyAnalytics,
  getClassMonthlyAnalytics,
  getStudentMonthlyAnalytics,
  getClassesSummary,
} from "./analytics";
export type {
  PaginatedResult,
  SchoolDto,
  ClassDto,
  StudentDto,
  AttendanceBreakdownDto,
  SubjectAverageDto,
  AnalyticsSnapshotDto,
  MonthlyAnalyticsDto,
  AdviceItemDto,
  StudentAnalyticsSnapshotDto,
  ClassSummaryDto,
} from "./types";
