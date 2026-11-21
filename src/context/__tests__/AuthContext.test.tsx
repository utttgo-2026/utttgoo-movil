import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAuthSession } from '@/services/authSession';
import { ApiError } from '@/services/api/errors';
import type { User } from '@/types/models';

import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('@/services/authSession', () => ({ createAuthSession: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
}));

const user: User = { id: 'fixture-user', role: 'buyer', fullName: 'Fixture', email: 'fixture@uttt.edu.mx' };
const mockSession = {
  restore: jest.fn(), login: jest.fn(), register: jest.fn(), refreshProfile: jest.fn(), logout: jest.fn(), sellerOperation: jest.fn(),
  sellerSubmissionState: () => ({ received: false, uncertain: false }),
  cancelPendingOperations: jest.fn(),
};

describe('AuthContext como única autoridad de sesión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.restore.mockResolvedValue(null);
    mockSession.logout.mockResolvedValue(undefined);
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

  test('refrescar oculta datos hasta validación; un fallo temporal no conserva información privada visible', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    let fail!: (error: Error) => void;
    mockSession.refreshProfile.mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    let refreshing!: ReturnType<typeof result.current.refreshProfile>;
    await act(async () => { refreshing = result.current.refreshProfile(); });
    expect(result.current.user).toBeNull(); expect(result.current.status).toBe('restoring');
    await act(async () => { fail(new ApiError('network', 'Synthetic network error')); await refreshing; });
    expect(result.current.user).toBeNull(); expect(result.current.status).toBe('blocked');
    expect(mockSession.logout).not.toHaveBeenCalled();
  });

  test('último refresco prevalece y una respuesta anterior no repone un perfil viejo', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    let finishOld!: (value: User) => void;
    mockSession.refreshProfile.mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve; }))
      .mockResolvedValueOnce({ ...user, fullName: 'Latest fixture' });
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    let old!: ReturnType<typeof result.current.refreshProfile>;
    await act(async () => { old = result.current.refreshProfile(); });
    await act(async () => { await result.current.refreshProfile(); });
    await act(async () => { finishOld({ ...user, fullName: 'Old fixture' }); expect((await old).success).toBe(false); });
    expect(result.current.user?.fullName).toBe('Latest fixture');
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('capacidades seller exigen sesión validada y aceptación no altera rol Buyer', async () => {
    const anonymous = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect((await anonymous.result.current.consultSeller()).success).toBe(false); });
    expect(mockSession.sellerOperation).not.toHaveBeenCalled(); await anonymous.unmount();
    mockSession.restore.mockResolvedValueOnce(user);
    mockSession.sellerOperation.mockResolvedValueOnce({ kind: 'active', status: 201, seller: { sellerId: 'seller-fixture' }, roleSynced: false });
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect(await result.current.requestSellerActivation({ storeName: 'Fixture', description: 'Synthetic business', phone: '5551234567' }))
      .toEqual({ success: true, kind: 'active', status: 201, seller: { sellerId: 'seller-fixture' }, roleSynced: false, received: false, uncertain: false }); });
    expect(result.current.role).toBe('buyer'); expect(result.current.user).toEqual(user);
  });

  test('401 seller invalida contexto sin conceder rol mientras403 conserva identidad existente', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    mockSession.sellerOperation.mockRejectedValueOnce(new ApiError('http', 'Synthetic403', 403))
      .mockRejectedValueOnce(new ApiError('http', 'Synthetic401', 401));
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { expect((await result.current.consultSeller()).success).toBe(false); });
    expect(result.current.isAuthenticated).toBe(true);
    await act(async () => { expect((await result.current.consultSeller()).success).toBe(false); });
    expect(result.current.isAuthenticated).toBe(false); expect(result.current.user).toBeNull();
  });
  test('reproducción176: instancia sin sellerSubmissionState debe resolver error, no rechazar desde catch', async () => {
    const incompatible = { ...mockSession, sellerOperation: jest.fn().mockRejectedValue(new ApiError('network', 'Fallo de red fixture')), sellerSubmissionState: undefined };
    incompatible.restore.mockResolvedValueOnce(user);
    jest.mocked(createAuthSession).mockReturnValueOnce(incompatible as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, error: expect.stringContaining('Recarga') });
    });
    expect(result.current.role).toBe('buyer');
    expect(incompatible.sellerOperation).not.toHaveBeenCalled();
  });
  test('método sellerOperation obligatorio ausente falla antes de operar, sin optional chaining ni éxito ficticio', async () => {
    const snapshot = jest.fn(() => ({ received: false, uncertain: false }));
    mockSession.restore.mockResolvedValueOnce(user);
    const incompatible = { ...mockSession, sellerOperation: undefined, sellerSubmissionState: snapshot };
    jest.mocked(createAuthSession).mockReturnValueOnce(incompatible as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, error: expect.stringContaining('Recarga') });
    });
    expect(snapshot).not.toHaveBeenCalled(); expect(result.current.user).toEqual(user);
  });
  test.each([undefined, { received: false }, { received: 'false', uncertain: false }])('snapshot obligatorio incompatible no se normaliza a valores falsos: %j', async (value) => {
    mockSession.restore.mockResolvedValueOnce(user);
    const operation = jest.fn();
    const incompatible = { ...mockSession, sellerOperation: operation, sellerSubmissionState: () => value };
    jest.mocked(createAuthSession).mockReturnValueOnce(incompatible as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, error: expect.stringContaining('Recarga') }); });
    expect(operation).not.toHaveBeenCalled();
  });
  test('useState retiene objeto incompatible al rerender; remount completo usa factory actual y restaura sesión', async () => {
    mockSession.restore.mockResolvedValue(user);
    const old = { ...mockSession, sellerOperation: jest.fn(), sellerSubmissionState: undefined };
    jest.mocked(createAuthSession).mockReturnValue(old as unknown as ReturnType<typeof createAuthSession>);
    const first = await renderHook(useAuth, { wrapper: AuthProvider });
    const fresh = { ...mockSession, sellerOperation: jest.fn().mockResolvedValue({ kind: 'active', status: 200, seller: { sellerId: 'seller-fixture' }, roleSynced: false }) };
    jest.mocked(createAuthSession).mockReturnValue(fresh as unknown as ReturnType<typeof createAuthSession>);
    await first.rerender(undefined);
    await act(async () => { await expect(first.result.current.consultSeller()).resolves.toMatchObject({ success: false, error: expect.stringContaining('Recarga') }); });
    expect(createAuthSession).toHaveBeenCalledTimes(1); expect(fresh.sellerOperation).not.toHaveBeenCalled();
    await first.unmount();
    const second = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await expect(second.result.current.consultSeller()).resolves.toMatchObject({ success: true, kind: 'active' }); });
    expect(createAuthSession).toHaveBeenCalledTimes(2); expect(second.result.current.user).toEqual(user);
  });
  test.each([401, 403, 503])('errorHTTP%s sobrevive aunque el lector de metadata lance dentro del catch', async (status) => {
    mockSession.restore.mockResolvedValueOnce(user);
    const snapshot = jest.fn().mockReturnValueOnce({ received: false, uncertain: false }).mockImplementation(() => { throw new Error('private-getter-secret'); });
    const failed = { ...mockSession, sellerSubmissionState: snapshot, sellerOperation: jest.fn().mockRejectedValue(new ApiError('http', 'Error HTTP fixture', status)) };
    jest.mocked(createAuthSession).mockReturnValueOnce(failed as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, status, error: 'Error HTTP fixture' }); });
    expect(result.current.isAuthenticated).toBe(status !== 401);
    expect(result.current.sessionError ?? '').not.toContain('private-getter');
  });
  test('fallo de metadata después de iniciar un alta no actualiza rol ni permite repetir con falsa certeza', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    const snapshot = jest.fn().mockReturnValueOnce({ received: false, uncertain: false }).mockImplementation(() => { throw new Error('private-metadata-error'); });
    const failed = { ...mockSession, sellerSubmissionState: snapshot, sellerOperation: jest.fn().mockResolvedValue({ kind: 'active', status: 201,
      roleSynced: true, user: { ...user, role: 'seller' }, seller: { sellerId: 'seller-fixture' } }) };
    jest.mocked(createAuthSession).mockReturnValueOnce(failed as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      await expect(result.current.requestSellerActivation({ storeName: 'Fixture', description: 'Synthetic business', phone: '5551234567' }))
        .resolves.toMatchObject({ success: false, uncertain: true, error: expect.stringContaining('Recarga') });
    });
    expect(result.current.role).toBe('buyer'); expect(failed.sellerOperation).toHaveBeenCalledTimes(1);
  });
  test.each([false, true])('respuesta o rechazo tras logout se descarta sin leer metadata tardía (rechazo=%s)', async (rejects) => {
    mockSession.restore.mockResolvedValueOnce(user);
    let finish!: (value: unknown) => void; let fail!: (error: Error) => void;
    const snapshot = jest.fn(() => ({ received: false, uncertain: false }));
    const pendingSession = { ...mockSession, sellerSubmissionState: snapshot, sellerOperation: jest.fn(() => new Promise((resolve, reject) => { finish = resolve; fail = reject; })) };
    jest.mocked(createAuthSession).mockReturnValueOnce(pendingSession as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    let pending!: ReturnType<typeof result.current.consultSeller>;
    await act(async () => { pending = result.current.consultSeller(); });
    await act(async () => { await result.current.logout(); });
    await act(async () => {
      if (rejects) fail(new ApiError('network', 'Late network fixture'));
      else finish({ kind: 'active', status: 200, roleSynced: true, user: { ...user, role: 'seller' }, seller: { sellerId: 'seller-fixture' } });
      await expect(pending).resolves.toMatchObject({ success: false, error: 'La operación de sesión fue cancelada.' });
    });
    expect(snapshot).toHaveBeenCalledTimes(1); expect(result.current.user).toBeNull(); expect(result.current.isAuthenticated).toBe(false);
  });
  test('rechazo inesperado se sanitiza y resuelvefailure; resultado incompatible tampoco se acepta', async () => {
    mockSession.restore.mockResolvedValueOnce(user);
    const operation = jest.fn().mockRejectedValueOnce(new Error('private-native-error')).mockResolvedValueOnce(undefined);
    jest.mocked(createAuthSession).mockReturnValueOnce({ ...mockSession, sellerOperation: operation } as unknown as ReturnType<typeof createAuthSession>);
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => { await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, error: 'No se pudo completar la operación. Intenta nuevamente.' }); });
    await act(async () => { await expect(result.current.consultSeller()).resolves.toMatchObject({ success: false, error: expect.stringContaining('Recarga') }); });
    expect(result.current.role).toBe('buyer');
  });
});
