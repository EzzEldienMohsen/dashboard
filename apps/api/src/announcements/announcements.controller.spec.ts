import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: jest.Mocked<Pick<AnnouncementsService, 'findMany' | 'findById'>>;

  beforeEach(() => {
    service = { findMany: jest.fn(), findById: jest.fn() };
    controller = new AnnouncementsController(
      service as unknown as AnnouncementsService,
    );
  });

  it('delegates findMany to the service with the query', async () => {
    const result = { items: [], total: 0, page: 1, limit: 20 };
    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany({ page: 1, limit: 20, category: 'EXAM' }),
    ).resolves.toBe(result);
    expect(service.findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      category: 'EXAM',
    });
  });

  it('delegates findById to the service with the id', async () => {
    const announcement = {
      id: 'announcement-1',
      title: 'Mid-term exam schedule released',
      body: 'Check the notice board.',
      category: 'EXAM' as const,
      publishedAt: new Date('2024-01-01T00:00:00.000Z'),
    };
    service.findById.mockResolvedValue(announcement);

    await expect(controller.findById('announcement-1')).resolves.toBe(
      announcement,
    );
    expect(service.findById).toHaveBeenCalledWith('announcement-1');
  });
});
