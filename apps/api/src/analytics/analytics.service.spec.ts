import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import {
  ANALYTICS_REPOSITORY,
  type AnalyticsSnapshot,
  type IAnalyticsRepository,
  type MonthlyRecords,
} from './interfaces/analytics-repository.interface';
import { AdviceGeneratorService } from './services/advice-generator.service';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';
import { StudentNotFoundException } from '../common/exceptions/student-not-found.exception';

function monthsAgo(n: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 15));
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const analytics: jest.Mocked<IAnalyticsRepository> = {
    classBelongsToSchool: jest.fn(),
    studentBelongsToSchool: jest.fn(),
    getSnapshotForClass: jest.fn(),
    getSnapshotForSchool: jest.fn(),
    getSnapshotForStudent: jest.fn(),
    getClassSnapshotsForSchool: jest.fn(),
    getMonthlyRecordsForSchool: jest.fn(),
    getMonthlyRecordsForClass: jest.fn(),
    getMonthlyRecordsForStudent: jest.fn(),
  };

  const adviceGenerator: jest.Mocked<Pick<AdviceGeneratorService, 'generate'>> =
    {
      generate: jest.fn(),
    };

  const snapshot: AnalyticsSnapshot = {
    attendanceRatePercentage: 92.5,
    attendanceBreakdown: { present: 37, absent: 2, late: 1, excused: 0 },
    averageGradePercentage: 81.2,
    gradesBySubject: [{ subject: 'Math', averagePercentage: 81.2 }],
  };

  const emptySnapshot: AnalyticsSnapshot = {
    attendanceRatePercentage: 0,
    attendanceBreakdown: { present: 0, absent: 0, late: 0, excused: 0 },
    averageGradePercentage: 0,
    gradesBySubject: [],
  };

  const emptyMonthly: MonthlyRecords = { grades: [], attendance: [] };

  const risingMonthly: MonthlyRecords = {
    grades: [
      { score: 60, maxScore: 100, recordedAt: monthsAgo(1) },
      { score: 75, maxScore: 100, recordedAt: monthsAgo(0) },
    ],
    attendance: [],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: ANALYTICS_REPOSITORY, useValue: analytics },
        { provide: AdviceGeneratorService, useValue: adviceGenerator },
      ],
    }).compile();

    service = moduleRef.get(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('getSchoolAnalytics', () => {
    it('returns the mapped snapshot with an improvement rate when the school matches the caller', async () => {
      analytics.getSnapshotForSchool.mockResolvedValue(snapshot);
      analytics.getMonthlyRecordsForSchool.mockResolvedValue(risingMonthly);

      const result = await service.getSchoolAnalytics('school-1', 'school-1');

      expect(analytics.getSnapshotForSchool).toHaveBeenCalledWith('school-1');
      expect(analytics.getMonthlyRecordsForSchool).toHaveBeenCalledWith(
        'school-1',
        6,
      );
      expect(result).toEqual({ ...snapshot, improvementRatePercentage: 15 });
    });

    it('throws SchoolNotFoundException when the id does not match the caller schoolId', async () => {
      await expect(
        service.getSchoolAnalytics('other-school', 'school-1'),
      ).rejects.toBeInstanceOf(SchoolNotFoundException);
      expect(analytics.getSnapshotForSchool).not.toHaveBeenCalled();
    });

    it('returns zeroed values without dividing by zero when there are no records', async () => {
      analytics.getSnapshotForSchool.mockResolvedValue(emptySnapshot);
      analytics.getMonthlyRecordsForSchool.mockResolvedValue(emptyMonthly);

      const result = await service.getSchoolAnalytics('school-1', 'school-1');

      expect(result).toEqual({
        ...emptySnapshot,
        improvementRatePercentage: 0,
      });
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      analytics.getSnapshotForSchool.mockRejectedValue(dbError);

      await expect(
        service.getSchoolAnalytics('school-1', 'school-1'),
      ).rejects.toBe(dbError);
    });
  });

  describe('getClassAnalytics', () => {
    it('returns the mapped snapshot with an improvement rate when the class belongs to the caller school', async () => {
      analytics.classBelongsToSchool.mockResolvedValue(true);
      analytics.getSnapshotForClass.mockResolvedValue(snapshot);
      analytics.getMonthlyRecordsForClass.mockResolvedValue(risingMonthly);

      const result = await service.getClassAnalytics('class-1', 'school-1');

      expect(analytics.classBelongsToSchool).toHaveBeenCalledWith(
        'class-1',
        'school-1',
      );
      expect(analytics.getSnapshotForClass).toHaveBeenCalledWith('class-1');
      expect(result).toEqual({ ...snapshot, improvementRatePercentage: 15 });
    });

    it('throws ClassNotFoundException when the class does not belong to the caller school', async () => {
      analytics.classBelongsToSchool.mockResolvedValue(false);

      await expect(
        service.getClassAnalytics('class-1', 'school-1'),
      ).rejects.toBeInstanceOf(ClassNotFoundException);
      expect(analytics.getSnapshotForClass).not.toHaveBeenCalled();
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      analytics.classBelongsToSchool.mockRejectedValue(dbError);

      await expect(
        service.getClassAnalytics('class-1', 'school-1'),
      ).rejects.toBe(dbError);
    });
  });

  describe('getStudentAnalytics', () => {
    it('returns strengths/weaknesses and localized advice for a student in the caller school', async () => {
      analytics.studentBelongsToSchool.mockResolvedValue(true);
      analytics.getSnapshotForStudent.mockResolvedValue(snapshot);
      analytics.getMonthlyRecordsForStudent.mockResolvedValue(risingMonthly);
      adviceGenerator.generate.mockReturnValue([
        {
          subject: 'Math',
          severity: 'strength',
          message: 'Great job in Math!',
        },
      ]);

      const result = await service.getStudentAnalytics(
        'student-1',
        'school-1',
        'en',
      );

      expect(analytics.studentBelongsToSchool).toHaveBeenCalledWith(
        'student-1',
        'school-1',
      );
      expect(adviceGenerator.generate).toHaveBeenCalledWith(
        [{ subject: 'Math', averagePercentage: 81.2 }],
        [],
        'en',
      );
      expect(result.strengths).toEqual([
        { subject: 'Math', averagePercentage: 81.2 },
      ]);
      expect(result.weaknesses).toEqual([]);
      expect(result.advice).toEqual([
        {
          subject: 'Math',
          severity: 'strength',
          message: 'Great job in Math!',
        },
      ]);
      expect(result.improvementRatePercentage).toBe(15);
    });

    it('throws StudentNotFoundException when the student does not belong to the caller school', async () => {
      analytics.studentBelongsToSchool.mockResolvedValue(false);

      await expect(
        service.getStudentAnalytics('student-1', 'school-1', 'en'),
      ).rejects.toBeInstanceOf(StudentNotFoundException);
      expect(analytics.getSnapshotForStudent).not.toHaveBeenCalled();
    });
  });

  describe('getSchoolMonthlyAnalytics', () => {
    it('returns monthly buckets for the school', async () => {
      analytics.getMonthlyRecordsForSchool.mockResolvedValue(risingMonthly);

      const result = await service.getSchoolMonthlyAnalytics(
        'school-1',
        'school-1',
        2,
      );

      expect(result).toHaveLength(2);
      expect(result[0].averageGradePercentage).toBe(60);
      expect(result[1].averageGradePercentage).toBe(75);
    });

    it('throws SchoolNotFoundException when the id does not match the caller schoolId', async () => {
      await expect(
        service.getSchoolMonthlyAnalytics('other-school', 'school-1', 6),
      ).rejects.toBeInstanceOf(SchoolNotFoundException);
    });
  });

  describe('getClassMonthlyAnalytics', () => {
    it('returns monthly buckets for the class', async () => {
      analytics.classBelongsToSchool.mockResolvedValue(true);
      analytics.getMonthlyRecordsForClass.mockResolvedValue(risingMonthly);

      const result = await service.getClassMonthlyAnalytics(
        'class-1',
        'school-1',
        2,
      );

      expect(result).toHaveLength(2);
    });

    it('throws ClassNotFoundException when the class does not belong to the caller school', async () => {
      analytics.classBelongsToSchool.mockResolvedValue(false);

      await expect(
        service.getClassMonthlyAnalytics('class-1', 'school-1', 6),
      ).rejects.toBeInstanceOf(ClassNotFoundException);
    });
  });

  describe('getStudentMonthlyAnalytics', () => {
    it('returns monthly buckets for the student', async () => {
      analytics.studentBelongsToSchool.mockResolvedValue(true);
      analytics.getMonthlyRecordsForStudent.mockResolvedValue(risingMonthly);

      const result = await service.getStudentMonthlyAnalytics(
        'student-1',
        'school-1',
        2,
      );

      expect(result).toHaveLength(2);
    });

    it('throws StudentNotFoundException when the student does not belong to the caller school', async () => {
      analytics.studentBelongsToSchool.mockResolvedValue(false);

      await expect(
        service.getStudentMonthlyAnalytics('student-1', 'school-1', 6),
      ).rejects.toBeInstanceOf(StudentNotFoundException);
    });
  });

  describe('getClassesSummaryForSchool', () => {
    it('returns class summaries for the school', async () => {
      analytics.getClassSnapshotsForSchool.mockResolvedValue([
        { classId: 'class-1', className: 'Grade 4-A', ...snapshot },
      ]);

      const result = await service.getClassesSummaryForSchool(
        'school-1',
        'school-1',
      );

      expect(result).toEqual([
        { classId: 'class-1', className: 'Grade 4-A', ...snapshot },
      ]);
    });

    it('throws SchoolNotFoundException when the id does not match the caller schoolId', async () => {
      await expect(
        service.getClassesSummaryForSchool('other-school', 'school-1'),
      ).rejects.toBeInstanceOf(SchoolNotFoundException);
      expect(analytics.getClassSnapshotsForSchool).not.toHaveBeenCalled();
    });
  });
});
