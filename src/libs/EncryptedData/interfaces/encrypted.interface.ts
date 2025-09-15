import { ClientDataDTO } from './../../../modules/client-data/dto';

export interface EncryptedFieldsTarget {
  constructor: {
    _encryptedFields?: string[];
    _searchableEncryptedFields?: string[];
  };
}

export interface DecryptableObject {
  [key: string]: ClientDataDTO | string | undefined | DecryptableObject;
  firstname?: string;
  lastname?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  direction?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  clientData?: DecryptableObject;
  address?: DecryptableObject;
}
