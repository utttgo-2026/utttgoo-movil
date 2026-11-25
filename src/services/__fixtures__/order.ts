import type { OrderPr27 } from '../api/orderContractsPr27';

/** Synthetic test-only contract, never imported by runtime UI or services. */
export const orderFixture: OrderPr27 = {
  orderId: '507f1f77bcf86cd799439071', productId: '507f1f77bcf86cd799439072', sellerId: '507f1f77bcf86cd799439073', buyerId: 'buyer-fixture',
  productName: 'Tacos de piña', quantity: 2, unitPrice: 25, totalAmount: 50, currency: 'MXN', paymentMethod: 'Cash', status: 'Pending', pickupPoint: 'Biblioteca',
  deliveredAt: null, completedAt: null, version: 0, createdAt: '2026-11-24T12:00:00Z', updatedAt: '2026-11-24T12:00:00Z', notes: 'Sin cebolla',
};
