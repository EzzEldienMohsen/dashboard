import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnouncementCard } from "./AnnouncementCard";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AnnouncementCard", () => {
  it("renders title, category badge, and truncates a long body", () => {
    const longBody = "x".repeat(200);
    render(
      <AnnouncementCard
        id="ann-1"
        title="Sports Day"
        body={longBody}
        category="EVENT"
        categoryLabel="Event"
        readMoreLabel="Read more"
        publishedAt="2026-07-18T00:00:00.000Z"
      />,
    );

    expect(screen.getByText("Sports Day")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText(/x+…$/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read more" })).toHaveAttribute(
      "href",
      "/announcements/ann-1",
    );
  });

  it("renders the body unmodified when short enough", () => {
    render(
      <AnnouncementCard
        id="ann-2"
        title="Short notice"
        body="Back to school on Monday."
        category="GENERAL"
        categoryLabel="General"
        readMoreLabel="Read more"
        publishedAt="2026-07-18T00:00:00.000Z"
      />,
    );

    expect(screen.getByText("Back to school on Monday.")).toBeInTheDocument();
  });
});
