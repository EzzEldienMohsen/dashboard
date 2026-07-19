import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AnnouncementsList } from "./AnnouncementsList";
import type { Announcement } from "@/lib/api/types";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Sports Day",
    titleAr: null,
    body: "Body 1",
    bodyAr: null,
    category: "EVENT",
    publishedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Exam Schedule",
    titleAr: null,
    body: "Body 2",
    bodyAr: null,
    category: "EXAM",
    publishedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    title: "General Notice",
    titleAr: null,
    body: "Body 3",
    bodyAr: null,
    category: "GENERAL",
    publishedAt: "2026-01-03T00:00:00.000Z",
  },
];

describe("AnnouncementsList", () => {
  it("renders every announcement under the ALL tab by default", () => {
    render(<AnnouncementsList announcements={announcements} />);

    expect(screen.getByText("Sports Day")).toBeInTheDocument();
    expect(screen.getByText("Exam Schedule")).toBeInTheDocument();
    expect(screen.getByText("General Notice")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "categories.ALL" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("filters to only the selected category when its tab is clicked", () => {
    render(<AnnouncementsList announcements={announcements} />);

    fireEvent.click(screen.getByRole("tab", { name: "categories.EVENT" }));

    expect(screen.getByText("Sports Day")).toBeInTheDocument();
    expect(screen.queryByText("Exam Schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("General Notice")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "categories.EVENT" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "categories.ALL" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("shows the empty state when there are no announcements to display", () => {
    render(<AnnouncementsList announcements={[]} />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });
});
