import { httpClient } from '../httpClient';
import { orderService } from '../orderService';
import { ApiError } from '../errors';

const order = { orderId: 'order-1', productId: 'product-1', productName: 'Tacos', sellerId: 'seller-1', buyerId: 'buyer-1',
  quantity: 2, unitPrice: 25, totalAmount: 50, currency: 'MXN', paymentMethod: 'Cash', status: 'Pending', pickupPoint: '',
  deliveredAt: null, completedAt: null, createdAt: '2026-11-16T12:00:00Z', updatedAt: '2026-11-16T12:00:00Z', version: 1 };

describe('Servicios AWS pedidos PR27', () => {
  afterEach(() => jest.restoreAllMocks());
  test('crea con productId y valida orderId, moneda y efectivo', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValue({ status: 201, headers: {}, data: order });
    expect(await orderService.create('jwt-fixture', { productId: order.productId, quantity: 2 })).toEqual(order);
    expect(request).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({ method: 'POST', body: { productId: 'product-1', quantity: 2 } }));
    request.mockResolvedValue({ status: 201, headers: {}, data: { ...order, paymentMethod: 'Card' } });
    await expect(orderService.create('jwt-fixture', { productId: order.productId, quantity: 2 })).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test('página y detalle usan endpoints, paginación y orderId exacto', async () => {
    const request = jest.spyOn(httpClient, 'request').mockResolvedValueOnce({ status: 200, headers: {}, data: { items: [{ ...order, role: 'buyer' }], page: 2, pageSize: 20, totalCount: 21 } })
      .mockResolvedValueOnce({ status: 200, headers: {}, data: order });
    expect((await orderService.mine('jwt-fixture', 2)).items[0].orderId).toBe(order.orderId);
    expect(request).toHaveBeenCalledWith('/api/v1/orders/mine', expect.objectContaining({ query: { page: 2, pageSize: 20 } }));
    expect(await orderService.detail('jwt-fixture', order.orderId)).toEqual(order);
    expect(request).toHaveBeenLastCalledWith('/api/v1/orders/order-1', expect.objectContaining({ token: 'jwt-fixture' }));
    request.mockResolvedValueOnce({ status: 200, headers: {}, data: { ...order, orderId: 'other' } });
    await expect(orderService.detail('jwt-fixture', order.orderId)).rejects.toMatchObject({ kind: 'invalid_response' });
  });
  test.each([new ApiError('http', 'No encontrado', 404), new ApiError('http', 'Sesión expirada', 401), new ApiError('network', 'Sin conexión')])
  ('propaga errores de lectura sin inventar pedidos', async (error) => {
    jest.spyOn(httpClient, 'request').mockRejectedValue(error);
    await expect(orderService.detail('jwt-fixture', order.orderId)).rejects.toBe(error);
  });
});
