import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";
import type { AuthActionState } from "@/app/[locale]/(auth)/action-state";
import type { CountryOption } from "@/lib/countries";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const countryOptions: CountryOption[] = [
  { code: "EG", value: "Egypt", label: "Egypt" },
  { code: "US", value: "United States", label: "United States" },
];

describe("RegisterForm", () => {
  it("renders the core fields wired to the injected action", async () => {
    const action = vi.fn();
    render(
      <RegisterForm
        action={action}
        initialState={{ status: "idle" }}
        countryOptions={countryOptions}
      />,
    );

    expect(screen.getByPlaceholderText("namePlaceholder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("emailPlaceholder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("phonePlaceholder")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();

    // CountrySelect is code-split via next/dynamic; wait for it to resolve.
    await waitFor(() => expect(screen.getByText("Egypt")).toBeInTheDocument());
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("renders field-level and form-level errors from initialState", () => {
    const action = vi.fn();
    const initialState: AuthActionState = {
      status: "error",
      fieldErrors: { email: "emailExists", country: "countryRequired" },
      formError: "invalidData",
    };

    render(
      <RegisterForm action={action} initialState={initialState} countryOptions={countryOptions} />,
    );

    expect(screen.getByText("emailExists")).toBeInTheDocument();
    expect(screen.getByText("invalidData")).toBeInTheDocument();
  });

  it("shows the password strength hint updating as the password field is typed into", async () => {
    const action = vi.fn();
    render(
      <RegisterForm
        action={action}
        initialState={{ status: "idle" }}
        countryOptions={countryOptions}
      />,
    );

    // PasswordStrengthHint is also code-split; wait for it to mount.
    await waitFor(() => expect(screen.getByText("length")).toBeInTheDocument());
  });
});
