import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth/session";
import { getClasses } from "@/lib/data";
import type { CurrentUser } from "@/lib/auth/session";
import type { ClassDto, PaginatedResult } from "@/lib/data";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getClasses: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedGetClasses = vi.mocked(getClasses);

const USER: CurrentUser = {
  id: "user-1",
  email: "manager@school.dev",
  role: "MANAGER",
  schoolId: "school-1",
  accessToken: "token-1",
};

describe("fetchClassesAction", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedGetClasses.mockReset();
  });

  it("returns null and does not call getClasses when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchClassesAction } = await import("./actions");

    const result = await fetchClassesAction(1);

    expect(result).toBeNull();
    expect(mockedGetClasses).not.toHaveBeenCalled();
  });

  it("delegates to getClasses with the user's access token and the requested page", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const page: PaginatedResult<ClassDto> = {
      items: [{ id: "c1", name: "Class 1", schoolId: "school-1" }],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockedGetClasses.mockResolvedValue(page);
    const { fetchClassesAction } = await import("./actions");

    const result = await fetchClassesAction(1);

    expect(mockedGetClasses).toHaveBeenCalledWith("token-1", 1);
    expect(result).toEqual(page);
  });
});
