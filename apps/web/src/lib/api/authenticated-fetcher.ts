import "server-only";

export interface AuthenticatedFetchOptions {
  /** Seconds to persist in Next's Data Cache. */
  revalidate: number;
  tags: string[];
  /** Forwarded as `Accept-Language` — only needed for endpoints returning backend-localized text (e.g. student advice). */
  locale?: string;
}

export interface AuthenticatedFetchClient {
  get<T>(
    path: string,
    token: string,
    options: AuthenticatedFetchOptions,
  ): Promise<T | null>;
}

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3000";
const API_VERSION_PREFIX = "/v1";

export class NestAuthenticatedFetchClient implements AuthenticatedFetchClient {
  async get<T>(
    path: string,
    token: string,
    { revalidate, tags, locale }: AuthenticatedFetchOptions,
  ): Promise<T | null> {
    const url = `${INTERNAL_API_URL}${API_VERSION_PREFIX}${path}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(locale ? { "Accept-Language": locale } : {}),
        },
        next: { revalidate, tags },
      });
      if (res.ok) return (await res.json()) as T;
      console.error(`[api] ${res.status} ${res.statusText} — ${url}`);
    } catch (err) {
      console.error(`[api] fetch failed — ${url}`, err);
    }
    return null;
  }
}

export const authenticatedFetchClient: AuthenticatedFetchClient =
  new NestAuthenticatedFetchClient();
