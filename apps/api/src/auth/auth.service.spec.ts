import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from './interfaces/password-hasher.interface';
import {
  TOKEN_SERVICE,
  type ITokenService,
} from './interfaces/token-service.interface';
import { EmailAlreadyExistsException } from '../common/exceptions/email-already-exists.exception';
import { InvalidCredentialsException } from '../common/exceptions/invalid-credentials.exception';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;

  const users: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
  const hasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const tokens: jest.Mocked<ITokenService> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const existingUser = {
    id: 'user-1',
    email: 'jane@example.com',
    passwordHash: 'hashed-password',
    role: 'TEACHER',
    name: 'Jane Doe',
    phone: '+1-555-0110',
    country: 'United States',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  } as const;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: users },
        { provide: PASSWORD_HASHER, useValue: hasher },
        { provide: TOKEN_SERVICE, useValue: tokens },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      role: 'TEACHER',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1-555-0110',
      country: 'United States',
      password: 'Passw0rd!',
      confirmPassword: 'Passw0rd!',
    };

    it('creates a user and returns an access token', async () => {
      users.findByEmail.mockResolvedValue(null);
      hasher.hash.mockResolvedValue('hashed-password');
      users.create.mockResolvedValue(existingUser);
      tokens.sign.mockReturnValue('signed-jwt');

      const result = await service.register(registerDto);

      expect(hasher.hash).toHaveBeenCalledWith('Passw0rd!');
      expect(users.create).toHaveBeenCalledWith({
        email: registerDto.email,
        passwordHash: 'hashed-password',
        role: registerDto.role,
        name: registerDto.name,
        phone: registerDto.phone,
        country: registerDto.country,
      });
      expect(tokens.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
      expect(result.accessToken).toBe('signed-jwt');
      expect(result.user.email).toBe(existingUser.email);
      expect(
        (result.user as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
    });

    it('throws EmailAlreadyExistsException when the email is already taken', async () => {
      users.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(
        EmailAlreadyExistsException,
      );
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'jane@example.com',
      password: 'Passw0rd!',
    };

    it('returns an access token for valid credentials', async () => {
      users.findByEmail.mockResolvedValue(existingUser);
      hasher.compare.mockResolvedValue(true);
      tokens.sign.mockReturnValue('signed-jwt');

      const result = await service.login(loginDto);

      expect(hasher.compare).toHaveBeenCalledWith(
        'Passw0rd!',
        existingUser.passwordHash,
      );
      expect(result.accessToken).toBe('signed-jwt');
    });

    it('throws InvalidCredentialsException for an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        InvalidCredentialsException,
      );
      expect(hasher.compare).not.toHaveBeenCalled();
    });

    it('throws InvalidCredentialsException for a wrong password', async () => {
      users.findByEmail.mockResolvedValue(existingUser);
      hasher.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(
        InvalidCredentialsException,
      );
      expect(tokens.sign).not.toHaveBeenCalled();
    });
  });
});
