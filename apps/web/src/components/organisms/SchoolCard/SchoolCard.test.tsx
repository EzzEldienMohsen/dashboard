import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchoolCard } from "./SchoolCard";
import type { SchoolDto } from "@/lib/data";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("SchoolCard", () => {
  it("renders the school name and address when present", async () => {
    const school: SchoolDto = { id: "1", name: "Greenwood High", address: "123 Main St" };

    render(await SchoolCard({ school }));

    expect(screen.getByRole("heading", { name: "Greenwood High" })).toBeInTheDocument();
    expect(screen.getByText("address")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("falls back to the noAddress translation when address is null", async () => {
    const school: SchoolDto = { id: "2", name: "No Address School", address: null };

    render(await SchoolCard({ school }));

    expect(screen.getByText("noAddress")).toBeInTheDocument();
  });
});
