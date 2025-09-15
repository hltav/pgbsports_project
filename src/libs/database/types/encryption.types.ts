// encryption.types.ts
export type EncryptableModels = {
  user: {
    fields: ['firstname', 'lastname', 'nickname', 'email', 'password'];
  };
  clientdata: {
    fields: ['cpf', 'phone', 'image'];
  };
  address: {
    fields: ['direction', 'neighborhood', 'city', 'state', 'country'];
  };
};

export const ENCRYPTABLE_FIELDS: {
  [K in keyof EncryptableModels]: EncryptableModels[K]['fields'];
} = {
  user: ['firstname', 'lastname', 'nickname', 'email', 'password'],
  clientdata: ['cpf', 'phone', 'image'],
  address: ['direction', 'neighborhood', 'city', 'state', 'country'],
};

export type ModelName = keyof EncryptableModels;
