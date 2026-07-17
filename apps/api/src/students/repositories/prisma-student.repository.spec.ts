import { PrismaStudentRepository } from './prisma-student.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaStudentRepository', () => {
  const student = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  const prisma = { student } as unknown as PrismaService;
  const repository = new PrismaStudentRepository(prisma);
  const SELECT = { id: true, firstName: true, lastName: true, classId: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('queries by id scoped to the caller school via the class relation', async () => {
      student.findFirst.mockResolvedValue({
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Doe',
        classId: 'class-1',
      });

      const result = await repository.findById('student-1', 'school-1');

      expect(student.findFirst).toHaveBeenCalledWith({
        where: { id: 'student-1', class: { schoolId: 'school-1' } },
        select: SELECT,
      });
      expect(result).toEqual({
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Doe',
        classId: 'class-1',
      });
    });

    it('returns null when the student belongs to another school', async () => {
      student.findFirst.mockResolvedValue(null);

      await expect(
        repository.findById('student-1', 'school-2'),
      ).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('scopes to the caller school when no classId filter is given', async () => {
      student.findMany.mockResolvedValue([]);
      student.count.mockResolvedValue(0);

      await repository.findMany({ page: 1, limit: 20, schoolId: 'school-1' });

      const where = { class: { schoolId: 'school-1' } };
      expect(student.findMany).toHaveBeenCalledWith({
        where,
        skip: 0,
        take: 20,
        select: SELECT,
      });
      expect(student.count).toHaveBeenCalledWith({ where });
    });

    it('composes the classId filter with the school scope when given', async () => {
      student.findMany.mockResolvedValue([
        {
          id: 'student-1',
          firstName: 'Jane',
          lastName: 'Doe',
          classId: 'class-1',
        },
      ]);
      student.count.mockResolvedValue(23);

      const result = await repository.findMany({
        page: 2,
        limit: 5,
        schoolId: 'school-1',
        classId: 'class-1',
      });

      const where = { classId: 'class-1', class: { schoolId: 'school-1' } };
      expect(student.findMany).toHaveBeenCalledWith({
        where,
        skip: 5,
        take: 5,
        select: SELECT,
      });
      expect(student.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({
        items: [
          {
            id: 'student-1',
            firstName: 'Jane',
            lastName: 'Doe',
            classId: 'class-1',
          },
        ],
        total: 23,
        page: 2,
        limit: 5,
      });
    });
  });
});
