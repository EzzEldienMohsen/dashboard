import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../users/interfaces/user-repository.interface';
import type { JwtPayload } from '../interfaces/token-service.interface';
import { READ_CACHE_TTL_MS } from '../../common/constants/cache.constant';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

function userCacheKey(userId: string): string {
  return `auth:user:${userId}`;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const cacheKey = userCacheKey(payload.sub);
    const cached = await this.cache.get<AuthenticatedUser>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    await this.cache.set(cacheKey, authenticatedUser, READ_CACHE_TTL_MS);
    return authenticatedUser;
  }
}
