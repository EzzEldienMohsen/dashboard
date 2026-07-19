export type PerformanceTier = "success" | "warning" | "error";

const STRONG_THRESHOLD = 80;
const AVERAGE_THRESHOLD = 60;

/**
 * Maps a 0-100 performance percentage to a semantic tier — the single
 * source of truth for "what counts as high/average/low performance" used
 * to color-code class links, strengths/weaknesses badges, the monthly
 * radial gauge, and the improvement-rate indicator consistently.
 */
export function getPerformanceTier(percentage: number): PerformanceTier {
  if (percentage >= STRONG_THRESHOLD) return "success";
  if (percentage >= AVERAGE_THRESHOLD) return "warning";
  return "error";
}

export function getPerformanceBadgeClass(percentage: number): string {
  return `badge-${getPerformanceTier(percentage)}`;
}

export function getPerformanceTextColorClass(percentage: number): string {
  return `text-${getPerformanceTier(percentage)}`;
}
