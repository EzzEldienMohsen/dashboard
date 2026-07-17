import { PrismaClassRepository } from './prisma-class.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaClassRepository', () => {
  const classDelegate = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  const prisma = { class: classDelegate } as unknown as PrismaService;
  const repository = new PrismaClassRepository(prisma);
  const SELECT = { id: true, name: true, schoolId: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('queries by id scoped to the caller school', async () => {
      classDelegate.findFirst.mockResolvedValue({
        id: 'class-1',
        name: 'Grade 5-A',
        schoolId: 'school-1',
      });

      const result = await repository.findById('class-1', 'school-1');

      expect(classDelegate.findFirst).toHaveBeenCalledWith({
        where: { id: 'class-1', schoolId: 'school-1' },
        select: SELECT,
      });
      expect(result).toEqual({
        id: 'class-1',
        name: 'Grade 5-A',
        schoolId: 'school-1',
      });
    });

    it('returns null when the class belongs to another school', async () => {
      classDelegate.findFirst.mockResolvedValue(null);

      await expect(
        repository.findById('class-1', 'school-2'),
      ).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('scopes to the caller school and computes skip from page/limit', async () => {
      classDelegate.findMany.mockResolvedValue([
        { id: 'class-1', name: 'Grade 5-A', schoolId: 'school-1' },
      ]);
      classDelegate.count.mockResolvedValue(6);

      const result = await repository.findMany({
        page: 2,
        limit: 3,
        schoolId: 'school-1',
      });

      const where = { schoolId: 'school-1' };
      expect(classDelegate.findMany).toHaveBeenCalledWith({
        where,
        skip: 3,
        take: 3,
        select: SELECT,
      });
      expect(classDelegate.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({
        items: [{ id: 'class-1', name: 'Grade 5-A', schoolId: 'school-1' }],
        total: 6,
        page: 2,
        limit: 3,
      });
    });
  });
});
