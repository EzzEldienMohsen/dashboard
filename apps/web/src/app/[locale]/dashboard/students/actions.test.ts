import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudents } from "@/lib/data";
import type { CurrentUser } from "@/lib/auth/session";
import type { PaginatedResult, StudentDto } from "@/lib/data";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getStudents: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedGetStudents = vi.mocked(getStudents);

const USER: CurrentUser = {
  id: "user-1",
  email: "teacher@school.dev",
  role: "TEACHER",
  schoolId: "school-1",
  accessToken: "token-1",
};

describe("fetchStudentsAction", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockedGetStudents.mockReset();
  });

  it("returns null and does not call getStudents when there is no current user", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const { fetchStudentsAction } = await import("./actions");

    const result = await fetchStudentsAction(1);

    expect(result).toBeNull();
    expect(mockedGetStudents).not.toHaveBeenCalled();
  });

  it("delegates to getStudents with the user's access token, page and limit", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    const page: PaginatedResult<StudentDto> = {
      items: [{ id: "s1", firstName: "A", lastName: "B", classId: "c1" }],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockedGetStudents.mockResolvedValue(page);
    const { fetchStudentsAction } = await import("./actions");

    const result = await fetchStudentsAction(1);

    expect(mockedGetStudents).toHaveBeenCalledWith("token-1", 1, 20, undefined);
    expect(result).toEqual(page);
  });

  it("forwards an optional classId filter to getStudents", async () => {
    mockedGetCurrentUser.mockResolvedValue(USER);
    mockedGetStudents.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      limit: 20,
    });
    const { fetchStudentsAction } = await import("./actions");

    await fetchStudentsAction(2, "class-42");

    expect(mockedGetStudents).toHaveBeenCalledWith("token-1", 2, 20, "class-42");
  });
});
