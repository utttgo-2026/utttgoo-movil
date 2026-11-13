import { authService } from '../authService';
import { adminService } from '../adminService';
import { healthService } from '../healthService';
import { httpClient } from '../httpClient';
import { sellerService } from '../sellerService';
import { userService } from '../userService';

describe('Servicios: construcción de solicitudes documentadas', () => {
  const request = jest.spyOn(httpClient, 'request');
  beforeEach(() => request.mockResolvedValue({ status: 200, headers: {}, data: { fixture: true } }));
  afterEach(() => request.mockReset());
  afterAll(() => request.mockRestore());

  test('login y registro usan cuerpos exactos y no asumen DTO de respuesta', async () => {
    const input = { email: ' Fixture@UTTT.EDU.MX ', password: 'synthetic-password' };
    const response = await authService.login(input);
    expect(response.data).toEqual({ fixture: true });
    expect(request).toHaveBeenLastCalledWith('/api/v1/auth/login', {
      method: 'POST', body: { email: 'fixture@uttt.edu.mx', password: input.password }, expectedStatuses: [200],
    });
    await authService.register({ ...input, displayName: ' Fixture ' });
    expect(request).toHaveBeenLastCalledWith('/api/v1/auth/register', {
      method: 'POST', body: { email: 'fixture@uttt.edu.mx', password: input.password, displayName: 'Fixture' }, expectedStatuses: [202],
    });
  });

  test('ambos /me requieren Bearer', async () => {
    await authService.getMe('synthetic.jwt');
    expect(request).toHaveBeenLastCalledWith('/api/v1/auth/me', { token: 'synthetic.jwt', expectedStatuses: [200] });
    await userService.getMe('synthetic.jwt');
    expect(request).toHaveBeenLastCalledWith('/api/v1/users/me', { token: 'synthetic.jwt', expectedStatuses: [200] });
    expect(() => authService.getMe('')).toThrow();
  });

  test('PATCH perfil omite campos undefined', async () => {
    await userService.updateMe('synthetic.jwt', { displayName: ' Fixture ', phone: undefined });
    expect(request).toHaveBeenLastCalledWith('/api/v1/users/me', {
      method: 'PATCH', token: 'synthetic.jwt', body: { displayName: 'Fixture' }, expectedStatuses: [200],
    });
  });

  test('vendedores: activación 200/201, me, PATCH y público sin token', async () => {
    const input = { businessName: 'Fixture', description: 'Synthetic description', pickupPoint: 'Fixture point' };
    await sellerService.requestActivation('synthetic.jwt', input);
    expect(request).toHaveBeenLastCalledWith('/api/v1/sellers/activation-requests', {
      method: 'POST', token: 'synthetic.jwt', body: input, expectedStatuses: [200, 201],
    });
    await sellerService.getMe('synthetic.jwt');
    expect(request).toHaveBeenLastCalledWith('/api/v1/sellers/me', { token: 'synthetic.jwt', expectedStatuses: [200] });
    await sellerService.updateMe('synthetic.jwt', { pickupPoint: 'New point' });
    expect(request).toHaveBeenLastCalledWith('/api/v1/sellers/me', {
      method: 'PATCH', token: 'synthetic.jwt', body: { pickupPoint: 'New point' }, expectedStatuses: [200],
    });
    await sellerService.getById('seller/fixture');
    expect(request).toHaveBeenLastCalledWith('/api/v1/sellers/seller%2Ffixture', { expectedStatuses: [200] });
  });

  test('admin solo envía parámetros conocidos', async () => {
    await adminService.getUsers('synthetic.jwt', { page: 2, pageSize: 10 });
    expect(request).toHaveBeenCalledWith('/api/v1/admin/users', {
      token: 'synthetic.jwt', query: { page: 2, pageSize: 10 }, expectedStatuses: [200],
    });
  });

  test('health valida la estructura observada; Healthy no se inventa ante un JSON ajeno', async () => {
    request.mockResolvedValueOnce({ status: 200, headers: {}, data: { status: 'Healthy', checks: { mongodb: 'Healthy', redis: 'Healthy' } } });
    expect((await healthService.getHealth()).data.status).toBe('Healthy');
    expect(request).toHaveBeenCalledWith('/health', { expectedStatuses: [200] });
    await expect(healthService.getHealth()).rejects.toMatchObject({ kind: 'invalid_response' });
  });
});
