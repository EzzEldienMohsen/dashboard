import { z } from "zod";

/**
 * Kept byte-for-byte identical to PHONE_REGEX in
 * apps/api/src/auth/dto/register.dto.ts — update both together.
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Phone must be a valid phone number");

/**
 * Kept byte-for-byte identical to PASSWORD_COMPLEXITY_REGEX in
 * apps/api/src/auth/dto/register.dto.ts — update both together.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one digit",
  );
