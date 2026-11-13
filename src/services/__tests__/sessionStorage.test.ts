import * as SecureStore from 'expo-secure-store';

import { sessionStorage } from '../sessionStorage';

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(), getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only-fixture',
}));

describe('Persistencia segura (SecureStore simulado)', () => {
  const secure = jest.mocked(SecureStore);
  beforeEach(() => {
    jest.clearAllMocks();
    secure.isAvailableAsync.mockResolvedValue(true);
    secure.getItemAsync.mockResolvedValue(null);
    secure.setItemAsync.mockResolvedValue(undefined);
    secure.deleteItemAsync.mockResolvedValue(undefined);
  });

  test('guarda solo el token y usa la misma clave/opciones al leer y borrar', async () => {
    await sessionStorage.save('synthetic.jwt');
    secure.getItemAsync.mockResolvedValueOnce('synthetic.jwt');
    expect(await sessionStorage.read()).toBe('synthetic.jwt');
    await sessionStorage.clear();
    const [key, token, options] = secure.setItemAsync.mock.calls[0];
    expect(key).toBe('uttgo.aws.jwt');
    expect(token).toBe('synthetic.jwt');
    expect(options?.requireAuthentication).not.toBe(true);
    expect(secure.getItemAsync).toHaveBeenCalledWith(key, options);
    expect(secure.deleteItemAsync).toHaveBeenCalledWith(key, options);
  });

  test('no inventa una sesión si no hay token', async () => {
    expect(await sessionStorage.read()).toBeNull();
  });

  test('no usa fallback si SecureStore no está disponible', async () => {
    secure.isAvailableAsync.mockResolvedValueOnce(false);
    await expect(sessionStorage.read()).rejects.toMatchObject({ kind: 'storage' });
    expect(secure.getItemAsync).not.toHaveBeenCalled();
  });

  test('fallas nativas se reportan sin revelar tokens', async () => {
    secure.setItemAsync.mockRejectedValueOnce(new Error('synthetic.jwt'));
    await expect(sessionStorage.save('synthetic.jwt')).rejects.toMatchObject({ kind: 'storage' });
    secure.deleteItemAsync.mockRejectedValueOnce(new Error('native error'));
    await expect(sessionStorage.clear()).rejects.toMatchObject({ kind: 'storage' });
  });

  test('serializa save → clear para que logout sea la última escritura', async () => {
    const order: string[] = [];
    secure.setItemAsync.mockImplementationOnce(async () => { order.push('save'); });
    secure.deleteItemAsync.mockImplementationOnce(async () => { order.push('clear'); });
    await Promise.all([sessionStorage.save('synthetic.jwt'), sessionStorage.clear()]);
    expect(order).toEqual(['save', 'clear']);
  });

  test('rechaza tokens vacíos sin escribir', () => {
    expect(() => sessionStorage.save('')).toThrow();
    expect(secure.setItemAsync).not.toHaveBeenCalled();
  });
});
