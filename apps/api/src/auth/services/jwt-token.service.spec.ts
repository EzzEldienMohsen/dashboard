import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import type { JwtPayload } from '../interfaces/token-service.interface';

describe('JwtTokenService', () => {
  let jwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;
  let service: JwtTokenService;

  const payload: JwtPayload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'MANAGER',
    schoolId: 'school-1',
  };

  beforeEach(() => {
    jwtService = { sign: jest.fn(), verify: jest.fn() };
    service = new JwtTokenService(jwtService as unknown as JwtService);
  });

  it('delegates sign to the underlying JwtService', () => {
    jwtService.sign.mockReturnValue('signed-token');

    const token = service.sign(payload);

    expect(jwtService.sign).toHaveBeenCalledWith(payload);
    expect(token).toBe('signed-token');
  });

  it('delegates verify to the underlying JwtService and returns the typed payload', () => {
    jwtService.verify.mockReturnValue(payload);

    const result = service.verify('signed-token');

    expect(jwtService.verify).toHaveBeenCalledWith('signed-token');
    expect(result).toEqual(payload);
  });
});
