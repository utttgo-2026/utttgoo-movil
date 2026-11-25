import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import { fireEvent } from '@testing-library/react-native';
import BuyerLayout, { unstable_settings } from '@/app/buyer/_layout';
import BuyerTabs from '@/app/buyer/(tabs)/_layout';
import { AwsBuyerOrders } from '@/components/catalog/AwsOrderFlow';
import { orderFixture as order } from '@/services/__fixtures__/order';

const mockList = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'buyer-fixture' }, status: 'authenticated', orderRevision: 0, listBuyerOrders: mockList }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  'buyer/_layout': { default: BuyerLayout, unstable_settings },
  'buyer/(tabs)/_layout': BuyerTabs,
  'buyer/(tabs)/index': () => <Text>Inicio</Text>,
  'buyer/(tabs)/search': () => <Text>Buscar</Text>,
  'buyer/(tabs)/orders': AwsBuyerOrders,
  'buyer/(tabs)/notifications': () => <Text>Avisos</Text>,
  'buyer/(tabs)/profile': () => <Text>Perfil</Text>,
  receipt: () => <Text>Comprobante de prueba</Text>,
};
test('volver a Mis pedidos desde otro flujo reconsulta página1 y descubre compra nueva', async () => {
  mockList.mockImplementation(async (page: number) => ({ success: true, data: { items: [{ ...order, productName: 'Compra anterior' }], page, pageSize: 20, totalCount: 21 } }));
  await renderRouter(routes, { initialUrl: '/buyer/orders' });
  await waitFor(() => expect(screen.getByText('Compra anterior × 2')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Página siguiente' }));
  await waitFor(() => expect(screen.getByText('Página 2 · 21 pedidos')).toBeTruthy());
  await testRouter.push('/receipt');
  mockList.mockImplementation(async (page: number) => ({ success: true, data: { items: [{ ...order, productName: 'Compra recién confirmada' }], page, pageSize: 20, totalCount: 22 } }));
  await testRouter.back('/buyer/orders');
  await waitFor(() => expect(screen.getByText('Compra recién confirmada × 2')).toBeTruthy());
  expect(mockList).toHaveBeenLastCalledWith(1); expect(screen.getByText('Página 1 · 22 pedidos')).toBeTruthy();
});
