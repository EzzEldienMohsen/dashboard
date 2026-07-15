import type {
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import type { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<Pick<HealthCheckService, 'check'>>;
  let prismaIndicator: jest.Mocked<Pick<PrismaHealthIndicator, 'pingCheck'>>;
  let prisma: PrismaService;

  beforeEach(() => {
    health = { check: jest.fn() };
    prismaIndicator = { pingCheck: jest.fn() };
    prisma = {} as PrismaService;
    controller = new HealthController(
      health as unknown as HealthCheckService,
      prismaIndicator as unknown as PrismaHealthIndicator,
      prisma,
    );
  });

  it('runs the health check with a database ping indicator', async () => {
    const result = {
      status: 'ok' as const,
      info: { database: { status: 'up' as const } },
      error: {},
      details: { database: { status: 'up' as const } },
    };
    health.check.mockResolvedValue(result);

    await expect(controller.check()).resolves.toBe(result);
    expect(health.check).toHaveBeenCalledWith([expect.any(Function)]);

    const [indicatorFn] = health.check.mock.calls[0][0];
    prismaIndicator.pingCheck.mockResolvedValue({
      database: { status: 'up' },
    });
    await indicatorFn();
    expect(prismaIndicator.pingCheck).toHaveBeenCalledWith('database', prisma);
  });
});
