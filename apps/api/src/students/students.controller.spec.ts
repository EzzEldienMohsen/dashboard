import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: jest.Mocked<Pick<StudentsService, 'findMany' | 'findById'>>;

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ava@example.com',
    role: 'TEACHER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new StudentsController(service as unknown as StudentsService);
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
});
