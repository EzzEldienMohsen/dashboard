export const CATEGORY_BADGE_CLASS: Record<string, string> = {
  URGENT: "badge-error",
  EXAM: "badge-warning",
  EVENT: "badge-info",
  HOLIDAY: "badge-success",
  GENERAL: "badge-neutral",
};

export function getCategoryBadgeClass(category: string): string {
  return CATEGORY_BADGE_CLASS[category] ?? "badge-neutral";
}
