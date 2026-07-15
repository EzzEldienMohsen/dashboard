import { PrismaStudentRepository } from './prisma-student.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaStudentRepository', () => {
  const student = {
    findUnique: jest.fn(),
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
    it('queries by id with the narrowed select', async () => {
      student.findUnique.mockResolvedValue({
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Doe',
        classId: 'class-1',
      });

      const result = await repository.findById('student-1');

      expect(student.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        select: SELECT,
      });
      expect(result).toEqual({
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Doe',
        classId: 'class-1',
      });
    });
  });

  describe('findMany', () => {
    it('omits the where clause when no classId filter is given', async () => {
      student.findMany.mockResolvedValue([]);
      student.count.mockResolvedValue(0);

      await repository.findMany({ page: 1, limit: 20 });

      expect(student.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 20,
        select: SELECT,
      });
      expect(student.count).toHaveBeenCalledWith({ where: undefined });
    });

    it('applies the classId filter and pagination when given', async () => {
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
        classId: 'class-1',
      });

      expect(student.findMany).toHaveBeenCalledWith({
        where: { classId: 'class-1' },
        skip: 5,
        take: 5,
        select: SELECT,
      });
      expect(student.count).toHaveBeenCalledWith({
        where: { classId: 'class-1' },
      });
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
