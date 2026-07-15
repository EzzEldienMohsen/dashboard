import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validConfig = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'a'.repeat(16),
  };

  it('accepts a minimal valid config and applies documented defaults', () => {
    const result = validateEnv(validConfig);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.JWT_EXPIRES_IN).toBe('1h');
    expect(result.BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('coerces PORT and BCRYPT_SALT_ROUNDS from string env values', () => {
    const result = validateEnv({
      ...validConfig,
      PORT: '4000',
      BCRYPT_SALT_ROUNDS: '10',
    });

    expect(result.PORT).toBe(4000);
    expect(result.BCRYPT_SALT_ROUNDS).toBe(10);
  });

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validConfig;
    void _omit;

    expect(() => validateEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('throws when JWT_SECRET is shorter than 16 characters', () => {
    expect(() => validateEnv({ ...validConfig, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('throws when NODE_ENV is not one of the allowed values', () => {
    expect(() =>
      validateEnv({ ...validConfig, NODE_ENV: 'staging' }),
    ).toThrow();
  });

  it('throws when BCRYPT_SALT_ROUNDS is outside the [4,15] range', () => {
    expect(() =>
      validateEnv({ ...validConfig, BCRYPT_SALT_ROUNDS: '20' }),
    ).toThrow();
  });

  it('accepts optional SENTRY_DSN and CORS_ORIGIN when provided', () => {
    const result = validateEnv({
      ...validConfig,
      SENTRY_DSN: 'https://example.ingest.sentry.io/1',
      CORS_ORIGIN: 'https://app.example.com',
    });

    expect(result.SENTRY_DSN).toBe('https://example.ingest.sentry.io/1');
    expect(result.CORS_ORIGIN).toBe('https://app.example.com');
  });

  it('aggregates multiple validation issues into a single readable error', () => {
    expect(() => validateEnv({})).toThrow(
      /DATABASE_URL.*JWT_SECRET|JWT_SECRET.*DATABASE_URL/s,
    );
  });
});
