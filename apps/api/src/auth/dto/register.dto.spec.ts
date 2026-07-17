import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

const validPayload = {
  role: 'MANAGER',
  schoolId: 'school-1',
  name: 'Ava Manager',
  email: 'ava@example.com',
  phone: '+1-555-0100',
  country: 'United States',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

function toDto(payload: Record<string, unknown>): RegisterDto {
  return plainToInstance(RegisterDto, payload);
}

describe('RegisterDto', () => {
  it('passes validation for a fully valid payload', async () => {
    const errors = await validate(toDto(validPayload));

    expect(errors).toHaveLength(0);
  });

  it('rejects a missing schoolId', async () => {
    const errors = await validate(
      toDto({ ...validPayload, schoolId: undefined }),
    );

    expect(errors.some((e) => e.property === 'schoolId')).toBe(true);
  });

  it('rejects an invalid role', async () => {
    const errors = await validate(toDto({ ...validPayload, role: 'ADMIN' }));

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('rejects an invalid email', async () => {
    const errors = await validate(
      toDto({ ...validPayload, email: 'not-an-email' }),
    );

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects an invalid phone number', async () => {
    const errors = await validate(toDto({ ...validPayload, phone: 'call-me' }));

    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('rejects a password without complexity requirements', async () => {
    const errors = await validate(
      toDto({
        ...validPayload,
        password: 'alllowercase1',
        confirmPassword: 'alllowercase1',
      }),
    );

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const errors = await validate(
      toDto({ ...validPayload, password: 'Ab1', confirmPassword: 'Ab1' }),
    );

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects a mismatched confirmPassword', async () => {
    const errors = await validate(
      toDto({ ...validPayload, confirmPassword: 'Different123!' }),
    );

    expect(errors.some((e) => e.property === 'confirmPassword')).toBe(true);
  });
});
