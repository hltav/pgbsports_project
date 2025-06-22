import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './../../../users.controller';
import { UsersService } from './../../../users.service';
import { PrismaService } from '../../../../../libs/database';
import {
  UsersDeleterService,
  UsersFinderService,
  UsersUpdaterService,
} from './../../../../../modules/users/proxies/serviceProxies';
import {
  UserDeleteService,
  UserFindService,
  UserUpdateService,
} from './../../../../../modules/users/services';
import { UsersServiceProxy } from './../../../../../modules/users/proxies/user.cache.proxy.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        PrismaService,
        {
          provide: UsersFinderService,
          useValue: {}, // ou useValue: { findById: jest.fn() }, etc.
        },
        {
          provide: UsersUpdaterService,
          useValue: {},
        },
        {
          provide: UsersDeleterService,
          useValue: {},
        },
        UserFindService,
        UserUpdateService,
        UserDeleteService,
        UsersServiceProxy,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
