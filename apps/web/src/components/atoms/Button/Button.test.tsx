import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("applies the primary variant by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });

  it("applies the secondary variant classes when requested", () => {
    render(<Button variant="secondary">Cancel</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-base-100");
    expect(button.className).toContain("border-base-300");
  });

  it("applies the ghost variant classes when requested", () => {
    render(<Button variant="ghost">Skip</Button>);
    expect(screen.getByRole("button").className).toContain("hover:bg-primary/10");
  });

  it("merges a custom className with the variant classes", () => {
    render(<Button className="mt-4">Save</Button>);
    expect(screen.getByRole("button").className).toContain("mt-4");
  });

  it("disables the button and shows a spinner while loading", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("disables the button when disabled is passed directly", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not render a spinner when not loading", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button").querySelector("svg")).not.toBeInTheDocument();
  });

  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
