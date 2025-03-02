import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../libs/common/src/interface/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { GetUserDTO } from '../../../libs/common/src/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ accessToken: string; user: GetUserDTO }> {
    const user = await this.usersService.findOneByEmail(email);

    // Verify the exist user
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not found for this user');
    }

    // Verify the correct password
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect login data');
    }

    if (user.id === undefined) {
      throw new Error('User ID is undefined');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload);

    const userWithoutPassword: GetUserDTO = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname,
      email: user.email,
    };

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }
}
