/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SignOutService } from '../../services/sign-out.service';
import { UsersService } from './../../../../modules/users/users.service';

describe('SignOutService - Unit', () => {
  let service: SignOutService;
  let usersService: UsersService;

  const mockUsersService = {
    findUserById: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignOutService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<SignOutService>(SignOutService);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign out successfully', async () => {
    const mockUser = { id: 1, refreshToken: 'some-token' };
    mockUsersService.findUserById.mockResolvedValue(mockUser);
    mockUsersService.update.mockResolvedValue({
      ...mockUser,
      refreshToken: null,
    });

    await service.execute(mockUser.id);

    expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockUser.id);
    expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, {
      refreshToken: null,
    });
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUsersService.findUserById.mockResolvedValue(null);

    await expect(service.execute(99999)).rejects.toThrow(NotFoundException);
    expect(mockUsersService.findUserById).toHaveBeenCalledWith(99999);
  });
});
