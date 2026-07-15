import { PrismaSchoolRepository } from './prisma-school.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaSchoolRepository', () => {
  const school = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  const prisma = { school } as unknown as PrismaService;
  const repository = new PrismaSchoolRepository(prisma);
  const SELECT = { id: true, name: true, address: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('queries by id with the narrowed select', async () => {
      school.findUnique.mockResolvedValue({
        id: 'school-1',
        name: 'Riverside High',
        address: '123 River Road',
      });

      const result = await repository.findById('school-1');

      expect(school.findUnique).toHaveBeenCalledWith({
        where: { id: 'school-1' },
        select: SELECT,
      });
      expect(result).toEqual({
        id: 'school-1',
        name: 'Riverside High',
        address: '123 River Road',
      });
    });

    it('returns null when not found', async () => {
      school.findUnique.mockResolvedValue(null);

      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('computes skip from page/limit and passes the select', async () => {
      school.findMany.mockResolvedValue([
        { id: 'school-1', name: 'A', address: null },
      ]);
      school.count.mockResolvedValue(21);

      const result = await repository.findMany({ page: 3, limit: 10 });

      expect(school.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        select: SELECT,
      });
      expect(school.count).toHaveBeenCalledWith();
      expect(result).toEqual({
        items: [{ id: 'school-1', name: 'A', address: null }],
        total: 21,
        page: 3,
        limit: 10,
      });
    });
  });
});
