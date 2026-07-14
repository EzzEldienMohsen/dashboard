import { z } from "zod";

type Translator = (key: string) => string;

/**
 * Kept byte-for-byte identical to PHONE_REGEX in
 * apps/api/src/auth/dto/register.dto.ts — update both together.
 * A factory rather than a static schema because the error message needs
 * the caller's locale, resolved at request time, not at module load.
 */
export function createPhoneSchema(t: Translator) {
  return z.string().regex(/^\+?[0-9\s-]{7,20}$/, t("phoneInvalid"));
}

/**
 * Kept byte-for-byte identical to PASSWORD_COMPLEXITY_REGEX in
 * apps/api/src/auth/dto/register.dto.ts — update both together.
 */
export function createPasswordSchema(t: Translator) {
  return z
    .string()
    .min(8, t("passwordMinLength"))
    .max(72, t("passwordMaxLength"))
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      t("passwordComplexity"),
    );
}
