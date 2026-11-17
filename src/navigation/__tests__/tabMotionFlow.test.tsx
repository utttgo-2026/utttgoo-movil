import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { act, fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';
import BuyerLayout, { unstable_settings } from '@/app/buyer/_layout';
import BuyerTabs from '@/app/buyer/(tabs)/_layout';
import PrivateLayout from '@/app/buyer/(private)/_layout';
import SellerLayout from '@/app/seller/_layout';
import Profile from '@/app/buyer/(tabs)/profile';
import { AppHeader, AppInput, Screen } from '@/components/ui';
import { RequireSession } from '@/components/navigation/RequireSession';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { stackMotionOptions } from '@/navigation/motion';

let mockAuthenticated = false;
const mockListeners = new Set<() => void>();
const mockSubscribe = (listener: () => void) => { mockListeners.add(listener); return () => { mockListeners.delete(listener); }; };
function mockSetSession(value: boolean) { mockAuthenticated = value; mockListeners.forEach((listener) => listener()); }
const mockLogout = jest.fn(async () => { mockSetSession(false); return { success: true }; });
jest.mock('@/context/AuthContext', () => ({ useAuth: () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const authenticated = react.useSyncExternalStore(mockSubscribe, () => mockAuthenticated, () => false);
  return { isAuthenticated: authenticated, status: authenticated ? 'authenticated' : 'anonymous', logout: mockLogout,
    user: authenticated ? { id: 'fixture-user', role: 'buyer', fullName: 'Nombre privado fixture', email: 'fixture@uttt.edu.mx' } : null };
} }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

function Root() {
  const reduced = useReducedMotion();
  return <Stack screenOptions={({ route }) => ({ ...stackMotionOptions(reduced, route.name), headerShown: false })} />;
}
function Search() {
  const [query, setQuery] = React.useState('');
  return <AppInput accessibilityLabel="Consulta fixture" value={query} onChangeText={setQuery} />;
}
function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Screen header={<AppHeader title="Detalle fixture" backFallback="/buyer" />}><Text>Producto {id}</Text></Screen>;
}
const routes = {
  _layout: Root,
  welcome: () => <Text>Bienvenida fixture</Text>,
  login: () => <Text>Login fixture</Text>,
  'buyer/_layout': { default: BuyerLayout, unstable_settings },
  'buyer/(tabs)/_layout': BuyerTabs,
  'buyer/(tabs)/index': () => <Text>Inicio fixture</Text>,
  'buyer/(tabs)/search': Search,
  'buyer/(tabs)/orders': () => <RequireSession inTabs><Text>Pedido privado fixture</Text></RequireSession>,
  'buyer/(tabs)/notifications': () => <RequireSession inTabs><Text>Aviso privado fixture</Text></RequireSession>,
  'buyer/(tabs)/profile': Profile,
  'buyer/food/[id]': Detail,
  'buyer/(private)/_layout': PrivateLayout,
  'buyer/(private)/order-data': () => <Text>Checkout privado fixture</Text>,
  'seller/_layout': SellerLayout,
  'seller/product-draft': () => <Text>Editor privado fixture</Text>,
};

describe('Tabs animados sobre Expo Router real, datos solo fixture de prueba', () => {
  let reduce: (value: boolean) => void;
  beforeEach(() => {
    mockAuthenticated = false; jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'reduceMotionChanged') reduce = handler as (value: boolean) => void;
      return { remove: jest.fn() };
    });
  });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
  test('cinco tabs conservan etiquetas/estado activo y cambios rápidos terminan en la última selección', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer' });
    expect(screen.getByTestId('tab-index').props.accessibilityState).toMatchObject({ selected: true });
    for (const [tab, path] of [['search', '/buyer/search'], ['orders', '/buyer/orders'], ['notifications', '/buyer/notifications'], ['profile', '/buyer/profile'], ['index', '/buyer'], ['search', '/buyer/search']] as const) {
      await fireEvent.press(screen.getByTestId(`tab-${tab}`));
      expect(view.getPathname()).toBe(path);
      expect(screen.getByTestId(`tab-${tab}`).props.accessibilityState).toMatchObject({ selected: true });
    }
    await act(async () => jest.advanceTimersByTime(500));
    expect(view.getPathname()).toBe('/buyer/search');
    expect(screen.getByTestId('tab-index').props.accessibilityState).toMatchObject({ selected: false });
    expect(screen.getByTestId('tab-profile').props.accessibilityState).toMatchObject({ selected: false });
    expect(screen.queryByText('Login fixture')).toBeNull();
    expect(screen.getAllByTestId(/^tab-/)).toHaveLength(5);
  });
  test('indicador se mide sin consumir toques y ReduceMotion en vivo conserva selección y navegación', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer' });
    const background = screen.getByTestId('buyer-tab-background', { includeHiddenElements: true });
    await fireEvent(background, 'layout', { nativeEvent: { layout: { width: 320, height: 60, x: 0, y: 0 } } });
    expect(background.props.pointerEvents).toBe('none');
    expect(screen.getByTestId('active-tab-indicator', { includeHiddenElements: true })).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tab-profile'));
    await act(async () => reduce(true));
    await fireEvent.press(screen.getByTestId('tab-search'));
    expect(view.getPathname()).toBe('/buyer/search');
    expect(screen.getByTestId('tab-search').props.accessibilityState).toMatchObject({ selected: true });
    await act(async () => jest.advanceTimersByTime(500));
    expect(view.getPathname()).toBe('/buyer/search');
  });
  test('cambiar tabs preserva input y volver usa historial de tabs, no login', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/search' });
    await fireEvent.changeText(screen.getByLabelText('Consulta fixture'), 'consulta conservada');
    await fireEvent.press(screen.getByTestId('tab-profile'));
    await testRouter.back('/buyer/search');
    expect(view.getPathname()).toBe('/buyer/search');
    expect(screen.getByLabelText('Consulta fixture').props.value).toBe('consulta conservada');
  });
  test('deep link dinámico conserva ID y botónAtrás vuelve al ancla pública', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/food/producto-fixture' });
    expect(screen.getByText('Producto producto-fixture')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(view.getPathname()).toBe('/buyer');
  });
  test.each(['/buyer/orders', '/buyer/notifications', '/buyer/order-data', '/seller/product-draft'])('invitado en%s mantiene guarda sin datos ni login automático', async (initialUrl) => {
    const view = await renderRouter(routes, { initialUrl });
    expect(view.getPathname()).toBe(initialUrl);
    expect(screen.getByText('Exploras como invitado')).toBeTruthy();
    expect(screen.queryByText(/^(Pedido|Aviso|Checkout|Editor) privado fixture$/)).toBeNull();
    await act(async () => jest.advanceTimersByTime(500));
    expect(view.getPathname()).toBe(initialUrl);
  });
  test('sesión validada y logout durante movimiento no retienen datos ni navegan desde una animación tardía', async () => {
    const view = await renderRouter(routes, { initialUrl: '/buyer/profile' });
    await act(async () => mockSetSession(true));
    expect(screen.getByText('Nombre privado fixture')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tab-orders'));
    expect(screen.getByText('Pedido privado fixture')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tab-profile'));
    await fireEvent.press(screen.getByLabelText('Cerrar sesión'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(view.getPathname()).toBe('/welcome');
    await act(async () => jest.advanceTimersByTime(600));
    expect(view.getPathname()).toBe('/welcome');
    expect(screen.queryByText('Nombre privado fixture')).toBeNull();
    expect(screen.queryByText('Pedido privado fixture')).toBeNull();
  });
});
