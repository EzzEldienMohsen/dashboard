import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from '@nestjs/cache-manager';
import { JwtStrategy } from './jwt.strategy';
import type { IUserRepository } from '../../users/interfaces/user-repository.interface';
import type { JwtPayload } from '../interfaces/token-service.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const users: jest.Mocked<Pick<IUserRepository, 'findById'>> = {
    findById: jest.fn(),
  };
  const cache: jest.Mocked<Pick<Cache, 'get' | 'set'>> = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const config = {
    get: jest.fn().mockReturnValue('test-secret'),
  } as unknown as ConfigService;

  const payload: JwtPayload = {
    sub: 'user-1',
    email: 'jane@example.com',
    role: 'TEACHER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      config,
      users as unknown as IUserRepository,
      cache as unknown as Cache,
    );
  });

  it('returns the cached user without calling the repository on a cache hit', async () => {
    const cachedUser = {
      id: 'user-1',
      email: 'jane@example.com',
      role: 'TEACHER',
      schoolId: 'school-1',
    };
    cache.get.mockResolvedValue(cachedUser);

    const result = await strategy.validate(payload);

    expect(cache.get).toHaveBeenCalledWith('auth:user:user-1');
    expect(users.findById).not.toHaveBeenCalled();
    expect(result).toEqual(cachedUser);
  });

  it('falls back to the repository on a cache miss and caches the result', async () => {
    cache.get.mockResolvedValue(undefined);
    users.findById.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      role: 'TEACHER',
      schoolId: 'school-1',
    });

    const result = await strategy.validate(payload);

    expect(users.findById).toHaveBeenCalledWith('user-1');
    expect(cache.set).toHaveBeenCalledWith(
      'auth:user:user-1',
      {
        id: 'user-1',
        email: 'jane@example.com',
        role: 'TEACHER',
        schoolId: 'school-1',
      },
      30_000,
    );
    expect(result).toEqual({
      id: 'user-1',
      email: 'jane@example.com',
      role: 'TEACHER',
      schoolId: 'school-1',
    });
  });

  it('throws UnauthorizedException and does not cache when the user no longer exists', async () => {
    cache.get.mockResolvedValue(undefined);
    users.findById.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
