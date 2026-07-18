import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthPageTemplate } from "./AuthPageTemplate";

describe("AuthPageTemplate", () => {
  it("renders the title, subtitle, and children", () => {
    render(
      <AuthPageTemplate title="Welcome back" subtitle="Log in to continue">
        <div>form contents</div>
      </AuthPageTemplate>,
    );

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByText("Log in to continue")).toBeInTheDocument();
    expect(screen.getByText("form contents")).toBeInTheDocument();
    expect(screen.queryByText(/footer/i)).not.toBeInTheDocument();
  });

  it("renders the footerSlot when provided", () => {
    render(
      <AuthPageTemplate
        title="Welcome back"
        subtitle="Log in to continue"
        footerSlot={<span>Don&apos;t have an account?</span>}
      >
        <div>form contents</div>
      </AuthPageTemplate>,
    );

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it("omits the footer wrapper entirely when footerSlot is not provided", () => {
    const { container } = render(
      <AuthPageTemplate title="Welcome back" subtitle="Log in to continue">
        <div>form contents</div>
      </AuthPageTemplate>,
    );

    expect(container.querySelector(".mt-6")).not.toBeInTheDocument();
  });
});
