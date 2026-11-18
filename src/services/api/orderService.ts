import type { CreateOrderRequest } from '@/types/api';
import { assertAllowedFields } from '@/utils/apiValidation';
import { sellerText } from '@/utils/sellerValidation';
import { invalidContract, orderResponse } from './catalogContracts';
import { ApiError } from './errors';
import { httpClient } from './httpClient';

export function createOrderBody(input: CreateOrderRequest): CreateOrderRequest {
  assertAllowedFields(input, ['productId', 'quantity', 'notes']);
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1 || input.quantity > 2147483647) throw new ApiError('validation', 'Cantidad inválida.');
  const notes = input.notes === undefined ? undefined : orderNotes(input.notes);
  return { productId: sellerText(input.productId, 1, 256), quantity: input.quantity, ...(notes !== undefined ? { notes } : {}) };
}
export function orderNotes(value: unknown): string {
  if (typeof value !== 'string' || value.length > 250 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new ApiError('validation', 'Las notas deben ser texto de máximo 250 caracteres, sin caracteres de control.');
  return value;
}
export const orderService = {
  async create(token: string, input: CreateOrderRequest) {
    const body = createOrderBody(input);
    const response = await httpClient.request('/api/v1/orders', { method: 'POST', token, body: { ...body }, expectedStatuses: [201] });
    const data = orderResponse(response.data);
    if (data.productId !== body.productId || data.quantity !== body.quantity) return invalidContract();
    return data;
  },
};
