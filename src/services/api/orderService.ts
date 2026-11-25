import type { CreateOrderRequest } from '@/types/api';
import { assertAllowedFields } from '@/utils/apiValidation';
import { sellerText } from '@/utils/sellerValidation';
import { invalidContract } from './catalogContracts';
import { deliveryCredential, isOrderStatus, orderActionResponse, orderPagePr27, orderPr27, validDeliveryToken, type OrderStatus, type SellerOrderTarget } from './orderContractsPr27';
import { orderOperation } from './orderDiagnostics';
import { ApiError } from './errors';
import { httpClient } from './httpClient';

export function createOrderBody(input: CreateOrderRequest): CreateOrderRequest {
  assertAllowedFields(input, ['productId', 'quantity', 'notes']);
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 50) throw new ApiError('validation', 'Elige entre 1 y 50 unidades.');
  const notes = input.notes === undefined ? undefined : orderNotes(input.notes);
  return { productId: sellerText(input.productId, 1, 256), quantity: input.quantity, ...(notes !== undefined ? { notes } : {}) };
}
export function orderNotes(value: unknown): string {
  if (typeof value !== 'string' || value.length > 250 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new ApiError('validation', 'Las notas deben ser texto de máximo 250 caracteres, sin caracteres de control.');
  return value;
}
export const orderService = {
  async create(token: string, input: CreateOrderRequest, idempotencyKey?: string) {
    const body = createOrderBody(input);
    return orderOperation('create', async (request) => {
      const response = await request(() => httpClient.request('/api/v1/orders', { method: 'POST', token, body: { ...body }, expectedStatuses: [201, 200], ...(idempotencyKey ? { idempotencyKey } : {}) }));
      const data = orderPr27(response.data);
      if (data.productId !== body.productId || data.quantity !== body.quantity || (response.status === 201 && data.status !== 'Pending')) return invalidContract();
      return data;
    });
  },
  async mine(token: string, page = 1, pageSize = 20) {
    return orderOperation('buyer-list', async (request) => {
      validateOrderPage(page, pageSize);
      const response = await request(() => httpClient.request('/api/v1/orders/mine', { token, query: { page, pageSize }, expectedStatuses: [200] }));
      const result = orderPagePr27(response.data);
      if (result.page !== page || result.pageSize !== pageSize) return invalidContract();
      return result;
    });
  },
  async detail(token: string, orderId: string, source: 'seller-order-detail' | 'buyer-order-detail' = 'buyer-order-detail') {
    return orderOperation('detail', async (request) => {
      const id = sellerText(orderId, 1, 256);
      const response = await request(() => httpClient.request(`/api/v1/orders/${encodeURIComponent(id)}`, { token, expectedStatuses: [200] }));
      const result = orderPr27(response.data);
      if (result.orderId !== id) return invalidContract();
      return result;
    }, { source });
  },
  async sellerMine(token: string, page = 1, pageSize = 20, status?: OrderStatus) {
    return orderOperation('seller-list', async (request) => {
      validateOrderPage(page, pageSize);
      if (status !== undefined && !isOrderStatus(status)) throw new ApiError('validation', 'Selecciona un estado válido.');
      const response = await request(() => httpClient.request('/api/v1/sellers/me/orders', { token, query: { page, pageSize, ...(status ? { status } : {}) }, expectedStatuses: [200] }));
      const result = orderPagePr27(response.data);
      if (result.page !== page || result.pageSize !== pageSize || (status && result.items.some((item) => item.status !== status))) return invalidContract();
      return result;
    }, { filter: status });
  },
  async cancel(token: string, orderId: string) {
    return orderOperation('cancel', async (request) => {
      const response = await request(() => httpClient.request(`${orderPath(orderId)}/cancel`, { method: 'POST', token, expectedStatuses: [200] }));
      return orderActionResponse(response.data, orderId, 'CancelledByBuyer', 'completedAt');
    });
  },
  async updateStatus(token: string, orderId: string, status: SellerOrderTarget, version: number) {
    return orderOperation('status', async (request) => {
      if (!['Accepted', 'Rejected', 'InPreparation', 'Ready'].includes(status) || !Number.isSafeInteger(version) || version < 0) throw new ApiError('validation', 'Actualiza el pedido antes de continuar.');
      const response = await request(() => httpClient.request(`${orderPath(orderId)}/status`, { method: 'PATCH', token, body: { status, version }, expectedStatuses: [200] }));
      return orderActionResponse(response.data, orderId, status, 'updatedAt');
    }, { transition: status, orderVersion: version });
  },
  async deliveryToken(token: string, orderId: string) {
    return orderOperation('delivery-token', async (request) => {
      const response = await request(() => httpClient.request(`${orderPath(orderId)}/delivery-token`, { method: 'POST', token, expectedStatuses: [201] }));
      return deliveryCredential(response.data, orderId);
    });
  },
  async confirmDelivery(token: string, orderId: string, credential: string) {
    return orderOperation('delivery-confirmation', async (request) => {
      if (!validDeliveryToken(credential)) throw new ApiError('validation', 'Este código QR no es válido. Pide al comprador que muestre el código de entrega.');
      const response = await request(() => httpClient.request(`${orderPath(orderId)}/delivery-confirmations`, { method: 'POST', token, body: { token: credential }, expectedStatuses: [200] }));
      return orderActionResponse(response.data, orderId, 'Delivered', 'deliveredAt');
    });
  },
};
function orderPath(id: string) { return `/api/v1/orders/${encodeURIComponent(sellerText(id, 1, 256))}`; }
function validateOrderPage(page: number, size: number) {
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || !Number.isSafeInteger(size) || size < 1 || size > 50) throw new ApiError('validation', 'No se pudo abrir esta página. Actualiza tus pedidos.');
}
