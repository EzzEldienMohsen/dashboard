import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Creator } from "./types";
import type { Locale } from "@/lib/locale/locales";

const fetchMock = vi.fn();
const getLocaleMock = vi.fn<() => Promise<Locale>>();

vi.mock("next-intl/server", () => ({
  getLocale: () => getLocaleMock(),
}));

// getCreator is wrapped in React's cache(); re-import fresh per test so
// one test's resolved value can't leak into the next under plain Vitest.
async function importCreator() {
  vi.resetModules();
  return import("./creator");
}

describe("getCreator", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    getLocaleMock.mockReset();
    getLocaleMock.mockResolvedValue("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the parsed creator profile on success", async () => {
    const creator: Creator = {
      id: "c1",
      name: "Ezz Eldien Deghedy",
      nameAr: "عز الدين دغيدي",
      role: "Creator & Full-Stack Developer",
      roleAr: "المُنشئ ومطوّر البرمجيات المتكامل",
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript.",
      bioAr: "مطوّر واجهات أمامية متخصص في Next.js وReact وTypeScript.",
      skills: ["React.js", "Next.js", "TypeScript"],
      email: "ezzmohsend@gmail.com",
      githubUrl: "https://github.com/EzzEldienMohsen",
      linkedinUrl: "https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6",
      portfolioUrl: "https://ezz-portfolio.vercel.app",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => creator });

    const { getCreator } = await importCreator();
    const result = await getCreator();

    expect(result).toEqual(creator);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/creator",
      { next: { revalidate: 3600 } },
    );
  });

  it("returns the Arabic name/role/bio when the locale is ar", async () => {
    const creator: Creator = {
      id: "c1",
      name: "Ezz Eldien Deghedy",
      nameAr: "عز الدين دغيدي",
      role: "Creator & Full-Stack Developer",
      roleAr: "المُنشئ ومطوّر البرمجيات المتكامل",
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript.",
      bioAr: "مطوّر واجهات أمامية متخصص في Next.js وReact وTypeScript.",
      skills: ["React.js", "Next.js", "TypeScript"],
      email: "ezzmohsend@gmail.com",
      githubUrl: "https://github.com/EzzEldienMohsen",
      linkedinUrl: "https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6",
      portfolioUrl: "https://ezz-portfolio.vercel.app",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => creator });
    getLocaleMock.mockResolvedValue("ar");

    const { getCreator } = await importCreator();
    const result = await getCreator();

    expect(result.name).toBe("عز الدين دغيدي");
    expect(result.role).toBe("المُنشئ ومطوّر البرمجيات المتكامل");
    expect(result.bio).toBe("مطوّر واجهات أمامية متخصص في Next.js وReact وTypeScript.");
  });

  it("falls back to English when the locale is ar but the Arabic fields are null", async () => {
    const creator: Creator = {
      id: "c1",
      name: "Ezz Eldien Deghedy",
      nameAr: null,
      role: "Creator & Full-Stack Developer",
      roleAr: null,
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript.",
      bioAr: null,
      skills: ["React.js", "Next.js", "TypeScript"],
      email: "ezzmohsend@gmail.com",
      githubUrl: "https://github.com/EzzEldienMohsen",
      linkedinUrl: "https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6",
      portfolioUrl: "https://ezz-portfolio.vercel.app",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => creator });
    getLocaleMock.mockResolvedValue("ar");

    const { getCreator } = await importCreator();
    const result = await getCreator();

    expect(result.name).toBe("Ezz Eldien Deghedy");
    expect(result.role).toBe("Creator & Full-Stack Developer");
    expect(result.bio).toBe(
      "Frontend-focused developer specializing in Next.js, React, and TypeScript.",
    );
  });

  it("returns a neutral fallback when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => ({}),
    });

    const { getCreator } = await importCreator();
    const result = await getCreator();

    expect(result).toMatchObject({
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
    });
    // updatedAt is computed at module load time via `new Date().toISOString()`,
    // so assert shape rather than an exact value.
    expect(typeof result.updatedAt).toBe("string");
    expect(Number.isNaN(new Date(result.updatedAt).getTime())).toBe(false);
  });
});
