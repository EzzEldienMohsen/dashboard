import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

describe('SchoolsController', () => {
  let controller: SchoolsController;
  let service: jest.Mocked<Pick<SchoolsService, 'findMany' | 'findById'>>;

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new SchoolsController(service as unknown as SchoolsService);
  });

  it('delegates findMany to the service with the query', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(controller.findMany({ page: 1, limit: 20 })).resolves.toBe(
      result,
    );
    expect(service.findMany).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('delegates findById to the service with the id', async () => {
    const school = { id: 'school-1', name: 'Riverside', address: null };
    service.findById.mockResolvedValue(school);

    await expect(controller.findById('school-1')).resolves.toBe(school);
    expect(service.findById).toHaveBeenCalledWith('school-1');
  });
});
