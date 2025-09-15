import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../../../libs/crypto/services/crypto.service';
import { UsersService } from '../../users/users.service';
import { GetUserDTO } from '../../../libs/common/dto/user';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class SignInService {
  constructor(
    private readonly usersService: UsersService,
    private readonly crypto: CryptoService,
    private readonly encryptionService: EncryptionService,
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

    console.log('=== DEBUG LOGIN CORRIGIDO ===');
    console.log('Email recebido:', email);

    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      email.toLowerCase(),
    );
    console.log('Hash gerado para verificação:', searchableEmailHash);

    const userInDb = await this.usersService.findOneByEmail(email);
    console.log(
      'Usuário encontrado:',
      userInDb ? `SIM (ID: ${userInDb.id})` : 'NÃO',
    );

    if (userInDb) {
      console.log('Hash no banco:', userInDb.searchableEmailHash);
      console.log(
        'Hashes batem?',
        searchableEmailHash === userInDb.searchableEmailHash,
      );
    }

    if (!userInDb || !userInDb.password) {
      console.log('❌ ERRO: Usuário não encontrado ou sem password');
      throw new UnauthorizedException('Incorrect Credentials');
    }

    const decryptedUser = {
      ...userInDb,
      email: this.encryptionService.decrypt(userInDb.email),
      firstname: this.encryptionService.decrypt(userInDb.firstname),
      lastname: this.encryptionService.decrypt(userInDb.lastname),
      nickname: this.encryptionService.decrypt(userInDb.nickname),
      clientData: userInDb.clientData || null,
    };

    const isPasswordValid = await this.crypto.comparePassword(
      pass,
      userInDb.password,
    );

    if (!isPasswordValid) {
      console.log('❌ ERRO: Senha inválida');
      throw new UnauthorizedException('Incorrect Credentials');
    }

    console.log('✅ Login válido! Gerando tokens...');

    const payload: JwtPayload = {
      sub: decryptedUser.id,
      email: decryptedUser.email,
      nickname: decryptedUser.nickname,
      role: decryptedUser.role,
    };

    const accessToken = this.crypto.signJwt(payload, { expiresIn: '1d' });
    const refreshToken = this.crypto.signJwt(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await this.crypto.hashPassword(refreshToken);
    await this.usersService.update(decryptedUser.id, {
      refreshToken: hashedRefreshToken,
    });

    const userWithoutPassword: GetUserDTO = {
      id: decryptedUser.id,
      firstname: decryptedUser.firstname,
      lastname: decryptedUser.lastname,
      nickname: decryptedUser.nickname,
      email: decryptedUser.email,
      role: decryptedUser.role,
      clientData: decryptedUser.clientData,
    };

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }
}
