import React from 'react';
import { Stack } from 'expo-router';
import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { CartProvider } from '@/context/CartContext';
import BuyerLayout, { unstable_settings } from '@/app/buyer/_layout';
import BuyerTabs from '@/app/buyer/(tabs)/_layout';
import Home from '@/app/buyer/(tabs)/index';
import Search from '@/app/buyer/(tabs)/search';
import Orders from '@/app/buyer/(tabs)/orders';
import Notifications from '@/app/buyer/(tabs)/notifications';
import Profile from '@/app/buyer/(tabs)/profile';
import Category from '@/app/buyer/category';
import Available from '@/app/buyer/available-now';
import Filters from '@/app/buyer/filters';
import Food from '@/app/buyer/food/[id]';
import PrivateLayout from '@/app/buyer/(private)/_layout';
import OrderData from '@/app/buyer/(private)/order-data';
import NotFound from '@/app/+not-found';

let mockAuthenticated = false;
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({
  user: mockAuthenticated ? { id: 'fixture-user', role: 'buyer', fullName: 'Fixture', email: 'fixture@uttt.edu.mx' } : null,
  status: mockAuthenticated ? 'authenticated' : 'anonymous', isAuthenticated: mockAuthenticated,
}) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const routes = {
  _layout: () => <CartProvider><Stack screenOptions={{ headerShown: false }} /></CartProvider>,
  welcome: () => <Text>Bienvenida fixture</Text>,
  login: () => <Text>Login fixture</Text>,
  'buyer/_layout': { default: BuyerLayout, unstable_settings },
  'buyer/(tabs)/_layout': BuyerTabs,
  'buyer/(tabs)/index': Home,
  'buyer/(tabs)/search': Search,
  'buyer/(tabs)/orders': Orders,
  'buyer/(tabs)/notifications': Notifications,
  'buyer/(tabs)/profile': Profile,
  'buyer/category': Category,
  'buyer/available-now': Available,
  'buyer/filters': Filters,
  'buyer/food/[id]': Food,
  'buyer/(private)/_layout': PrivateLayout,
  'buyer/(private)/order-data': OrderData,
  '+not-found': NotFound,
};

