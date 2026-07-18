import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Select } from "./Select";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("Select", () => {
  it("renders all options", () => {
    render(<Select id="s" name="s" options={options} />);
    expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
  });

  it("renders a disabled placeholder option when provided", () => {
    render(<Select id="s" name="s" options={options} placeholder="Choose one" />);
    const placeholderOption = screen.getByRole("option", { name: "Choose one" });
    expect(placeholderOption).toBeDisabled();
  });

  it("does not render a placeholder option when none is given", () => {
    render(<Select id="s" name="s" options={options} />);
    expect(screen.queryAllByRole("option")).toHaveLength(2);
  });

  it("fires onChange with the selected value", () => {
    const onChange = vi.fn();
    render(<Select id="s" name="s" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies invalid styling and aria-invalid when invalid", () => {
    render(<Select id="s" name="s" options={options} invalid />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select.className).toContain("border-error");
  });

  it("disables the select when disabled", () => {
    render(<Select id="s" name="s" options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
