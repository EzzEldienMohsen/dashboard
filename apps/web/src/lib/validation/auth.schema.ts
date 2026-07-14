import { z } from "zod";
import { createPasswordSchema, createPhoneSchema } from "./shared";

type Translator = (key: string) => string;

export const ROLES = ["MANAGER", "TEACHER"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Factories, not static schema objects — error messages must come from the
 * caller's resolved locale (via next-intl), which is only known at request
 * time inside a Server Action, not at module load.
 */
export function createLoginSchema(t: Translator) {
  return z.object({
    email: z.email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export function createRegisterSchema(t: Translator) {
  return z
    .object({
      role: z.enum(ROLES, t("roleRequired")),
      name: z.string().min(1, t("nameRequired")).max(100, t("nameTooLong")),
      email: z.email(t("emailInvalid")),
      phone: createPhoneSchema(t),
      country: z
        .string()
        .min(1, t("countryRequired"))
        .max(100, t("countryTooLong")),
      password: createPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: "custom",
          message: t("passwordsMustMatch"),
        });
      }
    });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;
