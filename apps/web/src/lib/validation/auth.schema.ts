import { z } from "zod";
import { passwordSchema, phoneSchema } from "./shared";

export const ROLES = ["MANAGER", "TEACHER"] as const;
export type Role = (typeof ROLES)[number];

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(ROLES, "Select a role"),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.email("Enter a valid email address"),
    phone: phoneSchema,
    country: z
      .string()
      .min(1, "Country is required")
      .max(100, "Country is too long"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords must match",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
