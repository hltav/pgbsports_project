import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../../../libs/crypto/services/crypto.service';
import { UsersService } from '../../users/users.service';
import { GetUserDTO } from '../../../libs/common/dto/user';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';
import { AuthContext } from '../../../modules/users/proxies/serviceProxies/users-finders.proxy.service';

// @Injectable()
// export class SignInVerifyService {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly crypto: CryptoService,
//     private readonly encryptionService: EncryptionService,
//   ) {}

//   async execute(token: string, currentUser: AuthContext): Promise<GetUserDTO> {
//     if (!token) {
//       throw new UnauthorizedException('Token is required');
//     }

//     let payload: JwtPayload;
//     try {
//       payload = this.crypto.verifyJwt(token);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : 'Unknown error';
//       throw new UnauthorizedException('Invalid or expired token', errorMessage);
//     }

//     const user = await this.usersService.findUserById(payload.sub, currentUser);

//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }

//     if (user.email) {
//       this.encryptionService.encrypt(user.email);
//     }
//     if (user.firstname) {
//       this.encryptionService.encrypt(user.firstname);
//     }

//     const decryptedUser = {
//       ...user,
//       email: this.encryptionService.decrypt(user.email || ''),
//       firstname: this.encryptionService.decrypt(user.firstname || ''),
//       lastname: this.encryptionService.decrypt(user.lastname || ''),
//       nickname: this.encryptionService.decrypt(user.nickname || ''),
//       clientData: user.clientData || null,
//     };

//     const userWithoutPassword: GetUserDTO = {
//       id: decryptedUser.id ?? 0,
//       firstname: decryptedUser.firstname ?? '',
//       lastname: decryptedUser.lastname ?? '',
//       nickname: decryptedUser.nickname ?? '',
//       email: decryptedUser.email ?? '',
//       role: decryptedUser.role,
//       clientData: decryptedUser.clientData,
//     };

//     return userWithoutPassword;
//   }
// }
@Injectable()
export class SignInVerifyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly crypto: CryptoService,
    private readonly encryptionService: EncryptionService,
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

    // Caller derivado do próprio payload do token
    const authenticatedCaller: AuthContext = {
      id: payload.sub,
      role: payload.role,
    };

    const user = await this.usersService.findUserById(
      payload.sub,
      authenticatedCaller,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Nota: as chamadas this.encryptionService.encrypt() que existiam aqui
    // não faziam nada (resultado ignorado) — foram removidas
    const decryptedUser = {
      ...user,
      email: this.encryptionService.decrypt(user.email || ''),
      firstname: this.encryptionService.decrypt(user.firstname || ''),
      lastname: this.encryptionService.decrypt(user.lastname || ''),
      nickname: this.encryptionService.decrypt(user.nickname || ''),
      clientData: user.clientData || null,
    };

    return {
      id: decryptedUser.id ?? 0,
      firstname: decryptedUser.firstname ?? '',
      lastname: decryptedUser.lastname ?? '',
      nickname: decryptedUser.nickname ?? '',
      email: decryptedUser.email ?? '',
      role: decryptedUser.role,
      clientData: decryptedUser.clientData,
    };
  }
}
