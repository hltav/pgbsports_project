import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from './../../libs/database/prisma';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './services';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        PrismaService,
        {
          provide: UserFindService,
          useValue: {}, // ou useValue: { findById: jest.fn() }, etc.
        },
        {
          provide: UserUpdateService,
          useValue: {},
        },
        {
          provide: UserDeleteService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
