import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ICreatorRepository,
  CreatorEntity,
} from '../interfaces/creator-repository.interface';

const CREATOR_SELECT = {
  id: true,
  name: true,
  nameAr: true,
  role: true,
  roleAr: true,
  bio: true,
  bioAr: true,
  skills: true,
  email: true,
  githubUrl: true,
  linkedinUrl: true,
  portfolioUrl: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaCreatorRepository implements ICreatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(): Promise<CreatorEntity | null> {
    return this.prisma.creator.findFirst({
      select: CREATOR_SELECT,
    });
  }
}
