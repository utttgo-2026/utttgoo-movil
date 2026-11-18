import { httpClient } from '../httpClient';
import { backendHttpError } from '../errors';
import { createProductBody, productAvailabilityBody, productService } from '../productService';
import { createOrderBody, orderService } from '../orderService';
import { orderResponse } from '../catalogContracts';
import { getLatestCommerceDiagnostic } from '../commerceDiagnostics';
import type { DeployedOrderResponse, ProductAvailabilityRequest } from '@/types/api';
import { productMetadata } from '../../__fixtures__/product';

const input = { categoryId: 'aws-category-fixture', name: 'Alimento fixture', description: 'Descripción fixture', ingredients: ['Maíz'], price: 35.25, stock: 3 };
const product = { ...input, ...productMetadata, id: 'aws-product-fixture', sellerId: 'aws-seller-fixture', status: 'Active' };
const wireOrder: DeployedOrderResponse = { orderId: 'aws-order-fixture', productId: product.id, productName: input.name, sellerId: product.sellerId,
  buyerUserId: 'aws-user-fixture', quantity: 2, unitPrice: 35.25, total: 70.5, currency: 'MXN', paymentMethod: 'Cash', status: 'Pending',
  pickupPoint: 'Edificio fixture', deliveredAt: null, completedAt: null, createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z', version: 1, notes: 'Sin cebolla' };

describe('PR24: status, imagen omitida, notas y contrato desplegado', () => {
  afterEach(() => jest.restoreAllMocks());
  test.each(['Active', 'Paused'] as const)('PATCHavailability envía solo status=%s con Bearer y verifica respuesta200', async (status) => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 200, headers: {}, data: { ...product, status } });
    expect((await productService.updateStatus('synthetic.aws.jwt', product.id, { status })).status).toBe(status);
    expect(request).toHaveBeenCalledWith(`/api/v1/products/${product.id}/availability`, {
      method: 'PATCH', token: 'synthetic.aws.jwt', body: { status }, expectedStatuses: [200],
    });
    request.mockResolvedValue({ status: 200, headers: {}, data: { ...product, status: status === 'Active' ? 'Paused' : 'Active' } });
    await expect(productService.updateStatus('synthetic.aws.jwt', product.id, { status })).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test.each([{ status: 'Published' }, { availability: 'Paused' }, { status: 'Active', sellerId: 'injected' }, { status: null }])('requeststatus inválido rechazado: %j', (body) => {
    expect(() => productAvailabilityBody(body as ProductAvailabilityRequest)).toThrow();
  });
  test('alta sinimagen o connull siempre omite imageUrl en JSON y permite consulta porID', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: product });
    expect(createProductBody({ ...input, imageUrl: null }, [input.categoryId])).toEqual(input);
    await productService.create('synthetic.aws.jwt', { ...input, imageUrl: null }, [input.categoryId]);
    expect(request).toHaveBeenLastCalledWith('/api/v1/products', expect.objectContaining({ body: input }));
    expect(JSON.stringify(request.mock.calls[0][1]?.body)).not.toContain('imageUrl');
    request.mockResolvedValue({ status: 200, headers: {}, data: product });
    expect(await productService.getById(product.id)).toEqual(product);
  });
  test.each(['https://mock.example.test/photo.jpg', 'file:///placeholder.png', 'https://invented.s3.example.test/photo.jpg'])('URL deimagen no disponible no se envía: %s', async (imageUrl) => {
    const request = jest.spyOn(httpClient, 'request');
    await expect(productService.create('synthetic.aws.jwt', { ...input, imageUrl } as unknown as typeof input, [input.categoryId])).rejects.toMatchObject({ kind: 'validation' });
    expect(request).not.toHaveBeenCalled();
  });
  test('422IMAGE_NOT_AVAILABLE muestra mensaje fijo y diagnóstico sin información sensible', async () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const error = backendHttpError(422, { status: 422, code: 'IMAGE_NOT_AVAILABLE', correlationId: 'private-correlation', message: 'private-body-secret' });
    jest.spyOn(httpClient, 'request').mockRejectedValue(error);
    await expect(productService.create('synthetic.aws.jwt', input, [input.categoryId])).rejects.toMatchObject({ status: 422, code: 'IMAGE_NOT_AVAILABLE', message: expect.stringContaining('sin imagen') });
    const diagnostic = getLatestCommerceDiagnostic();
    expect(diagnostic).toEqual({ event: 'image_not_available', method: 'POST', path: '/api/v1/products', status: 422, code: 'IMAGE_NOT_AVAILABLE', timestamp: expect.any(String) });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/synthetic|private|Alimento|aws-category/);
    expect(error.message).not.toContain('private');
    log.mockClear();
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    await expect(productService.create('synthetic.aws.jwt', input, [input.categoryId])).rejects.toMatchObject({ status: 422 });
    expect(log).not.toHaveBeenCalled(); expect(getLatestCommerceDiagnostic()?.code).toBe('IMAGE_NOT_AVAILABLE');
  });
  test.each([400, 401, 403, 404, 409, 422, 429, 503])('PATCH errorHTTP%s no confirma cambio ni reintenta', async (status) => {
    const request = jest.spyOn(httpClient, 'request').mockRejectedValue(backendHttpError(status, null));
    await expect(productService.updateStatus('synthetic.aws.jwt', product.id, { status: 'Paused' })).rejects.toMatchObject({ status });
    expect(request).toHaveBeenCalledTimes(1);
  });
  test.each(['Sin cebolla', '', 'x'.repeat(250)])('notas válidas se envían sin precios ni total (%s)', async (notes) => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: { ...wireOrder, notes } });
    const result = await orderService.create('synthetic.aws.jwt', { productId: product.id, quantity: 2, notes });
    expect(result).toMatchObject({ id: wireOrder.orderId, buyerId: wireOrder.buyerUserId, totalAmount: wireOrder.total, notes });
    expect(request).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({ body: { productId: product.id, quantity: 2, notes } }));
  });
  test.each(['x'.repeat(251), '🙂'.repeat(126), 'bad\u0000notes', { $ne: null }])('notas inválidas no alcanzan red: %j', async (notes) => {
    const request = jest.spyOn(httpClient, 'request');
    await expect(orderService.create('synthetic.aws.jwt', { productId: product.id, quantity: 2, notes } as { productId: string; quantity: number; notes: string })).rejects.toMatchObject({ kind: 'validation' });
    expect(request).not.toHaveBeenCalled();
  });
  test('precios/total/múltiplesproductos no son campos request', () => {
    for (const extra of [{ unitPrice: 1 }, { total: 1 }, { items: [] }]) expect(() => createOrderBody({ productId: product.id, quantity: 2, ...extra })).toThrow();
  });
  test('parser desplegado rechaza mezclas, total incoherente y metadata inválida', () => {
    expect(orderResponse(wireOrder)).toMatchObject({ id: wireOrder.orderId, buyerId: wireOrder.buyerUserId, totalAmount: 70.5 });
    for (const extra of [{ id: 'mixed' }, { buyerId: 'mixed' }, { total: 1 }, { currency: 'USD' }, { version: -1 }, { completedAt: 'bad-date' }]) {
      expect(() => orderResponse({ ...wireOrder, ...extra })).toThrow();
    }
  });
});
