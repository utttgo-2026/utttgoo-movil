import type { Order, OrderItem, OrderStatus } from '@/types/models';

const now = new Date().toISOString();

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    code: 'UTTT-1001',
    buyerId: 'buyer-1',
    buyerName: 'Mariana López Cruz',
    sellerId: 'seller-1',
    sellerName: 'Ana Sofía Ramírez',
    items: [
      { foodId: 'food-1', name: 'Torta de Milanesa', price: 45, quantity: 2 },
      { foodId: 'food-5', name: 'Agua de Horchata', price: 18, quantity: 1 },
    ],
    subtotal: 108,
    serviceFee: 10,
    total: 118,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    pickupLocation: 'Puerta 3 - Edificio A',
    paymentMethod: 'Transferencia institucional',
    rated: true,
  },
  {
    id: 'order-2',
    code: 'UTTT-1002',
    buyerId: 'buyer-1',
    buyerName: 'Mariana López Cruz',
    sellerId: 'seller-1',
    sellerName: 'Ana Sofía Ramírez',
    items: [
      { foodId: 'food-3', name: 'Chilaquiles con Huevo', price: 48, quantity: 1 },
    ],
    subtotal: 48,
    serviceFee: 8,
    total: 56,
    status: 'preparing',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pickupLocation: 'Puerta 3 - Edificio A',
    paymentMethod: 'Efectivo',
    rated: false,
  },
  {
    id: 'order-3',
    code: 'UTTT-1003',
    buyerId: 'buyer-1',
    buyerName: 'Mariana López Cruz',
    sellerId: 'seller-1',
    sellerName: 'Ana Sofía Ramírez',
    items: [
      { foodId: 'food-2', name: 'Enchiladas Verdes', price: 55, quantity: 1 },
      { foodId: 'food-7', name: 'Elote en Vaso', price: 25, quantity: 2 },
    ],
    subtotal: 105,
    serviceFee: 10,
    total: 115,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    pickupLocation: 'Puerta 3 - Edificio A',
    paymentMethod: 'Tarjeta universitaria',
    rated: false,
  },
  {
    id: 'order-4',
    code: 'UTTT-1004',
    buyerId: 'buyer-1',
    buyerName: 'Mariana López Cruz',
    sellerId: 'seller-1',
    sellerName: 'Ana Sofía Ramírez',
    items: [
      { foodId: 'food-4', name: 'Quesadillas de Hongos', price: 38, quantity: 1 },
    ],
    subtotal: 38,
    serviceFee: 5,
    total: 43,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    pickupLocation: 'Puerta 3 - Edificio A',
    paymentMethod: 'Efectivo',
    rated: false,
  },
];

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    preparing: 'En preparación',
    ready: 'Listo para recoger',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: '#D2030F',
    preparing: '#C77700',
    ready: '#008522',
    delivered: '#008522',
    cancelled: '#766B64',
  };
  return colors[status];
}
