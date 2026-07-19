import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

const localeMock = vi.fn(() => "en");
vi.mock("next-intl", () => ({
  useLocale: () => localeMock(),
}));

describe("StatCard", () => {
  it("renders the label and a locale-formatted count", () => {
    render(<StatCard count={1234} label="Students" />);

    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText((1234).toLocaleString("en"))).toBeInTheDocument();
  });

  it("formats the count using the active locale", () => {
    localeMock.mockReturnValueOnce("ar");
    render(<StatCard count={1234} label="طلاب" />);

    expect(screen.getByText((1234).toLocaleString("ar"))).toBeInTheDocument();
  });
});
