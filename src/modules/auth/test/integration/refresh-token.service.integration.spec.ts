/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenService } from '../../services/refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../../../modules/users/users.service';
import { JwtPayload } from '../../dto/jwt-payload.dto';

describe('RefreshTokenService - Unit', () => {
  let service: RefreshTokenService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn((payload: JwtPayload) => `signed-${payload.sub}`),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return new tokens for valid refresh token', async () => {
    const mockPayload: JwtPayload = {
      sub: 1,
      email: 'test@example.com',
      nickname: 'testuser',
      role: 'USER',
    };
    (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
    (usersService.findUserById as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      nickname: 'testuser',
      role: 'USER',
    });

    const tokens = await service.execute('valid-refresh-token');

    expect(tokens.accessToken).toBe('signed-1');
    expect(tokens.refreshToken).toBe('signed-1');
    expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
    expect(usersService.findUserById).toHaveBeenCalledWith(1);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.execute('invalid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const mockPayload: JwtPayload = {
      sub: 2,
      email: 'notfound@example.com',
      nickname: 'notfound',
      role: 'USER',
    };
    (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
    (usersService.findUserById as jest.Mock).mockResolvedValue(null);

    await expect(service.execute('valid-token-user-not-found')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
