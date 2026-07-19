import type {
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import type { CacheHealthIndicator } from './cache-health.indicator';
import type { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<Pick<HealthCheckService, 'check'>>;
  let prismaIndicator: jest.Mocked<Pick<PrismaHealthIndicator, 'pingCheck'>>;
  let cacheIndicator: jest.Mocked<Pick<CacheHealthIndicator, 'isHealthy'>>;
  let prisma: PrismaService;

  beforeEach(() => {
    health = { check: jest.fn() };
    prismaIndicator = { pingCheck: jest.fn() };
    cacheIndicator = { isHealthy: jest.fn() };
    prisma = {} as PrismaService;
    controller = new HealthController(
      health as unknown as HealthCheckService,
      prismaIndicator as unknown as PrismaHealthIndicator,
      prisma,
      cacheIndicator as unknown as CacheHealthIndicator,
    );
  });

  it('runs the health check with database and cache indicators', async () => {
    const result = {
      status: 'ok' as const,
      info: {
        database: { status: 'up' as const },
        cache: { status: 'up' as const },
      },
      error: {},
      details: {
        database: { status: 'up' as const },
        cache: { status: 'up' as const },
      },
    };
    health.check.mockResolvedValue(result);

    await expect(controller.check()).resolves.toBe(result);
    expect(health.check).toHaveBeenCalledWith([
      expect.any(Function),
      expect.any(Function),
    ]);

    const [databaseIndicatorFn, cacheIndicatorFn] =
      health.check.mock.calls[0][0];

    prismaIndicator.pingCheck.mockResolvedValue({
      database: { status: 'up' },
    });
    await databaseIndicatorFn();
    expect(prismaIndicator.pingCheck).toHaveBeenCalledWith('database', prisma);

    cacheIndicator.isHealthy.mockResolvedValue({ cache: { status: 'up' } });
    await cacheIndicatorFn();
    expect(cacheIndicator.isHealthy).toHaveBeenCalledWith('cache');
  });
});
