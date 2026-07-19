import { Injectable, type ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';

/**
 * The base CacheInterceptor keys purely by request URL, which would let a
 * caller from one school see another school's cached response for the same
 * URL within the TTL window. Guards run before interceptors, so request.user
 * is already populated here — fold it into the cache key to keep responses
 * isolated per tenant.
 *
 * Also folds in `Accept-Language`: most routes return language-agnostic
 * data so this simply adds a no-cost extra key segment, but the student
 * analytics route's `advice[].message` is localized server-side per
 * request — without this, an `en` response would get cached and served
 * back verbatim to a subsequent `ar` request for the same URL.
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
      headers: Record<string, string | string[] | undefined>;
    }>();
    const url = request.originalUrl ?? request.url;
    const langHeader = request.headers['accept-language'] ?? '';
    const lang = Array.isArray(langHeader) ? langHeader.join(',') : langHeader;

    return `${request.user?.schoolId ?? 'anon'}:${lang}:${url}`;
  }
}
