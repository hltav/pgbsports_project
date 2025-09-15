import { Module } from '@nestjs/common';
import { EncryptionService } from './encryptedData.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptedDataModule {}
