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
    it('queries by id when it matches the caller school', async () => {
      school.findUnique.mockResolvedValue({
        id: 'school-1',
        name: 'Riverside High',
        address: '123 River Road',
      });

      const result = await repository.findById('school-1', 'school-1');

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

    it('returns null without querying when the id is not the caller school', async () => {
      const result = await repository.findById('school-2', 'school-1');

      expect(school.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null when not found', async () => {
      school.findUnique.mockResolvedValue(null);

      await expect(
        repository.findById('missing', 'missing'),
      ).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('scopes to the caller school and computes skip from page/limit', async () => {
      school.findMany.mockResolvedValue([
        { id: 'school-1', name: 'A', address: null },
      ]);
      school.count.mockResolvedValue(1);

      const result = await repository.findMany({
        page: 1,
        limit: 10,
        schoolId: 'school-1',
      });

      const where = { id: 'school-1' };
      expect(school.findMany).toHaveBeenCalledWith({
        where,
        skip: 0,
        take: 10,
        select: SELECT,
      });
      expect(school.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({
        items: [{ id: 'school-1', name: 'A', address: null }],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('existsById', () => {
    it('returns true when a matching row is found', async () => {
      school.findUnique.mockResolvedValue({ id: 'school-1' });

      const result = await repository.existsById('school-1');

      expect(school.findUnique).toHaveBeenCalledWith({
        where: { id: 'school-1' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('returns false when no matching row is found', async () => {
      school.findUnique.mockResolvedValue(null);

      const result = await repository.existsById('missing');

      expect(result).toBe(false);
    });
  });
});
