import type { Cache } from '@nestjs/cache-manager';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { CacheHealthIndicator } from './cache-health.indicator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CacheHealthIndicator', () => {
  let indicator: CacheHealthIndicator;
  let cache: jest.Mocked<Pick<Cache, 'set' | 'get'>>;

  beforeEach(async () => {
    cache = { set: jest.fn(), get: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CacheHealthIndicator,
        HealthIndicatorService,
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    indicator = moduleRef.get(CacheHealthIndicator);
  });

  it('reports up when the cache round-trip returns the value that was set', async () => {
    cache.get.mockResolvedValue('ok');

    const result = await indicator.isHealthy('cache');

    expect(cache.set).toHaveBeenCalledWith('health:cache-ping', 'ok', 5_000);
    expect(result).toEqual({ cache: { status: 'up' } });
  });

  it('reports down when the cache round-trip returns an unexpected value', async () => {
    cache.get.mockResolvedValue(undefined);

    const result = await indicator.isHealthy('cache');

    expect(result).toEqual({
      cache: {
        status: 'down',
        message: 'cache round-trip returned an unexpected value',
      },
    });
  });

  it('reports down when the cache throws', async () => {
    cache.set.mockRejectedValue(new Error('connection refused'));

    const result = await indicator.isHealthy('cache');

    expect(result).toEqual({
      cache: { status: 'down', message: 'connection refused' },
    });
  });
});
