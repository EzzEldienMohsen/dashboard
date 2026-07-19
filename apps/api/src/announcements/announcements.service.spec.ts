import { Test } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import {
  ANNOUNCEMENT_REPOSITORY,
  type IAnnouncementRepository,
} from './interfaces/announcement-repository.interface';
import { AnnouncementNotFoundException } from '../common/exceptions/announcement-not-found.exception';
import type { ListAnnouncementsQueryDto } from './dto/list-announcements-query.dto';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  const announcements: jest.Mocked<IAnnouncementRepository> = {
    findById: jest.fn(),
    findMany: jest.fn(),
  };

  const existingAnnouncement = {
    id: 'announcement-1',
    title: 'Mid-term exam schedule released',
    titleAr: 'الإعلان عن جدول اختبارات منتصف الفصل الدراسي',
    body: 'Please check the exam hall notice board.',
    bodyAr: 'يُرجى مراجعة لوحة الإعلانات الخاصة بقاعة الاختبار.',
    category: 'EXAM' as const,
    publishedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: ANNOUNCEMENT_REPOSITORY, useValue: announcements },
      ],
    }).compile();

    service = moduleRef.get(AnnouncementsService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the mapped DTO when the announcement exists', async () => {
      announcements.findById.mockResolvedValue(existingAnnouncement);

      const result = await service.findById('announcement-1');

      expect(announcements.findById).toHaveBeenCalledWith('announcement-1');
      expect(result).toEqual(existingAnnouncement);
    });

    it('throws AnnouncementNotFoundException when the announcement does not exist', async () => {
      announcements.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        AnnouncementNotFoundException,
      );
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      announcements.findById.mockRejectedValue(dbError);

      await expect(service.findById('announcement-1')).rejects.toBe(dbError);
    });
  });

  describe('findMany', () => {
    it('passes pagination and category through and maps items to DTOs', async () => {
      announcements.findMany.mockResolvedValue({
        items: [existingAnnouncement],
        total: 1,
        page: 2,
        limit: 10,
      });
      const query: ListAnnouncementsQueryDto = {
        page: 2,
        limit: 10,
        category: 'EXAM',
      };

      const result = await service.findMany(query);

      expect(announcements.findMany).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        category: 'EXAM',
      });
      expect(result).toEqual({
        items: [existingAnnouncement],
        total: 1,
        page: 2,
        limit: 10,
      });
    });

    it('rethrows unexpected repository errors', async () => {
      const dbError = new Error('connection lost');
      announcements.findMany.mockRejectedValue(dbError);

      await expect(service.findMany({ page: 1, limit: 20 })).rejects.toBe(
        dbError,
      );
    });
  });
});
