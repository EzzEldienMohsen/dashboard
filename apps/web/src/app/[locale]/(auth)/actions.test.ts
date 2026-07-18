import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "@/i18n/navigation";
import { authApiClient } from "@/lib/auth/auth-api-client";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-cookie";
import { loginAction, registerAction, logoutAction } from "./actions";

const cookiesSet = vi.fn();
const cookiesDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: cookiesSet, delete: cookiesDelete, get: vi.fn() })),
}));

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn().mockResolvedValue("en"),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/i18n/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/auth-api-client", () => ({
  authApiClient: { login: vi.fn(), register: vi.fn() },
}));

const mockedRedirect = vi.mocked(redirect);
const mockedRegister = vi.mocked(authApiClient.register);
const mockedLogin = vi.mocked(authApiClient.login);

function makeToken(claims: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(claims)}.signature`;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const VALID_REGISTER_FIELDS = {
  role: "MANAGER",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1234567890",
  country: "USA",
  password: "Passw0rd123",
  confirmPassword: "Passw0rd123",
};

const VALID_LOGIN_FIELDS = {
  email: "jane@example.com",
  password: "Passw0rd123",
};

describe("registerAction", () => {
  beforeEach(() => {
    cookiesSet.mockReset();
    cookiesDelete.mockReset();
    mockedRedirect.mockReset();
    mockedRegister.mockReset();
    mockedLogin.mockReset();
  });

  it("returns field errors and does not call the API when validation fails", async () => {
    const formData = buildFormData({
      ...VALID_REGISTER_FIELDS,
      email: "not-an-email",
      phone: "abc",
      confirmPassword: "SomethingElse123",
    });

    const result = await registerAction({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      fieldErrors: {
        email: "emailInvalid",
        phone: "phoneInvalid",
        confirmPassword: "passwordsMustMatch",
      },
    });
    expect(mockedRegister).not.toHaveBeenCalled();
    expect(cookiesSet).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("maps an API failure to action state without establishing a session", async () => {
    mockedRegister.mockResolvedValue({
      ok: false,
      status: 409,
      errorCode: "EMAIL_ALREADY_EXISTS",
    });
    const formData = buildFormData(VALID_REGISTER_FIELDS);

    const result = await registerAction({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      fieldErrors: { email: "emailExists" },
    });
    expect(cookiesSet).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("establishes a session and redirects a MANAGER to /dashboard on success", async () => {
    const token = makeToken({ role: "MANAGER" });
    mockedRegister.mockResolvedValue({ ok: true, accessToken: token });
    const formData = buildFormData(VALID_REGISTER_FIELDS);

    await registerAction({ status: "idle" }, formData);

    expect(mockedRegister).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com", role: "MANAGER" }),
    );
    expect(cookiesSet).toHaveBeenCalledWith(
      SESSION_COOKIE,
      token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      }),
    );
    expect(mockedRedirect).toHaveBeenCalledWith({
      href: "/dashboard",
      locale: "en",
    });
  });

  it("redirects a TEACHER to /dashboard/classes on success", async () => {
    const token = makeToken({ role: "TEACHER" });
    mockedRegister.mockResolvedValue({ ok: true, accessToken: token });
    const formData = buildFormData({
      ...VALID_REGISTER_FIELDS,
      role: "TEACHER",
    });

    await registerAction({ status: "idle" }, formData);

    expect(mockedRedirect).toHaveBeenCalledWith({
      href: "/dashboard/classes",
      locale: "en",
    });
  });
});

describe("loginAction", () => {
  beforeEach(() => {
    cookiesSet.mockReset();
    cookiesDelete.mockReset();
    mockedRedirect.mockReset();
    mockedRegister.mockReset();
    mockedLogin.mockReset();
  });

  it("returns field errors and does not call the API when validation fails", async () => {
    const formData = buildFormData({ email: "not-an-email", password: "" });

    const result = await loginAction({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      fieldErrors: { email: "emailInvalid", password: "passwordRequired" },
    });
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("maps a network-error API failure to a form-level error", async () => {
    mockedLogin.mockResolvedValue({ ok: false, status: 0, networkError: true });
    const formData = buildFormData(VALID_LOGIN_FIELDS);

    const result = await loginAction({ status: "idle" }, formData);

    expect(result).toEqual({ status: "error", formError: "networkError" });
    expect(cookiesSet).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("maps invalid credentials to a form-level error", async () => {
    mockedLogin.mockResolvedValue({
      ok: false,
      status: 401,
      errorCode: "INVALID_CREDENTIALS",
    });
    const formData = buildFormData(VALID_LOGIN_FIELDS);

    const result = await loginAction({ status: "idle" }, formData);

    expect(result).toEqual({ status: "error", formError: "invalidCredentials" });
  });

  it("establishes a session and redirects a MANAGER to /dashboard on success", async () => {
    const token = makeToken({ role: "MANAGER" });
    mockedLogin.mockResolvedValue({ ok: true, accessToken: token });
    const formData = buildFormData(VALID_LOGIN_FIELDS);

    await loginAction({ status: "idle" }, formData);

    expect(mockedLogin).toHaveBeenCalledWith({
      email: "jane@example.com",
      password: "Passw0rd123",
    });
    expect(cookiesSet).toHaveBeenCalledWith(
      SESSION_COOKIE,
      token,
      expect.objectContaining({ httpOnly: true, path: "/" }),
    );
    expect(mockedRedirect).toHaveBeenCalledWith({
      href: "/dashboard",
      locale: "en",
    });
  });

  it("redirects a TEACHER to /dashboard/classes on success", async () => {
    const token = makeToken({ role: "TEACHER" });
    mockedLogin.mockResolvedValue({ ok: true, accessToken: token });
    const formData = buildFormData(VALID_LOGIN_FIELDS);

    await loginAction({ status: "idle" }, formData);

    expect(mockedRedirect).toHaveBeenCalledWith({
      href: "/dashboard/classes",
      locale: "en",
    });
  });
});

describe("logoutAction", () => {
  beforeEach(() => {
    cookiesSet.mockReset();
    cookiesDelete.mockReset();
    mockedRedirect.mockReset();
  });

  it("deletes the session cookie and redirects to /login in the current locale", async () => {
    await logoutAction();

    expect(cookiesDelete).toHaveBeenCalledWith(SESSION_COOKIE);
    expect(mockedRedirect).toHaveBeenCalledWith({ href: "/login", locale: "en" });
  });
});
