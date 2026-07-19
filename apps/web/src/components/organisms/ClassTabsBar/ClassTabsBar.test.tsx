import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClassTabsBar } from "./ClassTabsBar";
import * as Sentry from "@sentry/nextjs";
import type { ClassDto } from "@/lib/data";

const usePathnameMock = vi.fn<() => string>();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => usePathnameMock(),
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@sentry/nextjs", () => ({ addBreadcrumb: vi.fn() }));

const CLASSES: ClassDto[] = [
  { id: "c1", name: "Grade 4-A", schoolId: "s1" },
  { id: "c2", name: "Grade 4-B", schoolId: "s1" },
];

describe("ClassTabsBar", () => {
  it("renders one tab per class linking to its detail route", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes/c1");

    render(<ClassTabsBar classes={CLASSES} ariaLabel="Classes" />);

    expect(screen.getByRole("link", { name: "Grade 4-A" })).toHaveAttribute(
      "href",
      "/dashboard/classes/c1",
    );
    expect(screen.getByRole("link", { name: "Grade 4-B" })).toHaveAttribute(
      "href",
      "/dashboard/classes/c2",
    );
  });

  it("marks the tab matching the current pathname as active", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes/c2");

    render(<ClassTabsBar classes={CLASSES} ariaLabel="Classes" />);

    expect(
      screen.getByRole("link", { name: "Grade 4-A" }),
    ).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Grade 4-B" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("adds a Sentry breadcrumb when a tab is clicked", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes/c1");

    render(<ClassTabsBar classes={CLASSES} ariaLabel="Classes" />);
    fireEvent.click(screen.getByRole("link", { name: "Grade 4-B" }));

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "navigation",
        message: "classes-tab-switched",
        data: { classId: "c2" },
      }),
    );
  });

  it("renders nothing when there are no classes", () => {
    usePathnameMock.mockReturnValue("/dashboard/classes");

    const { container } = render(
      <ClassTabsBar classes={[]} ariaLabel="Classes" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
