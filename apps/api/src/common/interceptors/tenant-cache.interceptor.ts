import { Injectable, type ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

/**
 * The base CacheInterceptor keys purely by request URL, which would let a
 * caller from one school see another school's cached response for the same
 * URL within the TTL window. Guards run before interceptors, so request.user
 * is already populated here — fold it into the cache key to keep responses
 * isolated per tenant.
 */
@Injectable()
export class TenantCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    if (!this.isRequestCacheable(context)) {
      return undefined;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      originalUrl?: string;
      url: string;
    }>();
    const url = request.originalUrl ?? request.url;

    return `${request.user?.schoolId ?? 'anon'}:${url}`;
  }
}
