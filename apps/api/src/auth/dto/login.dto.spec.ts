import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('passes validation for a valid payload', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'whatever',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'nope',
      password: 'whatever',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects an empty password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
