import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
  SCHOOL_REPOSITORY,
  type ISchoolRepository,
} from '../schools/interfaces/school-repository.interface';
import { EmailAlreadyExistsException } from '../common/exceptions/email-already-exists.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';
import { SchoolNotConfiguredException } from '../common/exceptions/school-not-configured.exception';
import { withServiceError } from '../common/utils/service-error';
import { EventQueueService } from '../queues/event-queue.service';
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
    @Inject(SCHOOL_REPOSITORY) private readonly schools: ISchoolRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    private readonly eventQueue: EventQueueService,
  ) {}

  private queueAuditEvent(action: string, userId: string): void {
    void this.eventQueue
      .queueAuditEvent({
        userId,
        action,
        resourceType: 'User',
        resourceId: userId,
        timestamp: new Date().toISOString(),
      })
      .catch((err: unknown) => {
        this.logger.warn({
          msg: 'failed to queue audit event',
          action,
          userId,
          err,
        });
      });
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    return withServiceError(
      async () => {
        const emailTaken = await this.users.existsByEmail(dto.email);
        if (emailTaken) {
          throw new EmailAlreadyExistsException(dto.email);
        }

        const schoolId = await this.schools.resolveDefaultSchoolId();
        if (!schoolId) {
          throw new SchoolNotConfiguredException();
        }

        const passwordHash = await this.hasher.hash(dto.password);
        const user = await this.users.create({
          email: dto.email,
          passwordHash,
          role: dto.role,
          name: dto.name,
          phone: dto.phone,
          country: dto.country,
          schoolId,
        });

        const accessToken = this.tokens.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
          schoolId,
        });
        this.logger.log({
          msg: 'user registered',
          userId: user.id,
          email: user.email,
        });

        this.queueAuditEvent('user.register', user.id);

        return { accessToken, user: UserResponseDto.fromEntity(user) };
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: EmailAlreadyExistsException,
          warnContext: {
            msg: 'register rejected: email already exists',
            email: dto.email,
          },
        },
        errorContext: { msg: 'register failed unexpectedly', email: dto.email },
      },
    );
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    return withServiceError(
      async () => {
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
          schoolId: user.schoolId,
        });
        this.logger.log({
          msg: 'user logged in',
          userId: user.id,
          email: user.email,
        });

        this.queueAuditEvent('user.login', user.id);

        return { accessToken, user: UserResponseDto.fromEntity(user) };
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: InvalidCredentialsException,
          warnContext: {
            msg: 'login rejected: invalid credentials',
            email: dto.email,
          },
        },
        errorContext: { msg: 'login failed unexpectedly', email: dto.email },
      },
    );
  }
}
