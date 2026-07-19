import {
  STRENGTH_RULES,
  WEAKNESS_RULES,
  resolveMessageKey,
} from './advice-rules';

describe('resolveMessageKey', () => {
  describe('with STRENGTH_RULES', () => {
    it('resolves to the strength key at or above the threshold', () => {
      expect(resolveMessageKey(STRENGTH_RULES, 80)).toBe('advice.strength');
      expect(resolveMessageKey(STRENGTH_RULES, 95)).toBe('advice.strength');
    });

    it('falls back to the relative-strength key below the threshold', () => {
      expect(resolveMessageKey(STRENGTH_RULES, 79)).toBe(
        'advice.relativeStrength',
      );
      expect(resolveMessageKey(STRENGTH_RULES, 48)).toBe(
        'advice.relativeStrength',
      );
    });
  });

  describe('with WEAKNESS_RULES', () => {
    it('resolves to the severe key below the severe threshold', () => {
      expect(resolveMessageKey(WEAKNESS_RULES, 39)).toBe(
        'advice.weaknessSevere',
      );
      expect(resolveMessageKey(WEAKNESS_RULES, 0)).toBe(
        'advice.weaknessSevere',
      );
    });

    it('falls back to the mild weakness key at or above the severe threshold', () => {
      expect(resolveMessageKey(WEAKNESS_RULES, 40)).toBe('advice.weakness');
      expect(resolveMessageKey(WEAKNESS_RULES, 59)).toBe('advice.weakness');
    });
  });

  it('throws when given a rule list with no catch-all (defensive — should never happen with the exported lists)', () => {
    expect(() =>
      resolveMessageKey(
        [{ appliesTo: () => false, messageKey: 'advice.strength' }],
        50,
      ),
    ).toThrow(/No advice rule matched/);
  });
});
