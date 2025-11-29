/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../../../modules/users/users.service';
import { JwtPayload } from '../../dto/jwt-payload.dto';
import { RefreshTokenService } from '../../services/refreshToken.service';
import { describe, beforeAll, it, expect, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { Role } from '@prisma/client';

describe('RefreshTokenService - Unit', () => {
  let service: RefreshTokenService;
  let jwtService: JwtService;
  let usersService: UsersService;

  // Mock functions
  const mockJwtVerify = jest.fn();
  const mockJwtSign = jest.fn();
  const mockFindUserById = jest.fn() as jest.MockedFunction<
    UsersService['findUserById']
  >;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtService,
          useValue: {
            verify: mockJwtVerify,
            sign: mockJwtSign,
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserById: mockFindUserById,
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return new tokens for valid refresh token', async () => {
    const mockPayload: JwtPayload = {
      sub: 1,
      email: 'test@example.com',
      nickname: 'testuser',
      role: 'USER',
    };

    mockJwtVerify.mockReturnValue(mockPayload);
    mockJwtSign.mockImplementation(
      (payload: JwtPayload) => `signed-${payload.sub}`,
    );
    mockFindUserById.mockResolvedValue({
      id: 1,
      firstname: 'João',
      lastname: 'Da Silva',
      email: 'test@example.com',
      nickname: 'testuser',
      role: Role.USER,
    });

    const tokens = await service.execute('valid-refresh-token');

    expect(tokens.accessToken).toBe('signed-1');
    expect(tokens.refreshToken).toBe('signed-1');
    expect(mockJwtVerify).toHaveBeenCalledWith('valid-refresh-token');
    expect(mockFindUserById).toHaveBeenCalledWith(1);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    mockJwtVerify.mockImplementation(() => {
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

    mockJwtVerify.mockReturnValue(mockPayload);
    mockFindUserById.mockResolvedValue(null);

    await expect(service.execute('valid-token-user-not-found')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
