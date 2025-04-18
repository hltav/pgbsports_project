import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../libs/database/prisma';
import { MailerService } from '@nestjs-modules/mailer';
import { GetUserDTO, CreateUserDTO } from './../../libs/common/dto/user/';
import { ForgotPasswordDTO } from './../../libs/common/dto/forgot-password.dto';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(createUser: CreateUserDTO): Promise<GetUserDTO> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUser.email }, { nickname: createUser.nickname }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or Nickname User already registered!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUser.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        ...createUser,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });

    return newUser;
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: GetUserDTO }> {
    if (!email || !pass) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    if (user.id === undefined) {
      throw new Error('User ID is undefined');
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

  async signOut(userId: number): Promise<void> {
    console.log('signOut userId:', userId);
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(userId, { refreshToken: null });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return;
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password reset',
      template: 'forgot-password',
      context: {
        name: user.firstname,
        resetLink: `https://localhost:3000/reset-password?token=${resetToken}`,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const user = await this.usersService.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id as number,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('An unexpected error occurred');
    }
  }
}
