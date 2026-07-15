import { PrismaClassRepository } from './prisma-class.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaClassRepository', () => {
  const classDelegate = {
    findUnique: jest.fn(),
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
    it('queries by id with the narrowed select', async () => {
      classDelegate.findUnique.mockResolvedValue({
        id: 'class-1',
        name: 'Grade 5-A',
        schoolId: 'school-1',
      });

      const result = await repository.findById('class-1');

      expect(classDelegate.findUnique).toHaveBeenCalledWith({
        where: { id: 'class-1' },
        select: SELECT,
      });
      expect(result).toEqual({
        id: 'class-1',
        name: 'Grade 5-A',
        schoolId: 'school-1',
      });
    });
  });

  describe('findMany', () => {
    it('omits the where clause when no schoolId filter is given', async () => {
      classDelegate.findMany.mockResolvedValue([]);
      classDelegate.count.mockResolvedValue(0);

      await repository.findMany({ page: 1, limit: 20 });

      expect(classDelegate.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 20,
        select: SELECT,
      });
      expect(classDelegate.count).toHaveBeenCalledWith({ where: undefined });
    });

    it('applies the schoolId filter and pagination when given', async () => {
      classDelegate.findMany.mockResolvedValue([
        { id: 'class-1', name: 'Grade 5-A', schoolId: 'school-1' },
      ]);
      classDelegate.count.mockResolvedValue(6);

      const result = await repository.findMany({
        page: 2,
        limit: 3,
        schoolId: 'school-1',
      });

      expect(classDelegate.findMany).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        skip: 3,
        take: 3,
        select: SELECT,
      });
      expect(classDelegate.count).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
      });
      expect(result).toEqual({
        items: [{ id: 'class-1', name: 'Grade 5-A', schoolId: 'school-1' }],
        total: 6,
        page: 2,
        limit: 3,
      });
    });
  });
});
