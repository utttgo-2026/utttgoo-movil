import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAuthSession } from '@/services/authSession';
import { ApiError } from '@/services/api/errors';
import type { User } from '@/types/models';

import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('@/services/authSession', () => ({ createAuthSession: jest.fn() }));
jest.mock('@/services/supabaseAuth', () => ({
  verifySignupOtp: jest.fn(),
  resendSignupOtp: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
}));

const user: User = { id: 'fixture-user', role: 'buyer', fullName: 'Fixture', email: 'fixture@uttt.edu.mx' };
const mockSession = {
  restore: jest.fn(), login: jest.fn(), register: jest.fn(), refreshProfile: jest.fn(), logout: jest.fn(),
};
const { verifySignupOtp, resendSignupOtp } = jest.requireMock('@/services/supabaseAuth') as {
  verifySignupOtp: jest.Mock;
  resendSignupOtp: jest.Mock;
};

describe('AuthContext como única autoridad de sesión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.restore.mockResolvedValue(null);
    mockSession.logout.mockResolvedValue(undefined);
    mockSession.login.mockResolvedValue(user);
    mockSession.register.mockResolvedValue(undefined);
    verifySignupOtp.mockResolvedValue(undefined);
    resendSignupOtp.mockResolvedValue(undefined);
    jest.mocked(createAuthSession).mockReturnValue(mockSession as unknown as ReturnType<typeof createAuthSession>);
  });

  test('no usa ni limpia usuarios legacy AsyncStorage', async () => {
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(AsyncStorage.clear).not.toHaveBeenCalled();
  });

  test('error de AWS/HTTPS no crea comprador ficticio', async () => {
    mockSession.login.mockRejectedValueOnce(new ApiError('insecure_transport', 'HTTPS requerido'));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      expect(await result.current.login(user.email, 'synthetic-password')).toEqual({ success: false, error: 'HTTPS requerido' });
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.status).toBe('blocked');
  });

  test('registro aceptado no autentica', async () => {
    mockSession.register.mockResolvedValueOnce(undefined);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      expect(await result.current.register('Fixture', user.email, 'synthetic-password')).toEqual({ success: true });
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('OTP válido ejecuta inmediatamente el login Backend con la contraseña en memoria', async () => {
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      expect(await result.current.register('Fixture', user.email, 'synthetic-password')).toEqual({ success: true });
      expect(await result.current.verifyEmail(user.email, '123456')).toEqual({ success: true });
    });
    expect(verifySignupOtp).toHaveBeenCalledWith(user.email, '123456');
    expect(mockSession.login).toHaveBeenCalledWith(user.email, 'synthetic-password');
  });

  test('OTP inválido no inicia login Backend', async () => {
    verifySignupOtp.mockRejectedValueOnce(new Error('invalid OTP'));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      await result.current.register('Fixture', user.email, 'synthetic-password');
      expect((await result.current.verifyEmail(user.email, '123456')).success).toBe(false);
    });
    expect(mockSession.login).not.toHaveBeenCalled();
  });

  test('restaura solo usuario validado por el coordinador y logout lo elimina', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => {
      expect(await result.current.logout()).toEqual({ success: true });
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockSession.logout).toHaveBeenCalledTimes(1);
  });

  test('muestra el fallo de borrado seguro sin reportar logout persistente exitoso', async () => {
    mockSession.logout.mockRejectedValueOnce(new ApiError('storage', 'Storage no disponible'));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      expect(await result.current.logout()).toEqual({ success: false, error: 'Storage no disponible' });
    });
    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('blocked');
  });
});
