import type { $Enums, User } from '../../../generated/prisma/client.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: $Enums.Role;
  name: string;
  phone: string;
  country: string;
  schoolId: string;
}

/** What JwtStrategy needs on every authenticated request — never includes passwordHash. */
export type AuthUserEntity = Pick<User, 'id' | 'email' | 'role' | 'schoolId'>;

/** What register()'s response DTO needs — never includes passwordHash. */
export type CreatedUserEntity = Pick<
  User,
  'id' | 'email' | 'role' | 'name' | 'phone' | 'country' | 'createdAt'
>;

/**
 * Narrow persistence contract for users — only what the auth flow needs.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  findById(id: string): Promise<AuthUserEntity | null>;
  create(data: CreateUserData): Promise<CreatedUserEntity>;
}
