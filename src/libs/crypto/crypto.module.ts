import { Module } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';
import { JwtHandlerService } from './services/jwt.service';
import { PasswordService } from './services/password.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKeyHere',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [JwtHandlerService, PasswordService, CryptoService],
  exports: [CryptoService, JwtHandlerService, PasswordService],
})
export class CryptoModule {}
