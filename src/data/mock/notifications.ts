import type { AppNotification } from '@/types/models';

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Pedido entregado',
    body: 'Tu pedido UTTT-1001 ha sido entregado. ¡Que lo disfrutes!',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'Pedido en preparación',
    body: 'Tu pedido UTTT-1002 está siendo preparado por Ana Sofía Ramírez.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: true,
    type: 'order',
  },
  {
    id: 'notif-3',
    title: 'Nueva oferta disponible',
    body: 'Desayunos con 20% de descuento hasta las 11:00 AM.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    type: 'system',
  },
  {
    id: 'notif-4',
    title: 'Mensaje del vendedor',
    body: 'Ana Sofía Ramírez te envió un mensaje sobre tu pedido.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    type: 'chat',
  },
];
