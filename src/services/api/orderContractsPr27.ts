import { invalidContract, money, object, pageResponse, schemaNumber, text } from './catalogContracts';

export type OrderStatus = 'Pending' | 'Accepted' | 'InPreparation' | 'Ready' | 'Delivered' | 'Rejected' | 'CancelledByBuyer';
export interface OrderSummaryPr27 {
  orderId: string; productId: string; productName: string; sellerId: string; buyerId: string;
  quantity: number; unitPrice: number; totalAmount: number; currency: 'MXN'; status: OrderStatus;
  role: 'buyer' | 'seller'; createdAt: string; notes?: string | null;
}
export interface OrderPr27 extends Omit<OrderSummaryPr27, 'role'> {
  paymentMethod: 'Cash'; pickupPoint: string; deliveredAt: string | null; completedAt: string | null;
  updatedAt: string; version: number;
}

const statuses: readonly string[] = ['Pending', 'Accepted', 'InPreparation', 'Ready', 'Delivered', 'Rejected', 'CancelledByBuyer'];
function date(value: unknown): value is string { return text(value) && Number.isFinite(Date.parse(value)); }
function nullableDate(value: unknown): value is string | null { return value === null || date(value); }
function base(value: Record<string, unknown>) {
  const quantity = schemaNumber(value.quantity, true), unitPrice = schemaNumber(value.unitPrice), totalAmount = schemaNumber(value.totalAmount);
  if (!text(value.orderId) || !text(value.productId) || !text(value.productName) || !text(value.sellerId) || !text(value.buyerId) ||
      quantity < 1 || !money(unitPrice) || !money(totalAmount) || Math.round(unitPrice * 100) * quantity !== Math.round(totalAmount * 100) ||
      value.currency !== 'MXN' || typeof value.status !== 'string' || !statuses.includes(value.status) || !date(value.createdAt) ||
      (value.notes !== undefined && value.notes !== null && (typeof value.notes !== 'string' || value.notes.length > 250 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value.notes)))) return invalidContract();
  return { orderId: value.orderId, productId: value.productId, productName: value.productName, sellerId: value.sellerId, buyerId: value.buyerId,
    quantity, unitPrice, totalAmount, currency: 'MXN' as const, status: value.status as OrderStatus, createdAt: value.createdAt,
    ...(value.notes !== undefined ? { notes: value.notes as string | null } : {}) };
}
export function orderSummaryPr27(data: unknown): OrderSummaryPr27 {
  const value = object(data);
  const result = base(value);
  if (value.role !== 'buyer' && value.role !== 'seller') return invalidContract();
  return { ...result, role: value.role };
}
export function orderPr27(data: unknown): OrderPr27 {
  const value = object(data);
  const result = base(value);
  const version = schemaNumber(value.version, true);
  if (value.paymentMethod !== 'Cash' || typeof value.pickupPoint !== 'string' || !nullableDate(value.deliveredAt) ||
      !nullableDate(value.completedAt) || !date(value.updatedAt) || version < 0) return invalidContract();
  return { ...result, paymentMethod: 'Cash', pickupPoint: value.pickupPoint, deliveredAt: value.deliveredAt,
    completedAt: value.completedAt, updatedAt: value.updatedAt, version };
}
export function orderPagePr27(data: unknown) { return pageResponse(data, orderSummaryPr27); }
