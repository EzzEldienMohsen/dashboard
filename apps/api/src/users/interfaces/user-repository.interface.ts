import type { $Enums, User } from '../../../generated/prisma/client.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: $Enums.Role;
  name: string;
  phone: string;
  country: string;
}

/**
 * Narrow persistence contract for users — only what the auth flow needs.
 * Any implementation must resolve `null` for a not-found lookup, never throw.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
