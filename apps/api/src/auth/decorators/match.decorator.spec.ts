import { validate } from 'class-validator';
import { Match } from './match.decorator';

class PasswordFormDto {
  password!: string;

  @Match('password')
  confirmPassword!: string;
}

describe('Match decorator', () => {
  it('passes validation when the two fields match', async () => {
    const dto = new PasswordFormDto();
    dto.password = 'Secret123!';
    dto.confirmPassword = 'Secret123!';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when the two fields differ', async () => {
    const dto = new PasswordFormDto();
    dto.password = 'Secret123!';
    dto.confirmPassword = 'Different1!';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual(
      expect.objectContaining({
        Match: 'confirmPassword must match password',
      }),
    );
  });
});
