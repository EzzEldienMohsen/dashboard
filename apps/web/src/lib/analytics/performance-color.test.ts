import { describe, expect, it } from "vitest";
import {
  getPerformanceBadgeClass,
  getPerformanceTextColorClass,
  getPerformanceTier,
} from "./performance-color";

describe("getPerformanceTier", () => {
  it("returns success at and above 80", () => {
    expect(getPerformanceTier(80)).toBe("success");
    expect(getPerformanceTier(95)).toBe("success");
  });

  it("returns warning between 60 and 79", () => {
    expect(getPerformanceTier(60)).toBe("warning");
    expect(getPerformanceTier(79)).toBe("warning");
  });

  it("returns error below 60", () => {
    expect(getPerformanceTier(59)).toBe("error");
    expect(getPerformanceTier(0)).toBe("error");
  });
});

describe("getPerformanceBadgeClass", () => {
  it("prefixes the tier with badge-", () => {
    expect(getPerformanceBadgeClass(90)).toBe("badge-success");
    expect(getPerformanceBadgeClass(65)).toBe("badge-warning");
    expect(getPerformanceBadgeClass(30)).toBe("badge-error");
  });
});

describe("getPerformanceTextColorClass", () => {
  it("prefixes the tier with text-", () => {
    expect(getPerformanceTextColorClass(90)).toBe("text-success");
    expect(getPerformanceTextColorClass(65)).toBe("text-warning");
    expect(getPerformanceTextColorClass(30)).toBe("text-error");
  });
});
