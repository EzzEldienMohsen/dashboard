import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import type { AuthActionState } from "@/app/[locale]/(auth)/action-state";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("LoginForm", () => {
  it("renders email/password fields wired to the injected action", () => {
    const action = vi.fn();
    render(
      <LoginForm action={action} initialState={{ status: "idle" }} />,
    );

    expect(screen.getByPlaceholderText("emailPlaceholder")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
  });

  it("renders field-level and form-level errors from initialState", () => {
    const action = vi.fn();
    const initialState: AuthActionState = {
      status: "error",
      fieldErrors: { email: "emailExists" },
      formError: "invalidCredentials",
    };

    render(<LoginForm action={action} initialState={initialState} />);

    expect(screen.getByText("emailExists")).toBeInTheDocument();
    expect(screen.getByText("invalidCredentials")).toBeInTheDocument();
  });
});
