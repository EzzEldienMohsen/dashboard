export const CATEGORY_BADGE_CLASS: Record<string, string> = {
  GENERAL: "badge-neutral",
  EVENT: "badge-info",
  EXAM: "badge-warning",
  HOLIDAY: "badge-success",
  URGENT: "badge-error",
};

export function getCategoryBadgeClass(category: string): string {
  return CATEGORY_BADGE_CLASS[category] ?? "badge-neutral";
}
