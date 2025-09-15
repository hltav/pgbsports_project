import 'reflect-metadata';

export const SENSITIVE_METADATA_KEY = Symbol('sensitive-field');

/**
 * Decorator para marcar campos sensíveis que devem ser criptografados
 */
export function Sensitive(): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
      Reflect.defineMetadata(SENSITIVE_METADATA_KEY, true, target, propertyKey);
    }
  };
}

// Alias opcional
export const SensitiveField = Sensitive;

/**
 * Verifica se um campo foi marcado como sensível
 */
export function isSensitiveField<T extends object>(
  target: T,
  propertyKey: keyof T & (string | symbol), // 🔑 força compatibilidade
): boolean {
  return (
    Reflect.getMetadata(SENSITIVE_METADATA_KEY, target, propertyKey) === true
  );
}
