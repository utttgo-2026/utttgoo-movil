import type { OrderStatus } from '@/services/api/orderContractsPr27';
import { productUserMessage } from './productPresentation';

export const orderStatusLabels: Record<OrderStatus, string> = { Pending: 'Pendiente', Accepted: 'Aceptado', InPreparation: 'En preparación', Ready: 'Listo para recoger', Delivered: 'Entregado', Rejected: 'Rechazado', CancelledByBuyer: 'Cancelado' };
export function orderBadgeTone(status: OrderStatus): 'warning' | 'success' | 'danger' | 'info' {
  return status === 'Pending' ? 'warning' : status === 'Delivered' ? 'success' : status === 'Rejected' || status === 'CancelledByBuyer' ? 'danger' : 'info';
}
/** Display reference derived from the real ID, not a new server identifier. */
export function orderReference(id: string) { return `#UG-${id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()}`; }
export function orderDate(value: string) { return new Date(value).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
export function orderUserMessage(value: string) {
  if (/ORDER_OUTCOME_UNCERTAIN|no pudo confirmar.*(?:pedido|AWS)|envío anterior|verifica con backend/i.test(value)) return 'No pudimos confirmar la compra. Revisa Mis pedidos antes de volver a pedir; si no puedes identificarla, contacta a soporte.';
  return productUserMessage(value);
}
