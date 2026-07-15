import { PrismaAnnouncementRepository } from './prisma-announcement.repository';
import type { PrismaService } from '../../prisma/prisma.service';

describe('PrismaAnnouncementRepository', () => {
  const announcement = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };
  const prisma = { announcement } as unknown as PrismaService;
  const repository = new PrismaAnnouncementRepository(prisma);
  const SELECT = {
    id: true,
    title: true,
    body: true,
    category: true,
    publishedAt: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('queries by id with the narrowed select', async () => {
      const record = {
        id: 'announcement-1',
        title: 'Mid-term exam schedule released',
        body: 'Please check the exam hall notice board.',
        category: 'EXAM',
        publishedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      announcement.findUnique.mockResolvedValue(record);

      const result = await repository.findById('announcement-1');

      expect(announcement.findUnique).toHaveBeenCalledWith({
        where: { id: 'announcement-1' },
        select: SELECT,
      });
      expect(result).toEqual(record);
    });

    it('returns null when not found', async () => {
      announcement.findUnique.mockResolvedValue(null);

      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('findMany', () => {
    it('computes skip from page/limit, orders by publishedAt desc, and omits where when no category', async () => {
      announcement.findMany.mockResolvedValue([
        {
          id: 'announcement-1',
          title: 'A',
          body: 'B',
          category: 'GENERAL',
          publishedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      ]);
      announcement.count.mockResolvedValue(21);

      const result = await repository.findMany({ page: 3, limit: 10 });

      expect(announcement.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 10,
        select: SELECT,
        orderBy: { publishedAt: 'desc' },
      });
      expect(announcement.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        items: [
          {
            id: 'announcement-1',
            title: 'A',
            body: 'B',
            category: 'GENERAL',
            publishedAt: new Date('2024-01-01T00:00:00.000Z'),
          },
        ],
        total: 21,
        page: 3,
        limit: 10,
      });
    });

    it('filters by category when provided', async () => {
      announcement.findMany.mockResolvedValue([]);
      announcement.count.mockResolvedValue(0);

      await repository.findMany({ page: 1, limit: 20, category: 'EXAM' });

      expect(announcement.findMany).toHaveBeenCalledWith({
        where: { category: 'EXAM' },
        skip: 0,
        take: 20,
        select: SELECT,
        orderBy: { publishedAt: 'desc' },
      });
      expect(announcement.count).toHaveBeenCalledWith({
        where: { category: 'EXAM' },
      });
    });
  });
});
