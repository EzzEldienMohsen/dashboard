import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<Pick<AuthService, 'register' | 'login'>>;

  const authResponse = {
    accessToken: 'signed-token',
    user: {
      id: 'user-1',
      email: 'ava@example.com',
      role: 'MANAGER' as const,
      name: 'Ava Manager',
      phone: '+1-555-0100',
      country: 'United States',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    },
  };

  beforeEach(() => {
    service = { register: jest.fn(), login: jest.fn() };
    controller = new AuthController(service as unknown as AuthService);
  });

  it('delegates register to the service with the dto', async () => {
    service.register.mockResolvedValue(authResponse);
    const dto = {
      role: 'MANAGER' as const,
      name: 'Ava Manager',
      email: 'ava@example.com',
      phone: '+1-555-0100',
      country: 'United States',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    await expect(controller.register(dto)).resolves.toBe(authResponse);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login to the service with the dto', async () => {
    service.login.mockResolvedValue(authResponse);
    const dto = { email: 'ava@example.com', password: 'Password123!' };

    await expect(controller.login(dto)).resolves.toBe(authResponse);
    expect(service.login).toHaveBeenCalledWith(dto);
  });
});
