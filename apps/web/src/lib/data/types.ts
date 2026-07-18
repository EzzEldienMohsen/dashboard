export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SchoolDto {
  id: string;
  name: string;
  address: string | null;
}

export interface ClassDto {
  id: string;
  name: string;
  schoolId: string;
}

export interface StudentDto {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
}

export interface AttendanceBreakdownDto {
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface SubjectAverageDto {
  subject: string;
  averagePercentage: number;
}

export interface AnalyticsSnapshotDto {
  attendanceRatePercentage: number;
  attendanceBreakdown: AttendanceBreakdownDto;
  averageGradePercentage: number;
  gradesBySubject: SubjectAverageDto[];
}
