import { ConfigService } from '@nestjs/config';
import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';

describe('BcryptPasswordHasher', () => {
  function makeHasher(saltRounds?: number): BcryptPasswordHasher {
    const config = {
      get: jest.fn().mockReturnValue(saltRounds ?? 4),
    } as unknown as ConfigService;
    return new BcryptPasswordHasher(config);
  }

  it('hashes a plaintext password to a bcrypt digest', async () => {
    const hasher = makeHasher(4);

    const hash = await hasher.hash('Password123!');

    expect(hash).not.toBe('Password123!');
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('compare resolves true for the original password against its hash', async () => {
    const hasher = makeHasher(4);
    const hash = await hasher.hash('Password123!');

    await expect(hasher.compare('Password123!', hash)).resolves.toBe(true);
  });

  it('compare resolves false for a wrong password', async () => {
    const hasher = makeHasher(4);
    const hash = await hasher.hash('Password123!');

    await expect(hasher.compare('WrongPassword1', hash)).resolves.toBe(false);
  });

  it('reads BCRYPT_SALT_ROUNDS from config with a default of 12', () => {
    const config = {
      get: jest.fn().mockReturnValue(12),
    } as unknown as ConfigService;

    new BcryptPasswordHasher(config);

    expect(config.get).toHaveBeenCalledWith('BCRYPT_SALT_ROUNDS', 12);
  });
});
