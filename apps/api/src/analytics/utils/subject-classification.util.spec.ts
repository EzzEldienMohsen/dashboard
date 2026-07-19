import { classifySubjects } from './subject-classification.util';
import type { SubjectAverage } from '../interfaces/analytics-repository.interface';

describe('classifySubjects', () => {
  it('returns empty groups when there are no subjects', () => {
    expect(classifySubjects([])).toEqual({ strengths: [], weaknesses: [] });
  });

  it('classifies subjects at/above 80% as strengths and below 60% as weaknesses', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'Math', averagePercentage: 92 },
      { subject: 'Science', averagePercentage: 55 },
      { subject: 'English', averagePercentage: 70 },
    ];

    const result = classifySubjects(subjects);

    expect(result.strengths).toEqual([
      { subject: 'Math', averagePercentage: 92 },
    ]);
    expect(result.weaknesses).toEqual([
      { subject: 'Science', averagePercentage: 55 },
    ]);
  });

  it('sorts strengths descending and weaknesses ascending', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'A', averagePercentage: 85 },
      { subject: 'B', averagePercentage: 95 },
      { subject: 'C', averagePercentage: 30 },
      { subject: 'D', averagePercentage: 50 },
    ];

    const result = classifySubjects(subjects);

    expect(result.strengths.map((s) => s.subject)).toEqual(['B', 'A']);
    expect(result.weaknesses.map((s) => s.subject)).toEqual(['C', 'D']);
  });

  it('caps each group at maxPerGroup (default 3)', () => {
    const subjects: SubjectAverage[] = Array.from({ length: 5 }, (_, i) => ({
      subject: `Strong${i}`,
      averagePercentage: 90 - i,
    }));

    const result = classifySubjects(subjects);

    expect(result.strengths).toHaveLength(3);
  });

  it('falls back to the single best subject as a strength when none crosses the threshold', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'Math', averagePercentage: 65 },
      { subject: 'Science', averagePercentage: 62 },
    ];

    const result = classifySubjects(subjects);

    expect(result.strengths).toEqual([
      { subject: 'Math', averagePercentage: 65 },
    ]);
  });

  it('falls back to the single worst subject as a weakness when none is below the threshold', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'Math', averagePercentage: 95 },
      { subject: 'Science', averagePercentage: 82 },
    ];

    const result = classifySubjects(subjects);

    expect(result.weaknesses).toEqual([
      { subject: 'Science', averagePercentage: 82 },
    ]);
  });

  it('does not duplicate the same subject as both strength and weakness when only one subject exists', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'Math', averagePercentage: 70 },
    ];

    const result = classifySubjects(subjects);

    expect(result.strengths).toEqual([
      { subject: 'Math', averagePercentage: 70 },
    ]);
    expect(result.weaknesses).toEqual([]);
  });

  it('respects custom thresholds and group size', () => {
    const subjects: SubjectAverage[] = [
      { subject: 'A', averagePercentage: 100 },
      { subject: 'B', averagePercentage: 95 },
      { subject: 'C', averagePercentage: 90 },
    ];

    const result = classifySubjects(subjects, {
      strengthThreshold: 96,
      maxPerGroup: 1,
    });

    expect(result.strengths).toEqual([
      { subject: 'A', averagePercentage: 100 },
    ]);
  });
});
