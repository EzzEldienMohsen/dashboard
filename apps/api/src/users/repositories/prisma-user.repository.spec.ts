import { PrismaUserRepository } from './prisma-user.repository';
import type { PrismaService } from '../../prisma/prisma.service';
import type { CreateUserData } from '../interfaces/user-repository.interface';

describe('PrismaUserRepository', () => {
  const user = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const prisma = { user } as unknown as PrismaService;
  const repository = new PrismaUserRepository(prisma);

  const fullUser = {
    id: 'user-1',
    email: 'jane@example.com',
    passwordHash: 'hashed-password',
    role: 'TEACHER',
    name: 'Jane Doe',
    phone: '+1-555-0110',
    country: 'United States',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('fetches the full row (passwordHash included) with no select', async () => {
      user.findUnique.mockResolvedValue(fullUser);

      const result = await repository.findByEmail('jane@example.com');

      expect(user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(result).toEqual(fullUser);
    });
  });

  describe('existsByEmail', () => {
    it('returns true when a matching row is found', async () => {
      user.findUnique.mockResolvedValue({ id: 'user-1' });

      const result = await repository.existsByEmail('jane@example.com');

      expect(user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('returns false when no matching row is found', async () => {
      user.findUnique.mockResolvedValue(null);

      const result = await repository.existsByEmail('nobody@example.com');

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('selects only id/email/role — never passwordHash', async () => {
      user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        role: 'TEACHER',
      });

      const result = await repository.findById('user-1');

      expect(user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, email: true, role: true },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'jane@example.com',
        role: 'TEACHER',
      });
    });
  });

  describe('create', () => {
    it('selects the response fields and excludes passwordHash', async () => {
      const data: CreateUserData = {
        email: 'jane@example.com',
        passwordHash: 'hashed-password',
        role: 'TEACHER',
        name: 'Jane Doe',
        phone: '+1-555-0110',
        country: 'United States',
      };
      const created = {
        id: 'user-1',
        email: 'jane@example.com',
        role: 'TEACHER',
        name: 'Jane Doe',
        phone: '+1-555-0110',
        country: 'United States',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      user.create.mockResolvedValue(created);

      const result = await repository.create(data);

      expect(user.create).toHaveBeenCalledWith({
        data,
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          country: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(created);
      expect(
        (result as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
    });
  });
});
