export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

/**
 * Any implementation must resolve `false` from compare() on a mismatch —
 * never throw for a simply-wrong password — so callers can treat it as a pure predicate.
 */
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
