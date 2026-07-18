import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchoolProfileSection } from "./SchoolProfileSection";
import type { SchoolProfile } from "@/lib/api/types";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

const profile: SchoolProfile = {
  id: "1",
  name: "Greenwood High",
  mission: "Empower every learner.",
  foundedYear: 1998,
  address: "123 Main St",
  contactEmail: "info@greenwood.edu",
  contactPhone: "+1 555-1234",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("SchoolProfileSection", () => {
  it("renders the mission, founded year, address, and contact email", async () => {
    render(await SchoolProfileSection({ profile }));

    expect(screen.getByText("Empower every learner.")).toBeInTheDocument();
    expect(screen.getByText("1998")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "info@greenwood.edu" })).toHaveAttribute(
      "href",
      "mailto:info@greenwood.edu",
    );
  });

  it("renders the phone link when contactPhone is present", async () => {
    render(await SchoolProfileSection({ profile }));

    expect(screen.getByRole("link", { name: "+1 555-1234" })).toHaveAttribute(
      "href",
      "tel:+1 555-1234",
    );
  });

  it("omits the phone field entirely when contactPhone is null", async () => {
    render(await SchoolProfileSection({ profile: { ...profile, contactPhone: null } }));

    expect(screen.queryByText("phone")).not.toBeInTheDocument();
  });
});
