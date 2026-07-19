import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { $Enums } from '../../../generated/prisma/client.js';
import { Match } from '../decorators/match.decorator';

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/;
const PASSWORD_COMPLEXITY_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export class RegisterDto {
  @IsEnum($Enums.Role, { message: 'role must be one of MANAGER or TEACHER' })
  role!: $Enums.Role;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(72, { message: 'password must be at most 72 characters' })
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password!: string;

  @IsString()
  @Match('password', { message: 'confirmPassword must match password' })
  confirmPassword!: string;
}
