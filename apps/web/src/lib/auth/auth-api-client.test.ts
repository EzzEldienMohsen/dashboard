import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApiClient, NestAuthApiClient } from "./auth-api-client";

describe("NestAuthApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to /v1/auth/login and resolves the access token on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => ({ accessToken: "tok-abc" }),
    });
    const client = new NestAuthApiClient("http://api.test");

    const result = await client.login({ email: "a@b.com", password: "x" });

    expect(result).toEqual({ ok: true, accessToken: "tok-abc" });
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "x" }),
      cache: "no-store",
    });
  });

  it("posts to /v1/auth/register and resolves the access token on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => ({ accessToken: "tok-xyz" }),
    });
    const client = new NestAuthApiClient("http://api.test");

    const result = await client.register({ email: "a@b.com" });

    expect(result).toEqual({ ok: true, accessToken: "tok-xyz" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/v1/auth/register",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns the error body's status, errorCode and message on a failed response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: () =>
        Promise.resolve({
          statusCode: 409,
          message: "email already exists",
          errorCode: "EMAIL_ALREADY_EXISTS",
        }),
    });
    const client = new NestAuthApiClient("http://api.test");

    const result = await client.register({ email: "dup@b.com" });

    expect(result).toEqual({
      ok: false,
      status: 409,
      errorCode: "EMAIL_ALREADY_EXISTS",
      message: "email already exists",
    });
  });

  it("returns just the status when the error body cannot be parsed as JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });
    const client = new NestAuthApiClient("http://api.test");

    const result = await client.login({ email: "a@b.com", password: "x" });

    expect(result).toEqual({
      ok: false,
      status: 500,
      errorCode: undefined,
      message: undefined,
    });
  });

  it("returns a networkError result when fetch itself throws", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    const client = new NestAuthApiClient("http://api.test");

    const result = await client.login({ email: "a@b.com", password: "x" });

    expect(result).toEqual({ ok: false, status: 0, networkError: true });
  });
});

describe("authApiClient singleton", () => {
  it("is a NestAuthApiClient instance", () => {
    expect(authApiClient).toBeInstanceOf(NestAuthApiClient);
  });
});
