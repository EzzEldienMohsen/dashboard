import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

const PING_KEY = 'health:cache-ping';
const PING_VALUE = 'ok';
const PING_TTL_MS = 5_000;

/**
 * Exercises whichever cache backend is actually active — Redis in
 * production, in-memory when REDIS_URL is unset locally (see
 * `buildCacheStores()` in app.module.ts) — via a set/get round-trip rather
 * than pinging Redis directly, since the app is already written to be
 * agnostic to which store backs CACHE_MANAGER.
 */
@Injectable()
export class CacheHealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.cache.set(PING_KEY, PING_VALUE, PING_TTL_MS);
      const value = await this.cache.get(PING_KEY);
      if (value !== PING_VALUE) {
        return indicator.down({
          message: 'cache round-trip returned an unexpected value',
        });
      }
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }
}
