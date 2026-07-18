import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import type { AnalyticsService } from '../analytics/analytics.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: jest.Mocked<Pick<ClassesService, 'findMany' | 'findById'>>;
  let analyticsService: jest.Mocked<
    Pick<AnalyticsService, 'getClassAnalytics'>
  >;

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ava@example.com',
    role: 'MANAGER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    analyticsService = { getClassAnalytics: jest.fn() };
    controller = new ClassesController(
      service as unknown as ClassesService,
      analyticsService as unknown as AnalyticsService,
    );
  });

  it('delegates findMany to the service with the query and caller schoolId', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany({ page: 1, limit: 20 }, user),
    ).resolves.toBe(result);
    expect(service.findMany).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      'school-1',
    );
  });

  it('delegates findById to the service with the id and caller schoolId', async () => {
    const klass = { id: 'class-1', name: 'Grade 4-A', schoolId: 'school-1' };
    service.findById.mockResolvedValue(klass);

    await expect(controller.findById('class-1', user)).resolves.toBe(klass);
    expect(service.findById).toHaveBeenCalledWith('class-1', 'school-1');
  });

  it('delegates getAnalytics to the analytics service with the id and caller schoolId', async () => {
    const snapshot = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 85,
      gradesBySubject: [],
    };
    analyticsService.getClassAnalytics.mockResolvedValue(snapshot);

    await expect(controller.getAnalytics('class-1', user)).resolves.toBe(
      snapshot,
    );
    expect(analyticsService.getClassAnalytics).toHaveBeenCalledWith(
      'class-1',
      'school-1',
    );
  });
});
