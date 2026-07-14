import type { AuthActionState } from "@/app/(auth)/action-state";
import type { AuthApiFailure } from "./auth-api-client";

type Translator = (key: string) => string;

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
 * are displayed (single responsibility per module). Field-validation
 * messages in the 400 branch come from the API itself (English only, since
 * translating those requires the API to be locale-aware too — out of scope
 * for this frontend-only pass) and pass through unmodified.
 */
export function mapAuthApiFailureToActionState(
  failure: AuthApiFailure,
  t: Translator,
): AuthActionState {
  if (failure.networkError) {
    return {
      status: "error",
      formError: t("networkError"),
    };
  }

  if (failure.status === 429) {
    return {
      status: "error",
      formError: t("rateLimited"),
    };
  }

  if (failure.status === 409 && failure.errorCode === "EMAIL_ALREADY_EXISTS") {
    return {
      status: "error",
      fieldErrors: { email: t("emailExists") },
    };
  }

  if (failure.status === 401 && failure.errorCode === "INVALID_CREDENTIALS") {
    return { status: "error", formError: t("invalidCredentials") };
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

  return { status: "error", formError: t("generic") };
}
