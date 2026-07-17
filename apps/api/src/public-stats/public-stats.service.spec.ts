import { Test } from '@nestjs/testing';
import { PublicStatsService } from './public-stats.service';
import {
  PUBLIC_STATS_REPOSITORY,
  type IPublicStatsRepository,
} from './interfaces/public-stats-repository.interface';

describe('PublicStatsService', () => {
  let service: PublicStatsService;

  const publicStats: jest.Mocked<IPublicStatsRepository> = {
    getCounts: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PublicStatsService,
        { provide: PUBLIC_STATS_REPOSITORY, useValue: publicStats },
      ],
    }).compile();

    service = moduleRef.get(PublicStatsService);
    jest.clearAllMocks();
  });

  it('delegates to the repository and returns its result unchanged', async () => {
    const counts = { schoolsCount: 12, studentsCount: 340, teachersCount: 28 };
    publicStats.getCounts.mockResolvedValue(counts);

    const result = await service.getStats();

    expect(publicStats.getCounts).toHaveBeenCalledWith();
    expect(result).toEqual(counts);
  });
});
