import { describe, expect, it } from "vitest";
import { DASHBOARD_NAV_LINKS } from "./dashboard-nav-links";

describe("DASHBOARD_NAV_LINKS", () => {
  it("contains the expected dashboard nav entries", () => {
    expect(DASHBOARD_NAV_LINKS).toEqual([
      { href: "/dashboard", labelKey: "overview", roles: ["MANAGER"] },
      { href: "/dashboard/classes", labelKey: "classes", roles: ["MANAGER", "TEACHER"] },
      { href: "/dashboard/students", labelKey: "students", roles: ["MANAGER", "TEACHER"] },
    ]);
  });

  it("restricts the overview link to managers only", () => {
    const overview = DASHBOARD_NAV_LINKS.find((link) => link.href === "/dashboard");
    expect(overview?.roles).toEqual(["MANAGER"]);
  });

  it("grants classes and students links to both managers and teachers", () => {
    const rest = DASHBOARD_NAV_LINKS.filter((link) => link.href !== "/dashboard");
    for (const link of rest) {
      expect(link.roles).toEqual(expect.arrayContaining(["MANAGER", "TEACHER"]));
    }
  });
});
