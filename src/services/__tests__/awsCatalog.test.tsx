import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Home from '@/app/buyer/(tabs)/index';
import Search from '@/app/buyer/(tabs)/search';
import Detail from '@/app/buyer/food/[id]';
import Filters from '@/app/buyer/filters';
import { httpClient } from '../api/httpClient';
import { ApiError } from '../api/errors';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
const mockParams: Record<string, string> = {};
const mockPush = jest.fn(); const mockSetParams = jest.fn((value: Record<string, string>) => Object.assign(mockParams, value));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, setParams: mockSetParams, dismissTo: mockPush }), useLocalSearchParams: () => mockParams }));

describe('Catálogo AWS sin fallback ni mezcla de fotos/productos mock', () => {
  const previous = process.env.EXPO_PUBLIC_CATALOG_SOURCE;
  const category = { id: 'persistent-category-fixture', name: 'Categoría real fixture', sortOrder: 10 };
  let request: jest.SpyInstance;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_CATALOG_SOURCE = 'aws';
    Object.keys(mockParams).forEach((key) => delete mockParams[key]); jest.clearAllMocks();
    request = jest.spyOn(httpClient, 'request').mockImplementation(async (path: string) => ({
      status: 200, headers: {}, data: { items: path === '/api/v1/categories' ? [category] : [], page: 1, pageSize: 20, total: path === '/api/v1/categories' ? 1 : 0 },
    }));
  });
  afterEach(() => { if (previous === undefined) delete process.env.EXPO_PUBLIC_CATALOG_SOURCE; else process.env.EXPO_PUBLIC_CATALOG_SOURCE = previous; jest.restoreAllMocks(); });
  test('inicio consume categorías reales y vacío de productos, no mock como fallback', async () => {
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByText('Categoría real fixture')).toBeTruthy());
    await waitFor(() => expect(view.getByText('AWS no tiene productos públicos con esta selección.')).toBeTruthy());
    expect(view.queryByText('Chilaquiles con Huevo')).toBeNull(); expect(view.queryByText('Tortas')).toBeNull();
    await fireEvent.press(view.getByText('Categoría real fixture'));
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/buyer/category', params: expect.objectContaining({ categoryId: category.id }) }));
  });
  test('búsqueda conserva instancia input y envía search al servicio', async () => {
    const view = await render(<Search />);
    const input = view.getByPlaceholderText('Buscar alimentos');
    await fireEvent.changeText(input, 'tacos'); await view.rerender(<Search />);
    expect(view.getByPlaceholderText('Buscar alimentos')).toBe(input);
    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: expect.objectContaining({ search: 'tacos' }) })));
  });
  test('categorías vacías se informan honestamente', async () => {
    request.mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 1, pageSize: 20, total: 0 } });
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByText('AWS no tiene categorías configuradas.')).toBeTruthy());
    expect(view.queryByText('Vegano')).toBeNull();
  });
  test('fallo503 conserva error, nunca lo sustituye por productos mock', async () => {
    request.mockRejectedValue(new ApiError('http', 'Catálogo temporalmente no disponible (fixture).', 503));
    const view = await render(<Home />);
    await waitFor(() => expect(view.getAllByText('Catálogo temporalmente no disponible (fixture).').length).toBeGreaterThan(0));
    expect(view.queryByText('AWS no tiene productos públicos con esta selección.')).toBeNull();
    expect(view.queryByText('Torta de Milanesa')).toBeNull();
  });
  test('producto público no vacío muestra bloqueo de schema sin marcarlo disponible', async () => {
    request.mockImplementation(async (path: string) => ({ status: 200, headers: {}, data: { items: path === '/api/v1/categories' ? [category] : [{ id: 'unknown-product', name: 'Private response fixture' }], page: 1, pageSize: 20, total: 1 } }));
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByText(/falta el DTO completo de respuesta/)).toBeTruthy());
    expect(view.queryByText('Private response fixture')).toBeNull();
  });
  test('detalle real porID no busca producto mock ni asigna su foto', async () => {
    mockParams.id = 'food-1';
    const view = await render(<Detail />);
    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/v1/products/food-1', expect.any(Object)));
    await waitFor(() => expect(view.getByText(/falta el DTO completo/)).toBeTruthy());
    expect(view.queryByText('Chilaquiles con Huevo')).toBeNull();
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Agregar al pedido' })).toBeDisabled();
  });
  test('filtros de categorías usan ID persistente y maxPrice, sin valores availability/sortBy inventados', async () => {
    const view = await render(<Filters />);
    await waitFor(() => expect(view.getByText(category.name)).toBeTruthy());
    await fireEvent.press(view.getByText(category.name));
    await fireEvent.changeText(view.getByPlaceholderText('Sin límite'), '60');
    await fireEvent.press(view.getByRole('button', { name: 'Aplicar filtros' }));
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ categoryId: category.id, maxPrice: '60' }) }));
    expect(view.queryByText('Disponible ahora')).toBeNull();
  });
});
