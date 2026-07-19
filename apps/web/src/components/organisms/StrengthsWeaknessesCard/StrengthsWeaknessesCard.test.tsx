import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StrengthsWeaknessesCard } from "./StrengthsWeaknessesCard";
import type { SubjectAverageDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("StrengthsWeaknessesCard", () => {
  it("renders a badge per strength and weakness subject with its percentage", () => {
    const strengths: SubjectAverageDto[] = [
      { subject: "Math", averagePercentage: 92 },
    ];
    const weaknesses: SubjectAverageDto[] = [
      { subject: "Science", averagePercentage: 55 },
    ];

    render(<StrengthsWeaknessesCard strengths={strengths} weaknesses={weaknesses} />);

    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  it("shows the empty-state copy when there are no strengths or weaknesses", () => {
    render(<StrengthsWeaknessesCard strengths={[]} weaknesses={[]} />);

    expect(screen.getByText("noStrengths")).toBeInTheDocument();
    expect(screen.getByText("noWeaknesses")).toBeInTheDocument();
  });

  it("colors a badge by its actual performance tier, not blindly by which group it's in", () => {
    // classifySubjects() can fall back to surfacing the single best subject
    // as a "strength" even when it's objectively weak (e.g. every subject
    // is in the 40s) — the badge must reflect the real tier, not green.
    const strengths: SubjectAverageDto[] = [
      { subject: "Math", averagePercentage: 48 },
    ];

    render(<StrengthsWeaknessesCard strengths={strengths} weaknesses={[]} />);

    expect(screen.getByText("Math").className).toContain("badge-error");
  });
});
