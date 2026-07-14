import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  ITokenService,
  JwtPayload,
} from '../interfaces/token-service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
