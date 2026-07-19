import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AnalyticsSnapshot,
  AttendanceBreakdown,
  ClassSnapshot,
  IAnalyticsRepository,
  MonthlyRecords,
} from '../interfaces/analytics-repository.interface';

const EMPTY_BREAKDOWN: AttendanceBreakdown = {
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
};

/**
 * Safety ceiling for the raw-row queries below (class-summary batching,
 * monthly bucketing) — not expected to be hit at normal school scale
 * (seeded demo data is ~140 students), but without it an extremely large
 * school's `findMany` calls here have no upper bound at all.
 */
const MAX_ANALYTICS_ROWS = 50_000;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function averagePercentageOf(
  rows: { score: number; maxScore: number }[],
): number {
  if (rows.length === 0) return 0;
  return round1(
    (rows.reduce((sum, row) => sum + row.score / row.maxScore, 0) /
      rows.length) *
      100,
  );
}

/** Start-of-month cutoff aligning with `monthsWindow()` in monthly-performance.util. */
function monthsBackCutoff(monthsBack: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1),
  );
}

@Injectable()
export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async classBelongsToSchool(
    classId: string,
    schoolId: string,
  ): Promise<boolean> {
    const found = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
      select: { id: true },
    });
    return !!found;
  }

  async studentBelongsToSchool(
    studentId: string,
    schoolId: string,
  ): Promise<boolean> {
    const found = await this.prisma.student.findFirst({
      where: { id: studentId, class: { schoolId } },
      select: { id: true },
    });
    return !!found;
  }

  getSnapshotForClass(classId: string): Promise<AnalyticsSnapshot> {
    return this.buildSnapshot({ student: { classId } });
  }

  getSnapshotForSchool(schoolId: string): Promise<AnalyticsSnapshot> {
    return this.buildSnapshot({ student: { class: { schoolId } } });
  }

  getSnapshotForStudent(studentId: string): Promise<AnalyticsSnapshot> {
    return this.buildSnapshot({ student: { id: studentId } });
  }

  getMonthlyRecordsForSchool(
    schoolId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords> {
    return this.getMonthlyRecords(
      { student: { class: { schoolId } } },
      monthsBack,
    );
  }

  getMonthlyRecordsForClass(
    classId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords> {
    return this.getMonthlyRecords({ student: { classId } }, monthsBack);
  }

  getMonthlyRecordsForStudent(
    studentId: string,
    monthsBack: number,
  ): Promise<MonthlyRecords> {
    return this.getMonthlyRecords({ studentId }, monthsBack);
  }

  /**
   * Per-class breakdown for every class in a school, computed via two
   * findMany calls (one for attendance, one for grades) regardless of how
   * many classes the school has — avoids an N+1 of one analytics query per
   * class. AttendanceRecord/GradeRecord have no `classId` column of their
   * own (only `studentId`), so a DB-level `groupBy(['classId', ...])` isn't
   * possible here; bucketing by the student's `classId` happens in memory
   * instead, the same approach already used for monthly bucketing.
   */
  async getClassSnapshotsForSchool(schoolId: string): Promise<ClassSnapshot[]> {
    const [classes, attendanceRows, gradeRows] = await Promise.all([
      this.prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true },
      }),
      this.prisma.attendanceRecord.findMany({
        where: { student: { class: { schoolId } } },
        select: { status: true, student: { select: { classId: true } } },
        take: MAX_ANALYTICS_ROWS,
      }),
      this.prisma.gradeRecord.findMany({
        where: { student: { class: { schoolId } } },
        select: {
          subject: true,
          score: true,
          maxScore: true,
          student: { select: { classId: true } },
        },
        take: MAX_ANALYTICS_ROWS,
      }),
    ]);

    const attendanceByClass = new Map<
      string,
      (typeof attendanceRows)[number][]
    >();
    for (const row of attendanceRows) {
      const classId = row.student.classId;
      const bucket = attendanceByClass.get(classId);
      if (bucket) bucket.push(row);
      else attendanceByClass.set(classId, [row]);
    }

    const gradesByClass = new Map<string, (typeof gradeRows)[number][]>();
    for (const row of gradeRows) {
      const classId = row.student.classId;
      const bucket = gradesByClass.get(classId);
      if (bucket) bucket.push(row);
      else gradesByClass.set(classId, [row]);
    }

    return classes.map((klass) => {
      const breakdown: AttendanceBreakdown = { ...EMPTY_BREAKDOWN };
      for (const row of attendanceByClass.get(klass.id) ?? []) {
        breakdown[row.status.toLowerCase() as keyof AttendanceBreakdown] += 1;
      }
      const total =
        breakdown.present +
        breakdown.absent +
        breakdown.late +
        breakdown.excused;
      const attendanceRatePercentage =
        total > 0 ? round1((breakdown.present / total) * 100) : 0;

      const classGrades = gradesByClass.get(klass.id) ?? [];
      const bySubject = new Map<
        string,
        { score: number; maxScore: number }[]
      >();
      for (const row of classGrades) {
        const bucket = bySubject.get(row.subject);
        if (bucket) bucket.push(row);
        else bySubject.set(row.subject, [row]);
      }
      const gradesBySubject = [...bySubject.entries()].map(
        ([subject, rows]) => ({
          subject,
          averagePercentage: averagePercentageOf(rows),
        }),
      );

      return {
        classId: klass.id,
        className: klass.name,
        attendanceRatePercentage,
        attendanceBreakdown: breakdown,
        averageGradePercentage: averagePercentageOf(classGrades),
        gradesBySubject,
      };
    });
  }

  private async getMonthlyRecords(
    where: {
      studentId?: string;
      student?: { classId?: string; class?: { schoolId: string } };
    },
    monthsBack: number,
  ): Promise<MonthlyRecords> {
    const cutoff = monthsBackCutoff(monthsBack);
    const [grades, attendance] = await Promise.all([
      this.prisma.gradeRecord.findMany({
        where: { ...where, recordedAt: { gte: cutoff } },
        select: { score: true, maxScore: true, recordedAt: true },
        take: MAX_ANALYTICS_ROWS,
      }),
      this.prisma.attendanceRecord.findMany({
        where: { ...where, date: { gte: cutoff } },
        select: { status: true, date: true },
        take: MAX_ANALYTICS_ROWS,
      }),
    ]);
    return { grades, attendance };
  }

  /**
   * `where` is a Prisma-shaped filter reused verbatim across the attendance
   * and grade queries — both models relate to Student the same way, so one
   * filter shape (varying by classId / class.schoolId / student.id at the
   * call site) covers school, class, and student scopes.
   */
  private async buildSnapshot(where: {
    student: { classId?: string; class?: { schoolId: string }; id?: string };
  }): Promise<AnalyticsSnapshot> {
    const [attendanceGroups, gradeGroups, gradeOverall] = await Promise.all([
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.gradeRecord.groupBy({
        by: ['subject'],
        where,
        _avg: { score: true, maxScore: true },
      }),
      this.prisma.gradeRecord.aggregate({
        where,
        _avg: { score: true, maxScore: true },
      }),
    ]);

    const breakdown: AttendanceBreakdown = { ...EMPTY_BREAKDOWN };
    for (const group of attendanceGroups) {
      breakdown[group.status.toLowerCase() as keyof AttendanceBreakdown] =
        group._count._all;
    }
    const total =
      breakdown.present + breakdown.absent + breakdown.late + breakdown.excused;
    const attendanceRatePercentage =
      total > 0 ? round1((breakdown.present / total) * 100) : 0;

    const gradesBySubject = gradeGroups.map((group) => ({
      subject: group.subject,
      averagePercentage:
        group._avg.maxScore && group._avg.score != null
          ? round1((group._avg.score / group._avg.maxScore) * 100)
          : 0,
    }));

    const averageGradePercentage =
      gradeOverall._avg.maxScore && gradeOverall._avg.score != null
        ? round1((gradeOverall._avg.score / gradeOverall._avg.maxScore) * 100)
        : 0;

    return {
      attendanceRatePercentage,
      attendanceBreakdown: breakdown,
      averageGradePercentage,
      gradesBySubject,
    };
  }
}
