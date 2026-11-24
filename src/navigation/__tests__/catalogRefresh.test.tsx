import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import BuyerLayout, { unstable_settings } from '@/app/buyer/_layout';
import BuyerTabs from '@/app/buyer/(tabs)/_layout';
import Home from '@/app/buyer/(tabs)/index';
import Search from '@/app/buyer/(tabs)/search';
import { httpClient } from '@/services/api/httpClient';
import { productMetadata } from '@/services/__fixtures__/product';

jest.mock('@/config/catalogSource', () => ({ usesMockCatalog: () => false }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  'buyer/_layout': { default: BuyerLayout, unstable_settings },
  'buyer/(tabs)/_layout': BuyerTabs,
  'buyer/(tabs)/index': Home,
  'buyer/(tabs)/search': Search,
  'buyer/(tabs)/orders': () => <Text>Pedidos fixture</Text>,
  'buyer/(tabs)/notifications': () => <Text>Avisos fixture</Text>,
  'buyer/(tabs)/profile': () => <Text>Perfil fixture</Text>,
  seller: () => <Text>Publicación externa fixture</Text>,
};
describe('Catálogo real se revalida al volver, sin rehacer el navegador', () => {
  afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
  test('producto nuevo se observa al regresar de seller y conserva query e instancia de input', async () => {
    const product = { ...productMetadata, id: 'persistent-product', sellerId: 'persistent-seller', categoryId: 'persistent-category',
      name: 'Maíz fixture', description: 'Descripción fixture', ingredients: [], price: 35, stock: 4, status: 'Active' };
    let published = false;
    const request = jest.spyOn(httpClient, 'request').mockImplementation(async (path) => ({ status: 200, headers: {}, data: {
      items: path === '/api/v1/products' && published ? [product] : [], page: 1, pageSize: 20, totalCount: path === '/api/v1/products' && published ? 1 : 0,
    } }));
    const view = await renderRouter(routes, { initialUrl: '/buyer/search?query=maiz' });
    await waitFor(() => expect(screen.getByText('AWS no tiene productos públicos con esta selección.')).toBeTruthy());
    const input = screen.getByPlaceholderText('Buscar alimentos');
    await testRouter.push('/seller');
    published = true; // Test-only server fixture; no mutation request is performed.
    await testRouter.back('/buyer/search?query=maiz');
    await waitFor(() => expect(screen.getByLabelText('Ver Maíz fixture')).toBeTruthy());
    expect(view.getSearchParams().query).toBe('maiz');
    expect(screen.getByPlaceholderText('Buscar alimentos')).toBe(input);
    expect(request.mock.calls.filter(([path]) => path === '/api/v1/products')).toHaveLength(2);
    expect(request).toHaveBeenLastCalledWith('/api/v1/products', expect.objectContaining({ query: expect.objectContaining({ search: 'maiz', sortBy: undefined }) }));
  });
});