describe('Expo Router real con fixtures de sesión anónima, sin AWS/dispositivo', () => {
  beforeEach(() => { mockAuthenticated = false; });
  afterEach(() => { jest.useRealTimers(); });

  test('invitado llega al catálogo completo disponible y detalle con regreso a inicio', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer' });
    expect(view.getPathname()).toBe('/buyer');
    expect(screen.getByText('Invitado')).toBeTruthy();
    expect(screen.getByTestId('home-products').props.horizontal).not.toBe(true);
    await fireEvent.press(screen.getByLabelText('Ver Chilaquiles con Huevo'));
    expect(view.getPathname()).toBe('/buyer/food/food-1');
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(view.getPathname()).toBe('/buyer');
  });

  test('Buscar selecciona Tortas una vez y vuelve del detalle conservando categoryId', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/search' });
    await fireEvent.press(screen.getByText('Tortas'));
    expect(view.getPathname()).toBe('/buyer/category');
    expect(view.getSearchParams().categoryId).toBe('cat-1');
    expect(screen.queryByText('Vegano')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Ver Torta de Milanesa'));
    expect(view.getPathname()).toBe('/buyer/food/food-5');
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(view.getSearchParams().categoryId).toBe('cat-1');
    expect(screen.getAllByLabelText('Ver Torta de Milanesa')).toHaveLength(1);
  });

  test('query cambia sin desmontar input y vuelve del detalle preservada', async () => {
    await renderRouter(routes, { initialUrl: '/buyer/search' });
    const input = screen.getByPlaceholderText('Buscar alimentos');
    await fireEvent.changeText(input, 'Torta');
    expect(screen.getByPlaceholderText('Buscar alimentos')).toBe(input);
    expect(screen.getByPlaceholderText('Buscar alimentos').props.value).toBe('Torta');
    await fireEvent.press(screen.getByLabelText('Ver Torta de Milanesa'));
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(screen.getByPlaceholderText('Buscar alimentos').props.value).toBe('Torta');
  });

  test('Vegano muestra vacío sin productos inventados', async () => {
    await renderRouter(routes, { initialUrl: '/buyer/search' });
    await fireEvent.press(screen.getByText('Vegano'));
    expect(screen.getByText('Sin alimentos compatibles')).toBeTruthy();
    expect(screen.queryAllByLabelText(/^Ver /)).toHaveLength(0);
  });

  test.each(['/buyer/orders', '/buyer/notifications', '/buyer/profile', '/buyer/order-data'])('entrada directa privada %s solicita acceso sin montar datos', async (initialUrl) => {
    const view = await renderRouter(routes, { initialUrl });
    expect(screen.getByText('Exploras como invitado')).toBeTruthy();
    expect(screen.queryByText('UTTT-1001')).toBeNull();
    expect(screen.queryByText('Mariana López Cruz')).toBeNull();
    expect(screen.queryByText('Revisa tu pedido')).toBeNull();
    await fireEvent.press(screen.getByText('Iniciar sesión'));
    expect(view.getPathname()).toBe('/login');
    await testRouter.back(initialUrl);
    expect(screen.getByText('Exploras como invitado')).toBeTruthy();
  });

  test('ruta desconocida muestra salida al catálogo, no login', async () => {
    const view = await renderRouter(routes, { initialUrl: '/does-not-exist' });
    expect(screen.getByText('Página no encontrada')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ir al catálogo'));
    expect(view.getPathname()).toBe('/buyer');
  });

  test('filtros retornan a la categoría con selección aplicada sin otro selector', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/category?categoryId=cat-4' });
    await fireEvent.press(screen.getByLabelText('Abrir filtros'));
    await fireEvent.changeText(screen.getByPlaceholderText('Sin límite'), '20');
    await fireEvent.press(screen.getByText('Aplicar filtros'));
    expect(view.getPathname()).toBe('/buyer/category');
    expect(view.getSearchParams()).toMatchObject({ categoryId: 'cat-4', maxPrice: '20' });
    expect(screen.getByLabelText('Ver Agua de Horchata')).toBeTruthy();
    expect(screen.getByLabelText('Ver Agua de Jamaica')).toBeTruthy();
    expect(screen.queryByLabelText('Ver Licuado de Plátano')).toBeNull();
  });

  test('cinco tabs navegan sin llevar automáticamente a login', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer' });
    await fireEvent.press(screen.getByText('Buscar'));
    expect(view.getPathname()).toBe('/buyer/search');
    await fireEvent.press(screen.getByText('Pedidos'));
    expect(view.getPathname()).toBe('/buyer/orders');
    expect(screen.getByText('Exploras como invitado')).toBeTruthy();
    await fireEvent.press(screen.getByText('Avisos', { exact: true }).parent!);
    expect(view.getPathname()).toBe('/buyer/notifications');
    await fireEvent.press(screen.getByText('Perfil', { exact: true }));
    expect(view.getPathname()).toBe('/buyer/profile');
    await fireEvent.press(screen.getByText('Inicio', { exact: true }));
    expect(view.getPathname()).toBe('/buyer');
  });

  test('Disponible usa detalle dinámico y preserva selección al regresar', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/available-now?categoryId=cat-1' });
    await fireEvent.press(screen.getByLabelText('Ver Torta de Milanesa'));
    expect(view.getPathname()).toBe('/buyer/food/food-5');
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(view.getSearchParams().categoryId).toBe('cat-1');
  });

  test('lista de productos puede virtualizar el último alimento con scroll simulado', async () => {
    await renderRouter(routes, { initialUrl: '/buyer' });
    await fireEvent.scroll(screen.getByTestId('home-products'), { nativeEvent: {
      contentOffset: { x: 0, y: 2600 },
      layoutMeasurement: { width: 390, height: 640 },
      contentSize: { width: 390, height: 3000 },
    } });
    await act(async () => { jest.runOnlyPendingTimers(); });
    expect(screen.getByLabelText('Ver Chicharrones con Salsa')).toBeTruthy();
  });

  test.each([
    ['/buyer/orders', 'orders-list'], ['/buyer/notifications', 'notifications-list'],
  ])('lista personal %s no tiene un ScrollView vertical exterior (sesión solo fixture)', async (initialUrl, testId) => {
    mockAuthenticated = true;
    await renderRouter(routes, { initialUrl });
    let parent = screen.getByTestId(testId).parent;
    while (parent) {
      // La lista puede tener su propio scroll nativo; no otro scroll como ancestro exterior.
      if (typeof parent.type === 'string') expect(parent.type).not.toMatch(/scrollview/i);
      parent = parent.parent;
    }
  });
});
