import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label and a locale-formatted count", () => {
    render(<StatCard count={1234} label="Students" />);

    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText((1234).toLocaleString())).toBeInTheDocument();
  });
});
