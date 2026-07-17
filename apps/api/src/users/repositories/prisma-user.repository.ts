import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '../../../generated/prisma/client.js';
import type {
  AuthUserEntity,
  CreateUserData,
  CreatedUserEntity,
  IUserRepository,
} from '../interfaces/user-repository.interface';

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  schoolId: true,
} as const;
const CREATED_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  name: true,
  phone: true,
  country: true,
  createdAt: true,
} as const;

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  findById(id: string): Promise<AuthUserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: AUTH_USER_SELECT,
    });
  }

  create(data: CreateUserData): Promise<CreatedUserEntity> {
    return this.prisma.user.create({ data, select: CREATED_USER_SELECT });
  }
}
