import * as SecureStore from 'expo-secure-store';

import { ApiError } from './api/errors';
import { bearerToken } from '@/utils/apiValidation';

const TOKEN_KEY = 'uttgo.aws.jwt';
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface SessionStorage {
  read: () => Promise<string | null>;
  save: (token: string) => Promise<void>;
  clear: () => Promise<void>;
}

// Serializa escritura y borrado: un login pendiente no puede reescribir después de logout.
let pending: Promise<unknown> = Promise.resolve();
function storedOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(async () => {
    try {
      if (!await SecureStore.isAvailableAsync()) throw new Error('Unavailable');
      return await operation();
    } catch {
      throw new ApiError('storage', 'No se pudo acceder al almacenamiento seguro de la sesión.');
    }
  });
  pending = result.catch(() => undefined);
  return result;
}

export const sessionStorage: SessionStorage = {
  read: () => storedOperation(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY, options);
    return token === null ? null : bearerToken(token);
  }),
  save: (token) => {
    const validated = bearerToken(token);
    return storedOperation(() => SecureStore.setItemAsync(TOKEN_KEY, validated, options));
  },
  clear: () => storedOperation(() => SecureStore.deleteItemAsync(TOKEN_KEY, options)),
};
