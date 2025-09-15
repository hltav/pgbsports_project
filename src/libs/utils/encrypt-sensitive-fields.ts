import 'reflect-metadata';
import { SensitiveDataService } from '../sensitiveData/sensitive-data.service';
import { SENSITIVE_METADATA_KEY } from '../common/decorator/sensitive.decorator';

type AnyObject = Record<string, unknown>;

export class SensitiveFieldsProcessor {
  constructor(private readonly sensitiveService: SensitiveDataService) {}

  encryptSensitiveFields<T extends AnyObject>(dto: T): T {
    return this.processFields<T>(dto, 'encrypt');
  }

  decryptSensitiveFields<T extends AnyObject>(dto: T): T {
    return this.processFields<T>(dto, 'decrypt');
  }

  private processFields<T extends AnyObject>(
    obj: T,
    operation: 'encrypt' | 'decrypt',
  ): T {
    if (
      !obj ||
      typeof obj !== 'object' ||
      Array.isArray(obj) ||
      Buffer.isBuffer(obj)
    ) {
      return obj;
    }

    const newObj: AnyObject = { ...obj };

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }

      const isSensitive =
        Reflect.getMetadata(SENSITIVE_METADATA_KEY, obj, key) === true;

      if (isSensitive && typeof value === 'string') {
        try {
          newObj[key] =
            operation === 'encrypt'
              ? this.sensitiveService.encrypt(value)
              : this.sensitiveService.decrypt(value);
        } catch (error) {
          console.warn(`Erro ao processar campo ${key}:`, error);
          newObj[key] = value;
        }
      } else if (typeof value === 'object' && !Buffer.isBuffer(value)) {
        if (Array.isArray(value)) {
          newObj[key] = value.map((item: unknown) =>
            typeof item === 'object' && item !== null
              ? this.processFields(item as AnyObject, operation)
              : item,
          );
        } else {
          newObj[key] = this.processFields(value as AnyObject, operation);
        }
      }
    }

    return newObj as T;
  }
}

let processorInstance: SensitiveFieldsProcessor | null = null;

function getProcessor(): SensitiveFieldsProcessor {
  if (!processorInstance) {
    processorInstance = new SensitiveFieldsProcessor(
      new SensitiveDataService(),
    );
  }
  return processorInstance;
}

export function encryptSensitiveFields<T extends AnyObject>(dto: T): T {
  return getProcessor().encryptSensitiveFields(dto);
}

export function decryptSensitiveFields<T extends AnyObject>(dto: T): T {
  return getProcessor().decryptSensitiveFields(dto);
}
