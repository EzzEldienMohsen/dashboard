import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSection } from "./StatsSection";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/lib/api", () => ({
  getPublicStats: vi.fn().mockResolvedValue({
    schoolsCount: 12,
    studentsCount: 3400,
    teachersCount: 210,
  }),
}));

describe("StatsSection", () => {
  it("renders a StatCard for schools, students, and teachers with the fetched counts", async () => {
    render(await StatsSection());

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3,400")).toBeInTheDocument();
    expect(screen.getByText("210")).toBeInTheDocument();

    expect(screen.getByText("schools")).toBeInTheDocument();
    expect(screen.getByText("students")).toBeInTheDocument();
    expect(screen.getByText("teachers")).toBeInTheDocument();
  });
});
