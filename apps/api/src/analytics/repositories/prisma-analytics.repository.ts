import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AnalyticsSnapshot,
  AttendanceBreakdown,
  IAnalyticsRepository,
} from '../interfaces/analytics-repository.interface';

const EMPTY_BREAKDOWN: AttendanceBreakdown = {
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
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

  getSnapshotForClass(classId: string): Promise<AnalyticsSnapshot> {
    return this.buildSnapshot({ student: { classId } });
  }

  getSnapshotForSchool(schoolId: string): Promise<AnalyticsSnapshot> {
    return this.buildSnapshot({ student: { class: { schoolId } } });
  }

  /**
   * `where` is a Prisma-shaped filter reused verbatim across the attendance
   * and grade queries — both models relate to Student the same way, so one
   * filter shape (varying only by classId vs. class.schoolId at the call
   * site) covers both scopes.
   */
  private async buildSnapshot(where: {
    student: { classId?: string; class?: { schoolId: string } };
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
