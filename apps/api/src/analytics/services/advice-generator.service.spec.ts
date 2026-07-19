import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AdviceGeneratorService } from './advice-generator.service';

describe('AdviceGeneratorService', () => {
  let service: AdviceGeneratorService;
  let i18n: jest.Mocked<Pick<I18nService, 't'>>;

  beforeEach(async () => {
    i18n = { t: jest.fn().mockReturnValue('translated message') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdviceGeneratorService,
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = moduleRef.get(AdviceGeneratorService);
  });

  it('generates a strength advice item per strength subject', () => {
    const result = service.generate(
      [{ subject: 'Math', averagePercentage: 92 }],
      [],
      'en',
    );

    expect(result).toEqual([
      { subject: 'Math', severity: 'strength', message: 'translated message' },
    ]);
    expect(i18n.t).toHaveBeenCalledWith('advice.strength', {
      lang: 'en',
      args: { subject: 'Math', percentage: 92 },
    });
  });

  it('uses the relative-strength key when the best subject still falls below the strength threshold', () => {
    service.generate([{ subject: 'Math', averagePercentage: 48 }], [], 'en');

    expect(i18n.t).toHaveBeenCalledWith('advice.relativeStrength', {
      lang: 'en',
      args: { subject: 'Math', percentage: 48 },
    });
  });

  it('uses the mild weakness key when the average is at or above the severe threshold', () => {
    service.generate([], [{ subject: 'Science', averagePercentage: 55 }], 'en');

    expect(i18n.t).toHaveBeenCalledWith('advice.weakness', {
      lang: 'en',
      args: { subject: 'Science', percentage: 55 },
    });
  });

  it('uses the severe weakness key when the average is below 40%', () => {
    service.generate([], [{ subject: 'Science', averagePercentage: 30 }], 'en');

    expect(i18n.t).toHaveBeenCalledWith('advice.weaknessSevere', {
      lang: 'en',
      args: { subject: 'Science', percentage: 30 },
    });
  });

  it('passes the requested locale through to the translator', () => {
    service.generate([{ subject: 'Math', averagePercentage: 92 }], [], 'ar');

    expect(i18n.t).toHaveBeenCalledWith(
      'advice.strength',
      expect.objectContaining({ lang: 'ar' }),
    );
  });

  it('combines strengths and weaknesses in the returned list', () => {
    const result = service.generate(
      [{ subject: 'Math', averagePercentage: 92 }],
      [{ subject: 'Science', averagePercentage: 30 }],
      'en',
    );

    expect(result).toHaveLength(2);
    expect(result[0].severity).toBe('strength');
    expect(result[1].severity).toBe('weakness');
  });
});
