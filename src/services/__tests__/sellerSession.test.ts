import { AuthSession } from '../authSession';
import { sessionContract } from '../api/sessionContract';
import { sellerService } from '../api/sellerService';
import { ApiError, backendHttpError } from '../api/errors';
import type { SellerActiveResponse } from '@/types/api';

jest.mock('../sessionStorage', () => ({ sessionStorage: {} }));
const input = { businessName: 'Negocio fixture', description: 'Descripción sintética del negocio', pickupPoint: 'Edificio fixture' };
const active: SellerActiveResponse = { ...input, sellerId: 'seller-fixture', status: 'Active', isActive: true,
  roles: ['Buyer', 'Seller'], createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z' };
const identity = { id: 'mongo-fixture', email: 'fixture@uttt.edu.mx', displayName: 'Fixture', roles: ['Buyer'], accountStatus: 'Active' };
function fixture() {
  const deps = {
    storage: { read: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue(undefined), clear: jest.fn().mockResolvedValue(undefined) },
    assertSecureTransport: jest.fn(), contract: sessionContract,
    auth: { login: jest.fn().mockResolvedValue({ status: 200, headers: {}, data: { accessToken: 'synthetic.aws.token', expiresIn: 3600, tokenType: 'Bearer', user: { id: identity.id, roles: ['Buyer'], accountStatus: 'Active' } } }),
      register: jest.fn(), getMe: jest.fn().mockResolvedValue({ status: 200, headers: {}, data: identity }) },
    users: { getMe: jest.fn().mockResolvedValue({ status: 200, headers: {}, data: { ...identity, phone: null, avatarUrl: null } }), updateMe: jest.fn() },
  };
  return { deps, session: new AuthSession(deps) };
}
describe('Seller sobre sesión única sin revelar JWT/cuerpo unknown', () => {
  beforeEach(() => { jest.spyOn(sellerService, 'getMe').mockResolvedValue({ status: 200, headers: {}, data: active }); });
  afterEach(() => jest.restoreAllMocks());
  test('sin sesión no transmite solicitud ni consulta', async () => {
    const post = jest.spyOn(sellerService, 'requestActivation'); const get = jest.spyOn(sellerService, 'getMe');
    const { session } = fixture();
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'unauthenticated' });
    await expect(session.sellerOperation()).rejects.toMatchObject({ kind: 'unauthenticated' });
    expect(post).not.toHaveBeenCalled(); expect(get).not.toHaveBeenCalled();
  });
  test.each([201])('alta HTTP%s valida Active, pero JWT viejo no se reemplaza ni roles se elevan por negocio', async (status) => {
    const post = jest.spyOn(sellerService, 'requestActivation').mockResolvedValue({ status, headers: {}, data: active });
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    const result = await session.sellerOperation(input);
    expect(result).toMatchObject({ status, seller: active, roleSynced: false });
    expect(post).toHaveBeenCalledWith('synthetic.aws.token', input);
    expect(deps.storage.save).toHaveBeenCalledTimes(1);
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'validation' });
    expect(post).toHaveBeenCalledTimes(1);
  });
  test('consulta no interpreta un JSON desconocido como autorización y no permite roles locales', async () => {
    jest.spyOn(sellerService, 'getMe').mockResolvedValue({ status: 200, headers: {}, data: active });
    const { session } = fixture(); const user = await session.login(identity.email, 'synthetic-password');
    expect(await session.sellerOperation()).toMatchObject({ status: 200, seller: active, roleSynced: false });
    expect(user.role).toBe('buyer');
  });
  test('doble operación bloqueada, respuesta tras logout no se aplica', async () => {
    let finish!: (value: { status: number; data: SellerActiveResponse; headers: Record<string, string> }) => void;
    const post = jest.spyOn(sellerService, 'requestActivation').mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    const first = session.sellerOperation(input);
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'validation' });
    await session.logout(); finish({ status: 201, data: active, headers: {} });
    await expect(first).rejects.toMatchObject({ kind: 'cancelled' }); expect(post).toHaveBeenCalledTimes(1);
  });
  test.each([400, 401, 403, 404, 422, 429, 500])('HTTP%s no inventa solicitud pendiente/aprobada/rechazada', async (status) => {
    jest.spyOn(sellerService, 'getMe').mockRejectedValue(new ApiError('http', 'Synthetic failure', status));
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    await expect(session.sellerOperation()).rejects.toMatchObject({ kind: 'http', status });
    expect(deps.storage.clear).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
  });
  test('error temporal de alta no reintenta y prohíbe repetir resultado incierto aun tras consulta', async () => {
    const post = jest.spyOn(sellerService, 'requestActivation').mockRejectedValue(new ApiError('timeout', 'Synthetic timeout'));
    jest.spyOn(sellerService, 'getMe').mockResolvedValue({ status: 200, headers: {}, data: active });
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'timeout' });
    await session.sellerOperation();
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'validation' }); expect(post).toHaveBeenCalledTimes(1);
  });
  test('HTTP/config insegura no llega al servicio vendedor', async () => {
    const post = jest.spyOn(sellerService, 'requestActivation');
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    deps.assertSecureTransport.mockImplementation(() => { throw new ApiError('insecure_transport', 'HTTPS required'); });
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'insecure_transport' }); expect(post).not.toHaveBeenCalled();
  });
  test('activación inmediata refresca identidad con el MISMO JWT y solo adopta Seller validado por /me', async () => {
    jest.spyOn(sellerService, 'requestActivation').mockResolvedValue({ status: 201, headers: {}, data: active });
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    deps.auth.getMe.mockResolvedValue({ status: 200, headers: {}, data: { ...identity, roles: ['Buyer', 'Seller'] } });
    deps.users.getMe.mockResolvedValue({ status: 200, headers: {}, data: { ...identity, roles: ['Buyer', 'Seller'], phone: null, avatarUrl: null } });
    const result = await session.sellerOperation(input);
    expect(result.roleSynced).toBe(true); expect(result.user?.role).toBe('seller');
    expect(deps.auth.getMe).toHaveBeenLastCalledWith('synthetic.aws.token');
    expect(deps.storage.save).toHaveBeenCalledTimes(1); expect(deps.auth.login).toHaveBeenCalledTimes(1);
  });
  test('solo404SELLER_PROFILE_NOT_FOUND de lookup significa ausencia, sin cambiar autoridad del usuario', async () => {
    jest.mocked(sellerService.getMe).mockRejectedValue(backendHttpError(404, { status: 404, code: 'SELLER_PROFILE_NOT_FOUND', correlationId: 'fixture', message: 'private-response' }));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    expect(await session.sellerOperation()).toEqual({ kind: 'missing', status: 404, roleSynced: false });
    expect(session.sellerSubmissionState()).toEqual({ received: false, uncertain: false });
  });
  test.each([[401, 'SELLER_PROFILE_NOT_FOUND'], [403, 'SELLER_PROFILE_NOT_FOUND'], [404, 'PRODUCT_NOT_FOUND'], [404, 'UNKNOWN_CODE'], [503, 'SELLER_UNAVAILABLE']] as const)
  ('HTTP%s/%s no se convierte en ausencia de negocio', async (status, code) => {
    jest.mocked(sellerService.getMe).mockRejectedValue(backendHttpError(status, { status, code, correlationId: 'fixture', message: 'private-response' }));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    await expect(session.sellerOperation()).rejects.toMatchObject({ status });
  });
  test('lookup concurrente comparte perfil e identidad, y una consulta posterior vuelve a AWS', async () => {
    let finish!: (value: { status: number; data: SellerActiveResponse; headers: Record<string, string> }) => void;
    jest.mocked(sellerService.getMe).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    deps.auth.getMe.mockClear(); deps.users.getMe.mockClear();
    const a = session.sellerOperation(); const b = session.sellerOperation();
    expect(sellerService.getMe).toHaveBeenCalledTimes(1);
    finish({ status: 200, headers: {}, data: active });
    expect(await a).toBe(await b);
    expect(deps.auth.getMe).toHaveBeenCalledTimes(1); expect(deps.users.getMe).toHaveBeenCalledTimes(1);
    await session.sellerOperation(); expect(sellerService.getMe).toHaveBeenCalledTimes(2);
  });
  test.each([200, 201])('alta%s confirma por GET antes de exponer Active y permisos', async (status) => {
    const post = jest.spyOn(sellerService, 'requestActivation').mockResolvedValue({ status, headers: {}, data: active });
    const { session, deps } = fixture(); await session.login(identity.email, 'synthetic-password');
    deps.auth.getMe.mockResolvedValue({ status: 200, headers: {}, data: { ...identity, roles: ['Buyer', 'Seller'] } });
    deps.users.getMe.mockResolvedValue({ status: 200, headers: {}, data: { ...identity, roles: ['Buyer', 'Seller'], phone: null, avatarUrl: null } });
    expect(await session.sellerOperation(input)).toMatchObject({ kind: 'active', status, seller: active, roleSynced: true });
    expect(jest.mocked(sellerService.getMe).mock.invocationCallOrder[0]).toBeGreaterThan(post.mock.invocationCallOrder[0]);
    expect(deps.auth.getMe.mock.invocationCallOrder[1]).toBeGreaterThan(jest.mocked(sellerService.getMe).mock.invocationCallOrder[0]);
  });
  test('POST aceptado seguido de GET fallido conserva recibido y prohíbe reenviar', async () => {
    const post = jest.spyOn(sellerService, 'requestActivation').mockResolvedValue({ status: 201, headers: {}, data: active });
    jest.mocked(sellerService.getMe).mockRejectedValueOnce(new ApiError('timeout', 'Fixture timeout'));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'timeout' });
    expect(session.sellerSubmissionState().received).toBe(true);
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'validation' });
    expect(await session.sellerOperation()).toMatchObject({ kind: 'active' });
    expect(post).toHaveBeenCalledTimes(1);
  });
  test('missing después de POST recibido es verificación pendiente, no otra oportunidad de alta', async () => {
    jest.spyOn(sellerService, 'requestActivation').mockResolvedValue({ status: 200, headers: {}, data: active });
    jest.mocked(sellerService.getMe).mockRejectedValue(backendHttpError(404, { status: 404, code: 'SELLER_PROFILE_NOT_FOUND', correlationId: 'fixture', message: 'Fixture missing' }));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'invalid_response' });
    expect(session.sellerSubmissionState().received).toBe(true);
    await expect(session.sellerOperation(input)).rejects.toMatchObject({ kind: 'validation' });
    expect(sellerService.requestActivation).toHaveBeenCalledTimes(1);
  });
  test('lookup tardío tras logout no repuebla perfil y no invalida una sesión posterior', async () => {
    let finish!: (value: { status: number; data: SellerActiveResponse; headers: Record<string, string> }) => void;
    jest.mocked(sellerService.getMe).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const { session } = fixture(); await session.login(identity.email, 'synthetic-password');
    const pending = session.sellerOperation(); await session.logout(); await session.login(identity.email, 'synthetic-password');
    finish({ status: 200, headers: {}, data: active });
    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
    expect(await session.sellerOperation()).toMatchObject({ kind: 'active' });
  });
});
