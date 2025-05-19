import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../users.service';
import { PrismaService } from '../../../../../libs/database/prisma';
import {
  UserFindService,
  UserUpdateService,
  UserDeleteService,
} from '../../../services';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserFindService,
          useValue: {},
        },
        {
          provide: UserUpdateService,
          useValue: {},
        },
        {
          provide: UserDeleteService,
          useValue: {},
        },
        PrismaService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
