import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { GetUserDTO } from '../../../libs/common/dto/user';
import { JwtPayload } from '../dto/jwt-payload.dto';

@Injectable()
export class SignInService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    email: string,
    pass: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: GetUserDTO;
  }> {
    if (!email || !pass) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findOneByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    const userWithoutPassword: GetUserDTO = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname,
      email: user.email,
      clientData: user.clientData
        ? {
            image: user.clientData.image,
            cpf: user.clientData.cpf,
            gender: user.clientData.gender,
            phone: user.clientData.phone,
            address: user.clientData.address
              ? {
                  neighborhood: user.clientData.address.neighborhood,
                  city: user.clientData.address.city,
                  state: user.clientData.address.state,
                  country: user.clientData.address.country,
                }
              : null,
          }
        : null,
    };

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }
}
