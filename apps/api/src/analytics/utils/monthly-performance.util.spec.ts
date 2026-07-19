import {
  buildMonthlyBuckets,
  computeImprovementRate,
  type AttendancePoint,
  type GradePoint,
  type MonthlyPerformance,
} from './monthly-performance.util';

function monthsAgo(n: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 15));
}

describe('buildMonthlyBuckets', () => {
  it('returns one zeroed entry per month when there are no records', () => {
    const buckets = buildMonthlyBuckets([], [], 3);

    expect(buckets).toHaveLength(3);
    for (const bucket of buckets) {
      expect(bucket.averageGradePercentage).toBe(0);
      expect(bucket.attendanceRatePercentage).toBe(0);
      expect(bucket.hasGradeData).toBe(false);
    }
  });

  it('buckets grades and attendance into the correct month, oldest to newest', () => {
    const grades: GradePoint[] = [
      { score: 80, maxScore: 100, recordedAt: monthsAgo(1) },
      { score: 90, maxScore: 100, recordedAt: monthsAgo(0) },
    ];
    const attendance: AttendancePoint[] = [
      { status: 'PRESENT', date: monthsAgo(1) },
      { status: 'ABSENT', date: monthsAgo(1) },
      { status: 'PRESENT', date: monthsAgo(0) },
    ];

    const buckets = buildMonthlyBuckets(grades, attendance, 2);

    expect(buckets).toHaveLength(2);
    expect(buckets[0].averageGradePercentage).toBe(80);
    expect(buckets[0].attendanceRatePercentage).toBe(50);
    expect(buckets[0].hasGradeData).toBe(true);
    expect(buckets[1].averageGradePercentage).toBe(90);
    expect(buckets[1].attendanceRatePercentage).toBe(100);
  });

  it('averages multiple grades within the same month', () => {
    const grades: GradePoint[] = [
      { score: 100, maxScore: 100, recordedAt: monthsAgo(0) },
      { score: 50, maxScore: 100, recordedAt: monthsAgo(0) },
    ];

    const buckets = buildMonthlyBuckets(grades, [], 1);

    expect(buckets[0].averageGradePercentage).toBe(75);
  });

  it('leaves gap months with no records zeroed rather than skipping them', () => {
    const grades: GradePoint[] = [
      { score: 80, maxScore: 100, recordedAt: monthsAgo(2) },
    ];

    const buckets = buildMonthlyBuckets(grades, [], 3);

    expect(buckets).toHaveLength(3);
    expect(buckets[0].hasGradeData).toBe(true);
    expect(buckets[1].hasGradeData).toBe(false);
    expect(buckets[2].hasGradeData).toBe(false);
  });
});

describe('computeImprovementRate', () => {
  it('returns 0 when fewer than two months have grade data', () => {
    const buckets: MonthlyPerformance[] = [
      {
        month: '2026-05',
        averageGradePercentage: 70,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
      {
        month: '2026-06',
        averageGradePercentage: 0,
        attendanceRatePercentage: 0,
        hasGradeData: false,
      },
    ];

    expect(computeImprovementRate(buckets)).toBe(0);
  });

  it('returns the percentage-point delta between the two most recent data-bearing months', () => {
    const buckets: MonthlyPerformance[] = [
      {
        month: '2026-04',
        averageGradePercentage: 60,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
      {
        month: '2026-05',
        averageGradePercentage: 70,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
      {
        month: '2026-06',
        averageGradePercentage: 85,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
    ];

    expect(computeImprovementRate(buckets)).toBe(15);
  });

  it('skips zero-filled gap months when finding the two most recent data-bearing months', () => {
    const buckets: MonthlyPerformance[] = [
      {
        month: '2026-04',
        averageGradePercentage: 70,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
      {
        month: '2026-05',
        averageGradePercentage: 0,
        attendanceRatePercentage: 0,
        hasGradeData: false,
      },
      {
        month: '2026-06',
        averageGradePercentage: 60,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
    ];

    expect(computeImprovementRate(buckets)).toBe(-10);
  });

  it('reports a negative rate when performance declined', () => {
    const buckets: MonthlyPerformance[] = [
      {
        month: '2026-05',
        averageGradePercentage: 90,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
      {
        month: '2026-06',
        averageGradePercentage: 75,
        attendanceRatePercentage: 90,
        hasGradeData: true,
      },
    ];

    expect(computeImprovementRate(buckets)).toBe(-15);
  });
});
