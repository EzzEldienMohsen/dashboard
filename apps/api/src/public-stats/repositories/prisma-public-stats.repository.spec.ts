import { PrismaPublicStatsRepository } from './prisma-public-stats.repository';
import type { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../../generated/prisma/client.js';

describe('PrismaPublicStatsRepository', () => {
  const school = { count: jest.fn() };
  const student = { count: jest.fn() };
  const user = { count: jest.fn() };
  const prisma = { school, student, user } as unknown as PrismaService;
  const repository = new PrismaPublicStatsRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('counts schools, students, and teachers in parallel', async () => {
    school.count.mockResolvedValue(12);
    student.count.mockResolvedValue(340);
    user.count.mockResolvedValue(28);

    const result = await repository.getCounts();

    expect(school.count).toHaveBeenCalledWith();
    expect(student.count).toHaveBeenCalledWith();
    expect(user.count).toHaveBeenCalledWith({ where: { role: Role.TEACHER } });
    expect(result).toEqual({
      schoolsCount: 12,
      studentsCount: 340,
      teachersCount: 28,
    });
  });
});
