import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NavLink } from "./NavLink";

const usePathnameMock = vi.fn<() => string>();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => usePathnameMock(),
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NavLink", () => {
  it("marks the link active when pathname matches href exactly", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes");
    render(<NavLink href="/dashboard/classes">Classes</NavLink>);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("marks the link active when pathname is nested under href", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes/5");
    render(<NavLink href="/dashboard/classes">Classes</NavLink>);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("leaves the link inactive when pathname doesn't match", () => {
    usePathnameMock.mockReturnValue("/dashboard/students");
    render(<NavLink href="/dashboard/classes">Classes</NavLink>);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("does not treat every nested path as active for the root href", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    render(<NavLink href="/">Home</NavLink>);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("marks the root href active only on an exact match", () => {
    usePathnameMock.mockReturnValue("/");
    render(<NavLink href="/">Home</NavLink>);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("calls onClick when clicked", () => {
    usePathnameMock.mockReturnValue("/dashboard");
    const onClick = vi.fn();
    render(
      <NavLink href="/dashboard" onClick={onClick}>
        Home
      </NavLink>,
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
