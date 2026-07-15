import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: jest.Mocked<Pick<StudentsService, 'findMany' | 'findById'>>;

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new StudentsController(service as unknown as StudentsService);
  });

  it('delegates findMany to the service with the query', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany({ page: 1, limit: 20, classId: 'class-1' }),
    ).resolves.toBe(result);
    expect(service.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      classId: 'class-1',
    });
  });

  it('delegates findById to the service with the id', async () => {
    const student = {
      id: 'student-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      classId: 'class-1',
    };
    service.findById.mockResolvedValue(student);

    await expect(controller.findById('student-1')).resolves.toBe(student);
    expect(service.findById).toHaveBeenCalledWith('student-1');
  });
});
