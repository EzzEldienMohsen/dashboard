import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children inside the card shell", () => {
    render(
      <Card>
        <p>Body content</p>
      </Card>,
    );

    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders a title as an h2 by default", () => {
    render(<Card title="Attendance breakdown">Body</Card>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Attendance breakdown" }),
    ).toBeInTheDocument();
  });

  it("renders no heading at all when title is omitted", () => {
    render(<Card>Body</Card>);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders the title at a custom heading level when titleAs is provided", () => {
    render(
      <Card title="Grade 4-A" titleAs="h3">
        Body
      </Card>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Grade 4-A" }),
    ).toBeInTheDocument();
  });

  it("renders the action slot next to the title", () => {
    render(
      <Card title="Attendance breakdown" action={<span>90%</span>}>
        Body
      </Card>,
    );

    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders a title with no action as a plain heading, not wrapped in a flex row (so section-level text-center still centers it)", () => {
    render(
      <Card title="Improvement rate" className="text-center">
        Body
      </Card>,
    );

    const heading = screen.getByRole("heading", { name: "Improvement rate" });
    expect(heading.parentElement?.tagName).toBe("SECTION");
  });

  it("merges a custom className with the default shell classes", () => {
    const { container } = render(<Card className="text-center">Body</Card>);

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-2xl");
    expect(section?.className).toContain("text-center");
  });
});
