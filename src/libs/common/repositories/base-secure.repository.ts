import { PrismaService } from './../../../libs/database/prisma';
import { SensitiveDataService } from './../../../libs/sensitiveData/sensitive-data.service';
import { SensitiveFieldsProcessor } from './../../../libs/utils/encrypt-sensitive-fields';

export abstract class BaseSecureRepository<T> {
  protected readonly processor: SensitiveFieldsProcessor;

  constructor(protected readonly prisma: PrismaService) {
    this.processor = new SensitiveFieldsProcessor(new SensitiveDataService());
  }
  /**
   * Criptografa campos sensíveis antes de persistir
   */
  protected encrypt(data: Partial<T>): Partial<T> {
    return this.processor.encryptSensitiveFields(data);
  }

  /**
   * Descriptografa campos sensíveis ao recuperar
   */
  protected decrypt(data: any): T {
    return this.processor.decryptSensitiveFields(data) as T;
  }

  /**
   * Descriptografa lista de objetos
   */
  protected decryptMany(data: any[]): T[] {
    return data.map((item) => this.decrypt(item));
  }
}
