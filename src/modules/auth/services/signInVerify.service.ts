import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { GetUserDTO } from '../../../libs/common/dto/user';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';
import { JwtHandlerService } from '../../../libs/crypto/services/jwt.service';

@Injectable()
export class SignInVerifyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtHandler: JwtHandlerService,
  ) {}

  async execute(token: string): Promise<GetUserDTO> {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtHandler.verify(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException('Invalid or expired token', errorMessage);
    }

    const user = await this.usersService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const decryptedUser = {
      ...user,
      email: this.encryptionService.decrypt(user.email || ''),
      firstname: this.encryptionService.decrypt(user.firstname || ''),
      lastname: this.encryptionService.decrypt(user.lastname || ''),
      nickname: this.encryptionService.decrypt(user.nickname || ''),
      clientData: user.clientData
        ? {
            ...user.clientData,
            cpf: user.clientData.cpf
              ? this.encryptionService.decrypt(user.clientData.cpf)
              : undefined,
            phone: user.clientData.phone
              ? this.encryptionService.decrypt(user.clientData.phone)
              : undefined,
            gender: user.clientData.gender
              ? this.encryptionService.decrypt(user.clientData.gender)
              : undefined,
            image: user.clientData.image
              ? this.encryptionService.decrypt(user.clientData.image)
              : undefined,
            address: user.clientData.address
              ? {
                  neighborhood: user.clientData.address.neighborhood
                    ? this.encryptionService.decrypt(
                        user.clientData.address.neighborhood,
                      )
                    : undefined,
                  city: user.clientData.address.city
                    ? this.encryptionService.decrypt(
                        user.clientData.address.city,
                      )
                    : undefined,
                  state: user.clientData.address.state
                    ? this.encryptionService.decrypt(
                        user.clientData.address.state,
                      )
                    : undefined,
                  country: user.clientData.address.country
                    ? this.encryptionService.decrypt(
                        user.clientData.address.country,
                      )
                    : undefined,
                }
              : undefined,
          }
        : undefined,
    };

    const userWithoutPassword: GetUserDTO = {
      id: decryptedUser.id ?? 0,
      firstname: decryptedUser.firstname ?? '',
      lastname: decryptedUser.lastname ?? '',
      nickname: decryptedUser.nickname ?? '',
      email: decryptedUser.email ?? '',
      role: decryptedUser.role,
      clientData: decryptedUser.clientData,
    };

    return userWithoutPassword;
  }
}
