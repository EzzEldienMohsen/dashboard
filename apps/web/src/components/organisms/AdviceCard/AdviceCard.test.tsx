import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdviceCard } from "./AdviceCard";
import type { AdviceItemDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("AdviceCard", () => {
  it("renders each advice item's already-localized message with its subject and severity", () => {
    const advice: AdviceItemDto[] = [
      { subject: "Math", severity: "strength", message: "Great job in Math!" },
      {
        subject: "Science",
        severity: "weakness",
        message: "Needs more practice in Science.",
      },
    ];

    render(<AdviceCard advice={advice} />);

    expect(screen.getByText("Great job in Math!")).toBeInTheDocument();
    expect(
      screen.getByText("Needs more practice in Science."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Math")).toHaveLength(1);
    expect(screen.getAllByText("Science")).toHaveLength(1);
  });

  it("shows the empty-state copy when there is no advice", () => {
    render(<AdviceCard advice={[]} />);

    expect(screen.getByText("noAdvice")).toBeInTheDocument();
  });
});
