import type { ExecutionContext } from '@nestjs/common';
import { TenantCacheInterceptor } from './tenant-cache.interceptor';

function buildContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('TenantCacheInterceptor', () => {
  const interceptor = new TenantCacheInterceptor({}, {} as never);

  function trackBy(request: Record<string, unknown>): string | undefined {
    return (
      interceptor as unknown as {
        trackBy(context: ExecutionContext): string | undefined;
      }
    ).trackBy(buildContext(request));
  }

  it('keys the cache by schoolId, Accept-Language, and URL', () => {
    const key = trackBy({
      method: 'GET',
      url: '/students/s1/analytics',
      user: { schoolId: 'school-1' },
      headers: { 'accept-language': 'ar' },
    });

    expect(key).toBe('school-1:ar:/students/s1/analytics');
  });

  it('produces different keys for the same URL under different Accept-Language headers', () => {
    const base = {
      method: 'GET',
      url: '/students/s1/analytics',
      user: { schoolId: 'school-1' },
    };

    const enKey = trackBy({ ...base, headers: { 'accept-language': 'en' } });
    const arKey = trackBy({ ...base, headers: { 'accept-language': 'ar' } });

    expect(enKey).not.toBe(arKey);
  });

  it('falls back to "anon" when there is no authenticated user and to an empty language segment when the header is absent', () => {
    const key = trackBy({
      method: 'GET',
      url: '/public/stats',
      headers: {},
    });

    expect(key).toBe('anon::/public/stats');
  });

  it('prefers originalUrl over url when both are present', () => {
    const key = trackBy({
      method: 'GET',
      url: '/students/s1/analytics',
      originalUrl: '/v1/students/s1/analytics',
      user: { schoolId: 'school-1' },
      headers: {},
    });

    expect(key).toBe('school-1::/v1/students/s1/analytics');
  });

  it('returns undefined for non-cacheable methods', () => {
    const key = trackBy({
      method: 'POST',
      url: '/students',
      headers: {},
    });

    expect(key).toBeUndefined();
  });
});
