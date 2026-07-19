import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { AuthenticatedUser } from '../strategies/jwt.strategy';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<
    Pick<Reflector, 'getAllAndOverride'>
  > &
    Reflector;

  beforeEach(() => {
    guard = new RolesGuard(reflector);
    jest.clearAllMocks();
  });

  function contextWithUser(
    user: AuthenticatedUser | undefined,
  ): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows the request when no roles metadata is present', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextWithUser(undefined))).toBe(true);
  });

  it('allows the request when the user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);

    const result = guard.canActivate(
      contextWithUser({
        id: 'user-1',
        email: 'jane@example.com',
        role: 'MANAGER',
        schoolId: 'school-1',
      }),
    );

    expect(result).toBe(true);
  });

  it('throws ForbiddenException when the user role is not permitted', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);

    expect(() =>
      guard.canActivate(
        contextWithUser({
          id: 'user-2',
          email: 'joe@example.com',
          role: 'TEACHER',
          schoolId: 'school-1',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no authenticated user', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);

    expect(() => guard.canActivate(contextWithUser(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
