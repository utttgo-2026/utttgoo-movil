import React from 'react';
import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import Draft from '@/app/seller/product-draft';

const assetId = '507f1f77bcf86cd799439011';
const mockOperation = jest.fn();
const mockCreate = jest.fn();
const mockSeller = jest.fn();
const mockPhoto = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ role: 'seller', consultSeller: mockSeller, productPhotoOperation: mockOperation, createProduct: mockCreate }) }));
jest.mock('@/services/productPhoto', () => ({ selectProductPhoto: () => mockPhoto() }));
jest.mock('@/services/api/categoryService', () => ({ categoryService: { getAll: async () => [{ id: 'category-fixture', name: 'Comida preparada', sortOrder: 1 }] } }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), useFocusEffect: (fn: () => void) => jest.requireActual<typeof import('react')>('react').useEffect(fn, [fn]) }));

async function fill(view: Awaited<ReturnType<typeof render>>) {
  await waitFor(() => expect(view.getByText('Comida preparada')).toBeTruthy());
  await fireEvent.changeText(view.getByLabelText('Nombre del alimento'), 'Tacos de piña');
  await fireEvent.changeText(view.getByLabelText('Descripción del alimento'), 'Con maíz y limón');
  await fireEvent.changeText(view.getByLabelText('Precio MXN'), '25');
  await fireEvent.press(view.getByText('Comida preparada'));
  await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
}
describe('Pantalla de circuito real con sesión simulada, nunca AWS', () => {
  const previousReal = process.env.EXPO_PUBLIC_MEDIA_REAL;
  const previousDemo = process.env.EXPO_PUBLIC_MEDIA_DEMO;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_MEDIA_REAL = 'controlled'; process.env.EXPO_PUBLIC_MEDIA_DEMO = '';
    mockSeller.mockResolvedValue({ success: true, kind: 'active', status: 200, roleSynced: true, received: false, uncertain: false, seller: { sellerId: 'fixture' } });
    mockPhoto.mockResolvedValue({ uri: 'file:///fixture.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 });
    mockCreate.mockResolvedValue({ success: true, data: { id: 'product-fixture', status: 'Active' } });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    if (previousReal === undefined) delete process.env.EXPO_PUBLIC_MEDIA_REAL; else process.env.EXPO_PUBLIC_MEDIA_REAL = previousReal;
    if (previousDemo === undefined) delete process.env.EXPO_PUBLIC_MEDIA_DEMO; else process.env.EXPO_PUBLIC_MEDIA_DEMO = previousDemo;
  });
  test('subida y Approved habilitan producto con mediaAssetId; fallo comercial conserva formulario', async () => {
    mockOperation.mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } })
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'Approved' } });
    mockCreate.mockResolvedValueOnce({ success: false, error: 'CATALOG_UNAVAILABLE fixture' });
    const view = await render(<Draft />); await fill(view);
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(view.getByText('Sube la fotografía antes de publicar.')).toBeTruthy();
    expect(view.queryByText(/La publicación con imagen permanece bloqueada/)).toBeNull();
    expect(mockOperation).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Publicar alimento' })).not.toBeDisabled());
    expect(view.getByText('Fotografía lista')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ mediaAssetId: assetId, name: 'Tacos de piña' }));
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Tacos de piña');
    expect(view.getByText('No pudimos cargar tus alimentos. Intenta más tarde.')).toBeTruthy();
    expect(view.queryByText(/CATALOG_UNAVAILABLE|media-gate|PRUEBA REAL|S3|Approved|EXPO_PUBLIC/)).toBeNull();
    expect(mockOperation.mock.calls.map((args) => args[0])).toEqual(['upload', 'confirm']);
  });
  test('POST incierto conserva Approved y bloquea botón sin permitir doble envío', async () => {
    mockOperation.mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } })
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'Approved' } });
    mockCreate.mockResolvedValueOnce({ success: false, error: 'CATALOG_UNAVAILABLE', reason: 'uncertain' });
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByRole('button', { name: 'Publicar alimento' })).not.toBeDisabled());
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Tacos de piña');
    expect(view.getByText('Fotografía lista')).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(view.getByRole('button', { name: 'Revisar mis alimentos' })).toBeTruthy();
  });
  test('timeout de confirmación ofrece reintento sin repetir upload', async () => {
    mockOperation.mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } })
      .mockResolvedValueOnce({ success: false, error: 'Confirmación sin respuesta' })
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'Approved' } });
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByText('No pudimos completar la fotografía. Revisa su estado o elige otra imagen.')).toBeTruthy());
    await fireEvent.press(view.getByRole('button', { name: 'Reintentar revisión' }));
    expect(mockOperation.mock.calls.map((args) => args[0])).toEqual(['upload', 'confirm', 'confirm']);
    expect(view.getByRole('button', { name: 'Publicar alimento' })).not.toBeDisabled();
  });
  test.each(['Rejected', 'ProcessingFailed'])('%s no crea un producto ni borra los datos comerciales', async (status) => {
    mockOperation.mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } })
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status } });
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    await waitFor(() => expect(view.getByText(status === 'Rejected' ? 'No se aceptó la fotografía. Elige otra imagen de tu alimento.' : 'No pudimos revisar la fotografía. Puedes consultar de nuevo o elegir otra imagen.')).toBeTruthy());
    expect(view.queryByText(status)).toBeNull();
    expect(view.getByRole('button', { name: 'Cambiar desde galería' })).not.toBeDisabled();
    expect(view.getByRole('button', { name: 'Quitar fotografía' })).not.toBeDisabled();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled(); expect(mockCreate).not.toHaveBeenCalled();
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('Tacos de piña');
  });
  test('PendingModeration limita polling a tres lecturas y conserva opción de consulta explícita', async () => {
    jest.useFakeTimers();
    try {
      mockOperation.mockResolvedValue({ success: true, data: { mediaAssetId: assetId, status: 'PendingModeration' } });
      const view = await render(<Draft />); await fill(view);
      await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
      await act(async () => { await jest.advanceTimersByTimeAsync(6500); });
      expect(mockOperation.mock.calls.map((args) => args[0])).toEqual(['upload', 'confirm', 'status', 'status', 'status']);
      expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
      expect(view.getByText('Revisando fotografía…')).toBeTruthy();
      expect(view.queryByText(/PendingUpload|PendingModeration|Approved|Rekognition|AWS|media-gate/)).toBeNull();
      expect(view.getByRole('button', { name: 'Consultar fotografía' })).not.toBeDisabled();
      await act(async () => { await jest.advanceTimersByTimeAsync(30000); });
      expect(mockOperation).toHaveBeenCalledTimes(5); expect(mockCreate).not.toHaveBeenCalled();
    } finally { jest.useRealTimers(); }
  });
  test('controlled deshabilitado explica bloqueo y permite quitar foto sin invocar Media', async () => {
    delete process.env.EXPO_PUBLIC_MEDIA_REAL;
    const view = await render(<Draft />); await fill(view);
    expect(view.getByText('No puedes subir fotografías en este momento. Puedes publicar sin fotografía.')).toBeTruthy();
    expect(view.queryByRole('button', { name: 'Subir fotografía' })).toBeNull();
    expect(mockOperation).not.toHaveBeenCalled();
    await fireEvent.press(view.getByRole('button', { name: 'Quitar fotografía' }));
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(mockCreate).toHaveBeenCalledWith(expect.not.objectContaining({ mediaAssetId: expect.anything() }));
  });
  test('estado Approved sin identificador válido no anuncia éxito ni habilita publicación', async () => {
    mockOperation.mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } })
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: 'invalid', status: 'Approved' } });
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    expect(view.queryByText('Fotografía lista')).toBeNull();
    expect(view.getByText('No pudimos confirmar la fotografía. Consulta de nuevo antes de publicar.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
  test('subida visible sin diagnóstico y recibo confirmado sin IDs; crear otro reinicia fotografía', async () => {
    let finish!: (result: object) => void;
    mockOperation.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }))
      .mockResolvedValueOnce({ success: true, data: { mediaAssetId: assetId, status: 'Approved' } });
    const view = await render(<Draft />); await fill(view);
    await fireEvent.press(view.getByRole('button', { name: 'Subir fotografía' }));
    expect(view.getByText('Subiendo fotografía…')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(view.queryByText(/AWS|S3|Approved|media-gate|controlled|EXPO_PUBLIC|upload-url|HTTP/)).toBeNull();
    await act(async () => { finish({ success: true, data: { mediaAssetId: assetId, status: 'PendingUpload' } }); });
    expect(view.getByText('Fotografía lista')).toBeTruthy();
    expect(view.queryByRole('button', { name: 'Consultar fotografía' })).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Publicar alimento' }));
    expect(view.getByText('¡Alimento publicado!')).toBeTruthy();
    expect(view.queryByText(/product-fixture|Active|507f1f77|AWS/)).toBeNull();
    expect(view.getByRole('button', { name: 'Ver mis alimentos' })).toBeTruthy();
    await fireEvent.press(view.getByRole('button', { name: 'Crear otro alimento' }));
    expect(view.queryByLabelText('Vista previa de fotografía')).toBeNull();
    expect(view.getByLabelText('Nombre del alimento').props.value).toBe('');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
  test('producción nunca muestra subida real aunque controlled esté configurado', async () => {
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    const view = await render(<Draft />); await fill(view);
    expect(view.queryByRole('button', { name: 'Subir fotografía' })).toBeNull();
    expect(view.getByRole('button', { name: 'Publicar alimento' })).toBeDisabled();
    expect(mockOperation).not.toHaveBeenCalled();
  });
});
