import type { $Enums } from '../../../generated/prisma/client.js';

export type GradePoint = {
  score: number;
  maxScore: number;
  recordedAt: Date;
};

export type AttendancePoint = {
  status: $Enums.AttendanceStatus;
  date: Date;
};

export type MonthlyPerformance = {
  month: string;
  averageGradePercentage: number;
  attendanceRatePercentage: number;
  /** Internal-only: whether any grade was recorded this month — needed to tell a genuine 0% from an empty month. Dropped by the response DTO's `excludeExtraneousValues`. */
  hasGradeData: boolean;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthsWindow(months: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    keys.push(monthKey(d));
  }
  return keys;
}

/**
 * Buckets raw grade/attendance rows into one entry per month in the trailing
 * `months` window — including months with no records at all (0s) — so the
 * frontend's trend chart and month dropdown always have a stable axis to
 * render against, rather than skipping gaps.
 */
export function buildMonthlyBuckets(
  grades: GradePoint[],
  attendance: AttendancePoint[],
  months: number,
): MonthlyPerformance[] {
  const window = monthsWindow(months);

  const gradesByMonth = new Map<string, GradePoint[]>();
  for (const grade of grades) {
    const key = monthKey(grade.recordedAt);
    const bucket = gradesByMonth.get(key);
    if (bucket) bucket.push(grade);
    else gradesByMonth.set(key, [grade]);
  }

  const attendanceByMonth = new Map<string, AttendancePoint['status'][]>();
  for (const record of attendance) {
    const key = monthKey(record.date);
    const bucket = attendanceByMonth.get(key);
    if (bucket) bucket.push(record.status);
    else attendanceByMonth.set(key, [record.status]);
  }

  return window.map((month) => {
    const monthGrades = gradesByMonth.get(month) ?? [];
    const averageGradePercentage = monthGrades.length
      ? round1(
          (monthGrades.reduce((sum, g) => sum + g.score / g.maxScore, 0) /
            monthGrades.length) *
            100,
        )
      : 0;

    const statuses = attendanceByMonth.get(month) ?? [];
    const present = statuses.filter((status) => status === 'PRESENT').length;
    const attendanceRatePercentage = statuses.length
      ? round1((present / statuses.length) * 100)
      : 0;

    return {
      month,
      averageGradePercentage,
      attendanceRatePercentage,
      hasGradeData: monthGrades.length > 0,
    };
  });
}

/**
 * Percentage-point delta between the two most recent months that actually
 * have grade data — skips zero-filled gap months rather than comparing
 * against them, and returns 0 when fewer than two data-bearing months exist.
 */
export function computeImprovementRate(buckets: MonthlyPerformance[]): number {
  const withData = buckets.filter((bucket) => bucket.hasGradeData);
  if (withData.length < 2) return 0;
  const [previous, latest] = withData.slice(-2);
  return round1(
    latest.averageGradePercentage - previous.averageGradePercentage,
  );
}
