import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Draft from '@/app/seller/product-draft';
import Products from '@/app/seller/products';
import { pr33Demo } from '../pr33Demo';
import { AwsProductDetail } from '@/components/catalog/AwsCatalog';
import { productService } from '../api/productService';

const mockCreate = jest.fn();
const mockConsult = jest.fn();
const mockSelect = jest.fn();
const mockPush = jest.fn();
const mockParams: { id?: string } = {};
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ role: 'buyer', createProduct: mockCreate, consultSeller: mockConsult }) }));
jest.mock('@/services/productPhoto', () => ({ selectProductPhoto: (...args: unknown[]) => mockSelect(...args) }));
jest.mock('expo-file-system', () => ({ File: class { exists = true; size = 4; async bytes() { return new Uint8Array([255, 216, 255, 1]); } } }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => mockParams, useFocusEffect: (fn: () => void) => jest.requireActual<typeof import('react')>('react').useEffect(fn, [fn]) }));

async function fill(view: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Tacos de piña');
  await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Con maíz y limón');
  await fireEvent.changeText(view.getByLabelText('Precio MXN'), '25');
  await fireEvent.press(view.getByText('Categoría de demostración'));
}
describe('Pantallas reales en modo aislado PR33', () => {
  const previous = process.env.EXPO_PUBLIC_MEDIA_DEMO;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_MEDIA_DEMO = 'pr33'; pr33Demo.reset(); jest.clearAllMocks();
    mockSelect.mockResolvedValue({ uri: 'file:///local.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 });
  });
  afterEach(() => { if (previous === undefined) delete process.env.EXPO_PUBLIC_MEDIA_DEMO; else process.env.EXPO_PUBLIC_MEDIA_DEMO = previous; });
  test('pendiente → aprobado → producto simulado → crear otro sin publicar a AWS', async () => {
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Consultar fotografía' })).not.toBeDisabled());
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    await fireEvent.press(view.getByRole('button', { name: 'Consultar fotografía' }));
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(view.getByText('Alimento guardado solo en demostración')).toBeTruthy();
    expect(pr33Demo.list()).toHaveLength(1);
    await fireEvent.press(view.getByRole('button', { name: 'Crear otro alimento' }));
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('');
    expect(view.queryByLabelText('Vista previa de fotografía')).toBeNull();
    await fill(view); await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(pr33Demo.list()).toHaveLength(2); expect(mockCreate).not.toHaveBeenCalled(); expect(mockConsult).not.toHaveBeenCalled();
  });
  test.each(['Rejected', 'ProcessingFailed'])('%s mantiene formulario y bloquea asociación', async (outcome) => {
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    await fireEvent.press(view.getByText(outcome === 'Rejected' ? 'No se aceptó la fotografía. Elige otra imagen de tu alimento.' : 'No pudimos revisar la fotografía. Puedes consultar de nuevo o elegir otra imagen.'));
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Consultar fotografía' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Consultar fotografía' }));
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Tacos de piña');
    await fireEvent.press(view.getByRole('button', { name: 'Quitar fotografía' }));
    expect(view.getByRole('button', { name: 'Publicar alimento' })).not.toBeDisabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
  test('Mis alimentos edita imagen por PATCH simulado conservando precio sin guardar', async () => {
    await pr33Demo.create({ name: 'Tacos de piña', description: 'Con maíz', ingredients: [], price: 25, stock: 4, categoryId: '507f1f77bcf86cd799439031' });
    const view = await render(<Products />);
    await fireEvent.press(view.getByRole('button', { name: 'Editar Tacos de piña' }));
    await fireEvent.changeText(view.getByLabelText('Precio MXN'), '33.50');
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Consultar fotografía' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Consultar fotografía' }));
    await fireEvent.press(view.getByRole('button', { name: 'Guardar fotografía simulada' }));
    expect(view.getByLabelText('Precio MXN').props.value).toBe('33.50');
    expect(view.getByLabelText('Imagen actual de demostración')).toBeTruthy();
    mockSelect.mockResolvedValueOnce({ uri: 'file:///replacement.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 });
    await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Consultar fotografía' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Consultar fotografía' }));
    await fireEvent.press(view.getByRole('button', { name: 'Guardar fotografía simulada' }));
    expect(view.getByLabelText('Imagen actual de demostración').props.source.uri).toBe('file:///replacement.jpg');
    expect(view.getByLabelText('Precio MXN').props.value).toBe('33.50');
    await fireEvent.press(view.getByRole('button', { name: 'Quitar imagen actual (demostración)' }));
    expect(view.queryByLabelText('Imagen actual de demostración')).toBeNull();
    expect(pr33Demo.list()).toHaveLength(1); expect(mockCreate).not.toHaveBeenCalled(); expect(mockConsult).not.toHaveBeenCalled();
  });
  test('detalle comprador simula caducidad y renovación sin GET a AWS ni compras', async () => {
    const get = jest.spyOn(productService, 'getById');
    try {
      const flow = await pr33Demo.photo({ uri: 'file:///local.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 }, 'Approved');
      await flow.checkStatus();
      const product = await pr33Demo.create({ name: 'Tacos de piña', description: 'Con maíz', ingredients: [], price: 25, stock: 4, categoryId: '507f1f77bcf86cd799439031' }, flow);
      mockParams.id = product.id;
      const view = await render(<AwsProductDetail />);
      expect(view.getByLabelText('Foto local simulada de Tacos de piña')).toBeTruthy();
      await fireEvent.press(view.getByRole('button', { name: 'Simular vencimiento de imagen' }));
      expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
      await fireEvent.press(view.getByRole('button', { name: 'Renovar imagen simulada' }));
      expect(view.getByLabelText('Foto local simulada de Tacos de piña')).toBeTruthy();
      expect(get).not.toHaveBeenCalled(); expect(view.queryByRole('button', { name: 'Agregar al pedido' })).toBeNull();
    } finally { get.mockRestore(); }
  });
});
