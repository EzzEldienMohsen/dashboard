import { describe, expect, it } from "vitest";
import { mapAuthApiFailureToActionState } from "./map-auth-api-result";
import type { AuthApiFailure } from "./auth-api-client";

const t = (key: string) => key;

describe("mapAuthApiFailureToActionState", () => {
  it("maps a network error to a generic networkError form error", () => {
    const failure: AuthApiFailure = { ok: false, status: 0, networkError: true };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      formError: "networkError",
    });
  });

  it("maps a 429 to a rateLimited form error", () => {
    const failure: AuthApiFailure = { ok: false, status: 429 };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      formError: "rateLimited",
    });
  });

  it("maps a 409 EMAIL_ALREADY_EXISTS to an email field error", () => {
    const failure: AuthApiFailure = {
      ok: false,
      status: 409,
      errorCode: "EMAIL_ALREADY_EXISTS",
    };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      fieldErrors: { email: "emailExists" },
    });
  });

  it("maps a 401 INVALID_CREDENTIALS to a form error", () => {
    const failure: AuthApiFailure = {
      ok: false,
      status: 401,
      errorCode: "INVALID_CREDENTIALS",
    };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      formError: "invalidCredentials",
    });
  });

  it("splits 400 validation messages between known fields and leftover form error", () => {
    const failure: AuthApiFailure = {
      ok: false,
      status: 400,
      message: ["email must be a valid email", "unexpected server note"],
    };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      fieldErrors: { email: "email must be a valid email" },
      formError: "unexpected server note",
    });
  });

  it("falls back to a generic form error for anything unrecognized", () => {
    const failure: AuthApiFailure = { ok: false, status: 500 };

    expect(mapAuthApiFailureToActionState(failure, t)).toEqual({
      status: "error",
      formError: "generic",
    });
  });
});
