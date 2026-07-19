import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreatorSection } from "./CreatorSection";
import type { Creator } from "@/lib/api/types";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

const getCreatorMock = vi.fn<() => Promise<Creator>>();
vi.mock("@/lib/api", () => ({
  getCreator: () => getCreatorMock(),
}));

describe("CreatorSection", () => {
  it("renders the creator's name, role, bio, skills, and links", async () => {
    getCreatorMock.mockResolvedValue({
      id: "1",
      name: "Ezz Eldien Deghedy",
      nameAr: null,
      role: "Creator & Full-Stack Developer",
      roleAr: null,
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript.",
      bioAr: null,
      skills: ["React.js", "Next.js"],
      email: "ezzmohsend@gmail.com",
      githubUrl: "https://github.com/EzzEldienMohsen",
      linkedinUrl: "https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6",
      portfolioUrl: "https://ezz-portfolio.vercel.app",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    render(await CreatorSection());

    expect(screen.getByText("Ezz Eldien Deghedy")).toBeInTheDocument();
    expect(screen.getByText("Creator & Full-Stack Developer")).toBeInTheDocument();
    expect(
      screen.getByText("Frontend-focused developer specializing in Next.js, React, and TypeScript."),
    ).toBeInTheDocument();
    expect(screen.getByText("React.js")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "github" })).toHaveAttribute(
      "href",
      "https://github.com/EzzEldienMohsen",
    );
    expect(screen.getByRole("link", { name: "email" })).toHaveAttribute(
      "href",
      "mailto:ezzmohsend@gmail.com",
    );
    expect(screen.queryByText(/555/)).not.toBeInTheDocument();
  });

  it("renders nothing when no creator profile is configured", async () => {
    getCreatorMock.mockResolvedValue({
      id: "",
      name: "",
      nameAr: null,
      role: "",
      roleAr: null,
      bio: "",
      bioAr: null,
      skills: [],
      email: null,
      githubUrl: null,
      linkedinUrl: null,
      portfolioUrl: null,
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    const result = await CreatorSection();
    expect(result).toBeNull();
  });
});
