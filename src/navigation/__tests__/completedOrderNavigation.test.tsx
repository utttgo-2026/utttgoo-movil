import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import { fireEvent } from '@testing-library/react-native';
import BuyerLayout, { unstable_settings } from '@/app/buyer/_layout';
import BuyerTabs from '@/app/buyer/(tabs)/_layout';
import BuyerPrivate from '@/app/buyer/(private)/_layout';
import { AwsBuyerTracking, AwsOrderReceipt, AwsOrderReview, AwsSellerOrderDetail, AwsSellerOrders } from '@/components/catalog/AwsOrderFlow';
import { orderFixture as order } from '@/services/__fixtures__/order';

const mockSubmit = jest.fn(async () => ({ success: true, data: order }));
const mockDetail = jest.fn(async () => ({ success: true, data: order }));
const mockNotes = jest.fn(() => ({ success: true }));
const mockSellerDetail = jest.fn(async () => ({ success: true, data: { ...order, status: 'Delivered', version: 10 } }));
const mockSellerList = jest.fn(async () => ({ success: true, data: { items: [{ ...order, status: 'Delivered', role: 'seller' }], page: 1, pageSize: 20, totalCount: 1 } }));
const mockDelivery = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({
  user: { id: 'buyer-fixture' }, isAuthenticated: true, status: 'authenticated', orderRevision: 0,
  orderPreparation: { key: 'fixture', quantity: 1, notes: '', product: { id: 'food', name: 'Alimento', price: 25 } },
  submitOrder: mockSubmit, updateOrderNotes: mockNotes, buyerOrder: mockDetail,
  sellerOrder: mockSellerDetail, listSellerOrders: mockSellerList, confirmOrderDelivery: mockDelivery,
}) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  'buyer/_layout': { default: BuyerLayout, unstable_settings },
  'buyer/(tabs)/_layout': BuyerTabs,
  'buyer/(tabs)/index': () => <Text>Catálogo de prueba</Text>,
  'buyer/(tabs)/orders': () => <Text>Bandeja compradora</Text>,
  'buyer/(tabs)/search': () => <Text>Buscar</Text>,
  'buyer/(tabs)/notifications': () => <Text>Avisos</Text>,
  'buyer/(tabs)/profile': () => <Text>Perfil</Text>,
  'buyer/food/[id]': () => <Text>Producto</Text>,
  'buyer/(private)/_layout': BuyerPrivate,
  'buyer/(private)/order-data': AwsOrderReview,
  'buyer/(private)/confirm-order': () => <AwsOrderReview confirm />,
  'buyer/(private)/order-created': AwsOrderReceipt,
  'buyer/(private)/order-tracking': AwsBuyerTracking,
  'seller/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  'seller/index': () => <Text>Mi negocio de prueba</Text>,
  'seller/orders': AwsSellerOrders,
  'seller/order-detail': AwsSellerOrderDetail,
};
jest.setTimeout(20000);

async function buy() {
  await renderRouter(routes, { initialUrl: '/buyer' });
  await testRouter.push('/buyer/food/food');
  await testRouter.push('/buyer/order-data');
  await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Confirmar pedido' }));
  await waitFor(() => expect(screen.getByText('¡Pedido generado!')).toBeTruthy());
}

beforeEach(() => jest.clearAllMocks());
test('Atrás desde comprobante vuelve a la bandeja, sin producto ni formulario detrás', async () => {
  await buy();
  await testRouter.back('/buyer/orders');
  expect(screen.getByText('Bandeja compradora')).toBeTruthy();
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});
test('Modificar pedido regresa al formulario existente y conserva el regreso al producto', async () => {
  await renderRouter(routes, { initialUrl: '/buyer' });
  await testRouter.push('/buyer/food/food');
  await testRouter.push('/buyer/order-data');
  await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Modificar pedido' }));
  await screen.findByRole('button', { name: 'Continuar' });
  await testRouter.back('/buyer/food/food');
  expect(mockSubmit).not.toHaveBeenCalled();
});
test('Ver mi pedido sustituye comprobante; Atrás vuelve a la bandeja', async () => {
  await buy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ver mi pedido' }));
  await waitFor(() => expect(screen.getByText('ESTADO ACTUAL')).toBeTruthy());
  await testRouter.back('/buyer/orders');
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});
test.each([['Mis pedidos', 'Bandeja compradora'], ['Ir al inicio', 'Catálogo de prueba']])('comprobante → %s reutiliza las tabs', async (action, content) => {
  await buy();
  await fireEvent.press(screen.getByRole('button', { name: action }));
  await waitFor(() => expect(screen.getByText(content)).toBeTruthy());
  expect(screen.queryByText('¡Pedido generado!')).toBeNull();
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});

test('entrega → bandeja → reingreso consulta el detalle; Atrás no revive un escáner', async () => {
  await renderRouter(routes, { initialUrl: '/seller' });
  await testRouter.push('/seller/orders');
  await fireEvent.press(await screen.findByRole('button', { name: 'Revisar pedido' }));
  await screen.findByText('¡Pedido entregado con éxito!');
  await fireEvent.press(screen.getByRole('button', { name: 'Ver pedidos recibidos' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Revisar pedido' }));
  await screen.findByText('¡Pedido entregado con éxito!');
  expect(mockSellerDetail).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('button', { name: 'Escanear QR de entrega' })).toBeNull();
  await testRouter.back('/seller/orders');
  await testRouter.back('/seller');
  expect(mockDelivery).not.toHaveBeenCalled();
});
