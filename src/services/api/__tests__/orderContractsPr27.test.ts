import { orderPagePr27, orderPr27 } from '../orderContractsPr27';

const order = { orderId: 'order-fixture', productId: 'product-fixture', productName: 'Alimento', sellerId: 'seller-fixture',
  buyerId: 'buyer-fixture', quantity: 2, unitPrice: 35.25, totalAmount: 70.5, currency: 'MXN', paymentMethod: 'Cash',
  status: 'Pending', pickupPoint: '', deliveredAt: null, completedAt: null, createdAt: '2026-11-16T12:00:00Z',
  updatedAt: '2026-11-16T12:00:00Z', version: 1, notes: 'Sin cebolla' };

describe('DTO pedidos PR27', () => {
  test('valida respuesta completa, diferencias entre orderId y productId y formatos numéricos documentados', () => {
    expect(orderPr27({ ...order, quantity: '2', version: '1' })).toEqual(order);
    expect(orderPr27(order).orderId).not.toBe(order.productId);
    for (const key of ['orderId', 'buyerId', 'productName', 'paymentMethod', 'pickupPoint', 'deliveredAt', 'completedAt', 'version']) {
      const incomplete: Record<string, unknown> = { ...order }; delete incomplete[key];
      expect(() => orderPr27(incomplete)).toThrow();
    }
  });
  test.each([{ currency: 'USD' }, { paymentMethod: 'Card' }, { status: 'Invented' }, { totalAmount: 1 }, { version: -1 }, { deliveredAt: 'bad' }])
  ('rechaza campos inválidos %j', (extra) => expect(() => orderPr27({ ...order, ...extra })).toThrow());
  test('lista distingue roles y exige totalCount', () => {
    expect(orderPagePr27({ items: [{ ...order, role: 'buyer' }, { ...order, orderId: 'other', role: 'seller' }], page: 1, pageSize: 10, totalCount: 2 }).items.map((item) => item.role)).toEqual(['buyer', 'seller']);
    expect(() => orderPagePr27({ items: [], page: 1, pageSize: 10, total: 0 })).toThrow();
    expect(() => orderPagePr27({ items: [{ ...order, role: 'admin' }], page: 1, pageSize: 10, totalCount: 1 })).toThrow();
  });
});
