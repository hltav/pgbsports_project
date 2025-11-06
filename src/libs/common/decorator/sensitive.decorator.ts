import 'reflect-metadata';

export const SENSITIVE_METADATA_KEY = Symbol('sensitive-field');

export function Sensitive(): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
      Reflect.defineMetadata(SENSITIVE_METADATA_KEY, true, target, propertyKey);
    }
  };
}

export const SensitiveField = Sensitive;

export function isSensitiveField<T extends object>(
  target: T,
  propertyKey: keyof T & (string | symbol), // 🔑 força compatibilidade
): boolean {
  return (
    Reflect.getMetadata(SENSITIVE_METADATA_KEY, target, propertyKey) === true
  );
}
