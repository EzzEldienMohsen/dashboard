import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardShell } from "./DashboardShell";

describe("DashboardShell", () => {
  it("renders its children inside the React Query provider", () => {
    render(
      <DashboardShell>
        <div>dashboard content</div>
      </DashboardShell>,
    );

    expect(screen.getByText("dashboard content")).toBeInTheDocument();
  });
});
