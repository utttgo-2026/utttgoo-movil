import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Home from '@/app/buyer/(tabs)/index';
import Search from '@/app/buyer/(tabs)/search';
import Detail from '@/app/buyer/food/[id]';
import Filters from '@/app/buyer/filters';
import Notifications from '@/app/buyer/(tabs)/notifications';
import { httpClient } from '../api/httpClient';
import { ApiError } from '../api/errors';
import { productMetadata } from '../__fixtures__/product';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
const mockParams: Record<string, string> = {};
const mockPush = jest.fn(); const mockSetParams = jest.fn((value: Record<string, string>) => Object.assign(mockParams, value));
const mockPrepare = jest.fn();
let mockAuthenticated = true;
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ prepareOrder: mockPrepare, isAuthenticated: mockAuthenticated }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, setParams: mockSetParams, dismissTo: mockPush }), useLocalSearchParams: () => mockParams,
  useFocusEffect: (callback: () => void | (() => void)) => jest.requireActual<typeof import('react')>('react').useEffect(callback, [callback]) }));

describe('Catálogo AWS sin fallback ni mezcla de fotos/productos mock', () => {
  const previous = process.env.EXPO_PUBLIC_CATALOG_SOURCE;
  const category = { id: 'persistent-category-fixture', name: 'Categoría real fixture', sortOrder: 10 };
  const product = { id: 'food-1', sellerId: 'persistent-seller', categoryId: category.id, name: 'Producto AWS fixture', description: 'Descripción AWS',
    ...productMetadata, price: 32.5, stock: 2, ingredients: ['Maíz'], status: 'Active' };
  let request: jest.SpyInstance;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_CATALOG_SOURCE = 'aws';
    Object.keys(mockParams).forEach((key) => delete mockParams[key]); jest.clearAllMocks();
    mockAuthenticated = true; mockPrepare.mockReturnValue({ success: true });
    request = jest.spyOn(httpClient, 'request').mockImplementation(async (path: string) => ({
      status: 200, headers: {}, data: { items: path === '/api/v1/categories' ? [category] : [], page: 1, pageSize: 20, totalCount: path === '/api/v1/categories' ? 1 : 0 },
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
    request.mockResolvedValue({ status: 200, headers: {}, data: { items: [], page: 1, pageSize: 20, totalCount: 0 } });
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
  test('producto público incompleto se rechaza sin mostrar campos parciales', async () => {
    request.mockImplementation(async (path: string) => ({ status: 200, headers: {}, data: { items: path === '/api/v1/categories' ? [category] : [{ id: 'unknown-product', name: 'Private response fixture' }], page: 1, pageSize: 20, total: 1, totalCount: 1 } }));
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByText(/no cumplen el contrato confirmado/)).toBeTruthy());
    expect(view.queryByText('Private response fixture')).toBeNull();
  });
  test('detalle real porID no busca producto mock ni asigna su foto', async () => {
    mockParams.id = 'food-1';
    request.mockResolvedValue({ status: 200, headers: {}, data: product });
    const view = await render(<Detail />);
    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/v1/products/food-1', expect.any(Object)));
    await waitFor(() => expect(view.getAllByText('Producto AWS fixture').length).toBeGreaterThan(0));
    expect(view.queryByText('Chilaquiles con Huevo')).toBeNull();
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: '+' }));
    expect(view.getByRole('button', { name: '+' })).toBeDisabled();
    await fireEvent.press(view.getByRole('button', { name: 'Agregar al pedido' }));
    expect(mockPrepare).toHaveBeenCalledWith(product, 2);
    expect(mockPush).toHaveBeenLastCalledWith('/buyer/order-data');
  });
  test.each([{ ...product, status: 'Paused' }, { ...product, stock: 0 }, { ...product, isAvailable: false }])('detalle no prepara producto no disponible', async (value) => {
    mockParams.id = value.id; request.mockResolvedValue({ status: 200, headers: {}, data: value });
    const view = await render(<Detail />);
    await waitFor(() => expect(view.getByText(value.description)).toBeTruthy());
    expect(view.getByRole('button', { name: 'Agregar al pedido' })).toBeDisabled();
    expect(mockPrepare).not.toHaveBeenCalled();
  });
  test('catálogo renderiza producto persistente y navega con su ID; paginación remota', async () => {
    request.mockImplementation(async (path: string, options: { query?: { page?: number } }) => ({ status: 200, headers: {}, data: path === '/api/v1/categories' ?
      { items: [category], page: 1, pageSize: 20, totalCount: 1 } : { items: [product], page: options.query?.page ?? 1, pageSize: 20, totalCount: 21 } }));
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByRole('button', { name: `Ver ${product.name}` })).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: `Ver ${product.name}` }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/buyer/food/[id]', params: { id: product.id } });
    await fireEvent.press(view.getByRole('button', { name: 'Página siguiente' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ query: expect.objectContaining({ page: 2, sortBy: undefined }) })));
  });
  test('filtros conservan categoría/maxPrice y sort AWS confirmado sin availability supuesto', async () => {
    const view = await render(<Filters />);
    await waitFor(() => expect(view.getByText(category.name)).toBeTruthy());
    await fireEvent.press(view.getByText(category.name));
    await fireEvent.changeText(view.getByPlaceholderText('Sin límite'), '60');
    await fireEvent.press(view.getByText('Menor precio'));
    await fireEvent.press(view.getByRole('button', { name: 'Aplicar filtros' }));
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ categoryId: category.id, maxPrice: '60', awsSort: 'price_asc' }) }));
    expect(view.queryByText('Disponible ahora')).toBeNull();
  });
  test('total desplegado es válido sin sort implícito; sort400 explícito no se oculta con otra consulta', async () => {
    request.mockImplementation(async (path: string, options: { query?: { sortBy?: string } }) => {
      if (path === '/api/v1/products' && options.query?.sortBy) throw new ApiError('http', 'Orden rechazado por backend (fixture).', 400);
      return { status: 200, headers: {}, data: { items: path === '/api/v1/categories' ? [category] : [], page: 1, pageSize: 20, totalCount: path === '/api/v1/categories' ? 1 : 0 } };
    });
    const view = await render(<Home />);
    await waitFor(() => expect(view.getByText('AWS no tiene productos públicos con esta selección.')).toBeTruthy());
    mockParams.awsSort = 'price_asc'; await view.rerender(<Home />);
    await waitFor(() => expect(view.getByText('Orden rechazado por backend (fixture).')).toBeTruthy());
    expect(request.mock.calls.filter(([path]) => path === '/api/v1/products')).toHaveLength(2);
    expect(view.queryByText('AWS no tiene productos públicos con esta selección.')).toBeNull();
  });
  test('avisos AWS conservan guarda y no muestran fixtures como notificaciones reales', async () => {
    const view = await render(<Notifications />);
    expect(view.getByText('Avisos remotos pendientes de integración')).toBeTruthy();
    expect(view.queryByTestId('notifications-list')).toBeNull(); expect(request).not.toHaveBeenCalled();
    mockAuthenticated = false; await view.rerender(<Notifications />);
    expect(view.getByText('Exploras como invitado')).toBeTruthy();
    expect(view.queryByText('Avisos remotos pendientes de integración')).toBeNull();
  });
});
