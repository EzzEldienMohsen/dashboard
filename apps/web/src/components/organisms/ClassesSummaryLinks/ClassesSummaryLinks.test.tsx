import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassesSummaryLinks } from "./ClassesSummaryLinks";
import type { ClassSummaryDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const CLASSES: ClassSummaryDto[] = [
  {
    classId: "class-1",
    className: "Grade 4-A",
    attendanceRatePercentage: 90,
    attendanceBreakdown: { present: 9, absent: 1, late: 0, excused: 0 },
    averageGradePercentage: 88,
    gradesBySubject: [],
  },
  {
    classId: "class-2",
    className: "Grade 4-B",
    attendanceRatePercentage: 70,
    attendanceBreakdown: { present: 7, absent: 3, late: 0, excused: 0 },
    averageGradePercentage: 52,
    gradesBySubject: [],
  },
];

describe("ClassesSummaryLinks", () => {
  it("renders one link per class pointing at its detail route, badge-colored by performance", () => {
    render(<ClassesSummaryLinks classes={CLASSES} />);

    const strongLink = screen.getByRole("link", { name: /Grade 4-A/ });
    expect(strongLink).toHaveAttribute("href", "/dashboard/classes/class-1");
    expect(screen.getByText("88%").className).toContain("badge-success");

    const weakLink = screen.getByRole("link", { name: /Grade 4-B/ });
    expect(weakLink).toHaveAttribute("href", "/dashboard/classes/class-2");
    expect(screen.getByText("52%").className).toContain("badge-error");
  });

  it("renders nothing when there are no classes", () => {
    const { container } = render(<ClassesSummaryLinks classes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
