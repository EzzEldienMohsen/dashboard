import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../../generated/prisma/client.js';
import type {
  IPublicStatsRepository,
  PublicStatsCounts,
} from '../interfaces/public-stats-repository.interface';

@Injectable()
export class PrismaPublicStatsRepository implements IPublicStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCounts(): Promise<PublicStatsCounts> {
    const [schoolsCount, studentsCount, teachersCount] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.student.count(),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
    ]);

    return { schoolsCount, studentsCount, teachersCount };
  }
}
