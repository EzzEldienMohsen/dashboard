import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

describe('SchoolsController', () => {
  let controller: SchoolsController;
  let service: jest.Mocked<Pick<SchoolsService, 'findMany' | 'findById'>>;

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ava@example.com',
    role: 'MANAGER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new SchoolsController(service as unknown as SchoolsService);
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
    const school = { id: 'school-1', name: 'Riverside', address: null };
    service.findById.mockResolvedValue(school);

    await expect(controller.findById('school-1', user)).resolves.toBe(school);
    expect(service.findById).toHaveBeenCalledWith('school-1', 'school-1');
  });
});
