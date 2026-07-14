import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../interfaces/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(config: ConfigService) {
    this.saltRounds = config.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
