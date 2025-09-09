import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SignInService } from '../../services';
import { CryptoService } from './../../../../libs/crypto/services/crypto.service';
import { UsersService } from './../../../../modules/users/users.service';
import { JwtPayload } from '../../dto/jwt-payload.dto';

describe('SignInService - Unit', () => {
  let service: SignInService;
  let usersService: UsersService;
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            comparePassword: jest.fn(),
            hashPassword: jest.fn(),
            signJwt: jest.fn((payload: JwtPayload) => 'token-' + payload.sub),
          },
        },
      ],
    }).compile();

    service = module.get(SignInService);
    usersService = module.get(UsersService);
    cryptoService = module.get(CryptoService);
  });

  it('should sign in successfully with correct credentials', async () => {
    (usersService.findOneByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      firstname: 'Test',
      lastname: 'User',
      nickname: 'testuser',
      role: 'USER',
      clientData: null,
    });
    (cryptoService.comparePassword as jest.Mock).mockResolvedValue(true);
    (cryptoService.hashPassword as jest.Mock).mockResolvedValue(
      'hashed-refresh',
    );

    const result = await service.execute('test@example.com', 'password');

    expect(result.accessToken).toBe('token-1');
    expect(result.refreshToken).toBe('token-1');
    expect(result.user.email).toBe('test@example.com');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(usersService.update).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for incorrect password', async () => {
    (usersService.findOneByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      firstname: 'Test',
      lastname: 'User',
      nickname: 'testuser',
      role: 'USER',
      clientData: null,
    });
    (cryptoService.comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(service.execute('test@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for non-existing email', async () => {
    (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.execute('nouser@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for user without password', async () => {
    (usersService.findOneByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: '',
      firstname: 'Test',
      lastname: 'User',
      nickname: 'testuser',
      role: 'USER',
      clientData: null,
    });

    await expect(
      service.execute('test@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
