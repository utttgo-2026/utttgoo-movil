import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as authModule from '@/services/authSession';
import { AuthProvider, useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({ WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'fixture', isAvailableAsync: async () => true,
  getItemAsync: async () => 'synthetic.aws.jwt', setItemAsync: async () => undefined, deleteItemAsync: jest.fn(async () => undefined) }));

interface BabelApi { transformSync(source: string, options: Record<string, unknown>): { ast?: unknown } | null }
interface RefreshApi {
  register(type: unknown, id: string): void;
  setSignature(type: unknown, key: string, forceReset: boolean): void;
  performReactRefresh(): { staleFamilies: Set<unknown>; updatedFamilies: Set<unknown> } | null;
  getFamilyByType(type: unknown): unknown;
}
function resetFlag(ast: unknown): boolean | undefined {
  if (!ast || typeof ast !== 'object') return undefined;
  if (Array.isArray(ast)) {
    for (const item of ast) { const found = resetFlag(item); if (found !== undefined) return found; }
    return undefined;
  }
  const node = ast as Record<string, unknown>;
  if (node.type === 'CallExpression' && node.callee && typeof node.callee === 'object' && Array.isArray(node.arguments)) {
    const callee = node.callee as Record<string, unknown>;
    const first = node.arguments[0] as Record<string, unknown> | undefined;
    if (typeof callee.name === 'string' && /^_s\d*$/.test(callee.name) && first && first.name === 'AuthProvider') {
      const third = node.arguments[2] as Record<string, unknown> | undefined;
      return !!third && third.value === true;
    }
  }
  for (const value of Object.values(node)) { const found = resetFlag(value); if (found !== undefined) return found; }
  return undefined;
}
const profile = { id: 'synthetic-user', email: 'fixture@uttt.edu.mx', displayName: 'Fixture', roles: ['Buyer', 'Seller'], accountStatus: 'Active' };
const seller = { sellerId: 'synthetic-seller', storeName: 'Negocio fixture', description: 'Comida del campus fixture', phone: '5551234567',
  status: 'Active', isActive: true, roles: ['Buyer', 'Seller'], createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z' };

describe('Coherencia Refresh y coordinador real de vendedor', () => {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://aws.example.test';
    jest.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const path = new URL(String(url)).pathname;
      const body = path.endsWith('/sellers/me') ? seller : path.endsWith('/auth/me') ? profile :
        path.endsWith('/users/me') ? { ...profile, phone: null, avatarUrl: null } : null;
      if (!body) throw new Error('Unexpected synthetic request');
      return new Response(JSON.stringify(body), { status: 200 });
    });
  });
  afterEach(() => { jest.restoreAllMocks(); if (previous === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL; else process.env.EXPO_PUBLIC_API_BASE_URL = previous; });

  test('Babel/React Refresh descarta el estado viejo del AuthProvider al cambiar el módulo', () => {
    const babel = jest.requireActual<BabelApi>('@babel/core');
    const runtime = jest.requireActual<RefreshApi>('react-refresh/runtime');
    const source = readFileSync(join(process.cwd(), 'src/context/AuthContext.tsx'), 'utf8');
    const result = babel.transformSync(source, { filename: 'AuthContext.tsx', configFile: false, babelrc: false,
      ast: true, code: false, parserOpts: { plugins: ['typescript', 'jsx'] }, plugins: [[require.resolve('react-refresh/babel'), { skipEnvCheck: true }]] });
    if (!result || !result.ast) throw new Error('Refresh transform did not produce an AST');
    const forceReset = resetFlag(result.ast);
    if (forceReset === undefined) throw new Error('AuthProvider Refresh signature missing');
    function PreviousProvider() { return null; }
    function UpdatedProvider() { return null; }
    runtime.setSignature(PreviousProvider, 'same-hook-signature', forceReset);
    runtime.setSignature(UpdatedProvider, 'same-hook-signature', forceReset);
    runtime.register(PreviousProvider, 'seller-refresh-real-provider');
    const family = runtime.getFamilyByType(PreviousProvider);
    runtime.register(UpdatedProvider, 'seller-refresh-real-provider');
    const update = runtime.performReactRefresh();
    if (!update) throw new Error('Refresh did not schedule an update');
    expect(update.staleFamilies.has(family)).toBe(true);
    expect(update.updatedFamilies.has(family)).toBe(false);
  });

  test('instancia REAL incompleta no concede acceso; remontaje crea factory real y restaura sin recrear credenciales', async () => {
    const factory = authModule.createAuthSession;
    const instances: authModule.AuthSession[] = [];
    const create = jest.spyOn(authModule, 'createAuthSession').mockImplementation(() => {
      const session = factory(); instances.push(session); return session;
    });
    const first = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(first.result.current.isAuthenticated).toBe(true));
    const old = instances[0];
    if (!old) throw new Error('Real coordinator was not initialized');
    expect(old).toBeInstanceOf(authModule.AuthSession);
    Object.defineProperty(old, 'sellerSubmissionState', { value: undefined });
    await act(async () => { await expect(first.result.current.consultSeller()).resolves.toMatchObject({ success: false }); });
    await first.unmount();
    const second = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(second.result.current.isAuthenticated).toBe(true));
    await act(async () => { await expect(second.result.current.consultSeller()).resolves.toMatchObject({ success: true, kind: 'active', seller, roleSynced: true }); });
    expect(create).toHaveBeenCalledTimes(2); expect(instances[1]).not.toBe(old);
    expect(second.result.current.role).toBe('seller');
  });

  test('Context y factory REALES: consulta404, POST201 con DTO inválido, GETActive y roles, sin repetir POST', async () => {
    let exists = false; let posts = 0;
    jest.mocked(globalThis.fetch).mockImplementation(async (url, options) => {
      const path = new URL(String(url)).pathname;
      const roles = exists ? ['Buyer', 'Seller'] : ['Buyer'];
      if (path.endsWith('/sellers/activation-requests') && options && options.method === 'POST') {
        posts++; exists = true;
        // AWS persisted the seller, but this POST body cannot pass the confirmed DTO decoder.
        return new Response(JSON.stringify({ incompatible: true }), { status: 201 });
      }
      if (path.endsWith('/sellers/me')) return new Response(JSON.stringify(exists ? seller : {
        status: 404, code: 'SELLER_PROFILE_NOT_FOUND', correlationId: 'fixture', message: 'Fixture missing',
      }), { status: exists ? 200 : 404 });
      if (path.endsWith('/auth/me')) return new Response(JSON.stringify({ ...profile, roles }), { status: 200 });
      if (path.endsWith('/users/me')) return new Response(JSON.stringify({ ...profile, roles, phone: null, avatarUrl: null }), { status: 200 });
      throw new Error('Unexpected synthetic request');
    });
    const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    await act(async () => { await expect(result.current.consultSeller()).resolves.toMatchObject({ success: true, kind: 'missing' }); });
    const body = { storeName: seller.storeName, description: seller.description, phone: seller.phone };
    await act(async () => {
      await expect(result.current.requestSellerActivation(body)).resolves.toMatchObject({ success: true, kind: 'active', status: 200, reconciled: true, roleSynced: true });
    });
    expect(posts).toBe(1); expect(result.current.role).toBe('seller');
    await act(async () => { await expect(result.current.requestSellerActivation(body)).resolves.toMatchObject({ success: false, received: true }); });
    expect(posts).toBe(1);
  });

  test('consulta del coordinador REAL termina cancelada después de desmontar el Context, sin afectar el nuevo', async () => {
    let finish!: (response: Response) => void;
    jest.mocked(globalThis.fetch).mockImplementation(async (url) => {
      const path = new URL(String(url)).pathname;
      if (path.endsWith('/sellers/me')) return new Promise<Response>((resolve) => { finish = resolve; });
      const body = path.endsWith('/auth/me') ? profile : path.endsWith('/users/me') ? { ...profile, phone: null, avatarUrl: null } : null;
      if (!body) throw new Error('Unexpected synthetic request');
      return new Response(JSON.stringify(body), { status: 200 });
    });
    const old = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(old.result.current.isAuthenticated).toBe(true));
    let pending!: ReturnType<typeof old.result.current.consultSeller>;
    await act(async () => { pending = old.result.current.consultSeller(); });
    await waitFor(() => expect(finish).toBeDefined());
    await old.unmount();
    const current = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(current.result.current.isAuthenticated).toBe(true));
    await act(async () => {
      finish(new Response(JSON.stringify(seller), { status: 200 }));
      await expect(pending).resolves.toMatchObject({ success: false, error: 'La operación de sesión fue cancelada.' });
    });
    expect(current.result.current.role).toBe('seller');
  });
  test('401 de consulta REAL desmontada no borra el JWT usado por el Context nuevo', async () => {
    let finish!: (response: Response) => void;
    jest.mocked(globalThis.fetch).mockImplementation(async (url) => {
      const path = new URL(String(url)).pathname;
      if (path.endsWith('/sellers/me')) return new Promise<Response>((resolve) => { finish = resolve; });
      const body = path.endsWith('/auth/me') ? profile : path.endsWith('/users/me') ? { ...profile, phone: null, avatarUrl: null } : null;
      if (!body) throw new Error('Unexpected synthetic request');
      return new Response(JSON.stringify(body), { status: 200 });
    });
    const old = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(old.result.current.isAuthenticated).toBe(true));
    let pending!: ReturnType<typeof old.result.current.consultSeller>;
    await act(async () => { pending = old.result.current.consultSeller(); });
    await waitFor(() => expect(finish).toBeDefined()); await old.unmount();
    const current = await renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(current.result.current.isAuthenticated).toBe(true));
    await act(async () => {
      finish(new Response(JSON.stringify({ status: 401, code: 'UNAUTHORIZED', correlationId: 'fixture', message: 'Fixture unauthorized' }), { status: 401 }));
      await expect(pending).resolves.toMatchObject({ success: false, error: 'La operación de sesión fue cancelada.' });
    });
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled(); expect(current.result.current.role).toBe('seller');
  });
});
