/** Regression at the native boundary, not a replacement implementation in the application. */
const mockUuid = jest.fn(() => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID());
const mockDigest = jest.fn(async (_algorithm: string, text: string) => jest.requireActual<typeof import('node:crypto')>('node:crypto').createHash('sha256').update(text).digest('hex'));
let mockNativeAvailable = true;

jest.mock('../../../node_modules/expo-crypto/build/ExpoCrypto.js', () => {
  if (!mockNativeAvailable) throw new Error("Cannot find native module 'ExpoCrypto'");
  return { __esModule: true, default: { randomUUID: mockUuid, digestStringAsync: mockDigest } };
});
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: () => Promise.resolve(true), hideAsync: () => Promise.resolve() }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('Bootstrap y Crypto oficial con registro nativo simulado', () => {
  beforeEach(() => { mockNativeAvailable = true; mockUuid.mockClear(); mockDigest.mockClear(); });
  afterEach(() => jest.restoreAllMocks());
  test('si falta el módulo nativo, el layout falla por ExpoCrypto antes de inicializar AuthContext; no se oculta', () => {
    mockNativeAvailable = false;
    jest.isolateModules(() => {
      expect(() => jest.requireActual('@/app/_layout')).toThrow("Cannot find native module 'ExpoCrypto'");
    });
    expect(mockUuid).not.toHaveBeenCalled(); expect(mockDigest).not.toHaveBeenCalled();
  });
  test('con módulo disponible se cargan sesión, provider y export ErrorBoundary sin resolver un registro ausente', () => {
    jest.isolateModules(() => {
      const root = jest.requireActual<typeof import('@/app/_layout')>('@/app/_layout');
      const auth = jest.requireActual<typeof import('@/context/AuthContext')>('@/context/AuthContext');
      const session = jest.requireActual<typeof import('@/services/authSession')>('@/services/authSession');
      expect(typeof root.default).toBe('function'); expect(typeof root.ErrorBoundary).toBe('function');
      expect(typeof auth.AuthProvider).toBe('function'); expect(typeof session.AuthSession).toBe('function');
    });
    expect(mockUuid).not.toHaveBeenCalled(); expect(mockDigest).not.toHaveBeenCalled();
  });
  test('API JS real de expo-crypto delega UUIDv4 y SHA256 al proveedor nativo, sin Math.random', async () => {
    const insecure = jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Insecure random forbidden'); });
    let pending: Promise<string> | undefined;
    jest.isolateModules(() => {
      const crypto = jest.requireActual<typeof import('expo-crypto')>('expo-crypto');
      const first = crypto.randomUUID(), second = crypto.randomUUID();
      expect(first).toMatch(/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i);
      expect(second).not.toBe(first);
      pending = crypto.digestStringAsync(crypto.CryptoDigestAlgorithm.SHA256, 'abc');
    });
    await expect(pending).resolves.toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(mockUuid).toHaveBeenCalledTimes(2); expect(mockDigest).toHaveBeenCalledTimes(1); expect(insecure).not.toHaveBeenCalled();
  });
});
