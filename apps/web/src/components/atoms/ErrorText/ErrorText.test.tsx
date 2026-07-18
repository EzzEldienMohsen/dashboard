import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorText } from "./ErrorText";

describe("ErrorText", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<ErrorText />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message with role alert and the given id", () => {
    render(<ErrorText id="email-error" message="Email is required" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Email is required");
    expect(alert).toHaveAttribute("id", "email-error");
  });
});
