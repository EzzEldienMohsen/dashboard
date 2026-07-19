import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { SubjectAverage } from '../interfaces/analytics-repository.interface';
import {
  STRENGTH_RULES,
  WEAKNESS_RULES,
  resolveMessageKey,
} from './advice-rules';

export type AdviceSeverity = 'strength' | 'weakness';

export interface AdviceItem {
  subject: string;
  severity: AdviceSeverity;
  message: string;
}

/**
 * Turns strength/weakness classifications into localized advice sentences.
 * Kept separate from AnalyticsService/classifySubjects so numeric
 * classification (what's strong/weak) stays independent from copy
 * generation (how to phrase it, in which language) — one class per
 * responsibility. Which message key applies per subject comes from the
 * `STRENGTH_RULES`/`WEAKNESS_RULES` ordered rule lists (see advice-rules.ts),
 * not inline branching here.
 */
@Injectable()
export class AdviceGeneratorService {
  constructor(private readonly i18n: I18nService) {}

  generate(
    strengths: SubjectAverage[],
    weaknesses: SubjectAverage[],
    lang: string,
  ): AdviceItem[] {
    const strengthAdvice = strengths.map((subject) => ({
      subject: subject.subject,
      severity: 'strength' as const,
      message: this.i18n.t(
        resolveMessageKey(STRENGTH_RULES, subject.averagePercentage),
        {
          lang,
          args: {
            subject: subject.subject,
            percentage: subject.averagePercentage,
          },
        },
      ),
    }));

    const weaknessAdvice = weaknesses.map((subject) => ({
      subject: subject.subject,
      severity: 'weakness' as const,
      message: this.i18n.t(
        resolveMessageKey(WEAKNESS_RULES, subject.averagePercentage),
        {
          lang,
          args: {
            subject: subject.subject,
            percentage: subject.averagePercentage,
          },
        },
      ),
    }));

    return [...strengthAdvice, ...weaknessAdvice];
  }
}
