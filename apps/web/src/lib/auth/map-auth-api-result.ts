import type { AuthActionState } from "@/app/(auth)/action-state";
import type { AuthApiFailure } from "./auth-api-client";

const KNOWN_FIELDS = [
  "role",
  "name",
  "email",
  "phone",
  "country",
  "password",
  "confirmPassword",
];

/**
 * Translates a raw AuthApiFailure into UI-facing form state — kept separate
 * from AuthApiClient so the transport layer stays ignorant of how errors
 * are displayed (single responsibility per module).
 */
export function mapAuthApiFailureToActionState(failure: AuthApiFailure): AuthActionState {
  if (failure.networkError) {
    return {
      status: "error",
      formError: "Unable to reach the server. Please try again.",
    };
  }

  if (failure.status === 429) {
    return {
      status: "error",
      formError: "Too many attempts. Please wait a minute and try again.",
    };
  }

  if (failure.status === 409 && failure.errorCode === "EMAIL_ALREADY_EXISTS") {
    return {
      status: "error",
      fieldErrors: { email: "An account with this email already exists" },
    };
  }

  if (failure.status === 401 && failure.errorCode === "INVALID_CREDENTIALS") {
    return { status: "error", formError: "Invalid email or password" };
  }

  if (failure.status === 400 && failure.message) {
    const messages = Array.isArray(failure.message) ? failure.message : [failure.message];
    const fieldErrors: Record<string, string> = {};
    const leftover: string[] = [];
    for (const message of messages) {
      const field = KNOWN_FIELDS.find((f) => message.startsWith(f));
      if (field) {
        fieldErrors[field] = message;
      } else {
        leftover.push(message);
      }
    }
    return {
      status: "error",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
      formError: leftover.length ? leftover.join(" ") : undefined,
    };
  }

  return { status: "error", formError: "Something went wrong. Please try again." };
}
