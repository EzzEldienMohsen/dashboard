import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders a text input by default", () => {
    render(<TextInput id="name" name="name" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("renders the given type", () => {
    render(<TextInput id="age" name="age" type="number" />);
    const input = document.getElementById("age") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("applies invalid styling and aria-invalid when invalid", () => {
    render(<TextInput id="name" name="name" invalid />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("border-error");
  });

  it("does not mark the field invalid by default", () => {
    render(<TextInput id="name" name="name" />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input.className).toContain("border-base-300");
  });

  it("merges a custom className", () => {
    render(<TextInput id="name" name="name" className="mt-2" />);
    expect(screen.getByRole("textbox").className).toContain("mt-2");
  });

  it("fires onChange handlers", () => {
    const onChange = vi.fn();
    render(<TextInput id="name" name="name" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ada" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
