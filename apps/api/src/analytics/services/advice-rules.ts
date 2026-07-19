import { STRENGTH_THRESHOLD } from '../utils/subject-classification.util';

const SEVERE_WEAKNESS_THRESHOLD = 40;

export type AdviceMessageKey =
  | 'advice.strength'
  | 'advice.relativeStrength'
  | 'advice.weakness'
  | 'advice.weaknessSevere';

export interface AdviceRule {
  appliesTo(percentage: number): boolean;
  messageKey: AdviceMessageKey;
}

/**
 * Ordered rule lists instead of inline branching — adding a new advice
 * tier (e.g. a future "exceptional" tier above 95%) means inserting a new
 * rule object before the catch-all, not editing existing rules (Open/Closed).
 * Each list's last entry must stay a catch-all (`appliesTo` always true) so
 * `resolveMessageKey` always resolves to something.
 */
export const STRENGTH_RULES: AdviceRule[] = [
  {
    appliesTo: (percentage) => percentage >= STRENGTH_THRESHOLD,
    messageKey: 'advice.strength',
  },
  { appliesTo: () => true, messageKey: 'advice.relativeStrength' },
];

export const WEAKNESS_RULES: AdviceRule[] = [
  {
    appliesTo: (percentage) => percentage < SEVERE_WEAKNESS_THRESHOLD,
    messageKey: 'advice.weaknessSevere',
  },
  { appliesTo: () => true, messageKey: 'advice.weakness' },
];

export function resolveMessageKey(
  rules: AdviceRule[],
  percentage: number,
): AdviceMessageKey {
  const rule = rules.find((candidate) => candidate.appliesTo(percentage));
  if (!rule) {
    throw new Error(
      'No advice rule matched — rule lists must end with a catch-all',
    );
  }
  return rule.messageKey;
}
