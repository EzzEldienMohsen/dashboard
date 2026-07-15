import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { EmailAlreadyExistsException } from '../common/exceptions/email-already-exists.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from './interfaces/password-hasher.interface';
import {
  TOKEN_SERVICE,
  type ITokenService,
} from './interfaces/token-service.interface';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const emailTaken = await this.users.existsByEmail(dto.email);
      if (emailTaken) {
        throw new EmailAlreadyExistsException(dto.email);
      }

      const passwordHash = await this.hasher.hash(dto.password);
      const user = await this.users.create({
        email: dto.email,
        passwordHash,
        role: dto.role,
        name: dto.name,
        phone: dto.phone,
        country: dto.country,
      });

      const accessToken = this.tokens.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      this.logger.log({
        msg: 'user registered',
        userId: user.id,
        email: user.email,
      });

      return { accessToken, user: UserResponseDto.fromEntity(user) };
    } catch (err: unknown) {
      if (err instanceof EmailAlreadyExistsException) {
        this.logger.warn({
          msg: 'register rejected: email already exists',
          email: dto.email,
        });
        throw err;
      }
      this.logger.error({
        msg: 'register failed unexpectedly',
        email: dto.email,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.users.findByEmail(dto.email);
      if (!user) {
        throw new InvalidCredentialsException();
      }

      const isValid = await this.hasher.compare(
        dto.password,
        user.passwordHash,
      );
      if (!isValid) {
        throw new InvalidCredentialsException();
      }

      const accessToken = this.tokens.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      this.logger.log({
        msg: 'user logged in',
        userId: user.id,
        email: user.email,
      });

      return { accessToken, user: UserResponseDto.fromEntity(user) };
    } catch (err: unknown) {
      if (err instanceof InvalidCredentialsException) {
        this.logger.warn({
          msg: 'login rejected: invalid credentials',
          email: dto.email,
        });
        throw err;
      }
      this.logger.error({
        msg: 'login failed unexpectedly',
        email: dto.email,
        err,
      });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }
}
