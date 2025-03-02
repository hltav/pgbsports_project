import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../libs/common/src/interface/user.interface';
import { JwtPayload } from '../../../libs/common/src/interface/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    console.log('Dados recebidos no signIn - identifier:', email); // Log para depuração
    console.log('Dados recebidos no signIn - pass:', pass);
    const user = await this.usersService.findOneByEmail(email);

    // Verifique se o usuário existe
    if (!user) {
      console.log('Usuário não encontrado');
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verifique se a senha está correta
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      console.log('Senha incorreta');
      throw new UnauthorizedException('Dados de Login Incorretos');
    }

    console.log('Login bem sucedido para usuário:', user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload);
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }
}
