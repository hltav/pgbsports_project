import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../../../libs/crypto/services/crypto.service';
import { UsersService } from '../../users/users.service';
import { GetUserDTO } from '../../../libs/common/dto/user';
import { JwtPayload } from '../dto/jwt-payload.dto';

@Injectable()
export class SignInVerifyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly crypto: CryptoService,
  ) {}

  async execute(token: string): Promise<GetUserDTO> {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    let payload: JwtPayload;
    try {
      payload = this.crypto.verifyJwt(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException('Invalid or expired token', errorMessage);
    }

    const user = await this.usersService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userWithoutPassword: GetUserDTO = {
      id: user.id ?? 0,
      firstname: user.firstname ?? '',
      lastname: user.lastname ?? '',
      nickname: user.nickname ?? '',
      email: user.email ?? '',
      role: user.role,
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

    return userWithoutPassword;
  }
}
