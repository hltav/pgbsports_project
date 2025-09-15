import { EncryptedFieldsTarget } from '../interfaces/encrypted.interface';

export function Encrypted() {
  return function (target: EncryptedFieldsTarget, propertyKey: string) {
    if (!target.constructor._encryptedFields) {
      target.constructor._encryptedFields = [];
    }
    target.constructor._encryptedFields.push(propertyKey);
  };
}

export function SearchableEncrypted() {
  return function (target: EncryptedFieldsTarget, propertyKey: string) {
    if (!target.constructor._searchableEncryptedFields) {
      target.constructor._searchableEncryptedFields = [];
    }
    target.constructor._searchableEncryptedFields.push(propertyKey);
  };
}
