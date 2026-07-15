import 'reflect-metadata';
import { Roles, ROLES_KEY } from './roles.decorator';

describe('Roles decorator', () => {
  it('attaches the given roles as reflect metadata under ROLES_KEY', () => {
    class TestController {
      @Roles('MANAGER', 'TEACHER')
      handler(): void {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.handler,
    ) as string[];

    expect(roles).toEqual(['MANAGER', 'TEACHER']);
  });

  it('supports a single role', () => {
    class TestController {
      @Roles('MANAGER')
      handler(): void {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.handler,
    ) as string[];

    expect(roles).toEqual(['MANAGER']);
  });
});
