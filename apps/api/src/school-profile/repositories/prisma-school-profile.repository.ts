import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ISchoolProfileRepository,
  SchoolProfileEntity,
} from '../interfaces/school-profile-repository.interface';

const SCHOOL_PROFILE_SELECT = {
  id: true,
  name: true,
  mission: true,
  foundedYear: true,
  address: true,
  contactEmail: true,
  contactPhone: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaSchoolProfileRepository implements ISchoolProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(): Promise<SchoolProfileEntity | null> {
    return this.prisma.schoolProfile.findFirst({
      select: SCHOOL_PROFILE_SELECT,
    });
  }
}
