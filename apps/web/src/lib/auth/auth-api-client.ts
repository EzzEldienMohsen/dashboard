export interface AuthApiSuccess {
  ok: true;
  accessToken: string;
}

export interface AuthApiFailure {
  ok: false;
  status: number;
  errorCode?: string;
  message?: string | string[];
  networkError?: boolean;
}

export type AuthApiResult = AuthApiSuccess | AuthApiFailure;

/**
 * Transport abstraction: registerAction/loginAction depend on this
 * interface, not on fetch or the NestJS response shape directly (DIP).
 * Swappable for a mock in tests without touching the Server Actions.
 */
export interface AuthApiClient {
  register(data: Record<string, unknown>): Promise<AuthApiResult>;
  login(data: Record<string, unknown>): Promise<AuthApiResult>;
}

interface RawApiErrorBody {
  statusCode: number;
  message: string | string[];
  errorCode?: string;
}

interface RawAuthResponse {
  accessToken: string;
}

export class NestAuthApiClient implements AuthApiClient {
  constructor(private readonly baseUrl: string) {}

  register(data: Record<string, unknown>): Promise<AuthApiResult> {
    return this.call("register", data);
  }

  login(data: Record<string, unknown>): Promise<AuthApiResult> {
    return this.call("login", data);
  }

  private async call(
    path: "register" | "login",
    body: Record<string, unknown>,
  ): Promise<AuthApiResult> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/auth/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      return { ok: false, status: 0, networkError: true };
    }

    if (response.ok) {
      const data = (await response.json()) as RawAuthResponse;
      return { ok: true, accessToken: data.accessToken };
    }

    const errorBody = (await response.json().catch(() => null)) as RawApiErrorBody | null;
    return {
      ok: false,
      status: response.status,
      errorCode: errorBody?.errorCode,
      message: errorBody?.message,
    };
  }
}

export const authApiClient: AuthApiClient = new NestAuthApiClient(
  process.env.INTERNAL_API_URL ?? "http://localhost:3000",
);
