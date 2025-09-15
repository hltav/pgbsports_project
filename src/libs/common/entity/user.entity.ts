import { Role } from '@prisma/client';
import { SensitiveField } from '../decorator/sensitive.decorator';
import { CreateUserDTO } from '../dto/user/createUser.dto';

export class UserEntity implements Record<string, unknown> {
  [key: string]: unknown;

  @SensitiveField()
  firstname!: string;

  @SensitiveField()
  lastname!: string;

  @SensitiveField()
  nickname!: string;

  @SensitiveField()
  email!: string;

  password!: string;
  role!: Role;

  constructor(data: CreateUserDTO) {
    Object.assign(this, data);
  }
}
