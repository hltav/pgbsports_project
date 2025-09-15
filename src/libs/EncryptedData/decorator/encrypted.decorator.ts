import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { EncryptionService } from '../services/encryptedData.service';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (Array.isArray(data)) {
          return data.map((item: unknown) => this.decryptObject(item));
        }
        return this.decryptObject(data);
      }),
    );
  }

  private decryptObject(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object' || obj === null) return obj;

    const decrypted = { ...obj } as Record<string, unknown>;

    const fieldsToDecrypt: string[] = [
      'firstname',
      'lastname',
      'nickname',
      'email',
      'phone',
      'cpf',
      'direction',
      'neighborhood',
      'city',
      'state',
      'country',
    ];

    fieldsToDecrypt.forEach((field) => {
      const fieldValue = decrypted[field];
      if (fieldValue && typeof fieldValue === 'string') {
        decrypted[field] = this.encryptionService.decrypt(fieldValue);
      }
    });

    // Descriptografar clientData se existir
    if (decrypted.clientData && typeof decrypted.clientData === 'object') {
      decrypted.clientData = this.decryptObject(decrypted.clientData);

      // Descriptografar address dentro de clientData
      if (decrypted.clientData && typeof decrypted.clientData === 'object') {
        const clientDataObj = decrypted.clientData as Record<string, unknown>;
        if (
          clientDataObj.address &&
          typeof clientDataObj.address === 'object'
        ) {
          clientDataObj.address = this.decryptObject(clientDataObj.address);
        }
      }
    }

    // Descriptografar address diretamente no objeto principal também
    if (decrypted.address && typeof decrypted.address === 'object') {
      decrypted.address = this.decryptObject(decrypted.address);
    }

    return decrypted;
  }
}
