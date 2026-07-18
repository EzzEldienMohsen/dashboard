import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Theme } from "./theme-cookie";
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE_SECONDS } from "./theme-cookie";

const cookiesSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: cookiesSet })),
}));

describe("setThemeAction", () => {
  beforeEach(() => {
    cookiesSet.mockReset();
  });

  it("sets the theme cookie for a valid theme", async () => {
    const { setThemeAction } = await import("./set-theme-action");

    await setThemeAction("schooldark");

    expect(cookiesSet).toHaveBeenCalledWith(THEME_COOKIE, "schooldark", {
      path: "/",
      maxAge: THEME_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  });

  it("sets the cookie for the other valid theme too", async () => {
    const { setThemeAction } = await import("./set-theme-action");

    await setThemeAction("schoollight");

    expect(cookiesSet).toHaveBeenCalledWith(
      THEME_COOKIE,
      "schoollight",
      expect.objectContaining({ path: "/" }),
    );
  });

  it("does not set the cookie for an invalid theme", async () => {
    const { setThemeAction } = await import("./set-theme-action");

    await setThemeAction("bogus" as unknown as Theme);

    expect(cookiesSet).not.toHaveBeenCalled();
  });
});
