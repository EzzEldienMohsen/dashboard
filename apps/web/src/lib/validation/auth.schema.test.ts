import { describe, expect, it } from "vitest";
import { createLoginSchema, createRegisterSchema, ROLES } from "./auth.schema";

const t = (key: string) => key;

describe("ROLES", () => {
  it("defines MANAGER and TEACHER", () => {
    expect(ROLES).toEqual(["MANAGER", "TEACHER"]);
  });
});

describe("createLoginSchema", () => {
  const schema = createLoginSchema(t);

  it("accepts a valid email and non-empty password", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ email: "not-an-email", password: "anything" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "emailInvalid")).toBe(true);
    }
  });

  it("rejects an empty password", () => {
    const result = schema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "passwordRequired")).toBe(true);
    }
  });
});

describe("createRegisterSchema", () => {
  const schema = createRegisterSchema(t);

  const validPayload = {
    role: "TEACHER" as const,
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+201234567",
    country: "Egypt",
    password: "Passw0rd",
    confirmPassword: "Passw0rd",
  };

  it("accepts a fully valid payload", () => {
    const result = schema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects when password and confirmPassword do not match", () => {
    const result = schema.safeParse({ ...validPayload, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "confirmPassword");
      expect(issue?.message).toBe("passwordsMustMatch");
    }
  });

  it("rejects an invalid role", () => {
    const result = schema.safeParse({ ...validPayload, role: "ADMIN" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing/empty name", () => {
    const result = schema.safeParse({ ...validPayload, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "nameRequired")).toBe(true);
    }
  });

  it("rejects a name longer than 100 characters", () => {
    const result = schema.safeParse({ ...validPayload, name: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "nameTooLong")).toBe(true);
    }
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "emailInvalid")).toBe(true);
    }
  });

  it("rejects an invalid phone number", () => {
    const result = schema.safeParse({ ...validPayload, phone: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "phoneInvalid")).toBe(true);
    }
  });

  it("rejects a missing/empty country", () => {
    const result = schema.safeParse({ ...validPayload, country: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "countryRequired")).toBe(true);
    }
  });

  it("rejects a country name longer than 100 characters", () => {
    const result = schema.safeParse({ ...validPayload, country: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "countryTooLong")).toBe(true);
    }
  });

  it("rejects a weak password", () => {
    const result = schema.safeParse({ ...validPayload, password: "weak", confirmPassword: "weak" });
    expect(result.success).toBe(false);
  });
});
