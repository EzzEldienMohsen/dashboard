import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
  it("renders its children and htmlFor", () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email");
  });

  it("does not render a required marker by default", () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders a required marker when required is true", () => {
    render(
      <Label htmlFor="email" required>
        Email
      </Label>,
    );
    const marker = screen.getByText("*");
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });
});
