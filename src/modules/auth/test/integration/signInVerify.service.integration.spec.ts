import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SignInVerifyService } from '../../services/signInVerify.service';
import { CryptoService } from './../../../../libs/crypto/services/crypto.service';
import { UsersService } from './../../../../modules/users/users.service';
import { Role } from '@prisma/client';

describe('SignInVerifyService - Integration', () => {
  let service: SignInVerifyService;
  let usersService: UsersService;
  let cryptoService: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInVerifyService,
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            verifyJwt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SignInVerifyService);
    usersService = module.get(UsersService);
    cryptoService = module.get(CryptoService);
  });

  it('should return user data when token is valid', async () => {
    const mockPayload = {
      sub: 1,
      email: 'test@example.com',
      nickname: 'test',
      role: 'user',
    };
    const mockUser = {
      id: 1,
      firstname: 'Test',
      lastname: 'User',
      nickname: 'test',
      email: 'test@example.com',
      role: Role.USER,
      clientData: null,
    };

    jest.spyOn(cryptoService, 'verifyJwt').mockReturnValue(mockPayload);
    jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);

    const user = await service.execute('valid-token');

    expect(user).toMatchObject({
      id: mockUser.id,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      email: mockUser.email,
      nickname: mockUser.nickname,
      role: mockUser.role,
      clientData: null,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cryptoService.verifyJwt).toHaveBeenCalledWith('valid-token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(usersService.findUserById).toHaveBeenCalledWith(1);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    await expect(service.execute('')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(cryptoService, 'verifyJwt').mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await expect(service.execute('invalid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    jest.spyOn(cryptoService, 'verifyJwt').mockReturnValue({ sub: 99 });
    jest.spyOn(usersService, 'findUserById').mockResolvedValue(null);

    await expect(service.execute('valid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
