import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../generated/prisma/client.js';
import { PublicStatsResponseDto } from './dto/public-stats-response.dto';

@Injectable()
export class PublicStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<PublicStatsResponseDto> {
    const [schoolsCount, studentsCount, teachersCount] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.student.count(),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
    ]);

    return { schoolsCount, studentsCount, teachersCount };
  }
}
