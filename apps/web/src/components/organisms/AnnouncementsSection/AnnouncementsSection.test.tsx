import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnouncementsSection } from "./AnnouncementsSection";
import type { PaginatedAnnouncements } from "@/lib/api/types";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const data: PaginatedAnnouncements = {
  items: [
    {
      id: "1",
      title: "Sports Day",
      body: "Body",
      category: "EVENT",
      publishedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Exam Notice",
      body: "Body2",
      category: "EXAM",
      publishedAt: "2026-01-02T00:00:00.000Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 3,
};

describe("AnnouncementsSection", () => {
  it("calls fetchAnnouncements with the given limit and renders the returned cards", async () => {
    const fetchAnnouncements = vi.fn().mockResolvedValue(data);

    render(await AnnouncementsSection({ limit: 3, fetchAnnouncements }));

    expect(fetchAnnouncements).toHaveBeenCalledWith(3);
    expect(screen.getByText("Sports Day")).toBeInTheDocument();
    expect(screen.getByText("Exam Notice")).toBeInTheDocument();
    expect(screen.getByText("heading")).toBeInTheDocument();
  });

  it("renders no cards when fetchAnnouncements returns an empty list", async () => {
    const fetchAnnouncements = vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, page: 1, limit: 3 });

    render(await AnnouncementsSection({ limit: 3, fetchAnnouncements }));

    expect(screen.queryByRole("link", { name: "readMore" })).not.toBeInTheDocument();
    expect(screen.getByText("viewAll")).toBeInTheDocument();
  });
});
