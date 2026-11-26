import { ApiError } from './errors';
import { safeCorrelationId } from './requestDiagnostics';

import { isOrderStatus, type OrderStatus } from './orderContractsPr27';
import type { ApiResponse } from '@/types/api';

export type OrderStage = 'create' | 'buyer-list' | 'seller-list' | 'detail' | 'cancel' | 'status' | 'delivery-token' | 'delivery-confirmation';
const codes = new Set(['UNAUTHORIZED', 'ACCOUNT_NOT_ACTIVE', 'SELLER_ROLE_REQUIRED', 'SELLER_ACCOUNT_NOT_ACTIVE', 'ORDER_NOT_FOUND', 'ORDER_FORBIDDEN', 'ORDER_STATE_CONFLICT', 'ORDER_VERSION_CONFLICT', 'ORDER_UNAVAILABLE', 'DELIVERY_TOKEN_INVALID', 'DELIVERY_TOKEN_EXPIRED', 'DELIVERY_TOKEN_ALREADY_USED', 'VALIDATION_ERROR', 'INSUFFICIENT_STOCK', 'PRODUCT_NOT_AVAILABLE', 'RATE_LIMITED']);
const routes = {
  create: ['POST', '/api/v1/orders', 'buyer-confirm'], 'buyer-list': ['GET', '/api/v1/orders/mine', 'buyer-orders'],
  'seller-list': ['GET', '/api/v1/sellers/me/orders', 'seller-orders'], detail: ['GET', '/api/v1/orders/{orderId}', 'buyer-order-detail'],
  cancel: ['POST', '/api/v1/orders/{orderId}/cancel', 'buyer-cancel'], status: ['PATCH', '/api/v1/orders/{orderId}/status', 'seller-order-detail'],
  'delivery-token': ['POST', '/api/v1/orders/{orderId}/delivery-token', 'buyer-delivery-qr'],
  'delivery-confirmation': ['POST', '/api/v1/orders/{orderId}/delivery-confirmations', 'seller-delivery-scanner'],
} as const;
type Trace = { phase?: 'action' | 'blocked' | 'request' | 'response' | 'failed' | 'readback-mismatch'; source?: 'seller-order-detail' | 'buyer-order-detail'; transition?: OrderStatus; orderVersion?: number; filter?: OrderStatus };
/** Never accept request bodies, credentials, raw messages, IDs, user data or QR contents. */
export function orderDiagnostic(stage: OrderStage, error?: unknown, counts?: { page: number; pageSize: number; received: number; totalCount: number; missingConfirmed?: number }, trace?: Trace, response?: ApiResponse) {
  const api = error instanceof ApiError ? error : undefined;
  const body = api?.data && typeof api.data === 'object' && !Array.isArray(api.data) ? api.data as Record<string, unknown> : undefined;
  const correlationId = safeCorrelationId(body?.correlationId) ?? safeCorrelationId(api?.responseCorrelationId) ??
    ['x-correlation-id', 'correlation-id', 'x-request-id', 'request-id', 'traceparent'].map((name) => safeCorrelationId(response?.headers[name])).find(Boolean);
  const [method, route, screen] = routes[stage];
  const status = api?.status ?? response?.status, code = body?.code ?? api?.code;
  const value = { version: 'orders-v2', stage, method, route, screen: trace?.source ?? screen, recordedAt: new Date().toISOString(),
    ...(trace?.phase ? { phase: trace.phase } : {}), ...(isOrderStatus(trace?.transition) ? { transition: trace.transition } : {}),
    ...(trace?.orderVersion !== undefined && Number.isSafeInteger(trace.orderVersion) ? { orderVersion: trace.orderVersion } : {}),
    ...(isOrderStatus(trace?.filter) ? { filter: trace.filter } : {}), ...(status !== undefined ? { status } : {}),
    ...(typeof code === 'string' && codes.has(code) ? { code } : {}), ...(correlationId ? { correlationId } : {}),
    ...(counts ? { ...counts, scope: 'requested-page-only' } : {}), ...(error ? { failure: api?.kind ?? 'unknown' } : {}) };
  if (__DEV__) console.info('[orders-http]', value);
  return value;
}
export async function orderOperation<T>(stage: OrderStage, run: (request: (send: () => Promise<ApiResponse>) => Promise<ApiResponse>) => Promise<T>, trace?: Trace): Promise<T> {
  let response: ApiResponse | undefined;
  try {
    const result = await run(async (send) => {
      orderDiagnostic(stage, undefined, undefined, { ...trace, phase: 'request' });
      response = await send();
      return response;
    });
    if (response) orderDiagnostic(stage, undefined, undefined, { ...trace, phase: 'response' }, response);
    return result;
  } catch (cause) { orderDiagnostic(stage, cause, undefined, { ...trace, phase: 'failed' }, response); throw cause; }
}
