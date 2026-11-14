import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { verificationClient } from '../verificationClient';

jest.mock('@react-native-async-storage/async-storage', () => ({ setItem: jest.fn(), getItem: jest.fn(), removeItem: jest.fn() }));
jest.mock('expo-secure-store', () => ({ setItemAsync: jest.fn(), getItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));

describe('SDK Supabase instalado con fetch simulado; ninguna petición real', () => {
  const previous = { url: process.env.EXPO_PUBLIC_SUPABASE_URL, key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.example.test';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fixture';
  });
  afterEach(() => {
    if (previous.url === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previous.key;
    expect(AsyncStorage.setItem).not.toHaveBeenCalled(); expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled(); expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('verifyOtp del SDK serializa contrato confirmado y descarta sesión recibida', async () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'fixture-sub', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const transport = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.c3ludGhldGlj`, refresh_token: 'synthetic-supabase-refresh', expires_in: 3600, token_type: 'bearer',
      user: { id: 'fixture-sub', email: 'fixture@uttt.edu.mx', email_confirmed_at: '2026-11-12T12:00:00Z' },
    }), { status: 200 }));
    expect(await verificationClient.verify('fixture@uttt.edu.mx', '012345')).toBeUndefined();
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0]).toBe('https://project.example.test/auth/v1/verify');
    expect(JSON.parse(transport.mock.calls[0][1]!.body as string)).toMatchObject({ email: 'fixture@uttt.edu.mx', token: '012345', type: 'email' });
    expect(transport.mock.calls[0][1]).toMatchObject({ redirect: 'error', credentials: 'omit' });
  });

  test('resend del SDK no llama signup/registro ni logout', async () => {
    const transport = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await verificationClient.resend('fixture@uttt.edu.mx');
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0]).toBe('https://project.example.test/auth/v1/resend');
    expect(JSON.parse(transport.mock.calls[0][1]!.body as string)).toMatchObject({ email: 'fixture@uttt.edu.mx', type: 'signup' });
  });

  test('el SDK propaga código expirado y Retry-After de429 sin interpretar el mensaje', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{"code":"otp_expired","msg":"private-provider-message"}', { status: 403, headers: { 'x-supabase-api-version': '2024-01-01' } }))
      .mockResolvedValueOnce(new Response('{"code":"over_email_send_rate_limit","msg":"private-provider-message"}', { status: 429, headers: { 'retry-after': '120', 'x-supabase-api-version': '2024-01-01' } }));
    await expect(verificationClient.verify('fixture@uttt.edu.mx', '012345')).rejects.toMatchObject({ kind: 'expired_code' });
    await expect(verificationClient.resend('fixture@uttt.edu.mx')).rejects.toMatchObject({ kind: 'rate_limit', retryAfterMs: 120000 });
  });

  test('conexión fallida del SDK no expone error original ni credenciales', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('private-provider-message synthetic-secret'));
    await expect(verificationClient.verify('fixture@uttt.edu.mx', '012345')).rejects.toMatchObject({ kind: 'network' });
  });

  test('timeout aborta fetch y libera recursos del cliente sin reintentos', async () => {
    jest.useFakeTimers();
    const transport = jest.spyOn(globalThis, 'fetch').mockImplementation((_input, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('Synthetic abort')));
    }));
    const request = verificationClient.verify('fixture@uttt.edu.mx', '012345');
    const assertion = expect(request).rejects.toMatchObject({ kind: 'network' });
    await jest.advanceTimersByTimeAsync(15001);
    await assertion;
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });
});
