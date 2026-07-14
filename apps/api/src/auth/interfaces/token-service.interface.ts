export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface ITokenService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}
