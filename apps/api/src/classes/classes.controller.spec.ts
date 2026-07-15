import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: jest.Mocked<Pick<ClassesService, 'findMany' | 'findById'>>;

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new ClassesController(service as unknown as ClassesService);
  });

  it('delegates findMany to the service with the query', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany({ page: 1, limit: 20, schoolId: 'school-1' }),
    ).resolves.toBe(result);
    expect(service.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      schoolId: 'school-1',
    });
  });

  it('delegates findById to the service with the id', async () => {
    const klass = { id: 'class-1', name: 'Grade 4-A', schoolId: 'school-1' };
    service.findById.mockResolvedValue(klass);

    await expect(controller.findById('class-1')).resolves.toBe(klass);
    expect(service.findById).toHaveBeenCalledWith('class-1');
  });
});
