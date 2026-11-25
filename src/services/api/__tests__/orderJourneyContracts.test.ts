import { orderService, createOrderBody } from '../orderService';
import { deliveryCredential, orderPr27, orderPagePr27, validDeliveryToken } from '../orderContractsPr27';
import { httpClient, HttpClient } from '../httpClient';
import { orderFixture as order } from '../../__fixtures__/order';
import { orderDiagnostic } from '../orderDiagnostics';
import { ApiError, backendHttpError } from '../errors';

const qr = 'A'.repeat(43);
describe('Contratos de pedidos desplegados, sin red real', () => {
  beforeEach(() => { jest.spyOn(console, 'info').mockImplementation(() => undefined); });
  afterEach(() => jest.restoreAllMocks());
  test('POST201 exacto y replay200 documentado, sin precio/pago cliente', async () => {
    const spy = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: order });
    expect(await orderService.create('fixture.jwt', { productId: order.productId, quantity: 2 })).toEqual(order);
    expect(spy).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({ body: { productId: order.productId, quantity: 2 }, expectedStatuses: [201, 200] }));
    spy.mockResolvedValueOnce({ status: 200, headers: {}, data: { ...order, status: 'Accepted' } });
    expect(await orderService.create('fixture.jwt', { productId: order.productId, quantity: 2 })).toMatchObject({ status: 'Accepted' });
  });
  test('Idempotency-Key UUIDv4 via header, nunca body; no reenvío interno', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify(order), { status: 201 }));
    const client = new HttpClient({ baseUrl: () => 'https://fixture.example.test', fetch: fetcher });
    await client.request('/api/v1/orders', { method: 'POST', token: 'fixture.jwt', body: { productId: order.productId, quantity: 2 }, idempotencyKey: '12345678-1234-4123-8123-123456789012' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1]).toMatchObject({ headers: { 'Idempotency-Key': '12345678-1234-4123-8123-123456789012' }, body: JSON.stringify({ productId: order.productId, quantity: 2 }) });
    await expect(client.request('/api/v1/products', { method: 'POST', idempotencyKey: 'private' })).rejects.toMatchObject({ kind: 'validation' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  test('lectura privada de pedidos solicita datos frescos, sin cache HTTP reutilizada', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const client = new HttpClient({ baseUrl: () => 'https://fixture.example.test', fetch: fetcher });
    await client.request('/api/v1/orders/mine', { token: 'fixture.jwt', query: { page: 1, pageSize: 20 } });
    expect(fetcher).toHaveBeenCalledWith('https://fixture.example.test/api/v1/orders/mine?page=1&pageSize=20', expect.objectContaining({ cache: 'no-store', headers: expect.objectContaining({ 'Cache-Control': 'no-cache' }) }));
  });
  test.each([0, 51, 1.5, NaN])('cantidad %s inválida antes de red', (quantity) => { expect(() => createOrderBody({ productId: order.productId, quantity })).toThrow(); });
  test.each([0, 51, 100])('pageSize%s no se envía', async (size) => {
    const spy = jest.spyOn(httpClient, 'request');
    await expect(orderService.mine('fixture.jwt', 1, size)).rejects.toMatchObject({ kind: 'validation' }); expect(spy).not.toHaveBeenCalled();
  });
  test('mine y seller usan page/pageSize sin status ni sort que oculte pedidos', async () => {
    const spy = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { items: [{ ...order, role: 'buyer' }], page: 2, pageSize: 20, totalCount: 21 } });
    expect(await orderService.mine('fixture.jwt', 2)).toMatchObject({ page: 2, totalCount: 21 });
    expect(spy).toHaveBeenLastCalledWith('/api/v1/orders/mine', { token: 'fixture.jwt', query: { page: 2, pageSize: 20 }, expectedStatuses: [200] });
    spy.mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [{ ...order, role: 'seller' }], page: 1, pageSize: 20, totalCount: 1 } });
    expect((await orderService.sellerMine('fixture.jwt')).items[0].role).toBe('seller');
    expect(spy).toHaveBeenLastCalledWith('/api/v1/sellers/me/orders', { token: 'fixture.jwt', query: { page: 1, pageSize: 20 }, expectedStatuses: [200] });
  });
  test('cancelación sin body y status con versión; Delivered no permitido vía PATCH', async () => {
    const spy = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { orderId: order.orderId, status: 'CancelledByBuyer', version: '1', completedAt: order.createdAt } });
    expect(await orderService.cancel('fixture.jwt', order.orderId)).toMatchObject({ status: 'CancelledByBuyer', version: 1 });
    expect(spy).toHaveBeenLastCalledWith(`/api/v1/orders/${order.orderId}/cancel`, { method: 'POST', token: 'fixture.jwt', expectedStatuses: [200] });
    spy.mockResolvedValueOnce({ status: 200, headers: {}, data: { orderId: order.orderId, status: 'Accepted', version: 1, updatedAt: order.createdAt } });
    await orderService.updateStatus('fixture.jwt', order.orderId, 'Accepted', 0);
    expect(spy).toHaveBeenLastCalledWith(`/api/v1/orders/${order.orderId}/status`, { method: 'PATCH', token: 'fixture.jwt', body: { status: 'Accepted', version: 0 }, expectedStatuses: [200] });
    await expect(orderService.updateStatus('fixture.jwt', order.orderId, 'Delivered' as 'Accepted', 0)).rejects.toMatchObject({ kind: 'validation' });
    expect(spy).toHaveBeenCalledTimes(2);
  });
  test('Pendientes consulta status en servidor y no interpreta un 200 con otro estado como lista vacía', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: {
      items: [{ ...order, role: 'seller' }], page: 2, pageSize: 20, totalCount: 25,
    } });
    expect((await orderService.sellerMine('fixture.jwt', 2, 20, 'Pending')).items[0].status).toBe('Pending');
    expect(request).toHaveBeenCalledWith('/api/v1/sellers/me/orders', expect.objectContaining({ query: { page: 2, pageSize: 20, status: 'Pending' } }));
    await expect(orderService.sellerMine('fixture.jwt', 2, 20, 'Ready')).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test.each([[401, 'UNAUTHORIZED'], [403, 'ORDER_FORBIDDEN'], [400, 'VALIDATION_ERROR'], [409, 'ORDER_VERSION_CONFLICT']] as const)('PATCH %i registra método, origen, versión y código, sin request privado', async (status, code) => {
    const correlationId = '0HNQ9283G4KFI:00000001';
    const error = backendHttpError(status, { status, code, correlationId, message: 'private-body' });
    const request = jest.spyOn(httpClient, 'request').mockRejectedValue(error);
    await expect(orderService.updateStatus('private-jwt', order.orderId, 'Accepted', 7)).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('[orders-http]', expect.objectContaining({ phase: 'failed', method: 'PATCH', route: '/api/v1/orders/{orderId}/status', screen: 'seller-order-detail', transition: 'Accepted', orderVersion: 7, status, code, correlationId }));
    expect(JSON.stringify(jest.mocked(console.info).mock.calls)).not.toMatch(new RegExp(`private-jwt|private-body|${order.orderId}`));
  });
  test('credencial201 y confirmación200 exactas, solo token del backend', async () => {
    const payload = { orderId: order.orderId, token: qr, expiresAt: new Date(Date.now() + 900000).toISOString() };
    const spy = jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 201, headers: {}, data: payload })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: { orderId: order.orderId, status: 'Delivered', deliveredAt: order.createdAt, version: 5 } });
    expect(await orderService.deliveryToken('fixture.jwt', order.orderId)).toEqual(payload);
    await orderService.confirmDelivery('fixture.jwt', order.orderId, qr);
    expect(spy).toHaveBeenLastCalledWith(`/api/v1/orders/${order.orderId}/delivery-confirmations`, { method: 'POST', token: 'fixture.jwt', body: { token: qr }, expectedStatuses: [200] });
  });
  test.each(['', 'wrong', 'A'.repeat(42), 'https://private.invalid', 'A'.repeat(42) + '.'])('QR inválido no se transmite', async (value) => {
    const spy = jest.spyOn(httpClient, 'request'); expect(validDeliveryToken(value)).toBe(false);
    await expect(orderService.confirmDelivery('fixture.jwt', order.orderId, value)).rejects.toMatchObject({ kind: 'validation' }); expect(spy).not.toHaveBeenCalled();
  });
  test('caducado, otro orderId y token inválido se rechazan', () => {
    const payload = { orderId: order.orderId, token: qr, expiresAt: '2000-01-01T00:00:00Z' };
    expect(() => deliveryCredential(payload, order.orderId)).toThrow();
    expect(() => deliveryCredential({ ...payload, expiresAt: '2099-01-01T00:00:00Z', orderId: 'other' }, order.orderId)).toThrow();
    expect(() => orderPr27({ ...order, status: 'Invented' })).toThrow();
    expect(() => orderPagePr27({ items: [], page: 1, pageSize: 20, total: 0 })).toThrow();
  });
  test.each(['DELIVERY_TOKEN_EXPIRED', 'DELIVERY_TOKEN_INVALID', 'DELIVERY_TOKEN_ALREADY_USED', 'ORDER_STATE_CONFLICT'])('error %s comprensible sin filtrar token/cuerpo', (code) => {
    const status = code === 'DELIVERY_TOKEN_ALREADY_USED' || code === 'ORDER_STATE_CONFLICT' ? 409 : 422;
    const failure = backendHttpError(status, { status, code, correlationId: '0HNQ9283G4KFI:00000001', message: `private ${qr}`, token: qr });
    expect(failure.code).toBe(code); expect(failure.message).not.toContain(qr); expect(failure.message).not.toContain(code);
    const diagnostic = orderDiagnostic('delivery-confirmation', failure);
    expect(diagnostic).toMatchObject({ code, status, correlationId: '0HNQ9283G4KFI:00000001' });
    expect(JSON.stringify(diagnostic)).not.toMatch(/private|AAAAAAAA|token/);
  });
  test('red y503 siguen siendo errores, no éxito ni reintento', async () => {
    const spy = jest.spyOn(httpClient, 'request').mockRejectedValue(new ApiError('timeout', 'fixture'));
    await expect(orderService.create('fixture.jwt', { productId: order.productId, quantity: 2 })).rejects.toMatchObject({ kind: 'timeout' }); expect(spy).toHaveBeenCalledTimes(1);
  });
});
