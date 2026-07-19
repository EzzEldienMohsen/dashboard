import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import type { AnalyticsService } from '../analytics/analytics.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: jest.Mocked<Pick<StudentsService, 'findMany' | 'findById'>>;
  let analyticsService: jest.Mocked<
    Pick<AnalyticsService, 'getStudentAnalytics' | 'getStudentMonthlyAnalytics'>
  >;

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ava@example.com',
    role: 'TEACHER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    analyticsService = {
      getStudentAnalytics: jest.fn(),
      getStudentMonthlyAnalytics: jest.fn(),
    };
    controller = new StudentsController(
      service as unknown as StudentsService,
      analyticsService as unknown as AnalyticsService,
    );
  });

  it('delegates findMany to the service with the query and caller schoolId', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany({ page: 1, limit: 20, classId: 'class-1' }, user),
    ).resolves.toBe(result);
    expect(service.findMany).toHaveBeenCalledWith(
      { page: 1, limit: 20, classId: 'class-1' },
      'school-1',
    );
  });

  it('delegates findById to the service with the id and caller schoolId', async () => {
    const student = {
      id: 'student-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      classId: 'class-1',
    };
    service.findById.mockResolvedValue(student);

    await expect(controller.findById('student-1', user)).resolves.toBe(student);
    expect(service.findById).toHaveBeenCalledWith('student-1', 'school-1');
  });

  it('delegates getAnalytics to the analytics service with the id, caller schoolId, and resolved language', async () => {
    const analytics = {
      attendanceRatePercentage: 90,
      attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
      averageGradePercentage: 85,
      gradesBySubject: [],
      improvementRatePercentage: 5,
      strengths: [],
      weaknesses: [],
      advice: [],
    };
    analyticsService.getStudentAnalytics.mockResolvedValue(analytics);

    await expect(
      controller.getAnalytics('student-1', user, 'ar'),
    ).resolves.toBe(analytics);
    expect(analyticsService.getStudentAnalytics).toHaveBeenCalledWith(
      'student-1',
      'school-1',
      'ar',
    );
  });

  it('delegates getMonthlyAnalytics to the analytics service with the id, months, and caller schoolId', async () => {
    const monthly = [
      {
        month: '2026-06',
        averageGradePercentage: 80,
        attendanceRatePercentage: 95,
      },
    ];
    analyticsService.getStudentMonthlyAnalytics.mockResolvedValue(monthly);

    await expect(
      controller.getMonthlyAnalytics('student-1', { months: 9 }, user),
    ).resolves.toBe(monthly);
    expect(analyticsService.getStudentMonthlyAnalytics).toHaveBeenCalledWith(
      'student-1',
      'school-1',
      9,
    );
  });
});
