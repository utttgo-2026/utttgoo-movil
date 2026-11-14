import React from 'react';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { createAuthSession } from '../authSession';
import ProfileScreen from '@/app/buyer/(tabs)/profile';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), navigate: mockNavigate, replace: mockReplace }) }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'fixture-device-only',
  isAvailableAsync: jest.fn(), getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn(),
}));

const valid = {
  accessToken: 'synthetic.aws.token', expiresIn: 3600, tokenType: 'Bearer',
  user: { id: 'synthetic-mongo-id', roles: ['Buyer'], accountStatus: 'Active' },
};
const secure = jest.mocked(SecureStore);
const identity = { id: valid.user.id, email: 'fixture@uttt.edu.mx', displayName: 'Identity fixture', roles: ['Buyer'], accountStatus: 'Active' };
const profile = { id: valid.user.id, email: identity.email, displayName: 'Profile fixture', phone: null, avatarUrl: null, roles: ['Buyer'] };
const expectedUser = { id: valid.user.id, role: 'buyer', fullName: profile.displayName, email: identity.email, accountStatus: 'Active', phone: null, avatar: null };

describe('Login real del cliente/contrato/contexto con fetch y SecureStore simulados', () => {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  let storedToken: string | null;
  let transport: jest.SpyInstance<ReturnType<typeof fetch>, Parameters<typeof fetch>>;
  beforeEach(() => {
    jest.clearAllMocks(); storedToken = null;
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://aws.example.test';
    secure.isAvailableAsync.mockResolvedValue(true);
    secure.getItemAsync.mockImplementation(async () => storedToken);
    secure.setItemAsync.mockImplementation(async (_key, token) => { storedToken = token; });
    secure.deleteItemAsync.mockImplementation(async () => { storedToken = null; });
    transport = jest.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const path = String(url);
      const body = path.endsWith('/auth/login') ? valid : path.endsWith('/auth/me') ? identity : path.endsWith('/users/me') ? profile : null;
      return new Response(JSON.stringify(body), { status: body ? 200 : 404 });
    });
  });
  afterEach(() => {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL; else process.env.EXPO_PUBLIC_API_BASE_URL = previous;
    jest.restoreAllMocks();
  });

  test('login HTTPS valida Buyer/Active y almacena solo accessToken antes de autenticar', async () => {
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect(await result.current.login(' Fixture@UTTT.EDU.MX ', 'synthetic-password')).toEqual({ success: true }); });
    expect(transport).toHaveBeenCalledTimes(3);
    expect(transport).toHaveBeenCalledWith('https://aws.example.test/api/v1/auth/login', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ email: 'fixture@uttt.edu.mx', password: 'synthetic-password' }), redirect: 'error',
    }));
    expect(secure.setItemAsync).toHaveBeenCalledWith('uttgo.aws.jwt', valid.accessToken, { keychainAccessible: 'fixture-device-only' });
    expect(storedToken).toBe(valid.accessToken);
    expect(result.current.status).toBe('authenticated');
    expect(result.current.user).toEqual(expectedUser);
    expect(transport).toHaveBeenCalledWith('https://aws.example.test/api/v1/auth/me', expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${valid.accessToken}` }) }));
    expect(transport).toHaveBeenCalledWith('https://aws.example.test/api/v1/users/me', expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${valid.accessToken}` }) }));
    expect(JSON.stringify(secure.setItemAsync.mock.calls)).not.toContain('synthetic-password');
  });

  test.each([
    ['token vacío', { ...valid, accessToken: '' }], ['expiración inválida', { ...valid, expiresIn: 0 }],
    ['tipo no Bearer', { ...valid, tokenType: 'Basic' }],
    ['cuenta no Active', { ...valid, user: { ...valid.user, accountStatus: 'PendingEmailVerification' } }],
    ['rol no confirmado', { ...valid, user: { ...valid.user, roles: ['Admin'] } }],
  ])('%s no guarda token ni activa AuthContext', async (_name, payload) => {
    transport.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect((await result.current.login('fixture@uttt.edu.mx', 'synthetic-password')).success).toBe(false); });
    expect(secure.setItemAsync).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull(); expect(result.current.isAuthenticated).toBe(false);
  });

  test('fallo SecureStore no produce sesión aunque el login sea válido', async () => {
    secure.setItemAsync.mockRejectedValueOnce(new Error('private-native-error'));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect((await result.current.login('fixture@uttt.edu.mx', 'synthetic-password')).success).toBe(false); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.sessionError).not.toContain('private-native-error');
  });

  test('logout borra solo JWT AWS y restauración sin token vuelve a anónimo', async () => {
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await result.current.login('fixture@uttt.edu.mx', 'synthetic-password'); });
    await act(async () => { expect(await result.current.logout()).toEqual({ success: true }); });
    expect(storedToken).toBeNull(); expect(result.current.isAuthenticated).toBe(false);
    expect(secure.deleteItemAsync).toHaveBeenCalledWith('uttgo.aws.jwt', { keychainAccessible: 'fixture-device-only' });
    expect(await createAuthSession().restore()).toBeNull();
    expect(transport).toHaveBeenCalledTimes(3);
  });

  test('JWT persistido restaura únicamente después de validar ambos /me', async () => {
    storedToken = valid.accessToken;
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual(expectedUser);
    expect(storedToken).toBe(valid.accessToken); expect(secure.deleteItemAsync).not.toHaveBeenCalled();
    expect(transport).toHaveBeenCalledTimes(2);
    expect(secure.setItemAsync).not.toHaveBeenCalled();
  });

  test('PATCH permitido mantiene lista blanca y vuelve a validar identidad/perfil', async () => {
    const session = createAuthSession();
    await session.login('fixture@uttt.edu.mx', 'synthetic-password');
    expect(await session.refreshProfile({ displayName: 'Fixture' })).toEqual(expectedUser);
    expect(transport).toHaveBeenCalledWith('https://aws.example.test/api/v1/users/me', expect.objectContaining({ method: 'PATCH', body: '{"displayName":"Fixture"}' }));
    expect(transport).toHaveBeenCalledTimes(6);
  });

  test('HTTP y correo externo permanecen bloqueados antes de transmitir credenciales', async () => {
    const session = createAuthSession();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://aws.example.test';
    await expect(session.login('fixture@uttt.edu.mx', 'synthetic-password')).rejects.toMatchObject({ kind: 'insecure_transport' });
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://aws.example.test';
    await expect(session.login('fixture@uttt.edu.mx.evil.test', 'synthetic-password')).rejects.toMatchObject({ kind: 'validation' });
    expect(transport).not.toHaveBeenCalled(); expect(secure.setItemAsync).not.toHaveBeenCalled();
  });

  test('logout durante POST pendiente no deja que la respuesta tardía guarde un JWT', async () => {
    let finish!: (response: Response) => void;
    transport.mockImplementationOnce(() => new Promise<Response>((resolve) => { finish = resolve; }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    let login!: ReturnType<typeof result.current.login>;
    await act(async () => { login = result.current.login('fixture@uttt.edu.mx', 'synthetic-password'); });
    await act(async () => { await result.current.logout(); });
    await act(async () => {
      finish(new Response(JSON.stringify(valid), { status: 200 }));
      expect((await login).success).toBe(false);
    });
    expect(storedToken).toBeNull(); expect(result.current.isAuthenticated).toBe(false);
    expect(secure.setItemAsync).not.toHaveBeenCalled();
  });

  test.each([401, 403, 500])('restauración HTTP%s oculta datos y solo401 borra JWT', async (status) => {
    storedToken = valid.accessToken;
    transport.mockResolvedValueOnce(new Response('{}', { status }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.status).toBe('blocked'));
    expect(result.current.user).toBeNull();
    expect(storedToken).toBe(status === 401 ? null : valid.accessToken);
    expect(secure.deleteItemAsync).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
  });

  test('restauración temporalmente sin red no borra token ni expone perfil', async () => {
    storedToken = valid.accessToken;
    transport.mockRejectedValueOnce(new Error('private-network-fixture'));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.status).toBe('blocked'));
    expect(result.current.user).toBeNull(); expect(storedToken).toBe(valid.accessToken);
    expect(secure.deleteItemAsync).not.toHaveBeenCalled();
  });

  test('identidad de otra cuenta no puede completar login ni guardar token', async () => {
    transport.mockResolvedValueOnce(new Response(JSON.stringify(valid), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...identity, id: 'different-mongo-id' }), { status: 200 }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect((await result.current.login(identity.email, 'synthetic-password')).success).toBe(false); });
    expect(secure.setItemAsync).not.toHaveBeenCalled(); expect(result.current.user).toBeNull();
  });

  test('users/me de otra cuenta bloquea restauración sin inventar perfil', async () => {
    storedToken = valid.accessToken;
    transport.mockResolvedValueOnce(new Response(JSON.stringify(identity), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...profile, id: 'different-mongo-id' }), { status: 200 }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.status).toBe('blocked'));
    expect(result.current.user).toBeNull(); expect(storedToken).toBe(valid.accessToken);
  });

  test('perfil existente muestra datos users/me al restaurar, sin bucle de consultas; logout oculta datos', async () => {
    storedToken = valid.accessToken;
    const view = await render(<AuthProvider><ProfileScreen /></AuthProvider>);
    await waitFor(() => expect(view.getByText(profile.displayName)).toBeTruthy());
    expect(view.getByText(profile.email)).toBeTruthy();
    expect(view.queryByText('Mariana López Cruz')).toBeNull();
    expect(transport).toHaveBeenCalledTimes(2);
    await fireEvent.press(view.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/welcome'));
    expect(storedToken).toBeNull(); expect(view.queryByText(profile.email)).toBeNull();
  });

  test('guarda privada no monta perfil mientras /me está pendiente ni tras error temporal; permite seguir explorando', async () => {
    storedToken = valid.accessToken;
    let finish!: (response: Response) => void;
    transport.mockImplementationOnce(() => new Promise<Response>((resolve) => { finish = resolve; }));
    const view = await render(<AuthProvider><ProfileScreen /></AuthProvider>);
    expect(view.queryByText(profile.displayName)).toBeNull();
    await act(async () => { finish(new Response('{}', { status: 500 })); });
    await waitFor(() => expect(view.getByText('Exploras como invitado')).toBeTruthy());
    expect(view.queryByText(profile.email)).toBeNull(); expect(storedToken).toBe(valid.accessToken);
    await fireEvent.press(view.getByRole('button', { name: 'Seguir explorando' }));
    expect(mockNavigate).toHaveBeenCalledWith('/buyer');
  });
});
