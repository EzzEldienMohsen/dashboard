import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import {
  ANALYTICS_REPOSITORY,
  type AnalyticsSnapshot,
  type IAnalyticsRepository,
} from './interfaces/analytics-repository.interface';
import { ClassNotFoundException } from '../common/exceptions/class-not-found.exception';
import { SchoolNotFoundException } from '../common/exceptions/school-not-found.exception';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const analytics: jest.Mocked<IAnalyticsRepository> = {
    classBelongsToSchool: jest.fn(),
    getSnapshotForClass: jest.fn(),
    getSnapshotForSchool: jest.fn(),
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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: ANALYTICS_REPOSITORY, useValue: analytics },
      ],
    }).compile();

    service = moduleRef.get(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('getSchoolAnalytics', () => {
    it('returns the mapped snapshot when the school matches the caller', async () => {
      analytics.getSnapshotForSchool.mockResolvedValue(snapshot);

      const result = await service.getSchoolAnalytics('school-1', 'school-1');

      expect(analytics.getSnapshotForSchool).toHaveBeenCalledWith('school-1');
      expect(result).toEqual(snapshot);
    });

    it('throws SchoolNotFoundException when the id does not match the caller schoolId', async () => {
      await expect(
        service.getSchoolAnalytics('other-school', 'school-1'),
      ).rejects.toBeInstanceOf(SchoolNotFoundException);
      expect(analytics.getSnapshotForSchool).not.toHaveBeenCalled();
    });

    it('returns zeroed values without dividing by zero when there are no records', async () => {
      analytics.getSnapshotForSchool.mockResolvedValue(emptySnapshot);

      const result = await service.getSchoolAnalytics('school-1', 'school-1');

      expect(result).toEqual(emptySnapshot);
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
    it('returns the mapped snapshot when the class belongs to the caller school', async () => {
      analytics.classBelongsToSchool.mockResolvedValue(true);
      analytics.getSnapshotForClass.mockResolvedValue(snapshot);

      const result = await service.getClassAnalytics('class-1', 'school-1');

      expect(analytics.classBelongsToSchool).toHaveBeenCalledWith(
        'class-1',
        'school-1',
      );
      expect(analytics.getSnapshotForClass).toHaveBeenCalledWith('class-1');
      expect(result).toEqual(snapshot);
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
});
