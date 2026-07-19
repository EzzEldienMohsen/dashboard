import type { SubjectAverage } from '../interfaces/analytics-repository.interface';

export const STRENGTH_THRESHOLD = 80;
export const WEAKNESS_THRESHOLD = 60;
const MAX_PER_GROUP = 3;

export interface ClassifySubjectsOptions {
  strengthThreshold?: number;
  weaknessThreshold?: number;
  maxPerGroup?: number;
}

export interface SubjectClassification {
  strengths: SubjectAverage[];
  weaknesses: SubjectAverage[];
}

/**
 * Strengths are subjects at/above the threshold (highest first), weaknesses
 * are subjects below the threshold (lowest first) — capped per group. When
 * nothing crosses a threshold, the single best/worst subject is still
 * surfaced so "what's this student good at / what needs work" always has an
 * answer, matching how the dashboard presents it.
 */
export function classifySubjects(
  gradesBySubject: SubjectAverage[],
  options?: ClassifySubjectsOptions,
): SubjectClassification {
  if (gradesBySubject.length === 0) return { strengths: [], weaknesses: [] };

  const strengthThreshold = options?.strengthThreshold ?? STRENGTH_THRESHOLD;
  const weaknessThreshold = options?.weaknessThreshold ?? WEAKNESS_THRESHOLD;
  const maxPerGroup = options?.maxPerGroup ?? MAX_PER_GROUP;

  const byDescending = [...gradesBySubject].sort(
    (a, b) => b.averagePercentage - a.averagePercentage,
  );

  let strengths = byDescending
    .filter((subject) => subject.averagePercentage >= strengthThreshold)
    .slice(0, maxPerGroup);
  let weaknesses = byDescending
    .filter((subject) => subject.averagePercentage < weaknessThreshold)
    .slice(-maxPerGroup)
    .reverse();

  if (strengths.length === 0) strengths = [byDescending[0]];
  if (weaknesses.length === 0) {
    weaknesses = [byDescending[byDescending.length - 1]];
  }

  // A single-subject school/class would otherwise show the same subject as
  // both its own strength and weakness — collapse to strength only.
  if (
    gradesBySubject.length === 1 &&
    strengths[0].subject === weaknesses[0].subject
  ) {
    weaknesses = [];
  }

  return { strengths, weaknesses };
}
