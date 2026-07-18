import { describe, expect, it } from "vitest";
import { createPasswordSchema, createPhoneSchema } from "./shared";

const t = (key: string) => key;

describe("createPhoneSchema", () => {
  const schema = createPhoneSchema(t);

  it.each(["+201234567", "0123456789", "01234567890123", "+1 234-567-890"])(
    "accepts a valid phone number: %s",
    (value) => {
      expect(schema.safeParse(value).success).toBe(true);
    },
  );

  it("rejects a phone number that is too short", () => {
    const result = schema.safeParse("123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("phoneInvalid");
    }
  });

  it("rejects a phone number that is too long", () => {
    const result = schema.safeParse("1".repeat(21));
    expect(result.success).toBe(false);
  });

  it("rejects a phone number with invalid characters", () => {
    const result = schema.safeParse("abcdefghij");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("phoneInvalid");
    }
  });
});

describe("createPasswordSchema", () => {
  const schema = createPasswordSchema(t);

  it("accepts a password meeting length and complexity requirements", () => {
    expect(schema.safeParse("Passw0rd").success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = schema.safeParse("Pw0aaaa");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "passwordMinLength")).toBe(true);
    }
  });

  it("rejects a password longer than 72 characters", () => {
    const longPassword = `Aa1${"a".repeat(70)}`;
    const result = schema.safeParse(longPassword);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "passwordMaxLength")).toBe(true);
    }
  });

  it("rejects a password missing an uppercase letter", () => {
    const result = schema.safeParse("password1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "passwordComplexity")).toBe(true);
    }
  });

  it("rejects a password missing a lowercase letter", () => {
    const result = schema.safeParse("PASSWORD1");
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a digit", () => {
    const result = schema.safeParse("Password");
    expect(result.success).toBe(false);
  });
});
